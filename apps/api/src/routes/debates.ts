import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getAuth } from '../auth/index.js';
import { getDb } from '../db/index.js';
import {
  users,
  debates,
  turns,
  messages,
  lawyerConversations,
  lawyerRequests,
  judgeReports,
  aiUsage,
} from '../db/schema/index.js';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { config } from '../config/env.js';
import { getLawyerAdvice } from '../ai/lawyer.js';
import { evaluateDebate } from '../ai/judge.js';

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

  // Get a single debate
  fastify.get('/api/debates/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = await requireUser(request, reply);
    if (!user) return;
    const db = getDb();
    const [debate] = await db.select().from(debates).where(eq(debates.id, request.params.id)).limit(1);
    if (!debate) return reply.code(404).send({ error: 'Debate not found' });
    return debate;
  });

  // Submit a public message for the current turn
  fastify.post('/api/debates/:id/message', async (request: FastifyRequest<{ Params: { id: string }; Body: { content: string } }>, reply: FastifyReply) => {
    const user = await requireUser(request, reply);
    if (!user) return;
    const { content } = request.body;
    if (!content) return reply.status(400).send({ error: 'content is required' });

    const db = getDb();
    const [debate] = await db.select().from(debates).where(eq(debates.id, request.params.id)).limit(1);
    if (!debate) return reply.code(404).send({ error: 'Debate not found' });
    if (content.length > debate.maxCharactersPerTurn) {
      return reply.status(400).send({ error: `Message exceeds ${debate.maxCharactersPerTurn} character limit` });
    }
    if (debate.status !== 'active') {
      return reply.status(400).send({ error: 'Debate is not active' });
    }

    const side = debate.participants?.affirmative.userId === user.id ? 'affirmative'
      : debate.participants?.negative.userId === user.id ? 'negative' : null;
    if (!side) return reply.code(403).send({ error: 'You are not a participant' });

    const [message] = await db.insert(messages).values({
      debateId: debate.id,
      senderId: user.id as any,
      side,
      content,
    }).returning();

    return reply.status(201).send(message);
  });

  // Request Lawyer advice (private, per participant)
  fastify.post('/api/debates/:id/lawyer', async (request: FastifyRequest<{ Params: { id: string }; Body: { request: string } }>, reply: FastifyReply) => {
    const user = await requireUser(request, reply);
    if (!user) return;
    const { request: participantRequest } = request.body;
    if (!participantRequest) return reply.status(400).send({ error: 'request is required' });

    const db = getDb();
    const [debate] = await db.select().from(debates).where(eq(debates.id, request.params.id)).limit(1);
    if (!debate) return reply.code(404).send({ error: 'Debate not found' });

    const side = debate.participants?.affirmative.userId === user.id ? 'affirmative'
      : debate.participants?.negative.userId === user.id ? 'negative' : null;
    if (!side) return reply.code(403).send({ error: 'You are not a participant' });

    const publicMessages = await db.select().from(messages).where(eq(messages.debateId, debate.id));

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
      const { response, tokensUsed } = await getLawyerAdvice({
        debateTopic: debate.topic,
        participantSide: side,
        publicMessages: publicMessages.map((m) => ({ side: m.side, content: m.content, createdAt: m.createdAt.toISOString() })),
        participantRequest,
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
        model: config.aiLawyerModel ?? 'unset',
      });

      return reply.status(200).send({ id: stored.id, advice: response });
    } catch (error) {
      fastify.log.error('Lawyer error: ' + (error as Error).message);
      return reply.status(502).send({ error: (error as Error).message });
    }
  });

  // Trigger judging once a debate is completed
  fastify.post('/api/debates/:id/judge', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = await requireUser(request, reply);
    if (!user) return;

    const db = getDb();
    const [debate] = await db.select().from(debates).where(eq(debates.id, request.params.id)).limit(1);
    if (!debate) return reply.code(404).send({ error: 'Debate not found' });

    const publicMessages = await db.select().from(messages).where(eq(messages.debateId, debate.id));

    try {
      const { response, tokensUsed } = await evaluateDebate({
        debateTopic: debate.topic,
        publicMessages: publicMessages.map((m) => ({ id: m.id, side: m.side, content: m.content, createdAt: m.createdAt.toISOString() })),
      });

      const [report] = await db.insert(judgeReports).values({
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

      await db.update(debates).set({ status: 'completed', judgeReportId: report.id, completedAt: new Date() })
        .where(eq(debates.id, debate.id));

      await db.insert(aiUsage).values({
        debateId: debate.id,
        role: 'judge',
        tokensUsed,
        model: config.aiJudgeModel ?? 'unset',
      });

      return reply.status(200).send(report);
    } catch (error) {
      fastify.log.error('Judge error: ' + (error as Error).message);
      await db.update(debates).set({ status: 'judging' }).where(eq(debates.id, debate.id));
      return reply.status(502).send({ error: (error as Error).message });
    }
  });
}
