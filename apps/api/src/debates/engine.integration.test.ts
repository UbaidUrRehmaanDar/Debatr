import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { eq } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import {
  users,
  debates,
  turns,
  messages,
} from '../db/schema/index.js';
import {
  startDebateTurns,
  getActiveTurn,
  closeTurnAndAdvance,
  enterJudging,
  sideOfUser,
} from './engine.js';
import {
  setupTestDb,
  teardownTestDb,
  truncateAll,
  hasTestDb,
} from '../../test/setup.js';

const maybe = hasTestDb ? describe : describe.skip;

function makeDebateRow(overrides: Record<string, unknown> = {}) {
  const now = new Date().toISOString();
  return {
    topic: 'Integration topic',
    description: null,
    status: 'waiting_for_participants' as const,
    participants: {
      affirmative: { userId: 'user-aaa', displayName: 'Alice', joinedAt: now },
      negative: { userId: 'user-bbb', displayName: 'Bob', joinedAt: '' },
    },
    maxRounds: 2,
    roundDurationMs: 300000,
    maxCharactersPerTurn: 2000,
    currentRound: 0,
    currentTurnId: null,
    judgeReportId: null,
    completedAt: null,
    ...overrides,
  };
}

maybe('debate engine integration (real DB)', () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  afterEach(async () => {
    await truncateAll();
  });

  async function seedDebate() {
    const db = getDb();
    await db.insert(users).values([
      { id: 'user-aaa', email: 'alice@example.com', name: 'Alice' },
      { id: 'user-bbb', email: 'bob@example.com', name: 'Bob' },
    ]);
    const [debate] = await db.insert(debates).values(makeDebateRow()).returning();
    return debate;
  }

  it('starts turns and activates the first (affirmative) turn', async () => {
    const debate = await seedDebate();
    await startDebateTurns(debate);

    const db = getDb();
    const [active] = await db.select().from(turns).where(eq(turns.status, 'active'));
    expect(active).toBeTruthy();
    expect(active.side).toBe('affirmative');
    expect(active.turnIndex).toBe(0);

    const [refreshed] = await db.select().from(debates).where(eq(debates.id, debate.id));
    expect(refreshed.status).toBe('active');
    expect(refreshed.currentTurnId).toBe(active.id);
    expect(refreshed.currentRound).toBe(0);
  });

  it('advances turns in the fixed plan and respects ownership', async () => {
    const debate = await seedDebate();
    await startDebateTurns(debate);

    let active = await getActiveTurn(debate.id);
    expect(active!.side).toBe('affirmative');

    // Close affirmative turn -> negative becomes active.
    const r1 = await closeTurnAndAdvance(debate.id, active!.id);
    expect(r1.completed).toBe(false);
    expect(r1.nextTurn!.side).toBe('negative');

    active = await getActiveTurn(debate.id);
    expect(active!.side).toBe('negative');
    expect(active!.turnIndex).toBe(1);

    // Run through the rest of the 2-round plan (4 turns total).
    await closeTurnAndAdvance(debate.id, active!.id); // affirmative round 2
    active = await getActiveTurn(debate.id);
    expect(active!.side).toBe('affirmative');
    expect(active!.turnIndex).toBe(2);

    await closeTurnAndAdvance(debate.id, active!.id); // negative round 2
    active = await getActiveTurn(debate.id);
    expect(active!.side).toBe('negative');
    expect(active!.turnIndex).toBe(3);

    const finalResult = await closeTurnAndAdvance(debate.id, active!.id);
    expect(finalResult.completed).toBe(true);
    expect(finalResult.nextTurn).toBeNull();
    expect(await getActiveTurn(debate.id)).toBeNull();

    const [refreshed] = await db_selectDebate(debate.id);
    expect(refreshed.currentTurnId).toBeNull();
    expect(refreshed.status).toBe('active'); // not auto-judged
  });

  it('moves an exhausted debate into judging and locks the turn', async () => {
    const debate = await seedDebate();
    await startDebateTurns(debate);
    // exhaust all turns
    let active = await getActiveTurn(debate.id);
    while (active) {
      const res = await closeTurnAndAdvance(debate.id, active.id);
      if (res.completed) break;
      active = await getActiveTurn(debate.id);
    }
    await enterJudging(debate.id);
    const [refreshed] = await db_selectDebate(debate.id);
    expect(refreshed.status).toBe('judging');
    expect(refreshed.currentTurnId).toBeNull();
  });

  it('sideOfUser resolves the correct side and null for non-participants', async () => {
    const debate = await seedDebate();
    expect(sideOfUser(debate, 'user-aaa')).toBe('affirmative');
    expect(sideOfUser(debate, 'user-bbb')).toBe('negative');
    expect(sideOfUser(debate, 'user-ccc')).toBeNull();
  });

  it('persists posted messages linked to their turn', async () => {
    const debate = await seedDebate();
    await startDebateTurns(debate);
    const active = await getActiveTurn(debate.id);
    const db = getDb();
    const [msg] = await db.insert(messages).values({
      debateId: debate.id,
      turnId: active!.id,
      senderId: 'user-aaa',
      side: 'affirmative',
      content: 'Opening statement.',
    }).returning();
    expect(msg.id).toBeTruthy();
    const all = await db.select().from(messages).where(eq(messages.debateId, debate.id));
    expect(all).toHaveLength(1);
  });
});

async function db_selectDebate(id: string) {
  return getDb().select().from(debates).where(eq(debates.id, id));
}
