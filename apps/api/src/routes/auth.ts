import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getAuth } from '../auth/index.js';
import { getDb } from '../db/index.js';
import { invitations } from '../db/schema/index.js';
import { eq, and, sql } from 'drizzle-orm';

interface SignUpBody {
  email: string;
  password: string;
  name: string;
  invitationCode: string;
}

interface SignInBody {
  email: string;
  password: string;
}

// Client-error thrown for expected invitation problems (handled distinctly from
// unexpected 500s in the signup catch block).
class InvitationError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Better Auth sets the session cookie on its response object. Forward any
// Set-Cookie headers it produced onto the Fastify reply so the browser keeps
// the session.
function forwardAuthCookies(result: any, reply: FastifyReply) {
  const headers: Headers | undefined = result?.response?.headers;
  if (!headers) return;
  // A Headers object may carry multiple `set-cookie` entries; `.get()` only
  // returns the first, which would silently drop Better Auth's other cookies.
  const all: string[] =
    typeof (headers as any).getSetCookie === 'function'
      ? (headers as any).getSetCookie()
      : (headers.get('set-cookie') ? [headers.get('set-cookie') as string] : []);
  if (all.length) {
    // Fastify accepts an array and emits one Set-Cookie header per entry.
    reply.header('set-cookie', all);
  }
}

export async function registerAuthRoutes(fastify: FastifyInstance) {
  // Sign up with invitation code
  fastify.post('/api/auth/signup', async (request: FastifyRequest<{ Body: SignUpBody }>, reply: FastifyReply) => {
    const { email, password, name, invitationCode } = request.body;
    const db = getDb();
    const auth = getAuth();

    // Atomically claim the invitation. We lock the invitation row (FOR UPDATE)
    // inside a transaction and mark it used only after the user is created, so
    // two concurrent signups with the same code cannot both succeed — the
    // loser's conditional UPDATE affects 0 rows and we roll back. This prevents
    // a single invitation code from minting unlimited accounts.
    try {
      const result: any = await db.transaction(async (tx) => {
        const [invitation] = await tx
          .select()
          .from(invitations)
          .where(eq(invitations.code, invitationCode))
          .for('update');

        if (!invitation) {
          throw new InvitationError('Invalid invitation code', 400);
        }
        if (invitation.usedBy) {
          throw new InvitationError('Invitation already used', 400);
        }
        if (invitation.expiresAt < new Date()) {
          throw new InvitationError('Invitation expired', 400);
        }
        if (invitation.email !== email) {
          throw new InvitationError('Invitation email does not match', 400);
        }

        // Create user via Better Auth (shares the same db transaction client).
        const created: any = await auth.api.signUpEmail({
          body: { email, password, name },
          headers: request.headers as any,
        });

        if (!created?.user) {
          throw new Error('Failed to create user');
        }

        // Claim the invitation atomically; if 0 rows, another request won the
        // race and we abort the transaction (the user insert is rolled back).
        const [claimed] = await tx.update(invitations)
          .set({ usedBy: created.user.id, usedAt: new Date() })
          .where(and(eq(invitations.id, invitation.id), eq(invitations.usedBy, sql`NULL`)))
          .returning();

        if (!claimed) {
          throw new InvitationError('Invitation already used', 400);
        }

        return created;
      });

      // Forward Better Auth's session Set-Cookie header if present
      forwardAuthCookies(result, reply);

      return reply.status(201).send({
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          emailVerified: result.user.emailVerified,
        },
        message: 'Account created.',
      });
    } catch (error) {
      if (error instanceof InvitationError) {
        return reply.status(error.status).send({ error: error.message });
      }
      fastify.log.error('Signup error: ' + (error as Error).message);
      return reply.status(500).send({ error: 'Failed to create account' });
    }
  });
  
  // Sign in
  fastify.post('/api/auth/signin', async (request: FastifyRequest<{ Body: SignInBody }>, reply: FastifyReply) => {
    const { email, password } = request.body;
    
    const auth = getAuth();
    
    try {
      const result: any = await auth.api.signInEmail({
        body: { email, password },
        headers: request.headers as any,
      });
      
      if (!result?.user) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }
      
      forwardAuthCookies(result, reply);
      
      return reply.send({
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          emailVerified: result.user.emailVerified,
        },
      });
    } catch (error) {
      fastify.log.error('Signin error: ' + (error as Error).message);
      return reply.status(401).send({ error: 'Invalid credentials' });
    }
  });
  
  // Sign out
  fastify.post('/api/auth/signout', async (request: FastifyRequest, reply: FastifyReply) => {
    const auth = getAuth();
    
    try {
      // signOut returns a Response whose headers expire Better Auth's real
      // session cookie. Forward those (multi-cookie safe) instead of manually
      // clearing a cookie name we don't control.
      const result = await auth.api.signOut({
        headers: request.headers as any,
        asResponse: true,
      });
      forwardAuthCookies({ response: result }, reply);
      return reply.send({ success: true });
    } catch (error) {
      fastify.log.error('Signout error: ' + (error as Error).message);
      return reply.status(500).send({ error: 'Failed to sign out' });
    }
  });
  
  // Get current user
  fastify.get('/api/auth/me', async (request: FastifyRequest, reply: FastifyReply) => {
    const auth = getAuth();
    
    try {
      const session = await auth.api.getSession({
        headers: request.headers as any,
      });
      
      if (!session?.user) {
        return reply.status(401).send({ error: 'Not authenticated' });
      }
      
      return reply.send({
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          emailVerified: session.user.emailVerified,
          role: (session.user as any).role || 'user',
        },
      });
    } catch (error) {
      fastify.log.error('Get session error: ' + (error as Error).message);
      return reply.status(500).send({ error: 'Failed to get session' });
    }
  });
  
  // Request password reset
  fastify.post('/api/auth/forgot-password', async (request: FastifyRequest<{ Body: { email: string } }>, reply: FastifyReply) => {
    const { email } = request.body;
    const auth = getAuth();
    
    try {
      await auth.api.forgotPassword({
        body: { email },
      });
      
      return reply.send({ 
        success: true,
        message: 'If an account exists with that email, a password reset link has been sent.',
      });
    } catch (error) {
      fastify.log.error('Password reset error: ' + (error as Error).message);
      // Don't reveal if email exists
      return reply.send({ 
        success: true,
        message: 'If an account exists with that email, a password reset link has been sent.',
      });
    }
  });
  
  // Reset password
  fastify.post('/api/auth/reset-password', async (request: FastifyRequest<{ Body: { token: string; newPassword: string } }>, reply: FastifyReply) => {
    const { token, newPassword } = request.body;
    const auth = getAuth();
    
    try {
      await auth.api.resetPassword({
        query: { token },
        body: { newPassword },
      });
      
      return reply.send({ success: true });
    } catch (error) {
      fastify.log.error('Reset password error: ' + (error as Error).message);
      return reply.status(400).send({ error: 'Invalid or expired reset token' });
    }
  });

  // Verify email (Better Auth: GET /verify-email?token=...)
  fastify.get('/api/auth/verify-email', async (request: FastifyRequest<{ Querystring: { token?: string } }>, reply: FastifyReply) => {
    const { token } = request.query;
    if (!token) {
      return reply.status(400).send({ error: 'Missing verification token' });
    }
    const auth = getAuth();
    try {
      await auth.api.verifyEmail({ query: { token } });
      return reply.send({ success: true });
    } catch (error) {
      fastify.log.error('Verify email error: ' + (error as Error).message);
      return reply.status(400).send({ error: 'Invalid or expired verification token' });
    }
  });
}
