# Debatr

> **AI-powered structured debates for learning, critical thinking, and evidence-based discussions.**

Debatr is a modern debate platform where people engage in structured debates while receiving assistance from specialized AI agents. Rather than replacing human reasoning, Debatr enhances it by helping participants construct stronger arguments, identify logical weaknesses, and receive objective feedback after every debate.

Each participant is paired with an independent **AI Lawyer** that assists throughout the debate, while a neutral **AI Judge** evaluates both sides after the debate concludes using predefined evaluation criteria.

The goal of Debatr is to make debates more educational, fair, and intellectually engaging for students, educators, professionals, debate clubs, and organizations.

---

# Vision

Debatr aims to become the modern platform for structured discussions by combining human intelligence with artificial intelligence.

Instead of social-media style arguments, Debatr promotes:

- Evidence-based reasoning
- Critical thinking
- Constructive disagreements
- Logical consistency
- Respectful discussions
- Continuous learning

Artificial intelligence acts as an assistant—not a replacement for human thought.

---

# Core Features

## AI Lawyer

Every participant receives a private AI assistant that can:

- Generate supporting arguments
- Suggest rebuttals
- Recommend counterpoints
- Improve writing clarity
- Identify logical weaknesses
- Suggest supporting evidence
- Adapt to the user's debating style

Each participant's AI is completely independent.

---

## AI Judge

After the debate ends, a neutral AI Judge evaluates both participants based on:

- Logic
- Evidence
- Persuasiveness
- Rebuttals
- Consistency
- Argument quality
- Critical thinking
- Logical fallacies

The Judge generates:

- Final verdict
- Overall winner
- Score breakdown
- Strength analysis
- Weakness analysis
- Constructive feedback
- Debate summary

---

## Debate System

- Public debates
- Private debates
- Invite-only debates
- Debate invitations
- Live messaging
- Typing indicators
- Presence detection
- Debate timers
- Round management
- Debate replay
- Debate history

---

## User Profiles

Each user has:

- Public profile
- Debate history
- Win/Loss record
- ELO rating
- Statistics
- Achievements
- Preferred debating style
- AI preferences

---

## Rankings

- Global leaderboard
- Weekly leaderboard
- Monthly leaderboard
- ELO rankings
- Most active debaters
- Highest rated debaters

---

## Search

Search for:

- Users
- Debates
- Topics
- Tags
- Public discussions

---

## Analytics

Every debate includes:

- AI feedback
- Performance analytics
- Speaking statistics
- Topic history
- Argument quality analysis
- Judge reports

---

# AI Architecture

```
                    AI Orchestrator
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
   AI Lawyer A      AI Lawyer B       AI Judge
```

Future AI agents:

- AI Moderator
- AI Fact Checker
- AI Coach
- AI Debate Trainer

---

# System Architecture

```
                        Users
                          │
                          ▼
                   SvelteKit Frontend
                          │
                    HTTPS / WebSocket
                          │
                          ▼
                     Fastify API
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
    PostgreSQL      Cloudflare R2     AI Provider
      (Neon)           Storage
```

The Fastify backend acts as the central application server and coordinates:

- Authentication
- Authorization
- Debate logic
- AI orchestration
- WebSocket communication
- Database access
- File uploads
- Business logic

---

# Technology Stack

## Frontend

- SvelteKit
- TypeScript
- Tailwind CSS
- GSAP
- TanStack Query
- Lucide Icons

---

## Backend

- Fastify
- TypeScript
- Drizzle ORM
- Zod

---

## Database

- PostgreSQL
- Neon

---

## Authentication

- Better Auth

---

## Storage

- Cloudflare R2

---

## Realtime

- Native WebSockets (`@fastify/websocket`)

Used for:

- Live debates
- Typing indicators
- Presence detection
- Debate timers
- AI streaming

---

## AI

The backend communicates directly with AI providers through a dedicated AI orchestration layer.

Current planned agents:

- AI Lawyer
- AI Judge

Future agents:

- AI Moderator
- AI Fact Checker
- AI Coach

---

## Deployment

### Frontend

- Vercel

### Backend

- Node.js
- Fastify

### Database

- Neon PostgreSQL

### Storage

- Cloudflare R2

Future production deployments may use Coolify on a self-hosted VPS.

---

# Repository Structure

```
Debatr/
│
├── apps/
│   ├── web/                  # SvelteKit frontend
│   └── api/                  # Fastify backend
│
├── packages/
│   ├── ui/                   # Shared UI components
│   ├── shared/               # Shared types & validation
│   └── config/               # Shared configuration
│
├── docs/
│
├── scripts/
│
└── .github/
```

---

# Backend Responsibilities

The Fastify server is responsible for:

- Authentication
- Debate management
- AI orchestration
- WebSocket communication
- User management
- Matchmaking
- Rankings
- Statistics
- File uploads
- API endpoints

---

# Database

PostgreSQL is the single source of truth.

Stores:

- Users
- Profiles
- Debates
- Debate messages
- AI responses
- Judge reports
- Ratings
- Statistics
- Leaderboards
- User preferences

---

# File Storage

Cloudflare R2 stores:

- Profile pictures
- Debate attachments
- Images
- Exported reports

Files are uploaded using signed URLs for improved security and performance.

---

# Realtime

Native WebSockets power:

- Live messaging
- Typing indicators
- User presence
- Debate synchronization
- AI streaming responses
- Live timers

---

# Security

Authentication is powered by Better Auth.

Security features include:

- Secure sessions
- Protected routes
- Authorization
- Input validation
- Rate limiting (future)
- CSRF protection
- Secure file uploads

---

# Development Roadmap

## Phase 1

- Project foundation
- Authentication
- User profiles
- Debate creation
- Live messaging
- WebSocket infrastructure

---

## Phase 2

- AI Lawyer
- AI Judge
- Debate history
- Statistics
- Ratings
- ELO system

---

## Phase 3

- Public debates
- Search
- Leaderboards
- Analytics
- User achievements

---

## Phase 4

- AI Fact Checker
- AI Moderator
- AI Coach
- Voice debates
- Team debates
- Tournament mode
- Mobile application

---

# Getting Started

## Clone the repository

```bash
git clone https://github.com/your-username/debatr.git
cd debatr
```

Install dependencies:

```bash
pnpm install
```

Copy the environment file:

```bash
cp .env.example .env
```

Configure:

- PostgreSQL
- Better Auth
- Cloudflare R2
- AI Provider

Run the development server:

```bash
pnpm dev
```

---

# Available Scripts

| Script | Description |
|----------|-------------|
| `pnpm dev` | Start all applications |
| `pnpm build` | Build the workspace |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Fix lint issues |
| `pnpm format` | Format code |
| `pnpm typecheck` | Type checking |
| `pnpm test` | Run tests |

---

# Design Principles

Debatr follows several core principles:

- Human-first discussions
- AI as an assistant, not a replacement
- Single source of truth
- Strong type safety
- Modular architecture
- Scalability
- Simplicity
- Performance
- Accessibility

---

# License

This project is licensed under the MIT License.

See the [LICENSE](LICENSE) file for details.