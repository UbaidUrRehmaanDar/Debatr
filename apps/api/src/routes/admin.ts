import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { hashPassword } from 'better-auth/crypto';
import { getAuth } from '../auth/index.js';
import { getDb } from '../db/index.js';
import { users, accounts } from '../db/schema/index.js';
import { sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { getAiUsageDashboard } from '../ai/usage.js';
import { logger } from '../observability/logger.js';

interface CreateAdminBody {
  email: string;
  password: string;
  name: string;
}

// Require an authenticated admin session. Returns the user or sends 401/403.
async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: request.headers as any });
  const user = session?.user as { id: string; role?: string } | null;
  if (!user) {
    reply.code(401).send({ error: 'Not authenticated' });
    return null;
  }
  if (user.role !== 'admin') {
    reply.code(403).send({ error: 'Admin access required' });
    return null;
  }
  return user;
}

export async function registerAdminRoutes(fastify: FastifyInstance) {
  // AI cost / usage dashboard aggregated from the `aiUsage` table.
  fastify.get('/api/admin/ai-usage', async (request: FastifyRequest<{ Querystring: { since?: string } }>, reply: FastifyReply) => {
    const admin = await requireAdmin(request, reply);
    if (!admin) return;

    let since: Date | undefined;
    if (request.query.since) {
      const parsed = new Date(request.query.since);
      if (!isNaN(parsed.getTime())) {
        since = parsed;
      } else {
        return reply.status(400).send({ error: 'Invalid "since" query (expected ISO date)' });
      }
    }

    try {
      const dashboard = await getAiUsageDashboard(since);
      logger.info('admin.ai_usage_viewed', { adminId: admin.id, since: since?.toISOString() });
      return reply.send(dashboard);
    } catch (error) {
      logger.error('admin.ai_usage_failed', { adminId: admin.id, error });
      return reply.status(500).send({ error: 'Failed to build usage dashboard' });
    }
  });

  // Bootstrap the first administrator. Only works when zero users exist, so it
  // cannot be abused after the system has an admin. Inserts the user and a
  // password-hashed accounts row directly (Better Auth's createUser endpoint
  // requires the admin plugin), producing a loginable account.
  fastify.post('/api/admin/bootstrap', async (request: FastifyRequest<{ Body: CreateAdminBody }>, reply: FastifyReply) => {
    const db = getDb();
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(users);

    if (count > 0) {
      return reply.status(409).send({ error: 'Administrator already exists. Bootstrap is disabled.' });
    }

    const { email, password, name } = request.body;
    if (!email || !password || !name) {
      return reply.status(400).send({ error: 'email, password, and name are required' });
    }

    try {
      const userId = randomUUID();
      const hashed = await hashPassword(password);

      await db.insert(users).values({
        id: userId,
        email,
        name,
        emailVerified: true,
        role: 'admin',
      });

      await db.insert(accounts).values({
        id: randomUUID(),
        userId,
        accountId: userId,
        providerId: 'credential',
        password: hashed,
      });

      return reply.status(201).send({
        user: { id: userId, email, role: 'admin' },
        message: 'Administrator created. You can now sign in.',
      });
    } catch (error) {
      fastify.log.error('Admin bootstrap error: ' + (error as Error).message);
      return reply.status(500).send({ error: 'Failed to create administrator' });
    }
  });
}
