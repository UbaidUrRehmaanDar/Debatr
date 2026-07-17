import postgres from 'postgres';

const baseUrl = process.env.DATABASE_URL!;
const sql = postgres(baseUrl, { max: 1 });
const dbName = 'debatr_test';

const rows = await sql`SELECT 1 FROM pg_database WHERE datname = ${dbName}`;
if (rows.length === 0) {
  await sql.unsafe(`CREATE DATABASE ${dbName}`);
  console.log('created', dbName);
} else {
  console.log('exists', dbName);
}
await sql.end();
