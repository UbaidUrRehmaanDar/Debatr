import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getAuth } from '../auth/index.js';
import { getDb } from '../db/index.js';
import { users, invitations } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

interface CreateInvitationBody {
  email: string;
  expiresInDays?: number;
}

async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: request.headers as any });
  if (!session?.user) {
    reply.code(401).send({ error: 'Not authenticated' });
    return null;
  }
  if ((session.user as any).role !== 'admin') {
    reply.code(403).send({ error: 'Admin access required' });
    return null;
  }
  return session.user;
}

export async function registerInvitationRoutes(fastify: FastifyInstance) {
  // List invitations (admin only)
  fastify.get('/api/invitations', async (request, reply) => {
    const admin = await requireAdmin(request, reply);
    if (!admin) return;
    const db = getDb();
    const rows = await db.select().from(invitations).orderBy(invitations.createdAt);
    return rows;
  });

  // Create an invitation (admin only)
  fastify.post('/api/invitations', async (request: FastifyRequest<{ Body: CreateInvitationBody }>, reply: FastifyReply) => {
    const admin = await requireAdmin(request, reply);
    if (!admin) return;

    const { email, expiresInDays } = request.body;
    if (!email) {
      return reply.status(400).send({ error: 'email is required' });
    }

    const db = getDb();
    const code = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (expiresInDays ?? 7));

    const [invitation] = await db.insert(invitations).values({
      code,
      email,
      createdBy: admin.id as any,
      expiresAt,
    }).returning();

    return reply.status(201).send(invitation);
  });
}
