# Local accounts & run notes (corrections)

## Correction 1 — admin creation
The recommended way to create the admin is NOT the `/api/admin/bootstrap`
endpoint (that only works when zero users exist and is meant for first-boot).
For an already-running DB, insert directly in SQL like Ubaid did:

```sql
INSERT INTO users (id, email, name, role, email_verified, created_at, updated_at)
VALUES (gen_random_uuid(), 'ubaidurrehmaandar2004@gmail.com', 'Ubaid Ur Rehmaan Dar', 'admin', true, now(), now());
```

## Correction 2 — signup is invitation-only
The web app does NOT allow open self-signup. The sign-up page requires a valid
invitation code. To create test accounts, insert them directly via SQL (with a
Better Auth `credential` account row) instead of using the UI. See
`apps/api/scripts/make-users.ts` to regenerate the hashes, or paste the SQL
below into the Neon SQL editor.

## How to log in
1. Start the API (`pnpm --filter @debatr/api dev`) and web (`pnpm --filter @debatr/web dev`).
2. Open http://localhost:5173 and go to **Sign in**.
3. Use the email + password of any account created in SQL.
   - Admin: ubaidurrehmaandar2004@gmail.com (password set separately / via your
     own insert).
   - Normal users: see generated SQL.
4. As admin, the **Analytics** nav link appears automatically (role === 'admin').

Note: email_verified is set true in the inserts, so no email verification step
is required to log in or use verified-only routes during local testing.
