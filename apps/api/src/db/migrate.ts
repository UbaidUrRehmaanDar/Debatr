import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { config } from '../config/env.js';

// Load local .env (Node 20.12+ built-in; no extra dependency needed).
// pnpm --filter runs from the app dir, but .env lives at the repo root.
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const envCandidates = [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '..', '..', '.env'),
];

for (const envPath of envCandidates) {
  if (existsSync(envPath)) {
    try {
      process.loadEnvFile(envPath);
    } catch {
      // ignore parse errors
    }
    break;
  }
}

async function main() {
  if (!config.load()) {
    console.error('Failed to load configuration. Cannot run migrations.');
    process.exit(1);
  }

  const client = postgres(config.databaseUrl, { max: 1 });
  const db = drizzle(client);

  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Migrations completed.');

  await client.end();
}

main().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
