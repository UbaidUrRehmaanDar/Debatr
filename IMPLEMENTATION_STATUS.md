# Implementation Status

## ✅ Completed (Phase 1 - Foundation)

### Configuration & Environment
- `.env.example` created with all required variables documented
- Environment configuration module with Zod validation (`apps/api/src/config/env.ts`)
- Startup validation for all required environment variables

### Database Schema (Drizzle ORM)
- Complete schema definition (`apps/api/src/db/schema/index.ts`):
  - `users` - User accounts with role support
  - `invitations` - Invitation-only registration system
  - `debates` - Core debate table with snapshotted settings
  - `turns` - Turn-based state management
  - `messages` - Public debate messages
  - `lawyerConversations` - Private lawyer sessions per participant
  - `lawyerRequests` - Individual AI lawyer interactions
  - `judgeReports` - Post-debate evaluations
  - `aiUsage` - Token tracking per debate
  - `moderationEvents` - Conduct tracking
  - `exports` - Debate export/import records

### Authentication
- Better Auth integration skeleton (`apps/api/src/auth/index.ts`)
- Email/password with verification flow
- Invitation-only registration structure
- Secure HTTP-only session cookies

### AI Provider Adapter
- OpenCode Zen provider implementation (`apps/api/src/ai/provider.ts`)
- Support for both streaming (`complete`) and structured JSON (`structured`) outputs
- Built-in retry logic with exponential backoff
- Timeout enforcement
- Token usage tracking

### AI Services
- **Lawyer service** (`apps/api/src/ai/lawyer.ts`):
  - Loads prompt from `/prompts/lawyer.md`
  - Builds debate context
  - Returns structured advice matching schema
  
- **Judge service** (`apps/api/src/ai/judge.ts`):
  - Loads prompt from `/prompts/judge.md`
  - Evaluates complete transcripts
  - Returns structured verdict with scores

### Application Entry Point
- Main server bootstrap (`apps/api/src/index.ts`)
- Graceful shutdown handling
- Configuration validation on startup
- Database connection management

## ⚠️ Manual Steps Required Before First Run

### 1. Create Your Local `.env` File
```bash
cp .env.example .env
```

Then fill in:
- `DATABASE_URL` - Your Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Generate with: `openssl rand -hex 32`
- `OPENCODE_API_KEY` - Your OpenCode Zen API key
- Update `BETTER_AUTH_URL`, `WEB_ORIGIN`, `API_ORIGIN` if not using localhost

### 2. Set Up Neon Database
1. Go to https://neon.tech
2. Create a new project named "debatr"
3. Create two branches: `main` (production) and `dev` (development)
4. Copy the connection string for the `dev` branch
5. Paste it into your `.env` file as `DATABASE_URL`

### 3. Install Dependencies
```bash
pnpm install
```

### 4. Run Database Migrations
```bash
pnpm db:generate   # generates SQL from schema (already done; re-run after schema changes)
pnpm db:migrate    # applies migrations to DATABASE_URL
```
> Note: `db:generate`/`db:migrate` require `drizzle-orm` 0.45 + `drizzle-kit` 0.31.4 (aligned with
> `better-auth` 1.6 peers). `migrate.ts` loads `.env` from the repo root automatically.

### 5. Create First Admin User
Use the bootstrap endpoint (creates a real, loginable admin with a hashed password):
```bash
curl -X POST http://localhost:3000/api/admin/bootstrap \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"strongpass","name":"Admin"}'
```
This only works when zero users exist. (The old bare `INSERT INTO users` approach does NOT
produce a loginable account because Better Auth needs a password hash in the `accounts` table.)

### 6. Create Invitations (admin only)
```bash
curl -X POST http://localhost:3000/api/invitations \
  -H 'Content-Type: application/json' \
  -d '{"email":"friend@example.com","expiresInDays":7}'
```

## 📋 Implemented vs Remaining

### Implemented (this branch + follow-up)
- Environment validation + `.env` loading from repo root
- Drizzle schema with Better Auth tables (`sessions`, `accounts`, `verifications`);
  `users.id` is `text` (Better Auth generates string IDs)
- `pnpm db:generate` / `pnpm db:migrate`
- Auth routes: signup (invitation-only), signin, signout, me, forgot/reset password
- Admin bootstrap endpoint (`/api/admin/bootstrap`)
- Invitation routes (admin create/list)
- Debate routes: list, create, get, message submit, lawyer request, judge trigger
- WebSocket stub (`/api/ws`)
- AI provider adapter (OpenCode Zen) + Lawyer/Judge services; **gated on model config**
  (returns a clear error until `AI_LAWYER_MODEL`/`AI_JUDGE_MODEL` are set after a
  privacy-reviewed evaluation — see D-011; free models that retain/train on data are not used)

### Remaining
- Email sender for verification/password-reset (currently `requireEmailVerification: false`
  for local dev; wire a provider before production)
- Real-time debate event fan-out (WebSocket is a stub)
- Turn state machine, raise-hand flow, timeouts
- SvelteKit frontend (login/UI/debate interface)
- `AI_LAWYER_MODEL` / `AI_JUDGE_MODEL` selection after evaluation

## 📋 Next Implementation Phases

### Phase 2 - API Routes (Implemented)
- POST `/api/auth/signup` - Registration with invitation code
- POST `/api/auth/signin` - Email/password login
- POST `/api/auth/signout` - Logout
- GET `/api/debates` - List user's debates
- POST `/api/debates` - Create new debate
- GET `/api/debates/:id` - Get debate details
- POST `/api/debates/:id/join` - Join a debate
- POST `/api/debates/:id/message` - Submit turn message
- POST `/api/debates/:id/lawyer` - Request lawyer advice
- POST `/api/debates/:id/judge` - Trigger judging (when complete)
- GET `/api/invitations` - List invitations (admin only)
- POST `/api/invitations` - Create invitation (admin only)

### Phase 3 - WebSocket Server
- Real-time debate updates
- Turn notifications
- Participant presence tracking
- Raise-hand requests

### Phase 4 - Debate State Machine
- Turn-based flow enforcement
- Timeout handling
- Automatic progression
- Pause/resume functionality

### Phase 5 - Frontend (SvelteKit)
- Authentication pages (login, signup, verify email, reset password)
- Debate list and creation
- Live debate interface
- Lawyer chat panel
- Judge report display

## 🎯 Current State Summary

The core backend foundation is complete:
- ✅ Environment configuration with validation
- ✅ Database schema matching all specifications
- ✅ Authentication framework ready
- ✅ AI provider adapter with cost controls
- ✅ Lawyer and Judge AI services integrated with prompts
- ✅ Application entry point with proper lifecycle

**What's missing before you can test:**
1. Your actual environment values in `.env`
2. Database migration execution
3. First admin user creation
4. API route implementations
5. WebSocket server setup

Would you like me to continue implementing the API routes and WebSocket server, or would you prefer to set up the environment and database first?
