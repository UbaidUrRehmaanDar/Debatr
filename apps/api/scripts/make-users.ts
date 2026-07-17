import { hashPassword } from 'better-auth/crypto';

// Generates a ready-to-run SQL script that creates:
//   - one admin account (ubaidurrehmaandar2004@gmail.com / 55555)
//   - three normal user accounts
// with Better Auth credential rows so they can log in with email+password.
// Run:  pnpm --filter @debatr/api exec tsx scripts/make-users.ts
// It prints SQL to stdout — paste into the Neon SQL editor.

const accounts = [
  { id: 'usr_admin', name: 'Ubaid Ur Rehmaan Dar', email: 'ubaidurrehmaandar2004@gmail.com', password: '55555', role: 'admin' },
  { id: 'usr_obaid', name: 'Obaid Ur Rehmaan Dar', email: 'ubaiddar808s@gmail.com', password: '5597227955', role: 'user' },
  { id: 'usr_rehan', name: 'Rehan Abrar Jutt', email: 'rehanabrar99@gmail.com', password: '54938lina', role: 'user' },
  { id: 'usr_rana', name: 'Rana Mustafa', email: '2mustafa.exe@gmail.com', password: '54024exe', role: 'user' },
];

async function main() {
  const lines: string[] = [];
  lines.push('-- Create admin + three normal accounts with working credentials.');
  lines.push('-- Safe to re-run: ON CONFLICT skips rows that already exist.');
  lines.push('');

  for (const u of accounts) {
    const hash = await hashPassword(u.password);
    lines.push(`-- ${u.role.toUpperCase()}: ${u.name} <${u.email}>`);
    lines.push(`INSERT INTO users (id, email, name, role, email_verified, created_at, updated_at)
VALUES ('${u.id}', '${u.email}', '${u.name}', '${u.role}', true, now(), now())
ON CONFLICT (email) DO NOTHING;`);

    lines.push(`INSERT INTO accounts (id, user_id, account_id, provider_id, password, created_at, updated_at)
VALUES (gen_random_uuid(), '${u.id}', '${u.email}', 'credential', '${hash}', now(), now())
ON CONFLICT DO NOTHING;`);
    lines.push('');
  }

  console.log(lines.join('\n'));
}

main();
