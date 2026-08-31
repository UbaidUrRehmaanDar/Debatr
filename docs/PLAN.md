# Debatr Implementation Plan

This document breaks the project into concrete, build-ordered phases. It aligns
with `docs/ROADMAP.md` (Phases 0–3) but adds the granular, code-level tasks the
current codebase needs. Status reflects the actual state of the repo today.

Legend: ✅ done · 🟡 partial · ⬜ not started

---

## Phase 0 — Foundations (docs + environment)

Goal: a runnable backend on a developer machine.

- ✅ Core docs (`PROJECT`, `SPEC`, `ARCHITECTURE`, `ROADMAP`, `DECISIONS`)
- ✅ Env validation + Zod config (`apps/api/src/config/env.ts`)
- ⬜ `.env` created from `.env.example` and verified locally
- ⬜ Neon database provisioned (main + dev branches)
- ⬜ `pnpm install` and dependency lock confirmed
- ⬜ Run `pnpm db:generate` + `pnpm db:migrate` to apply schema
- ⬜ Create first admin via `/api/admin/bootstrap`
- ⬜ Seed one invitation and a second user for local testing
- 🟡 `docs/debates/FLOW.md` — debate state machine spec must be written and
  matched by code before any `active` debate works

**Exit criteria:** `pnpm --filter @debatr/api dev` boots, `/api/health` returns
ok, a user can sign in, and migrations are applied.

---

## Phase 1 — Private debate foundation (backend)

Build the authoritative server: state, turns, realtime, persistence, export.

### 1.1 Auth hardening
- 🟡 Signup/signin/signout/me/forgot/reset wired (`routes/auth.ts`)
- ⬜ Verify cookie handling end-to-end in a browser (the `forwardAuthCookies`
  approach forwards a single `set-cookie` header; confirm multi-cookie + expiry)
- ⬜ Confirm `auth-session` cookie name matches Better Auth's actual cookie name

### 1.2 Debate state machine
- ✅ Turn engine in `apps/api/src/debates/engine.ts` (plan, start, advance, timeout, judging)
- ✅ `POST /api/debates/:id/join` — opponent accepts; debate moves to `active`
  and the turn engine seeds + activates the first turn
- ✅ `POST /api/debates/:id/complete` — explicit move to `judging` once turns exhausted
- ✅ `paused`/`cancelled` transitions: added `POST /api/debates/:id/pause`,
  `/resume`, and `/cancel` (participant-only; cancel records a moderation
  event with reason/category when supplied). Frontend shows Pause/Resume/Cancel
  controls and a paused banner.
- ✅ `raise-hand` request + explicit grant/decline decision route (grant
  mechanism kept as an open decision per `docs/QUESTIONS.md`)

### 1.3 Messaging rules
- ✅ `POST /api/debates/:id/message` now enforces: caller owns the active turn,
  turn not expired (timer), and char limit; message is linked to `turnId` and
  the turn auto-advances on a valid post
- ✅ Judge route now requires `judging` status (was transitioning from any state)

### 1.4 Realtime (WebSocket)
- ✅ `/api/ws` is a real event fan-out bus (`apps/api/src/debates/events.ts`);
  clients `subscribe` to a `debateId` and receive state/turn/message/raise-hand
  events
- ✅ Socket is authenticated via the Better Auth session cookie on the upgrade
  request; unauthenticated connections are rejected
- ✅ Presence: `presence` events broadcast the set of connected participant
  user IDs per debate; the room shows an "N online" indicator

### 1.5 Persistence & export
- 🟡 Schema has `exports` table and `completedAt`/`judgeReportId` columns
- ⬜ `POST /api/debates/:id/export` producing JSON per
  `schemas/debate-export.schema.json` + `docs/debates/EXPORT.md`
- ⬜ `POST /api/debates/:id/import` (user-directed reference material)
- ✅ Moderation events recording (`moderationEvents` table) on conduct findings
  and on cancel-with-reason

**Exit criteria:** two authenticated users can join a debate, take turns within
limits, see each other's messages in realtime, and export the record.

---

## Phase 2 — AI assistance and judging

Provider, Lawyer, Judge, evidence context, cost controls.

### 2.1 Provider & model config
- ✅ OpenCode Zen adapter with retry/timeout (`ai/provider.ts`)
- ⬜ Choose + set `AI_LAWYER_MODEL` / `AI_JUDGE_MODEL` after privacy review (D-011)
- ✅ Per-debate token budget enforcement (`ai/budget.ts`) against `aiUsage`;
  routes return `429` when the `AI_MAX_TOKENS_PER_DEBATE` ceiling is hit
- ✅ Pinned facts/evidence context strategy: `evidence` table + prompt injection
  in both Lawyer and Judge (AI must not invent these — `docs/SPEC.md`)

### 2.2 Lawyer
- ✅ Service + prompt load + structured response (`ai/lawyer.ts`, `prompts/lawyer.md`)
- ✅ Route enforces participant boundary + per-debate token budget; passes
  pinned evidence into context
- ⬜ Validate structured output against a runtime schema; safe-refusal handling
- ⬜ Optional inclusion of Lawyer logs in export (privacy-aware)

### 2.3 Judge
- ✅ Service + prompt + structured verdict (`ai/judge.ts`, `prompts/judge.md`)
- ✅ Triggers only from `judging` state with full transcript + turn record
- ✅ Stores **real** token usage (was hardcoded `0`); report attached to debate
- 🟡 Scoring rubric weights are instructed in the prompt; not yet validated
  server-side against `docs/SPEC.md` weights
- ✅ Apply conduct findings → `moderationEvents` rows (each Judge conduct
  finding persists an auditable moderation event linking the first referenced
  message; surfaced in the debate snapshot and the report's "Moderation record")

### 2.4 Additional AI roles (deferred)
- ⬜ Fact Checker (`prompts/fact_checker.md` exists, unused)
- ⬜ Moderator (`prompts/moderator.md` exists, unused)

**Exit criteria:** a completed debate yields a structured Judge report; Lawyer
advice is private, validated, and budget-bounded.

---

## Phase 3 — Frontend (SvelteKit)

The `apps/web` app was only `package.json`; it is now a scaffolded SvelteKit app
(Svelte 5 + vite + adapter-auto). `pnpm --filter @debatr/web check` passes with
0 errors. Vite proxies `/api` to the Fastify backend in dev.

### 3.1 App shell
- ✅ SvelteKit app + `app.css` token system (per `docs/frontend/DESIGN_SYSTEM.md`
  constraints; no brand yet)
- ✅ API client (`src/lib/api.ts`) with credentials; WebSocket client
  (`src/lib/ws.ts`) subscribes per debate and reconnects
- ✅ Route guards via `+layout.ts` (redirect unauthenticated → `/sign-in`,
  authenticated → away from auth pages). Server remains authoritative.

### 3.2 Auth pages
- ✅ Sign-in, sign-up (with invitation code), forgot-password, reset-password
- ⬜ Verify-email screen (backend sends email; no dedicated page yet)

### 3.3 Debate UX
- ✅ Debate list + create (invite opponent by email)
- ✅ Live debate interface: turn indicator, char counter, message feed,
  realtime via WebSocket; composer enabled only on your turn
- ✅ Raise-hand button; end-debate → judging; pin evidence
- ✅ Private Lawyer panel (clearly labelled private; only your data)
- ✅ Judge report display: outcome, confidence, rubric table, feedback,
  fallacies, conduct findings, summary; "Run Judge" trigger when judging
- ✅ Export/import: `POST /api/debates/:id/export` builds a schema-validated
  `DebateExport` JSON (validated against `schemas/debate-export.schema.json`
  via ajv), downloads it, and records an `exports` row. `POST /api/imports`
  validates + version-checks an uploaded export and stores it as reference
  material. Frontend: report page has "Download export"; `/imports/new`
  submits to the server and shows stored preview. Lawyer logs excluded by
  default (privacy policy pending).

**Exit criteria (mostly met):** the product is usable end-to-end in a browser
once the backend is running with a DB. Completed since: verify-email page
(`apps/web/src/routes/verify-email/+page.svelte` + `GET /api/auth/verify-email`
backend route wrapping Better Auth `auth.api.verifyEmail`), real export
download + server-side import, WebSocket auth, presence.
Remaining: integration tests, accessibility pass, observability, and real
email-verification delivery (sending the verify link from the inbox).

---

## Phase 4 — Quality, tests, observability

- ✅ Lint works repo-wide: added root `eslint.config.js` (flat config, ESLint 9)
  using `@typescript-eslint` parser+plugin, Node globals, svelte files ignored.
  `pnpm -r lint` passes for all 4 projects (0 errors). Also set root
  `"type": "module"`.
- ✅ Tests: `pnpm -r test` green across api (14 unit), shared (3), web (2).
  Plus `pnpm --filter @debatr/api test:integration` (5, real-DB).
  - `apps/api`: `ai/budget.test.ts`, `debates/engine.test.ts`,
    `routes/exports.test.ts` (ajv 2020 schema validation, round grouping,
    version check).
  - `packages/shared`: status/outcome label constants.
  - `apps/web`: shared label smoke test.
- ✅ `packages/shared` now has real source (`src/index.ts`): shared Side/
  DebateStatus/JudgeOutcome types, status + outcome labels, default debate
  settings — usable by both api and web.
- ✅ Integration tests (permissions, state transitions against a real DB).
  - `apps/api/src/debates/engine.integration.test.ts` exercises the turn
    engine (`startDebateTurns` → `closeTurnAndAdvance` → `enterJudging`),
    `sideOfUser` ownership, and message persistence against a **dedicated
    Neon test database** (`debatr_test`), isolated via `TRUNCATE … CASCADE`
    between tests.
  - Harness: `apps/api/test/setup.ts` (points the `getDb()` singleton at
    `TEST_DATABASE_URL`/`DATABASE_URL`, runs migrations, truncates), run via
    `pnpm --filter @debatr/api test:integration`. The default `pnpm test`
    stays unit-only and DB-free (config in `apps/api/vitest.config.ts`).
  - Create the test DB once with `apps/api/scripts/create-test-db.ts`.
- ✅ Accessibility pass on frontend (structural a11y; `svelte-check` reports 0
  a11y warnings, and manual fixes applied):
  - `apps/web/src/app.css`: added `:focus-visible` outline for keyboard users
    and a `.skip-link` (visually hidden until focused).
  - `apps/web/src/routes/+layout.svelte`: skip-to-content link, `aria-label`
    on `<nav>`, `aria-current="page"` on active links, `id`/`tabindex`/`label`
    on `<main>`.
  - `debates/[debateId]/+page.svelte`: `aria-live="polite"` on the turn
    indicator (announces whose turn it is) and the transcript `<ul>` (announces
    new messages); `<label class="sr-only">` added to the previously
    placeholder-only evidence (claim/source/side) and cancel-reason inputs.
- ✅ Observability: structured logs + AI cost dashboard from `aiUsage`.
  - `apps/api/src/observability/logger.ts`: single-line JSON logger
    (`{level,msg,time,ctx}`) with level filtering via `LOG_LEVEL`, replacing
    `console.*` in `index.ts`.
  - `apps/api/src/ai/provider.ts`: logs every AI request (`ai.request`),
    response (`ai.response` with model/tokens/duration/requestId), retries
    (`ai.request.retry`), timeouts, and failures.
  - `apps/api/src/ai/usage.ts`: `getAiUsageDashboard()` aggregates the
    `aiUsage` table by role, model, and debate, with an optional `since`
    window and an optional cost estimate (`AI_COST_PER_1K_TOKENS`; omitted
    unless configured, so no fabricated prices).
  - `GET /api/admin/ai-usage` (admin-only, `requireAdmin`) returns the
    dashboard; logged via `admin.ai_usage_viewed`. Added
    `AI_COST_PER_1K_TOKENS` to `config/env.ts`.
  - Integration test: `apps/api/src/ai/usage.integration.test.ts` (2 tests
    against `debatr_test`).
- ✅ Email verification confirmed end-to-end (Resend).
  - `apps/api/src/email/index.ts`: added an injectable transport
    (`setEmailSender`) wrapping the Resend client, so email flows are testable
    without delivering real mail.
  - `apps/api/src/auth/index.ts`: the verification and reset-password emails
    now rewrite their links to the **web** app origin
    (`{webOrigin}/verify-email?token=…`, `{webOrigin}/reset-password?token=…`)
    instead of the API origin — previously the link pointed at the API server
    where no verify UI exists (the verify-email page lives on the SvelteKit
    app). This was the real gap.
  - `apps/api/src/auth.integration.test.ts`: proves signup triggers the
    verification email and that the link carries a token and targets the web
    app (real DB, captured sender, no real delivery).
  - `apps/api/scripts/test-email.ts` (`pnpm --filter @debatr/api test:email`
    with `TEST_EMAIL_TO=you@example.com`): smoke test that sends a real
    verification email via Resend to confirm delivery to your inbox.
    Note: Resend's sandbox `onboarding@resend.dev` sender only delivers to
    verified contacts / a verified domain — the user must verify a domain or
    contact to receive it.
- ✅ All Phase 4 items complete. Docs/DEFERRED scope unchanged.

### Fixes made while testing
- Switch export validation to ajv draft-2020-12 (`ajv/dist/2020`) so the
  schemas' `$schema` resolves.
- `schemas/debate.schema.json`: made `description`, `currentTurnId`,
  `judgeReportId`, `completedAt` nullable to match real (nullable) DB columns.
- `buildExportPayload` now injects `side` into each participant (the export
  schema's `Participant` requires it) so exports validate.
- Cleaned dead imports flagged by lint (auth.ts, invitations.ts, debates.ts,
  exports.ts, exports_routes.ts, provider.ts, auth/index.ts).

---

## Deferred (out of current scope)

Public debates, matchmaking, leaderboards/ELO (`docs/debates/ELO.md`), uploads,
web research, voice, teams, tournaments, mobile.

---

## Suggested next step

Phase 0 leftovers + Phase 1.2/1.3 are the highest-value unblock: get a real
debate flowing with enforced turns. I can start by implementing the debate state
machine and the missing `join` route.
