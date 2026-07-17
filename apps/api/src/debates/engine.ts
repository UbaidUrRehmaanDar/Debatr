import { getDb, type Db } from '../db/index.js';
import {
  debates,
  turns,
} from '../db/schema/index.js';
import { eq, and, asc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

type DebateRow = typeof debates.$inferSelect;
type TurnRow = typeof turns.$inferSelect;

export type Side = 'affirmative' | 'negative';

// Turn order within a round: affirmative opens, negative replies.
// This is the initial fixed template; round templates are an open question
// (see docs/QUESTIONS.md) and must not be improvised in the client.
function buildTurnPlan(maxRounds: number): Array<{ roundIndex: number; turnIndex: number; side: Side }> {
  const plan: Array<{ roundIndex: number; turnIndex: number; side: Side }> = [];
  for (let round = 0; round < maxRounds; round++) {
    plan.push({ roundIndex: round, turnIndex: plan.length, side: 'affirmative' });
    plan.push({ roundIndex: round, turnIndex: plan.length, side: 'negative' });
  }
  return plan;
}

export interface TurnPlanEntry {
  roundIndex: number;
  turnIndex: number;
  side: Side;
}

export function planTurns(maxRounds: number): TurnPlanEntry[] {
  return buildTurnPlan(maxRounds);
}

/**
 * Seed the ordered turn rows for a debate and activate the first one.
 * Call once when a debate transitions into `active`. All writes happen on the
 * supplied transaction (default: getDb()) so callers can wrap this in a
 * transaction for atomicity.
 */
export async function startDebateTurns(debate: DebateRow, tx: Db = getDb()): Promise<void> {
  const plan = buildTurnPlan(debate.maxRounds);
  const now = new Date();

  const rows = plan.map((entry) => ({
    id: randomUUID(),
    debateId: debate.id,
    roundIndex: entry.roundIndex,
    turnIndex: entry.turnIndex,
    side: entry.side,
    participantId: entry.side === 'affirmative'
      ? debate.participants.affirmative.userId
      : debate.participants.negative.userId,
    startTime: now,
    status: 'pending' as const,
  }));

  await tx.insert(turns).values(rows);

  const first = rows[0];
  await tx.update(debates).set({
    status: 'active',
    currentRound: first.roundIndex,
    currentTurnId: first.id,
    updatedAt: now,
  }).where(eq(debates.id, debate.id));

  await tx.update(turns).set({ status: 'active' }).where(eq(turns.id, first.id));
}

/**
 * Returns the currently active turn for a debate, or null.
 */
export async function getActiveTurn(debateId: string): Promise<TurnRow | null> {
  const db = getDb();
  const [turn] = await db.select().from(turns)
    .where(and(eq(turns.debateId, debateId), eq(turns.status, 'active')))
    .limit(1);
  return turn ?? null;
}

export async function getTurnById(turnId: string): Promise<TurnRow | null> {
  const db = getDb();
  const [turn] = await db.select().from(turns).where(eq(turns.id, turnId)).limit(1);
  return turn ?? null;
}

export interface AdvanceResult {
  completed: boolean; // debate reached its final turn
  nextTurn: TurnRow | null;
}

/**
 * Close the given turn (only if it is still active), record completion, and
 * activate the next turn in the plan. Idempotent and concurrency-safe: the turn
 * close is a conditional UPDATE ... WHERE status='active' RETURNING, so two
 * concurrent callers cannot both close the same turn. When no further turn
 * exists, the debate is NOT auto-transitioned to `judging` here — the caller
 * decides completion (open question: completion policy).
 */
export async function closeTurnAndAdvance(
  debateId: string,
  turnId: string,
  tx: Db = getDb(),
): Promise<AdvanceResult> {
  const now = new Date();

  // Conditional close: only succeeds if the turn is currently active. A second
  // concurrent caller finds it already completed and gets null -> no-op.
  const [closed] = await tx.update(turns)
    .set({ status: 'completed', endTime: now })
    .where(and(eq(turns.id, turnId), eq(turns.status, 'active')))
    .returning();

  if (!closed) {
    // Already advanced by a concurrent request; fetch current state to return
    // a coherent result without re-advancing.
    const [debate] = await tx.select().from(debates).where(eq(debates.id, debateId)).limit(1);
    const allTurns = await tx.select().from(turns)
      .where(eq(turns.debateId, debateId))
      .orderBy(asc(turns.turnIndex));
    const idx = allTurns.findIndex((t) => t.id === turnId);
    const next = idx >= 0 ? allTurns[idx + 1] ?? null : null;
    return { completed: debate.currentTurnId === null, nextTurn: next && next.status === 'active' ? next : null };
  }

  const allTurns = await tx.select().from(turns)
    .where(eq(turns.debateId, debateId))
    .orderBy(asc(turns.turnIndex));

  const idx = allTurns.findIndex((t) => t.id === turnId);
  const next = idx >= 0 ? allTurns[idx + 1] ?? null : null;

  if (!next) {
    await tx.update(debates).set({
      currentRound: closed.roundIndex,
      currentTurnId: null,
      updatedAt: now,
    }).where(eq(debates.id, debateId));
    return { completed: true, nextTurn: null };
  }

  await tx.update(debates).set({
    currentRound: next.roundIndex,
    currentTurnId: next.id,
    updatedAt: now,
  }).where(eq(debates.id, debateId));

  await tx.update(turns).set({ status: 'active', startTime: now })
    .where(eq(turns.id, next.id));

  return { completed: false, nextTurn: next };
}

/**
 * Mark the current turn as timed out. The turn stays closed but flagged; the
 * debate does not auto-advance on timeout (timeout policy is an open question).
 * The next turn is activated so the debate can continue.
 */
export async function timeoutActiveTurn(debateId: string): Promise<AdvanceResult> {
  const active = await getActiveTurn(debateId);
  if (!active) {
    throw new Error('No active turn to time out');
  }
  return closeTurnAndAdvance(debateId, active.id);
}

/**
 * Move an active debate that has exhausted its turns into `judging` and lock
 * the transcript. Only call this when completion is authorised. Uses a
 * conditional UPDATE so it is safe to call concurrently (only the first wins).
 */
export async function enterJudging(debateId: string, tx: Db = getDb()): Promise<void> {
  const now = new Date();
  await tx.update(debates).set({
    status: 'judging',
    currentTurnId: null,
    updatedAt: now,
  }).where(and(eq(debates.id, debateId), eq(debates.status, 'active')));
}

export function sideOfUser(debate: DebateRow, userId: string): Side | null {
  if (debate.participants?.affirmative.userId === userId) return 'affirmative';
  if (debate.participants?.negative.userId === userId) return 'negative';
  return null;
}
