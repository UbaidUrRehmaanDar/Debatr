import postgres from 'postgres';
import { config } from '../src/config/env.js';
import { connect, disconnect } from '../src/db/index.js';

// Integration tests run against a dedicated test database so they never touch
// the application's real data. Point DATABASE_URL at the test DB before the app
// code (which reads it via the config singleton) is imported.
const TEST_DB_URL =
  process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? '';
export const hasTestDb = TEST_DB_URL.length > 0;

if (hasTestDb) {
  process.env.DATABASE_URL = TEST_DB_URL;
  // vitest sets NODE_ENV=test, but the app config only allows
  // development|production. Treat the test run as development.
  process.env.NODE_ENV = 'development';
}

const TABLES = [
  'ai_usage',
  'moderation_events',
  'evidence',
  'raise_hand_requests',
  'lawyer_requests',
  'lawyer_conversations',
  'messages',
  'turns',
  'judge_reports',
  'exports',
  'debates',
  'accounts',
  'sessions',
  'verifications',
  'invitations',
  'users',
];

let admin: postgres.Sql | null = null;

export async function setupTestDb(): Promise<void> {
  if (!hasTestDb) return;
  config.load();
  await connect();
  admin = postgres(TEST_DB_URL, { max: 1 });
  // Start from a clean slate so leftover rows from a previous (separate) test
  // run don't cause unique-constraint collisions on seeded ids like 'user-aaa'.
  await truncateAll();
}

export async function teardownTestDb(): Promise<void> {
  if (admin) {
    await admin.end();
    admin = null;
  }
  await disconnect();
}

// Remove all rows between tests for isolation. CASCADE handles FK chains.
export async function truncateAll(): Promise<void> {
  if (!admin) return;
  await admin.unsafe(
    `TRUNCATE ${TABLES.map((t) => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE;`
  );
}
