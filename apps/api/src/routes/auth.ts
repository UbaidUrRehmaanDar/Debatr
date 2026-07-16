import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getAuth } from '../auth/index.js';
import { getDb } from '../db/index.js';
import { users, invitations } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';

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

// Better Auth sets the session cookie on its response object. Forward any
// Set-Cookie headers it produced onto the Fastify reply so the browser keeps
// the session.
function forwardAuthCookies(result: any, reply: FastifyReply) {
  const headers: Headers | undefined = result?.response?.headers;
  if (!headers) return;
  const setCookie = headers.get('set-cookie');
  if (setCookie) {
    reply.header('set-cookie', setCookie);
  }
}

export async function registerAuthRoutes(fastify: FastifyInstance) {
  // Sign up with invitation code
  fastify.post('/api/auth/signup', async (request: FastifyRequest<{ Body: SignUpBody }>, reply: FastifyReply) => {
    const { email, password, name, invitationCode } = request.body;
    
    // Validate invitation code
    const db = getDb();
    const invitation = await db.query.invitations.findFirst({
      where: eq(invitations.code, invitationCode),
    });
    
    if (!invitation) {
      return reply.status(400).send({ error: 'Invalid invitation code' });
    }
    
    if (invitation.usedBy) {
      return reply.status(400).send({ error: 'Invitation already used' });
    }
    
    if (invitation.expiresAt < new Date()) {
      return reply.status(400).send({ error: 'Invitation expired' });
    }
    
    if (invitation.email !== email) {
      return reply.status(400).send({ error: 'Invitation email does not match' });
    }
    
    const auth = getAuth();

    try {
      // Create user via Better Auth
      const result: any = await auth.api.signUpEmail({
        body: {
          email,
          password,
          name,
        },
        headers: request.headers as any,
      });

      if (!result?.user) {
        return reply.status(400).send({ error: 'Failed to create user' });
      }

      // Mark invitation as used
      await db.update(invitations)
        .set({
          usedBy: result.user.id,
          usedAt: new Date(),
        })
        .where(eq(invitations.id, invitation.id));

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
      await auth.api.signOut({
        headers: request.headers as any,
      });
      
      reply.clearCookie('auth-session', { path: '/' });
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
}
