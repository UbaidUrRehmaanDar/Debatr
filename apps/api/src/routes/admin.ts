import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { hashPassword } from 'better-auth/crypto';
import { getDb } from '../db/index.js';
import { users, accounts } from '../db/schema/index.js';
import { sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

interface CreateAdminBody {
  email: string;
  password: string;
  name: string;
}

export async function registerAdminRoutes(fastify: FastifyInstance) {
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
