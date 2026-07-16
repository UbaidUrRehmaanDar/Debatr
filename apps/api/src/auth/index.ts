import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db/index.js';
import * as schema from '../db/schema/index.js';
import { config } from '../config/env.js';

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
        session: schema.sessions, // We'll create this if needed
        account: schema.accounts, // We'll create this if needed
        verification: schema.verifications, // We'll create this if needed
      },
    }),
    emailAndPassword: {
      enabled: true,
      // Dev note: set to true once an email sender is wired up. Left false so
      // local signup works without an SMTP/email provider (see D-010).
      requireEmailVerification: false,
    },
    emailVerification: {
      sendOnSignUp: false,
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
