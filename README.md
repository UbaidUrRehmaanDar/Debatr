# Debatr

> **AI-powered structured debates for learning, critical thinking, and evidence-based discussions.**

Debatr is a modern debate platform where people engage in structured debates while receiving assistance from specialized AI agents. Each participant is paired with an independent **AI Lawyer** that assists throughout the debate, while a neutral **AI Judge** evaluates both sides after the debate concludes.

See [WHAT_IS_PROJECT.md](./WHAT_IS_PROJECT.md) for the full project specification.

## Tech Stack

- **Frontend:** SvelteKit, TypeScript, Tailwind CSS, GSAP, TanStack Query, Lucide Icons
- **Backend:** Fastify, TypeScript, Drizzle ORM, Zod
- **Database:** PostgreSQL (Neon)
- **Auth:** Better Auth
- **Storage:** Cloudflare R2
- **Realtime:** Native WebSockets (`@fastify/websocket`)
- **Monorepo:** pnpm workspaces

## Repository Structure

```
Debatr/
├── apps/
│   ├── web/        # SvelteKit frontend
│   └── api/        # Fastify backend
├── packages/
│   ├── ui/         # Shared UI components
│   ├── shared/     # Shared types & validation
│   └── config/     # Shared configuration
├── docs/
├── scripts/
└── .github/
```

## Getting Started

```bash
pnpm install
cp .env.example .env
pnpm dev
```

## Scripts

| Script | Description |
|----------|-------------|
| `pnpm dev` | Start all applications |
| `pnpm build` | Build the workspace |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Type checking |
| `pnpm test` | Run tests |
