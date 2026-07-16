import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { config } from './config/env.js';

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
