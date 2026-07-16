import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db/index.js';
import * as schema from '../db/schema/index.js';
import { config } from '../config/env.js';
import { sendEmail } from '../email/index.js';

// Typed loosely: Better Auth 1.6's generic return type is incompatible with the
// inferred options object, and the db instance is nullable until connect() runs.
let authInstance: any = null;

export async function init() {
  if (authInstance) {
    return authInstance;
  }

  authInstance = betterAuth({
    database: drizzleAdapter(db!, {
      provider: 'pg',
      schema: {
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verifications,
      },
    }),
    emailAndPassword: {
      enabled: true,
      // Email verification is now wired via Resend (see D-010). Users must
      // verify before fully participating; signup still succeeds, verification
      // email is sent automatically.
      requireEmailVerification: true,
      sendResetPassword: async ({ user, url, token }, request) => {
        await sendEmail({
          to: user.email,
          subject: 'Reset your Debatr password',
          text: `Reset your Debatr password using the link below. It expires soon:\n\n${url}`,
          html: `<p>Reset your Debatr password using the link below. It expires soon:</p><p><a href="${url}">${url}</a></p>`,
        });
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      sendVerificationEmail: async ({ user, url, token }, request) => {
        await sendEmail({
          to: user.email,
          subject: 'Verify your Debatr email',
          text: `Welcome to Debatr. Verify your email to activate your account:\n\n${url}`,
          html: `<p>Welcome to Debatr. Verify your email to activate your account:</p><p><a href="${url}">${url}</a></p>`,
        });
      },
    },
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60, // Cache session for 60 seconds
      },
    },
    trustedOrigins: [config.webOrigin],
  });

  return authInstance;
}

export function getAuth() {
  if (!authInstance) {
    throw new Error('Auth not initialized. Call init() first.');
  }
  return authInstance;
}

export { authInstance as auth };
