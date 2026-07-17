import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getAuth } from '../auth/index.js';
import { getDb } from '../db/index.js';
import { debates, turns, messages, judgeReports, exports } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';
import { buildExportPayload, validateExportPayload, checkImportVersion } from './exports.js';

async function requireParticipant(request: FastifyRequest, reply: FastifyReply) {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: request.headers as any });
  if (!session?.user) {
    reply.code(401).send({ error: 'Not authenticated' });
    return null;
  }
  return session.user;
}

export async function registerExportRoutes(fastify: FastifyInstance) {
  // Export a debate as a portable JSON file (schema-validated).
  fastify.post('/api/debates/:id/export', async (request: FastifyRequest<{ Params: { id: string }; Body: { includeLawyerLogs?: boolean } }>, reply: FastifyReply) => {
    const user = await requireParticipant(request, reply);
    if (!user) return;

    const db = getDb();
    const [debate] = await db.select().from(debates).where(eq(debates.id, request.params.id)).limit(1);
    if (!debate) return reply.code(404).send({ error: 'Debate not found' });

    const isParticipant =
      debate.participants?.affirmative.userId === user.id ||
      debate.participants?.negative.userId === user.id;
    const isAdmin = (user as any).role === 'admin';
    if (!isParticipant && !isAdmin) {
      return reply.code(403).send({ error: 'You may only export debates you participate in' });
    }

    const debateTurns = await db.select().from(turns).where(eq(turns.debateId, debate.id));
    const debateMessages = await db.select().from(messages).where(eq(messages.debateId, debate.id));
    const judgeReport = debate.judgeReportId
      ? (await db.select().from(judgeReports).where(eq(judgeReports.id, debate.judgeReportId)).limit(1))[0] ?? null
      : null;

    // Lawyer logs excluded by default (privacy). Including them requires an
    // explicit, deliberate flag and is gated behind future consent policy.
    const includeLawyerLogs = request.body?.includeLawyerLogs === true;
    if (includeLawyerLogs) {
      return reply.status(501).send({ error: 'Including Lawyer logs in export is not enabled yet.' });
    }

    const payload = buildExportPayload(debate, debateTurns, debateMessages, judgeReport, user.id as string);
    const validation = validateExportPayload(payload);
    if (!validation.valid) {
      fastify.log.error('Export failed schema validation: ' + JSON.stringify(validation.errors));
      return reply.status(500).send({ error: 'Export did not match schema', details: validation.errors });
    }

    await db.insert(exports).values({
      debateId: debate.id,
      createdBy: user.id as any,
      includeLawyerLogs: false,
      data: payload,
    });

    const filename = `debatr-${debate.id}.json`;
    reply.header('Content-Type', 'application/json');
    reply.header('Content-Disposition', `attachment; filename="${filename}"`);
    return reply.send(payload);
  });

  // Import an exported debate as reference material. Validates schema + version
  // and stores a reference record. Imported material is context, not truth.
  fastify.post('/api/imports', async (request: FastifyRequest<{ Body: { data: unknown } }>, reply: FastifyReply) => {
    const user = await requireParticipant(request, reply);
    if (!user) return;

    const data = request.body?.data;
    if (!data || typeof data !== 'object') {
      return reply.status(400).send({ error: 'Export data is required' });
    }

    // Reject oversized payloads before validation/parsing to bound storage and
    // memory (the export JSON schema defines no max length on its own).
    const rawSize = JSON.stringify(request.body).length;
    const MAX_IMPORT_BYTES = 5 * 1024 * 1024; // 5 MB
    if (rawSize > MAX_IMPORT_BYTES) {
      return reply.status(413).send({ error: 'Export file too large (max 5 MB)' });
    }

    const validation = validateExportPayload(data);
    if (!validation.valid) {
      return reply.status(400).send({ error: 'Invalid export file', details: validation.errors });
    }

    const version = (data as any).version as string;
    const versionCheck = checkImportVersion(version);
    if (!versionCheck.accepted) {
      return reply.status(400).send({ error: versionCheck.note });
    }

    const db = getDb();
    // Imports are reference material and are NOT linked to any debate via a
    // foreign key. The upload's own debate id is untrusted, so we store it only
    // as provenance text (sourceDebateId) and never as a FK target.
    const [record] = await db.insert(exports).values({
      debateId: null,
      sourceDebateId: String((data as any).debate?.id ?? '').slice(0, 255) || null,
      createdBy: user.id as any,
      includeLawyerLogs: false,
      data,
    }).returning();

    return reply.status(201).send({
      id: record.id,
      topic: (data as any).debate.topic,
      outcome: (data as any).judgeReport?.outcome ?? null,
      note: 'Stored as reference material. Use it explicitly in a new debate context; it is not automatic memory.',
    });
  });
}
