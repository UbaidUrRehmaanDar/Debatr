import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from '../config/env.js';
import * as schema from './schema/index.js';

let client: postgres.Sql | null = null;
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

// A drizzle postgres-js instance (or a transaction handle, which is the same
// shape). Used by engine functions so callers can pass a transaction in.
type TransactionHandle = Parameters<Parameters<ReturnType<typeof getDb>['transaction']>[0]>[0];
export type Db = ReturnType<typeof getDb> | TransactionHandle;

export async function connect() {
  if (client) {
    return db!;
  }
  
  const databaseUrl = config.databaseUrl;
  client = postgres(databaseUrl, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  
  db = drizzle(client, { schema });
  return db;
}

export async function disconnect() {
  if (client) {
    await client.end();
    client = null;
    db = null;
  }
}

export function getDb() {
  if (!db) {
    throw new Error('Database not connected. Call connect() first.');
  }
  return db;
}

export { db };
