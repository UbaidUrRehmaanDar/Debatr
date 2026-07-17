# Debatr

A structured two-side debate platform: participants take timed turns, a private
"Lawyer" assists each side, and an AI "Judge" evaluates the completed transcript.
Built as a pnpm monorepo with a Fastify API and a SvelteKit web app.

- **API** — `apps/api` (Fastify + Better Auth + Drizzle ORM + PostgreSQL/Neon)
- **Web** — `apps/web` (SvelteKit + Svelte 5)
- **Shared** — `packages/shared` (TypeScript types)

## Prerequisites

- Node.js 20+ and pnpm (`npm i -g pnpm`)
- A PostgreSQL database (Neon recommended). The connection string must use the
  **pooled** URL and include `channel_binding=require`, e.g.
  `postgresql://USER:PASS@HOST-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
- A Resend API key for email (verification, password reset, invitations)
- An OpenCode Zen API key for the AI Lawyer/Judge (optional for non-AI flows)

## Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env
#   then edit .env and fill in real values (see "Environment variables" below)
#   .env lives at the repo root and is loaded automatically by both apps.

# 3. Apply database migrations (runs against DATABASE_URL)
pnpm --filter @debatr/api exec tsx src/db/migrate.ts
```

## Running locally

Open **two** terminals (the web app proxies `/api` to the API on port 3000, so
both must be running):

```bash
# Terminal 1 — API (Fastify on :3000, with hot reload)
pnpm --filter @debatr/api dev

# Terminal 2 — Web (SvelteKit on :5173)
pnpm --filter @debatr/web dev
```

Then open <http://localhost:5173>.

> The web app calls the API using relative `/api` paths; Vite proxies those to
> `API_ORIGIN` (default `http://localhost:3000`) in development, including the
> WebSocket at `/api/ws`. No CORS setup needed for local dev.

## Database management

```bash
# Generate a new migration after editing apps/api/src/db/schema
pnpm --filter @debatr/api exec drizzle-kit generate

# Apply all pending migrations
pnpm --filter @debatr/api exec tsx src/db/migrate.ts
```

Migrations live in `apps/api/drizzle`.

## Testing

```bash
# Unit tests (no DB required)
pnpm --filter @debatr/api test

# Integration tests (hit the real DATABASE_URL — truncates test rows each run)
pnpm --filter @debatr/api test:integration
```

The integration suite connects to `DATABASE_URL` (or `TEST_DATABASE_URL` if set)
and isolates state by truncating all tables at the start of each run, so it is
safe to run against a development database.

## Building for production

```bash
pnpm --filter @debatr/api build   # outputs apps/api/dist/index.js
pnpm --filter @debatr/web build    # adapter-node output in apps/web/build
```

The web app uses `@sveltejs/adapter-node`; serve `apps/web/build` with Node
(`node build` or your process manager), behind a reverse proxy that also fronts
the Fastify API.

## Environment variables

All server-side vars are validated at startup by `apps/api/src/config/env.ts`.
See `.env.example` for the full list and safe placeholders. Key variables:

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string (pooled Neon URL) |
| `BETTER_AUTH_SECRET` | yes | Session secret — `openssl rand -hex 32` |
| `BETTER_AUTH_URL` | yes | API base URL used for auth callbacks |
| `WEB_ORIGIN` | yes | Web app base URL (used in emails/links) |
| `API_ORIGIN` | yes | API base URL (used by the Vite proxy) |
| `OPENCODE_API_KEY` | yes* | OpenCode Zen key for AI features |
| `OPENCODE_BASE_URL` | yes* | OpenCode Zen base URL |
| `AI_LAWYER_MODEL` | no** | Model for the private Lawyer assistant |
| `AI_JUDGE_MODEL` | no** | Model for the Judge evaluation |
| `RESEND_API_KEY` | yes | Resend key for transactional email |
| `EMAIL_FROM` | yes | Verified Resend sender address |
| `AI_MAX_TOKENS_PER_REQUEST` | no | Cap per AI call (default 4096) |
| `AI_MAX_TOKENS_PER_DEBATE` | no | Cap per debate (default 50000) |
| `DEBATE_DEFAULT_ROUNDS` | no | Default rounds (default 4) |
| `DEBATE_DEFAULT_MAX_CHARACTERS` | no | Default chars/turn (default 2000) |

\* Required only for the AI Lawyer/Judge features. Auth, debate flow, WebSocket,
and import/export work without it (those calls return a 502 until configured).
\** Choose models only after a privacy review (D-011): do not use a model whose
terms allow private debate data to be retained or used for training.

## Manual test checklist

1. Sign up two accounts; verify emails are received (check Resend logs/spam).
2. As user A, create a debate → copy the invite link.
3. As user B, open the link and click **Join as opponent**.
4. Take turns posting messages; confirm the turn advances and the transcript
   updates live over the WebSocket (watch the "Connection:" indicator).
5. Try the **Private Lawyer** panel, **pin evidence**, and **pause/resume/cancel**.
6. **Complete** the debate → open the **Judge report** → **Run Judge** →
   **Download export (JSON)**.
7. Re-import an export at `/imports/new` (a >5 MB file is rejected client-side).

## Project layout

```
apps/api      Fastify API, auth, AI providers, DB schema, routes, websocket
apps/web      SvelteKit UI (debates, report, auth pages, import/export)
packages/shared  Shared TypeScript types
docs/PLAN.md  Product/architecture plan
```
