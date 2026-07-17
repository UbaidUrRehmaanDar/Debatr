import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getAuth } from '../auth/index.js';
import { getDb } from '../db/index.js';
import {
  users,
  debates,
  messages,
  lawyerConversations,
  lawyerRequests,
  judgeReports,
  aiUsage,
  raiseHandRequests,
  evidence,
  moderationEvents,
} from '../db/schema/index.js';
import { eq, and, asc, sql } from 'drizzle-orm';
import { config } from '../config/env.js';
import { getLawyerAdvice } from '../ai/lawyer.js';
import { evaluateDebate } from '../ai/judge.js';
import { checkDebateBudget } from '../ai/budget.js';
import {
  startDebateTurns,
  getActiveTurn,
  closeTurnAndAdvance,
  sideOfUser,
} from '../debates/engine.js';
import { debateEvents } from '../debates/events.js';
import { logger } from '../observability/logger.js';

interface CreateDebateBody {
  topic: string;
  description?: string;
  opponentEmail: string;
}

async function requireUser(request: FastifyRequest, reply: FastifyReply) {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: request.headers as any });
  if (!session?.user) {
    reply.code(401).send({ error: 'Not authenticated' });
    return null;
  }
  return session.user;
}

// Like requireUser but also enforces email verification. The app requires
// verification (auth config), but the custom-wrapped routes must check it
// explicitly — an unverified session would otherwise be able to post, use AI,
// and join debates.
async function requireVerifiedUser(request: FastifyRequest, reply: FastifyReply): Promise<Awaited<ReturnType<typeof requireUser>>> {
  const user = await requireUser(request, reply);
  if (!user) return null;
  if (!(user as any).emailVerified) {
    reply.code(403).send({ error: 'Please verify your email before participating' });
    return null;
  }
  return user;
}

async function getDebateOr404(debateId: string, reply: FastifyReply) {
  const db = getDb();
  const [debate] = await db.select().from(debates).where(eq(debates.id, debateId)).limit(1);
  if (!debate) {
    reply.code(404).send({ error: 'Debate not found' });
    return null;
  }
  return debate;
}

// Fetch a debate and require that the caller is one of its participants.
// Prevents IDOR/transcript leakage: every participant-scoped route must use
// this instead of getDebateOr404 alone.
export async function requireParticipant(
  debateId: string,
  userId: string,
  reply: FastifyReply,
): Promise<typeof debates.$inferSelect | null> {
  const debate = await getDebateOr404(debateId, reply);
  if (!debate) return null;
  if (!sideOfUser(debate, userId)) {
    reply.code(403).send({ error: 'You are not a participant of this debate' });
    return null;
  }
  return debate;
}

export async function registerDebateRoutes(fastify: FastifyInstance) {
  // List debates the user participates in
  fastify.get('/api/debates', async (request, reply) => {
    const user = await requireUser(request, reply);
    if (!user) return;
    const db = getDb();
    const rows = await db.select().from(debates).orderBy(debates.createdAt);
    // Filter to debates the user is a participant of (stored in JSONB participants)
    const mine = rows.filter((d) =>
      d.participants &&
      (d.participants.affirmative.userId === user.id || d.participants.negative.userId === user.id)
    );
    return mine;
  });

  // Create a debate and invite an opponent by email
  fastify.post('/api/debates', async (request: FastifyRequest<{ Body: CreateDebateBody }>, reply: FastifyReply) => {
    const user = await requireUser(request, reply);
    if (!user) return;

    const { topic, description, opponentEmail } = request.body;
    if (!topic || !opponentEmail) {
      return reply.status(400).send({ error: 'topic and opponentEmail are required' });
    }

    const db = getDb();
    const opponent = await db.select().from(users).where(eq(users.email, opponentEmail)).limit(1);
    if (!opponent.length) {
      return reply.status(400).send({ error: 'Opponent email is not a registered user' });
    }

    const roundDurationMs = config.debateDefaultTurnMinutes * 60 * 1000;
    const [debate] = await db.insert(debates).values({
      topic,
      description: description ?? null,
      status: 'waiting_for_participants',
      participants: {
        affirmative: { userId: user.id as string, displayName: user.name ?? user.email, joinedAt: new Date().toISOString() },
        negative: { userId: opponent[0].id as string, displayName: opponent[0].name ?? opponent[0].email, joinedAt: '' },
      },
      maxRounds: config.debateDefaultRounds,
      roundDurationMs,
      maxCharactersPerTurn: config.debateDefaultMaxCharacters,
    }).returning();

    return reply.status(201).send(debate);
  });

  // Join a debate. The invited (negative) participant accepts; once both sides
  // have joined the debate transitions to active and the turn engine starts.
  fastify.post('/api/debates/:id/join', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = await requireVerifiedUser(request, reply);
    if (!user) return;
    const debate = await getDebateOr404(request.params.id, reply);
    if (!debate) return;

    const side = sideOfUser(debate, user.id as string);
    if (!side) return reply.code(403).send({ error: 'You are not a participant of this debate' });
    if (side !== 'negative') {
      return reply.status(400).send({ error: 'Only the invited opponent joins' });
    }
    if (debate.status !== 'waiting_for_participants') {
      return reply.status(400).send({ error: `Cannot join in status '${debate.status}'` });
    }

    const db = getDb();
    const now = new Date();

    // Atomically transition waiting_for_participants -> active. The conditional
    // UPDATE ... WHERE status='waiting_for_participants' RETURNING ensures that
    // two concurrent joins cannot both seed turns (only the first wins; the
    // loser gets 0 rows and a 409).
    const result = await db.transaction(async (tx) => {
      const [target] = await tx.update(debates)
        .set({
          participants: {
            ...debate.participants,
            negative: { ...debate.participants.negative, joinedAt: now.toISOString() },
          },
          status: 'active',
          updatedAt: now,
        })
        .where(and(eq(debates.id, debate.id), eq(debates.status, 'waiting_for_participants')))
        .returning();

      if (!target) {
        // Another request already started this debate.
        return null;
      }

      await startDebateTurns(target, tx);
      return target;
    });

    if (!result) {
      return reply.status(409).send({ error: 'Debate already started' });
    }

    debateEvents.emit('debate_state_changed', {
      debateId: result.id,
      status: 'active',
      currentTurnId: result.currentTurnId,
      currentRound: result.currentRound,
    });

    return reply.send(result);
  });

  // Get a single debate (authoritative snapshot: current turn side, transcript,
  // evidence, and any raise-hand requests the caller is allowed to see).
  fastify.get('/api/debates/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = await requireUser(request, reply);
    if (!user) return;
    const debate = await requireParticipant(request.params.id, user.id as string, reply);
    if (!debate) return;

    const db = getDb();
    const activeTurn = await getActiveTurn(debate.id);
    const debateMessages = await db.select().from(messages).where(eq(messages.debateId, debate.id)).orderBy(asc(messages.createdAt));
    const debateEvidence = await db.select().from(evidence).where(eq(evidence.debateId, debate.id));
    const debateModeration = await db.select().from(moderationEvents).where(eq(moderationEvents.debateId, debate.id));

    return {
      ...debate,
      currentTurnSide: activeTurn?.side ?? null,
      messages: debateMessages,
      evidence: debateEvidence,
      moderationEvents: debateModeration,
    };
  });

  // Submit a public message for the current turn
  fastify.post('/api/debates/:id/message', async (request: FastifyRequest<{ Params: { id: string }; Body: { content: string } }>, reply: FastifyReply) => {
    const user = await requireVerifiedUser(request, reply);
    if (!user) return;
    const { content } = request.body;
    if (!content) return reply.status(400).send({ error: 'content is required' });

    const db = getDb();
    const debate = await getDebateOr404(request.params.id, reply);
    if (!debate) return;

    if (debate.status !== 'active') {
      return reply.status(400).send({ error: 'Debate is not active' });
    }
    if (content.length > debate.maxCharactersPerTurn) {
      return reply.status(400).send({ error: `Message exceeds ${debate.maxCharactersPerTurn} character limit` });
    }

    const side = sideOfUser(debate, user.id as string);
    if (!side) return reply.code(403).send({ error: 'You are not a participant' });

    // Turn enforcement (docs/debates/FLOW.md): sender must own the active turn
    // and the turn must not have expired.
    const activeTurn = await getActiveTurn(debate.id);
    if (!activeTurn) {
      return reply.status(400).send({ error: 'No active turn' });
    }
    if (activeTurn.side !== side) {
      return reply.status(403).send({ error: 'It is not your turn' });
    }
    if (activeTurn.startTime.getTime() + debate.roundDurationMs < Date.now()) {
      return reply.status(400).send({ error: 'Your turn has expired' });
    }

    // Insert the message and close/advance the turn atomically. The turn close
    // inside closeTurnAndAdvance is a conditional UPDATE ... WHERE status='active'
    // so concurrent posts for the same turn cannot both insert + advance.
    const [message, result] = await db.transaction(async (tx) => {
      const [msg] = await tx.insert(messages).values({
        debateId: debate.id,
        turnId: activeTurn.id,
        senderId: user.id as any,
        side,
        content,
      }).returning();

      const adv = await closeTurnAndAdvance(debate.id, activeTurn.id, tx);
      return [msg, adv] as const;
    });

    debateEvents.emit('message_posted', {
      debateId: debate.id,
      turnId: activeTurn.id,
      side,
      messageId: message.id,
    });

    debateEvents.emit('turn_advanced', {
      debateId: debate.id,
      completed: result.completed,
      nextTurnId: result.nextTurn?.id ?? null,
    });

    return reply.status(201).send(message);
  });

  // Raise a hand during the opponent's turn. This is a request, not permission
  // to post (docs/debates/FLOW.md). Granting is an explicit, auditable decision.
  fastify.post('/api/debates/:id/raise-hand', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = await requireVerifiedUser(request, reply);
    if (!user) return;
    const debate = await getDebateOr404(request.params.id, reply);
    if (!debate) return;
    if (debate.status !== 'active') {
      return reply.status(400).send({ error: 'Debate is not active' });
    }

    const side = sideOfUser(debate, user.id as string);
    if (!side) return reply.code(403).send({ error: 'You are not a participant' });

    const activeTurn = await getActiveTurn(debate.id);
    if (!activeTurn || activeTurn.side === side) {
      return reply.status(400).send({ error: 'You can only raise a hand during the opponent’s turn' });
    }

    const db = getDb();
    const [requestRow] = await db.insert(raiseHandRequests).values({
      debateId: debate.id,
      requesterId: user.id as any,
      side,
    }).returning();

    debateEvents.emit('raise_hand', {
      debateId: debate.id,
      requestId: requestRow.id,
      side,
    });

    return reply.status(201).send(requestRow);
  });

  // Decide a raise-hand request. Grant/decline is an explicit decision; the
  // grant mechanism itself is an open question (docs/QUESTIONS.md), so we do
  // not auto-convert a grant into an immediate turn here.
  fastify.post('/api/debates/:id/raise-hand/:requestId', async (request: FastifyRequest<{ Params: { id: string; requestId: string }; Body: { decision: 'granted' | 'declined'; reason?: string } }>, reply: FastifyReply) => {
    const user = await requireVerifiedUser(request, reply);
    if (!user) return;
    const { decision, reason } = request.body;
    if (decision !== 'granted' && decision !== 'declined') {
      return reply.status(400).send({ error: 'decision must be granted or declined' });
    }

    const db = getDb();
    const [existing] = await db.select().from(raiseHandRequests)
      .where(and(eq(raiseHandRequests.id, request.params.requestId), eq(raiseHandRequests.debateId, request.params.id)))
      .limit(1);
    if (!existing) return reply.code(404).send({ error: 'Raise-hand request not found' });
    if (existing.status !== 'pending') {
      return reply.status(400).send({ error: 'Request already decided' });
    }

    const [updated] = await db.update(raiseHandRequests).set({
      status: decision,
      decidedById: user.id as any,
      decidedAt: new Date(),
      reason: reason ?? null,
    }).where(eq(raiseHandRequests.id, request.params.requestId)).returning();

    debateEvents.emit('raise_hand_decided', {
      debateId: request.params.id,
      requestId: updated.id,
      status: decision,
    });

    return reply.send(updated);
  });

  // Pin a fact/evidence item to the debate context (user-supplied; the AI must
  // not invent these). Any participant may pin; side defaults to neutral.
  fastify.post('/api/debates/:id/evidence', async (request: FastifyRequest<{ Params: { id: string }; Body: { claim: string; source?: string; side?: 'affirmative' | 'negative' | 'neutral' } }>, reply: FastifyReply) => {
    const user = await requireVerifiedUser(request, reply);
    if (!user) return;
    const { claim, source, side } = request.body;
    if (!claim) return reply.status(400).send({ error: 'claim is required' });

    const debate = await getDebateOr404(request.params.id, reply);
    if (!debate) return;
    if (debate.status !== 'active' && debate.status !== 'judging') {
      return reply.status(400).send({ error: 'Evidence can only be pinned while the debate is active or judging' });
    }
    if (!sideOfUser(debate, user.id as string)) {
      return reply.code(403).send({ error: 'You are not a participant' });
    }

    const db = getDb();
    const [row] = await db.insert(evidence).values({
      debateId: debate.id,
      pinnedById: user.id as any,
      side: side ?? 'neutral',
      claim,
      source: source ?? null,
    }).returning();

    return reply.status(201).send(row);
  });

  // Explicitly move an exhausted debate into judging and lock the transcript.
  fastify.post('/api/debates/:id/complete', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = await requireVerifiedUser(request, reply);
    if (!user) return;
    const debate = await requireParticipant(request.params.id, user.id as string, reply);
    if (!debate) return;
    if (debate.status !== 'active') {
      return reply.status(400).send({ error: `Debate is not active (status: ${debate.status})` });
    }
    if (debate.currentTurnId) {
      return reply.status(400).send({ error: 'Debate still has an active turn' });
    }

    // Atomically transition active -> judging, re-checking the guards inside the
    // transaction so a concurrent message/post cannot re-activate a turn after
    // we validated. enterJudging's conditional UPDATE only proceeds for an
    // 'active' debate, so concurrent completes are safe (first wins).
    const db = getDb();
    const [transitioned] = await db.transaction(async (tx) => {
      const rows = await tx.update(debates)
        .set({ status: 'judging', currentTurnId: null, updatedAt: new Date() })
        .where(and(eq(debates.id, debate.id), eq(debates.status, 'active'), sql`${debates.currentTurnId} IS NULL`))
        .returning();
      return rows;
    });

    if (!transitioned) {
      return reply.status(409).send({ error: 'Debate could not be completed (already completed or a turn is active)' });
    }

    debateEvents.emit('debate_state_changed', {
      debateId: transitioned.id,
      status: 'judging',
      currentTurnId: null,
      currentRound: transitioned.currentRound,
    });

    return reply.send({ status: 'judging' });
  });

  // Pause an active debate (no timer or message submission proceeds).
  fastify.post('/api/debates/:id/pause', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = await requireVerifiedUser(request, reply);
    if (!user) return;
    const debate = await getDebateOr404(request.params.id, reply);
    if (!debate) return;
    if (debate.status !== 'active') {
      return reply.status(400).send({ error: `Debate is not active (status: ${debate.status})` });
    }
    if (!sideOfUser(debate, user.id as string)) {
      return reply.code(403).send({ error: 'You are not a participant' });
    }

    const db = getDb();
    await db.update(debates).set({ status: 'paused', updatedAt: new Date() }).where(eq(debates.id, debate.id));
    debateEvents.emit('debate_state_changed', {
      debateId: debate.id,
      status: 'paused',
      currentTurnId: debate.currentTurnId,
      currentRound: debate.currentRound,
    });
    return reply.send({ status: 'paused' });
  });

  // Resume a paused debate back to active.
  fastify.post('/api/debates/:id/resume', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = await requireUser(request, reply);
    if (!user) return;
    const debate = await getDebateOr404(request.params.id, reply);
    if (!debate) return;
    if (debate.status !== 'paused') {
      return reply.status(400).send({ error: `Debate is not paused (status: ${debate.status})` });
    }
    if (!sideOfUser(debate, user.id as string)) {
      return reply.code(403).send({ error: 'You are not a participant' });
    }

    const db = getDb();
    await db.update(debates).set({ status: 'active', updatedAt: new Date() }).where(eq(debates.id, debate.id));
    debateEvents.emit('debate_state_changed', {
      debateId: debate.id,
      status: 'active',
      currentTurnId: debate.currentTurnId,
      currentRound: debate.currentRound,
    });
    return reply.send({ status: 'active' });
  });

  // Cancel a debate (from waiting_for_participants or active). Records a
  // moderation/termination event only when a reason is supplied.
  fastify.post('/api/debates/:id/cancel', async (request: FastifyRequest<{ Params: { id: string }; Body: { reason?: string; category?: 'harassment' | 'threat' | 'hate' | 'spam' | 'disruption' | 'other' } }>, reply: FastifyReply) => {
    const user = await requireVerifiedUser(request, reply);
    if (!user) return;
    const { reason, category } = request.body;
    const debate = await getDebateOr404(request.params.id, reply);
    if (!debate) return;
    if (debate.status !== 'waiting_for_participants' && debate.status !== 'active') {
      return reply.status(400).send({ error: `Cannot cancel in status '${debate.status}'` });
    }
    if (!sideOfUser(debate, user.id as string)) {
      return reply.code(403).send({ error: 'You are not a participant' });
    }

    const db = getDb();
    await db.update(debates).set({ status: 'cancelled', updatedAt: new Date() }).where(eq(debates.id, debate.id));

    if (reason) {
      await db.insert(moderationEvents).values({
        debateId: debate.id,
        userId: user.id as any,
        category: category ?? 'other',
        action: 'terminate',
        explanation: reason,
      });
    }

    debateEvents.emit('debate_state_changed', {
      debateId: debate.id,
      status: 'cancelled',
      currentTurnId: null,
      currentRound: debate.currentRound,
    });
    return reply.send({ status: 'cancelled' });
  });

  // Request Lawyer advice (private, per participant)
  fastify.post('/api/debates/:id/lawyer', async (request: FastifyRequest<{ Params: { id: string }; Body: { request: string } }>, reply: FastifyReply) => {
    const user = await requireVerifiedUser(request, reply);
    if (!user) return;
    const { request: participantRequest } = request.body;
    if (!participantRequest) return reply.status(400).send({ error: 'request is required' });

    const db = getDb();
    const [debate] = await db.select().from(debates).where(eq(debates.id, request.params.id)).limit(1);
    if (!debate) return reply.code(404).send({ error: 'Debate not found' });

    const side = debate.participants?.affirmative.userId === user.id ? 'affirmative'
      : debate.participants?.negative.userId === user.id ? 'negative' : null;
    if (!side) return reply.code(403).send({ error: 'You are not a participant' });

    // Enforce the per-debate AI token budget before issuing a request.
    const budget = await checkDebateBudget(debate.id);
    if (!budget.allowed) {
      return reply.status(429).send({
        error: 'AI token budget for this debate has been exhausted',
        used: budget.used,
        limit: budget.limit,
      });
    }

    const publicMessages = await db.select().from(messages).where(eq(messages.debateId, debate.id));
    const evidenceRows = await db.select().from(evidence).where(eq(evidence.debateId, debate.id));

    let conversation = await db.select().from(lawyerConversations)
      .where(and(eq(lawyerConversations.debateId, debate.id), eq(lawyerConversations.participantId, user.id as any)))
      .limit(1);
    if (!conversation.length) {
      const [created] = await db.insert(lawyerConversations).values({
        debateId: debate.id,
        participantId: user.id as any,
      }).returning();
      conversation = [created];
    }

    try {
      const { response, tokensUsed, requestId } = await getLawyerAdvice({
        debateTopic: debate.topic,
        participantSide: side,
        publicMessages: publicMessages.map((m) => ({ side: m.side, content: m.content, createdAt: m.createdAt.toISOString() })),
        participantRequest,
        evidence: evidenceRows.map((e) => ({ side: e.side, claim: e.claim, source: e.source })),
      });

      const [stored] = await db.insert(lawyerRequests).values({
        conversationId: conversation[0].id,
        participantRequest,
        context: { side, debateId: debate.id },
        aiResponse: response as any,
        tokensUsed,
      }).returning();

      await db.insert(aiUsage).values({
        debateId: debate.id,
        role: 'lawyer',
        tokensUsed,
        requestId: requestId ?? null,
        model: config.aiLawyerModel ?? 'unset',
      });

      return reply.status(200).send({ id: stored.id, advice: response });
    } catch (error) {
      logger.error('lawyer.request_failed', { debateId: debate.id, participantId: user.id, error });
      return reply.status(502).send({ error: 'Lawyer advice could not be generated. Please try again.' });
    }
  });

  // Get the Judge report for a completed/judging debate, if one exists.
  fastify.get('/api/debates/:id/report', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = await requireUser(request, reply);
    if (!user) return;
    const debate = await requireParticipant(request.params.id, user.id as string, reply);
    if (!debate) return;
    const db = getDb();

    if (!debate.judgeReportId) {
      return reply.code(404).send({ error: 'No judge report yet', status: debate.status });
    }
    const [report] = await db.select().from(judgeReports).where(eq(judgeReports.id, debate.judgeReportId)).limit(1);
    return report ?? reply.code(404).send({ error: 'Report missing' });
  });

  // Trigger judging once a debate is completed
  fastify.post('/api/debates/:id/judge', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = await requireUser(request, reply);
    if (!user) return;

    const db = getDb();
    const [debate] = await db.select().from(debates).where(eq(debates.id, request.params.id)).limit(1);
    if (!debate) return reply.code(404).send({ error: 'Debate not found' });

    // Idempotency: if a report already exists, return it instead of spending AI
    // tokens again (prevents double-charge on retry / double-click).
    if (debate.judgeReportId) {
      const [existing] = await db.select().from(judgeReports).where(eq(judgeReports.id, debate.judgeReportId)).limit(1);
      return reply.status(200).send(existing ?? { error: 'Report missing' });
    }
    if (debate.status !== 'judging') {
      return reply.status(400).send({ error: `Debate must be in 'judging' status to be judged (status: ${debate.status})` });
    }

    const budget = await checkDebateBudget(debate.id);
    if (!budget.allowed) {
      return reply.status(429).send({
        error: 'AI token budget for this debate has been exhausted',
        used: budget.used,
        limit: budget.limit,
      });
    }

    const publicMessages = await db.select().from(messages).where(eq(messages.debateId, debate.id));
    const evidenceRows = await db.select().from(evidence).where(eq(evidence.debateId, debate.id));

    try {
      const { response, tokensUsed, requestId } = await evaluateDebate({
        debateTopic: debate.topic,
        publicMessages: publicMessages.map((m) => ({ id: m.id, side: m.side, content: m.content, createdAt: m.createdAt.toISOString() })),
        evidence: evidenceRows.map((e) => ({ side: e.side, claim: e.claim, source: e.source })),
      });

      // Persist everything inside a transaction guarded by
      // `status='judging' AND judgeReportId IS NULL`. A concurrent second judge
      // call sees the row already updated and gets 0 rows -> 409, so we never
      // write a duplicate report or double-count AI tokens.
      const [report] = await db.transaction(async (tx) => {
        const [target] = await tx.update(debates)
          .set({ status: 'completed' })
          .where(and(eq(debates.id, debate.id), eq(debates.status, 'judging'), sql`${debates.judgeReportId} IS NULL`))
          .returning();

        if (!target) {
          return [null];
        }

        const [rep] = await tx.insert(judgeReports).values({
          debateId: debate.id,
          outcome: response.outcome,
          confidence: response.confidence,
          verdict: response.verdict,
          scores: response.scores as any,
          strengths: response.strengths as any,
          weaknesses: response.weaknesses as any,
          feedback: response.feedback as any,
          fallacies: response.fallacies as any,
          conductFindings: response.conductFindings as any,
          summary: response.summary,
          tokensUsed,
        }).returning();

        if (Array.isArray(response.conductFindings)) {
          for (const finding of response.conductFindings) {
            const messageId = finding.messageIds?.[0];
            await tx.insert(moderationEvents).values({
              debateId: debate.id,
              messageId: messageId ? (messageId as any) : null,
              category: finding.category ?? 'other',
              action: finding.recommendedAction ?? 'none',
              explanation: `${finding.side}: ${finding.explanation}`,
            });
          }
        }

        await tx.update(debates).set({ judgeReportId: rep.id, completedAt: new Date() })
          .where(eq(debates.id, debate.id));

        await tx.insert(aiUsage).values({
          debateId: debate.id,
          role: 'judge',
          tokensUsed,
          requestId: requestId ?? null,
          model: config.aiJudgeModel ?? 'unset',
        });

        return [rep];
      });

      if (!report) {
        return reply.status(409).send({ error: 'This debate is already being judged or has a report' });
      }

      return reply.status(200).send(report);
    } catch (error) {
      logger.error('judge.request_failed', { debateId: debate.id, error });
      return reply.status(502).send({ error: 'Judging failed. Please try again.' });
    }
  });
}
