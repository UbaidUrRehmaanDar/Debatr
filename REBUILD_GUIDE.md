# Debatr Rebuild Guide

> **Purpose**: This document is a complete specification for rebuilding Debatr from scratch using Next.js 14+ (App Router), tRPC, Prisma, and PostgreSQL. It is designed for an agentic AI to execute the full rebuild autonomously.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Database Schema (Prisma)](#4-database-schema-prisma)
5. [Environment Variables](#5-environment-variables)
6. [Authentication Flow](#6-authentication-flow)
7. [API Layer (tRPC)](#7-api-layer-trpc)
8. [WebSocket Layer](#8-websocket-layer)
9. [AI Integration](#9-ai-integration)
10. [Debate Engine](#10-debate-engine)
11. [Frontend Pages](#11-frontend-pages)
12. [Design System](#12-design-system)
13. [Component Library](#13-component-library)
14. [Implementation Phases](#14-implementation-phases)
15. [Deployment](#15-deployment)
16. [Testing Strategy](#16-testing-strategy)

---

## 1. Project Overview

**Debatr** is a private AI-assisted structured debate platform. Two participants take timed turns presenting arguments, with a private AI "Lawyer" assistant providing per-participant coaching, and an AI "Judge" evaluating the completed transcript.

### Core Features

- **Turn-based timed debates** with configurable rounds and turn duration
- **AI Lawyer** - Private per-participant coaching with server-side tool grounding
- **AI Judge** - Structured evaluation with scores, fallacy detection, conduct findings
- **AI Fact-Checker** - Per-message claim verification with verdict badges
- **Real-time WebSocket** - Live turn advancement, typing indicators, emoji reactions, presence
- **Invitation-only registration** with email verification
- **Export/Import** - JSON (server-side), PDF (client-side)
- **Analytics** - Outcome distribution, win rates, confidence trends, AI usage
- **Admin dashboard** - User management, AI usage monitoring
- **Debate templates** - Preset topics/rules by category
- **Bookmarks** - Save debates for later
- **PWA support** - Offline caching, install prompt

### User Roles

- **user** - Regular participant, can create/join debates
- **admin** - Full access to admin dashboard, user management, AI usage monitoring

---

## 2. Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| **Framework** | Next.js | 14+ | App Router, React Server Components |
| **Language** | TypeScript | 5.5+ | Strict mode |
| **API** | tRPC | 11+ | End-to-end type safety |
| **Database** | PostgreSQL | 15+ | Neon free tier recommended |
| **ORM** | Prisma | 6+ | Schema-first, migrations, type generation |
| **Auth** | Auth.js (NextAuth) | 5+ | Credentials provider (email/password) |
| **UI** | shadcn/ui | latest | Built on Radix + Tailwind |
| **Styling** | Tailwind CSS | 4 | Utility-first |
| **Real-time** | Socket.io | 4+ | WebSocket with fallback |
| **Email** | Resend | 3+ | Transactional emails |
| **AI Provider** | OpenCode Zen API | - | Free models: nemotron-3-ultra-free, etc. |
| **Validation** | Zod | 3+ | Shared between tRPC and Prisma |
| **PDF** | jspdf | 2+ | Client-side PDF generation |
| **Package Manager** | pnpm | 9+ | Monorepo with workspaces |
| **Deployment** | Vercel / VPS | - | Free tier initially, self-host later |

### Why This Stack?

| Problem in Old Stack | Solution in New Stack |
|---------------------|----------------------|
| 64 `as any` type escapes | tRPC gives end-to-end types automatically |
| Svelte 5 runes complexity | React is simpler, more resources |
| Better Auth confusion | Auth.js is battle-tested, massive community |
| Drizzle ORM manual types | Prisma generates types from schema |
| Fastify route boilerplate | tRPC procedures are minimal |
| Manual WebSocket setup | Socket.io handles connection management |

---

## 3. Project Structure

```
debatr/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth pages (grouped layout)
│   │   │   ├── sign-in/
│   │   │   ├── sign-up/
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/
│   │   │   └── verify-email/
│   │   ├── (dashboard)/        # Protected pages (grouped layout)
│   │   │   ├── debates/
│   │   │   │   ├── page.tsx    # Debate list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [debateId]/
│   │   │   │       ├── page.tsx           # Main debate view
│   │   │   │       ├── report/
│   │   │   │       │   └── page.tsx       # Judge report
│   │   │   │       └── spectate/
│   │   │   │           └── page.tsx       # Spectate completed
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx
│   │   │   │   └── users/
│   │   │   │       └── page.tsx
│   │   │   ├── invitations/
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   └── bookmarks/
│   │   │       └── page.tsx
│   │   ├── legal-ai/
│   │   │   └── page.tsx        # Standalone Legal AI page
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Redirect to /debates
│   │   └── error.tsx           # Global error boundary
│   ├── server/
│   │   ├── auth.ts             # Auth.js config
│   │   ├── db.ts               # Prisma client singleton
│   │   ├── trpc/
│   │   │   ├── router.ts       # tRPC root router
│   │   │   ├── context.ts      # tRPC context (session, db)
│   │   │   ├── routers/
│   │   │   │   ├── auth.ts     # Auth procedures
│   │   │   │   ├── debates.ts  # Debate CRUD + AI
│   │   │   │   ├── admin.ts    # Admin procedures
│   │   │   │   ├── invitations.ts
│   │   │   │   ├── bookmarks.ts
│   │   │   │   ├── templates.ts
│   │   │   │   ├── exports.ts
│   │   │   │   └── health.ts
│   │   │   └── procedures/
│   │   │       ├── protected.ts  # Auth middleware
│   │   │       └── admin.ts      # Admin middleware
│   │   ├── ai/
│   │   │   ├── provider.ts     # OpenCode API client
│   │   │   ├── lawyer.ts       # AI Lawyer
│   │   │   ├── judge.ts        # AI Judge
│   │   │   ├── factChecker.ts  # AI Fact-Checker
│   │   │   ├── tools.ts        # Server-side tools
│   │   │   ├── budget.ts       # Per-debate token budget
│   │   │   └── prompts/        # Markdown prompt templates
│   │   │       ├── lawyer.md
│   │   │       ├── judge.md
│   │   │       ├── fact_checker.md
│   │   │       └── shared/
│   │   │           ├── debate_rules.md
│   │   │           └── json_output.md
│   │   ├── debate-engine/
│   │   │   ├── engine.ts       # Turn-based state machine
│   │   │   ├── events.ts       # EventEmitter for debate events
│   │   │   └── timer.ts        # Server-side turn timer
│   │   ├── email/
│   │   │   ├── resend.ts       # Resend client
│   │   │   └── templates/      # Email templates
│   │   ├── websocket/
│   │   │   ├── index.ts        # Socket.io server
│   │   │   ├── handlers.ts     # Event handlers
│   │   │   └── middleware.ts    # Auth middleware
│   │   └── lib/
│   │       ├── errors.ts       # Error handling
│   │       ├── logger.ts       # Structured logger
│   │       ├── rate-limit.ts   # Rate limiting
│   │       └── validation.ts   # Zod schemas
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── debate/
│   │   │   ├── DebateCard.tsx
│   │   │   ├── DebateView.tsx
│   │   │   ├── TurnTimer.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageComposer.tsx
│   │   │   ├── LawyerPanel.tsx
│   │   │   ├── JudgeReport.tsx
│   │   │   └── FactCheckBadge.tsx
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── CommandPalette.tsx
│   │   └── shared/
│   │       ├── ScoreRing.tsx
│   │       ├── Badge.tsx
│   │       └── EmptyState.tsx
│   ├── hooks/
│   │   ├── useWebSocket.ts     # Socket.io client hook
│   │   ├── useDebate.ts        # Debate state hook
│   │   └── useTimer.ts         # Turn timer hook
│   ├── lib/
│   │   ├── api.ts              # tRPC client setup
│   │   ├── socket.ts           # Socket.io client
│   │   ├── pdf.ts              # Client-side PDF generation
│   │   └── utils.ts            # Utility functions
│   ├── types/
│   │   └── index.ts            # Shared TypeScript types
│   └── styles/
│       └── globals.css         # Tailwind + design tokens
├── public/
│   ├── icons/
│   └── manifest.json           # PWA manifest
├── .env.example
├── .env.local                  # Never commit
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 4. Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// AUTH TABLES (Auth.js)
// ============================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime? @map("email_verified")
  name          String?
  role          String    @default("user") // "user" | "admin"
  passwordHash  String    @map("password_hash")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  // Relations
  accounts        Account[]
  sessions        Session[]
  invitationsSent Invitation[]      @relation("InvitationSender")
  invitationsUsed Invitation[]      @relation("InvitationUser")
  debates         DebateParticipant[]
  messages        Message[]
  lawyerConversations LawyerConversation[]
  evidence        Evidence[]
  factChecks      FactCheck[]       @relation("FactChecker")
  raiseHandRequests RaiseHandRequest[]
  moderationEvents  ModerationEvent[]
  bookmarks       Bookmark[]
  exports         Export[]

  @@map("users")
}

model Account {
  id                String    @id @default(cuid())
  userId            String    @map("user_id")
  type              String
  provider          String
  providerAccountId String    @map("provider_account_id")
  refresh_token     String?   @db.Text
  access_token      String?   @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?   @db.Text
  session_state     String?
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id")
  expires      DateTime
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// ============================================
// APP TABLES
// ============================================

model Invitation {
  id        String   @id @default(cuid())
  code      String   @unique
  email     String
  createdById String @map("created_by_id")
  usedById  String?  @map("used_by_id")
  usedAt    DateTime? @map("used_at")
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  createdBy User @relation("InvitationSender", fields: [createdById], references: [id])
  usedBy    User? @relation("InvitationUser", fields: [usedById], references: [id])

  @@index([createdById])
  @@index([email])
  @@index([expiresAt])
  @@map("invitations")
}

model Debate {
  id                    String   @id @default(cuid())
  topic                 String
  description           String?
  status                String   @default("waiting_for_participants")
  // "draft" | "waiting_for_participants" | "active" | "paused" | "judging" | "completed" | "cancelled"
  
  // Settings (snapshotted at creation)
  maxRounds             Int      @map("max_rounds")
  roundDurationMs       Int      @map("round_duration_ms")
  maxCharactersPerTurn  Int      @map("max_characters_per_turn")
  
  // Current state
  currentRound          Int      @default(0) @map("current_round")
  currentTurnId         String?  @map("current_turn_id")
  judgeReportId         String?  @map("judge_report_id")
  
  createdAt             DateTime @default(now()) @map("created_at")
  updatedAt             DateTime @updatedAt @map("updated_at")
  completedAt           DateTime? @map("completed_at")

  // Relations
  turns               Turn[]
  messages            Message[]
  participants        DebateParticipant[]
  lawyerConversations LawyerConversation[]
  judgeReport         JudgeReport?
  aiUsage             AiUsage[]
  moderationEvents    ModerationEvent[]
  raiseHandRequests   RaiseHandRequest[]
  evidence            Evidence[]
  factChecks          FactCheck[]
  exports             Export[]
  bookmarks           Bookmark[]

  @@index([status])
  @@index([createdAt])
  @@map("debates")
}

model DebateParticipant {
  id          String   @id @default(cuid())
  debateId    String   @map("debate_id")
  userId      String   @map("user_id")
  side        String   // "affirmative" | "negative"
  displayName String   @map("display_name")
  joinedAt    DateTime @default(now()) @map("joined_at")

  debate Debate @relation(fields: [debateId], references: [id], onDelete: Cascade)
  user   User   @relation(fields: [userId], references: [id])

  @@unique([debateId, userId])
  @@index([debateId])
  @@index([userId])
  @@map("debate_participants")
}

model Turn {
  id            String   @id @default(cuid())
  debateId      String   @map("debate_id")
  roundIndex    Int      @map("round_index")
  turnIndex     Int      @map("turn_index")
  side          String   // "affirmative" | "negative"
  participantId String   @map("participant_id")
  startTime     DateTime @map("start_time")
  endTime       DateTime? @map("end_time")
  status        String   @default("pending")
  // "pending" | "active" | "completed" | "timeout"
  createdAt     DateTime @default(now()) @map("created_at")

  debate   Debate     @relation(fields: [debateId], references: [id], onDelete: Cascade)
  messages Message[]

  @@index([debateId, status])
  @@index([debateId])
  @@map("turns")
}

model Message {
  id        String   @id @default(cuid())
  debateId  String   @map("debate_id")
  turnId    String?  @map("turn_id")
  senderId  String   @map("sender_id")
  side      String   // "affirmative" | "negative" | "system"
  content   String
  createdAt DateTime @default(now()) @map("created_at")

  debate     Debate      @relation(fields: [debateId], references: [id], onDelete: Cascade)
  turn       Turn?       @relation(fields: [turnId], references: [id], onDelete: Cascade)
  sender     User        @relation(fields: [senderId], references: [id])
  factChecks FactCheck[]

  @@index([debateId, createdAt])
  @@index([debateId])
  @@index([senderId])
  @@map("messages")
}

model LawyerConversation {
  id            String   @id @default(cuid())
  debateId      String   @map("debate_id")
  participantId String   @map("participant_id")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  debate   Debate          @relation(fields: [debateId], references: [id], onDelete: Cascade)
  requests LawyerRequest[]

  @@unique([debateId, participantId])
  @@map("lawyer_conversations")
}

model LawyerRequest {
  id                String   @id @default(cuid())
  conversationId    String   @map("conversation_id")
  participantRequest String  @map("participant_request")
  context           Json     // Debate context provided to AI
  aiResponse        Json     @map("ai_response") // Structured AI response
  tokensUsed        Int?     @map("tokens_used")
  createdAt         DateTime @default(now()) @map("created_at")

  conversation LawyerConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@index([conversationId])
  @@map("lawyer_requests")
}

model JudgeReport {
  id              String   @id @default(cuid())
  debateId        String   @unique @map("debate_id")
  outcome         String   // "affirmative" | "negative" | "draw" | "inconclusive"
  confidence      Float
  verdict         String
  scores          Json     // { affirmative: {...}, negative: {...} }
  strengths       Json
  weaknesses      Json
  feedback        Json
  fallacies       Json
  conductFindings Json     @map("conduct_findings")
  summary         String
  tokensUsed      Int?     @map("tokens_used")
  createdAt       DateTime @default(now()) @map("created_at")

  debate Debate @relation(fields: [debateId], references: [id], onDelete: Cascade)

  @@map("judge_reports")
}

model AiUsage {
  id         String   @id @default(cuid())
  debateId   String   @map("debate_id")
  role       String   // "lawyer" | "judge" | "fact_checker"
  tokensUsed Int      @map("tokens_used")
  model      String
  requestId  String?  @map("request_id")
  createdAt  DateTime @default(now()) @map("created_at")

  debate Debate @relation(fields: [debateId], references: [id], onDelete: Cascade)

  @@index([debateId])
  @@index([createdAt])
  @@index([role])
  @@map("ai_usage")
}

model ModerationEvent {
  id         String   @id @default(cuid())
  debateId   String?  @map("debate_id")
  messageId  String?  @map("message_id")
  userId     String?  @map("user_id")
  category   String   // "harassment" | "threat" | "hate" | "spam" | "disruption" | "other"
  action     String   // "none" | "warning" | "official_warning" | "penalty" | "terminate"
  explanation String?
  createdAt  DateTime @default(now()) @map("created_at")

  debate  Debate?  @relation(fields: [debateId], references: [id], onDelete: Cascade)
  message Message? @relation(fields: [messageId], references: [id], onDelete: Cascade)
  user    User?    @relation(fields: [userId], references: [id])

  @@index([debateId])
  @@map("moderation_events")
}

model RaiseHandRequest {
  id          String    @id @default(cuid())
  debateId    String    @map("debate_id")
  requesterId String    @map("requester_id")
  side        String    // "affirmative" | "negative"
  status      String    @default("pending")
  // "pending" | "granted" | "declined" | "expired"
  decidedById String?   @map("decided_by_id")
  decidedAt   DateTime? @map("decided_at")
  reason      String?
  createdAt   DateTime  @default(now()) @map("created_at")

  debate    Debate @relation(fields: [debateId], references: [id], onDelete: Cascade)
  requester User   @relation(fields: [requesterId], references: [id])
  decidedBy User?  @relation(fields: [decidedById], references: [id])

  @@index([debateId, status])
  @@map("raise_hand_requests")
}

model Evidence {
  id         String   @id @default(cuid())
  debateId   String   @map("debate_id")
  pinnedById String   @map("pinned_by_id")
  side       String   @default("neutral")
  claim      String
  source     String?
  createdAt  DateTime @default(now()) @map("created_at")

  debate   Debate @relation(fields: [debateId], references: [id], onDelete: Cascade)
  pinnedBy User   @relation(fields: [pinnedById], references: [id])

  @@index([debateId])
  @@map("evidence")
}

model FactCheck {
  id          String   @id @default(cuid())
  debateId    String   @map("debate_id")
  messageId   String   @map("message_id")
  checkedById String?  @map("checked_by_id")
  verdict     String   // "verified" | "disputed" | "unverified" | "mixed"
  claims      Json     // Array of claim assessments
  model       String
  tokensUsed  Int?     @map("tokens_used")
  createdAt   DateTime @default(now()) @map("created_at")

  debate    Debate  @relation(fields: [debateId], references: [id], onDelete: Cascade)
  message   Message @relation(fields: [messageId], references: [id], onDelete: Cascade)
  checkedBy User?   @relation(fields: [checkedById], references: [id])

  @@index([debateId, messageId])
  @@map("fact_checks")
}

model Export {
  id                String   @id @default(cuid())
  debateId          String?  @map("debate_id")
  sourceDebateId    String?  @map("source_debate_id")
  createdById       String   @map("created_by_id")
  includeLawyerLogs Boolean  @default(false) @map("include_lawyer_logs")
  data              Json
  createdAt         DateTime @default(now()) @map("created_at")

  debate    Debate? @relation(fields: [debateId], references: [id], onDelete: Cascade)
  createdBy User    @relation(fields: [createdById], references: [id])

  @@index([debateId])
  @@index([createdById])
  @@index([createdAt])
  @@map("exports")
}

model DebateTemplate {
  id                   String   @id @default(cuid())
  name                 String
  topic                String
  description          String?
  category             String   @default("other")
  // "philosophy" | "politics" | "technology" | "science" | "ethics" | "education" | "economics" | "culture" | "other"
  maxRounds            Int      @default(4) @map("max_rounds")
  roundDurationMs      Int      @default(300000) @map("round_duration_ms")
  maxCharactersPerTurn Int      @default(2000) @map("max_characters_per_turn")
  isDefault            Boolean  @default(false) @map("is_default")
  createdAt            DateTime @default(now()) @map("created_at")

  @@index([category])
  @@map("debate_templates")
}

model Bookmark {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  debateId  String   @map("debate_id")
  createdAt DateTime @default(now()) @map("created_at")

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  debate Debate @relation(fields: [debateId], references: [id], onDelete: Cascade)

  @@unique([userId, debateId])
  @@index([userId])
  @@map("bookmarks")
}
```

### Migration Commands

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# Push to database (dev only)
npx prisma db push

# Open Prisma Studio
npx prisma studio
```

---

## 5. Environment Variables

```env
# .env.example

# ---- Application ----
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-a-long-random-secret

# ---- Database (Neon PostgreSQL) ----
DATABASE_URL=postgresql://user:password@localhost:5432/debatr?sslmode=require

# ---- AI Provider (OpenCode Zen) ----
OPENCODE_API_KEY=replace-with-your-opencode-api-key
OPENCODE_BASE_URL=https://opencode.ai/zen/v1
AI_LAWYER_MODEL=nemotron-3-ultra-free
AI_JUDGE_MODEL=nemotron-3-ultra-free
AI_FACT_CHECKER_MODEL=ling-3.0-flash-fin-free

# ---- AI Controls ----
AI_MAX_TOKENS_PER_REQUEST=4096
AI_MAX_TOKENS_PER_DEBATE=50000
AI_REQUEST_TIMEOUT_MS=60000
AI_MAX_RETRIES=3

# ---- Email (Resend) ----
RESEND_API_KEY=re_xxx_replace_with_your_resend_api_key
EMAIL_FROM=Debatr <onboarding@resend.dev>

# ---- Debate Defaults ----
DEBATE_DEFAULT_ROUNDS=4
DEBATE_DEFAULT_TURN_MINUTES=5
DEBATE_DEFAULT_MAX_CHARACTERS=2000

# ---- Invitation Settings ----
DEFAULT_INVITATION_CODE=change-me-to-a-secret-code

# ---- WebSocket ----
WS_PORT=3001
```

---

## 6. Authentication Flow

### Auth.js Configuration

```typescript
// src/server/auth.ts
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./db"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })
        
        if (!user || !user.passwordHash) return null
        
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )
        
        if (!isValid) return null
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    },
  },
})
```

### Registration Flow (with Invitation Code)

```typescript
// src/server/trpc/routers/auth.ts
import { z } from "zod"
import { router, publicProcedure } from "../context"
import bcrypt from "bcryptjs"
import { TRPCError } from "@trpc/server"

export const authRouter = router({
  signup: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(1),
        invitationCode: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 1. Validate invitation code
      const invitation = await ctx.db.invitation.findUnique({
        where: { code: input.invitationCode },
      })
      
      if (!invitation) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid invitation code",
        })
      }
      
      if (invitation.expiresAt < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invitation code has expired",
        })
      }
      
      if (invitation.usedById) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invitation code has already been used",
        })
      }
      
      // 2. Check email not already registered
      const existingUser = await ctx.db.user.findUnique({
        where: { email: input.email },
      })
      
      if (existingUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email already registered",
        })
      }
      
      // 3. Create user
      const passwordHash = await bcrypt.hash(input.password, 12)
      const user = await ctx.db.user.create({
        data: {
          email: input.email,
          name: input.name,
          passwordHash,
          emailVerified: new Date(), // Auto-verify on signup
        },
      })
      
      // 4. Mark invitation as used
      await ctx.db.invitation.update({
        where: { id: invitation.id },
        data: { usedById: user.id, usedAt: new Date() },
      })
      
      return { success: true }
    }),
  
  me: publicProcedure.query(async ({ ctx }) => {
    const session = await ctx.auth()
    if (!session?.user) return null
    
    return ctx.db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, role: true },
    })
  }),
})
```

---

## 7. API Layer (tRPC)

### tRPC Setup

```typescript
// src/server/trpc/context.ts
import { initTRPC, TRPCError } from "@trpc/server"
import { auth } from "@/server/auth"
import { prisma } from "@/server/db"
import { ZodError } from "zod"

export const createTRPCContext = async () => {
  const session = await auth()
  return {
    session,
    db: prisma,
    auth,
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const router = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" })
  }
  return next({ ctx })
})
```

### Root Router

```typescript
// src/server/trpc/router.ts
import { router } from "./context"
import { authRouter } from "./routers/auth"
import { debatesRouter } from "./routers/debates"
import { adminRouter } from "./routers/admin"
import { invitationsRouter } from "./routers/invitations"
import { bookmarksRouter } from "./routers/bookmarks"
import { templatesRouter } from "./routers/templates"
import { exportsRouter } from "./routers/exports"
import { healthRouter } from "./routers/health"

export const appRouter = router({
  auth: authRouter,
  debates: debatesRouter,
  admin: adminRouter,
  invitations: invitationsRouter,
  bookmarks: bookmarksRouter,
  templates: templatesRouter,
  exports: exportsRouter,
  health: healthRouter,
})

export type AppRouter = typeof appRouter
```

### Debates Router (Core)

```typescript
// src/server/trpc/routers/debates.ts
import { z } from "zod"
import { router, protectedProcedure, publicProcedure } from "../context"
import { TRPCError } from "@trpc/server"
import { startDebateTurns, closeTurnAndAdvance, sideOfUser, enterJudging } from "@/server/debate-engine/engine"
import { getLawyerAdvice } from "@/server/ai/lawyer"
import { evaluateDebate } from "@/server/ai/judge"
import { factCheckMessage } from "@/server/ai/factChecker"
import { checkDebateBudget } from "@/server/ai/budget"

export const debatesRouter = router({
  // List user's debates
  list: protectedProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      const userId = ctx.session.user.id
      const { cursor, limit } = input

      const debates = await ctx.db.debate.findMany({
        where: {
          participants: { some: { userId } },
        },
        include: {
          participants: true,
          judgeReport: { select: { outcome: true, confidence: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
      })

      let nextCursor: string | undefined
      if (debates.length > limit) {
        const next = debates.pop()
        nextCursor = next?.id
      }

      return { debates, nextCursor }
    }),

  // Get debate detail
  get: protectedProcedure
    .input(z.object({ debateId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const debate = await ctx.db.debate.findUnique({
        where: { id: input.debateId },
        include: {
          participants: { include: { user: { select: { id: true, name: true, email: true } } } },
          turns: { orderBy: { turnIndex: "asc" } },
          messages: { orderBy: { createdAt: "asc" } },
          judgeReport: true,
          evidence: true,
          bookmarks: { where: { userId: ctx.session.user.id } },
        },
      })

      if (!debate) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      // Check participant or spectating completed debate
      const isParticipant = debate.participants.some(p => p.userId === ctx.session.user.id)
      const canSpectate = debate.status === "completed" || debate.status === "judging"
      
      if (!isParticipant && !canSpectate) {
        throw new TRPCError({ code: "FORBIDDEN" })
      }

      return debate
    }),

  // Create debate
  create: protectedProcedure
    .input(
      z.object({
        topic: z.string().min(1).max(200),
        description: z.string().max(2000).optional(),
        opponentEmail: z.string().email(),
        maxRounds: z.number().min(1).max(20).default(4),
        roundDurationMs: z.number().min(60000).max(1800000).default(300000),
        maxCharactersPerTurn: z.number().min(100).max(10000).default(2000),
        templateId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id
      const user = ctx.session.user

      // Check opponent exists
      const opponent = await ctx.db.user.findUnique({
        where: { email: input.opponentEmail },
      })

      if (!opponent) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Opponent not found. They must have an account.",
        })
      }

      if (opponent.id === userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot debate yourself.",
        })
      }

      // Create debate
      const debate = await ctx.db.debate.create({
        data: {
          topic: input.topic,
          description: input.description,
          status: "waiting_for_participants",
          maxRounds: input.maxRounds,
          roundDurationMs: input.roundDurationMs,
          maxCharactersPerTurn: input.maxCharactersPerTurn,
          participants: {
            create: [
              {
                userId,
                side: "affirmative",
                displayName: user.name || user.email,
              },
              {
                userId: opponent.id,
                side: "negative",
                displayName: opponent.name || opponent.email,
              },
            ],
          },
        },
        include: { participants: true },
      })

      return debate
    }),

  // Join debate
  join: protectedProcedure
    .input(z.object({ debateId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const debate = await ctx.db.debate.findUnique({
        where: { id: input.debateId },
        include: { participants: true },
      })

      if (!debate) throw new TRPCError({ code: "NOT_FOUND" })
      if (debate.status !== "waiting_for_participants") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Debate already started" })
      }

      const isParticipant = debate.participants.some(p => p.userId === ctx.session.user.id)
      if (!isParticipant) {
        throw new TRPCError({ code: "FORBIDDEN" })
      }

      // Start the debate
      await startDebateTurns(debate)

      return { success: true }
    }),

  // Post message
  postMessage: protectedProcedure
    .input(
      z.object({
        debateId: z.string().uuid(),
        content: z.string().min(1).max(5000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const debate = await ctx.db.debate.findUnique({
        where: { id: input.debateId },
        include: { participants: true, turns: { where: { status: "active" } } },
      })

      if (!debate) throw new TRPCError({ code: "NOT_FOUND" })
      if (debate.status !== "active") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Debate is not active" })
      }

      const side = sideOfUser(debate, ctx.session.user.id)
      if (!side) throw new TRPCError({ code: "FORBIDDEN" })

      const activeTurn = debate.turns[0]
      if (!activeTurn) throw new TRPCError({ code: "BAD_REQUEST", message: "No active turn" })
      if (activeTurn.participantId !== ctx.session.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Not your turn" })
      }

      // Create message
      const message = await ctx.db.message.create({
        data: {
          debateId: input.debateId,
          turnId: activeTurn.id,
          senderId: ctx.session.user.id,
          side,
          content: input.content,
        },
      })

      // Advance turn
      const result = await closeTurnAndAdvance(debate.id, activeTurn.id)

      // If debate completed, trigger judging
      if (result.completed) {
        await enterJudging(debate.id)
      }

      return { message, turnCompleted: result.completed }
    }),

  // Request Lawyer advice
  requestLawyer: protectedProcedure
    .input(
      z.object({
        debateId: z.string().uuid(),
        request: z.string().min(1).max(2000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const debate = await ctx.db.debate.findUnique({
        where: { id: input.debateId },
        include: { participants: true, messages: true, evidence: true },
      })

      if (!debate) throw new TRPCError({ code: "NOT_FOUND" })

      const side = sideOfUser(debate, ctx.session.user.id)
      if (!side) throw new TRPCError({ code: "FORBIDDEN" })

      // Check budget
      const budget = await checkDebateBudget(debate.id)
      if (!budget.allowed) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "AI token budget exhausted for this debate",
        })
      }

      // Get or create conversation
      let conversation = await ctx.db.lawyerConversation.findUnique({
        where: {
          debateId_participantId: {
            debateId: debate.id,
            participantId: ctx.session.user.id,
          },
        },
      })

      if (!conversation) {
        conversation = await ctx.db.lawyerConversation.create({
          data: {
            debateId: debate.id,
            participantId: ctx.session.user.id,
          },
        })
      }

      // Call AI Lawyer
      const result = await getLawyerAdvice({
        debateTopic: debate.topic,
        participantSide: side,
        publicMessages: debate.messages.map(m => ({
          side: m.side,
          content: m.content,
          createdAt: m.createdAt.toISOString(),
        })),
        participantRequest: input.request,
        evidence: debate.evidence.map(e => ({
          side: e.side,
          claim: e.claim,
          source: e.source,
        })),
      })

      // Save request/response
      const lawyerRequest = await ctx.db.lawyerRequest.create({
        data: {
          conversationId: conversation.id,
          participantRequest: input.request,
          context: { debateTopic: debate.topic, side },
          aiResponse: result.response,
          tokensUsed: result.tokensUsed,
        },
      })

      // Track usage
      await ctx.db.aiUsage.create({
        data: {
          debateId: debate.id,
          role: "lawyer",
          tokensUsed: result.tokensUsed,
          model: "nemotron-3-ultra-free",
          requestId: result.requestId,
        },
      })

      return { response: result.response, requestId: lawyerRequest.id }
    }),

  // Fact-check a message
  factCheck: protectedProcedure
    .input(z.object({ messageId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const message = await ctx.db.message.findUnique({
        where: { id: input.messageId },
        include: {
          debate: { include: { evidence: true } },
        },
      })

      if (!message) throw new TRPCError({ code: "NOT_FOUND" })

      // Check budget
      const budget = await checkDebateBudget(message.debateId)
      if (!budget.allowed) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "AI token budget exhausted",
        })
      }

      const result = await factCheckMessage({
        debateTopic: message.debate.topic,
        messageContent: message.content,
        messageSide: message.side as "affirmative" | "negative" | "system",
        evidence: message.debate.evidence.map(e => ({
          side: e.side,
          claim: e.claim,
          source: e.source,
        })),
      })

      // Save fact check
      const factCheck = await ctx.db.factCheck.create({
        data: {
          debateId: message.debateId,
          messageId: input.messageId,
          checkedById: ctx.session.user.id,
          verdict: result.response.verdict,
          claims: result.response.claims,
          model: "ling-3.0-flash-fin-free",
          tokensUsed: result.tokensUsed,
        },
      })

      // Track usage
      await ctx.db.aiUsage.create({
        data: {
          debateId: message.debateId,
          role: "fact_checker",
          tokensUsed: result.tokensUsed,
          model: "ling-3.0-flash-fin-free",
          requestId: result.requestId,
        },
      })

      return { factCheck }
    }),

  // Trigger judging
  judge: protectedProcedure
    .input(z.object({ debateId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const debate = await ctx.db.debate.findUnique({
        where: { id: input.debateId },
        include: { messages: true, evidence: true },
      })

      if (!debate) throw new TRPCError({ code: "NOT_FOUND" })
      if (debate.status !== "judging" && debate.status !== "completed") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Debate not ready for judging" })
      }

      // Check budget
      const budget = await checkDebateBudget(debate.id)
      if (!budget.allowed) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "AI token budget exhausted",
        })
      }

      const result = await evaluateDebate({
        debateTopic: debate.topic,
        publicMessages: debate.messages.map(m => ({
          id: m.id,
          side: m.side as "affirmative" | "negative" | "system",
          content: m.content,
          createdAt: m.createdAt.toISOString(),
        })),
        evidence: debate.evidence.map(e => ({
          side: e.side,
          claim: e.claim,
          source: e.source,
        })),
      })

      // Save judge report
      const report = await ctx.db.judgeReport.create({
        data: {
          debateId: debate.id,
          outcome: result.response.outcome,
          confidence: result.response.confidence,
          verdict: result.response.verdict,
          scores: result.response.scores,
          strengths: result.response.strengths,
          weaknesses: result.response.weaknesses,
          feedback: result.response.feedback,
          fallacies: result.response.fallacies,
          conductFindings: result.response.conductFindings,
          summary: result.response.summary,
          tokensUsed: result.tokensUsed,
        },
      })

      // Update debate
      await ctx.db.debate.update({
        where: { id: debate.id },
        data: {
          status: "completed",
          judgeReportId: report.id,
          completedAt: new Date(),
        },
      })

      // Track usage
      await ctx.db.aiUsage.create({
        data: {
          debateId: debate.id,
          role: "judge",
          tokensUsed: result.tokensUsed,
          model: "nemotron-3-ultra-free",
          requestId: result.requestId,
        },
      })

      return { report }
    }),

  // Get judge report
  getReport: protectedProcedure
    .input(z.object({ debateId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const debate = await ctx.db.debate.findUnique({
        where: { id: input.debateId },
        include: { judgeReport: true },
      })

      if (!debate) throw new TRPCError({ code: "NOT_FOUND" })
      if (!debate.judgeReport) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No judge report yet" })
      }

      return debate.judgeReport
    }),

  // Pin evidence
  pinEvidence: protectedProcedure
    .input(
      z.object({
        debateId: z.string().uuid(),
        claim: z.string().min(1).max(1000),
        source: z.string().max(2000).optional(),
        side: z.enum(["affirmative", "negative", "neutral"]).default("neutral"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const debate = await ctx.db.debate.findUnique({
        where: { id: input.debateId },
        include: { participants: true },
      })

      if (!debate) throw new TRPCError({ code: "NOT_FOUND" })

      const isParticipant = debate.participants.some(p => p.userId === ctx.session.user.id)
      if (!isParticipant) throw new TRPCError({ code: "FORBIDDEN" })

      const evidence = await ctx.db.evidence.create({
        data: {
          debateId: input.debateId,
          pinnedById: ctx.session.user.id,
          claim: input.claim,
          source: input.source,
          side: input.side,
        },
      })

      return evidence
    }),

  // Pause debate
  pause: protectedProcedure
    .input(z.object({ debateId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const debate = await ctx.db.debate.findUnique({
        where: { id: input.debateId },
        include: { participants: true },
      })

      if (!debate) throw new TRPCError({ code: "NOT_FOUND" })
      if (debate.status !== "active") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Debate is not active" })
      }

      const isParticipant = debate.participants.some(p => p.userId === ctx.session.user.id)
      if (!isParticipant) throw new TRPCError({ code: "FORBIDDEN" })

      await ctx.db.debate.update({
        where: { id: debate.id },
        data: { status: "paused" },
      })

      return { success: true }
    }),

  // Resume debate
  resume: protectedProcedure
    .input(z.object({ debateId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const debate = await ctx.db.debate.findUnique({
        where: { id: input.debateId },
        include: { participants: true },
      })

      if (!debate) throw new TRPCError({ code: "NOT_FOUND" })
      if (debate.status !== "paused") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Debate is not paused" })
      }

      const isParticipant = debate.participants.some(p => p.userId === ctx.session.user.id)
      if (!isParticipant) throw new TRPCError({ code: "FORBIDDEN" })

      await ctx.db.debate.update({
        where: { id: debate.id },
        data: { status: "active" },
      })

      return { success: true }
    }),

  // Cancel debate
  cancel: protectedProcedure
    .input(
      z.object({
        debateId: z.string().uuid(),
        reason: z.string().max(1000).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const debate = await ctx.db.debate.findUnique({
        where: { id: input.debateId },
        include: { participants: true },
      })

      if (!debate) throw new TRPCError({ code: "NOT_FOUND" })
      if (debate.status === "completed" || debate.status === "cancelled") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Debate already finished" })
      }

      const isParticipant = debate.participants.some(p => p.userId === ctx.session.user.id)
      if (!isParticipant) throw new TRPCError({ code: "FORBIDDEN" })

      await ctx.db.debate.update({
        where: { id: debate.id },
        data: { status: "cancelled" },
      })

      // Log moderation event if reason provided
      if (input.reason) {
        await ctx.db.moderationEvent.create({
          data: {
            debateId: debate.id,
            userId: ctx.session.user.id,
            category: "other",
            action: "none",
            explanation: input.reason,
          },
        })
      }

      return { success: true }
    }),

  // Raise hand
  raiseHand: protectedProcedure
    .input(
      z.object({
        debateId: z.string().uuid(),
        reason: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const debate = await ctx.db.debate.findUnique({
        where: { id: input.debateId },
        include: { participants: true },
      })

      if (!debate) throw new TRPCError({ code: "NOT_FOUND" })
      if (debate.status !== "active") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Debate is not active" })
      }

      const side = sideOfUser(debate, ctx.session.user.id)
      if (!side) throw new TRPCError({ code: "FORBIDDEN" })

      // Check for existing pending request
      const existing = await ctx.db.raiseHandRequest.findFirst({
        where: {
          debateId: debate.id,
          requesterId: ctx.session.user.id,
          status: "pending",
        },
      })

      if (existing) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Hand already raised" })
      }

      const request = await ctx.db.raiseHandRequest.create({
        data: {
          debateId: debate.id,
          requesterId: ctx.session.user.id,
          side,
          reason: input.reason,
        },
      })

      return request
    }),

  // Decide raise hand
  decideRaiseHand: protectedProcedure
    .input(
      z.object({
        debateId: z.string().uuid(),
        requestId: z.string().uuid(),
        decision: z.enum(["granted", "declined"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const debate = await ctx.db.debate.findUnique({
        where: { id: input.debateId },
        include: { participants: true },
      })

      if (!debate) throw new TRPCError({ code: "NOT_FOUND" })

      const isParticipant = debate.participants.some(p => p.userId === ctx.session.user.id)
      if (!isParticipant) throw new TRPCError({ code: "FORBIDDEN" })

      const request = await ctx.db.raiseHandRequest.findUnique({
        where: { id: input.requestId },
      })

      if (!request || request.debateId !== debate.id) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      if (request.requesterId === ctx.session.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot decide your own request" })
      }

      await ctx.db.raiseHandRequest.update({
        where: { id: request.id },
        data: {
          status: input.decision,
          decidedById: ctx.session.user.id,
          decidedAt: new Date(),
        },
      })

      return { success: true }
    }),
})
```

---

## 8. WebSocket Layer

### Socket.io Setup

```typescript
// src/server/websocket/index.ts
import { Server } from "socket.io"
import { createServer } from "http"
import { parse } from "cookie"
import { auth } from "@/server/auth"
import { prisma } from "@/server/db"

const io = new Server({
  cors: {
    origin: process.env.NEXTAUTH_URL,
    credentials: true,
  },
})

// Auth middleware
io.use(async (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie
    if (!cookieHeader) {
      return next(new Error("No cookies"))
    }

    const cookies = parse(cookieHeader)
    const sessionToken = cookies["authjs.session-token"]

    if (!sessionToken) {
      return next(new Error("No session token"))
    }

    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    })

    if (!session || session.expires < new Date()) {
      return next(new Error("Session expired"))
    }

    socket.data.user = session.user
    next()
  } catch (error) {
    next(new Error("Authentication failed"))
  }
})

// Track online users per debate
const debatePresence = new Map<string, Set<string>>()

io.on("connection", (socket) => {
  const user = socket.data.user
  console.log(`User connected: ${user.id}`)

  // Subscribe to debate
  socket.on("subscribe", async (data: { debateId: string }) => {
    const { debateId } = data

    // Verify participant
    const participant = await prisma.debateParticipant.findUnique({
      where: {
        debateId_userId: {
          debateId,
          userId: user.id,
        },
      },
    })

    if (!participant) {
      socket.emit("error", { message: "Not a participant" })
      return
    }

    socket.join(`debate:${debateId}`)

    // Track presence
    if (!debatePresence.has(debateId)) {
      debatePresence.set(debateId, new Set())
    }
    debatePresence.get(debateId)!.add(user.id)

    // Broadcast presence
    io.to(`debate:${debateId}`).emit("presence", {
      debateId,
      userIds: Array.from(debatePresence.get(debateId)!),
    })

    socket.emit("subscribed", { debateId })
  })

  // Typing indicator
  socket.on("typing", (data: { debateId: string; isTyping: boolean }) => {
    socket.to(`debate:${data.debateId}`).emit("typing", {
      debateId: data.debateId,
      userId: user.id,
      isTyping: data.isTyping,
    })
  })

  // Emoji reaction
  socket.on("reaction", (data: { debateId: string; emoji: string }) => {
    socket.to(`debate:${data.debateId}`).emit("reaction", {
      debateId: data.debateId,
      userId: user.id,
      emoji: data.emoji,
    })
  })

  // Disconnect
  socket.on("disconnect", () => {
    // Remove from all debate presence sets
    debatePresence.forEach((users, debateId) => {
      if (users.has(user.id)) {
        users.delete(user.id)
        io.to(`debate:${debateId}`).emit("presence", {
          debateId,
          userIds: Array.from(users),
        })
      }
    })
  })
})

export { io }
```

### Client-Side Hook

```typescript
// src/hooks/useWebSocket.ts
"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { io, Socket } from "socket.io-client"
import { useSession } from "next-auth/react"

export type DebateEvent =
  | { type: "connected"; message: string }
  | { type: "subscribed"; debateId: string }
  | { type: "debate_state_changed"; debateId: string; status: string; currentTurnId: string | null; currentRound: number }
  | { type: "turn_advanced"; debateId: string; completed: boolean; nextTurnId: string | null }
  | { type: "message_posted"; debateId: string; turnId: string | null; side: string; messageId: string }
  | { type: "raise_hand"; debateId: string; requestId: string; side: string }
  | { type: "raise_hand_decided"; debateId: string; requestId: string; status: string }
  | { type: "presence"; debateId: string; userIds: string[] }
  | { type: "fact_checked"; debateId: string; messageId: string; verdict: string; factCheckId: string }
  | { type: "typing"; debateId: string; userId: string; isTyping: boolean }
  | { type: "reaction"; debateId: string; userId: string; emoji: string }
  | { type: "ai_thinking"; debateId: string; role: "lawyer" | "judge"; isThinking: boolean }
  | { type: "error"; message: string }

export type WsStatus = "connecting" | "connected" | "reconnecting" | "disconnected" | "unauthorized"

export function useWebSocket(debateId: string | null) {
  const { data: session } = useSession()
  const socketRef = useRef<Socket | null>(null)
  const [status, setStatus] = useState<WsStatus>("disconnected")
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])

  const connect = useCallback(() => {
    if (!debateId || !session) return

    const socket = io(process.env.NEXT_PUBLIC_WS_URL || window.location.origin, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    })

    socket.on("connect", () => {
      setStatus("connected")
      socket.emit("subscribe", { debateId })
    })

    socket.on("subscribed", () => {
      console.log("Subscribed to debate:", debateId)
    })

    socket.on("presence", (data: { debateId: string; userIds: string[] }) => {
      setOnlineUsers(data.userIds)
    })

    socket.on("turn_advanced", (data) => {
      window.dispatchEvent(new CustomEvent("debate:turn_advanced", { detail: data }))
    })

    socket.on("message_posted", (data) => {
      window.dispatchEvent(new CustomEvent("debate:message_posted", { detail: data }))
    })

    socket.on("typing", (data) => {
      window.dispatchEvent(new CustomEvent("debate:typing", { detail: data }))
    })

    socket.on("reaction", (data) => {
      window.dispatchEvent(new CustomEvent("debate:reaction", { detail: data }))
    })

    socket.on("ai_thinking", (data) => {
      window.dispatchEvent(new CustomEvent("debate:ai_thinking", { detail: data }))
    })

    socket.on("disconnect", () => {
      setStatus("disconnected")
    })

    socket.on("connect_error", () => {
      setStatus("reconnecting")
    })

    socketRef.current = socket
  }, [debateId, session])

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect()
    socketRef.current = null
    setStatus("disconnected")
  }, [])

  const sendTyping = useCallback((isTyping: boolean) => {
    socketRef.current?.emit("typing", { debateId, isTyping })
  }, [debateId])

  const sendReaction = useCallback((emoji: string) => {
    socketRef.current?.emit("reaction", { debateId, emoji })
  }, [debateId])

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return {
    status,
    onlineUsers,
    sendTyping,
    sendReaction,
  }
}
```

---

## 9. AI Integration

### AI Provider

```typescript
// src/server/ai/provider.ts
import { config } from "@/server/lib/config"

export interface AIProvider {
  name: string
  complete(prompt: string, options?: AIOptions): Promise<AIResponse>
  structured<T>(prompt: string, schema: object, options?: AIOptions): Promise<T>
  structuredWithUsage<T>(prompt: string, schema: object, options?: AIOptions): Promise<{ data: T; usage?: AIResponse["usage"]; requestId?: string }>
}

export interface AIOptions {
  model?: string
  maxTokens?: number
  temperature?: number
  timeoutMs?: number
  retries?: number
}

export interface AIResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  model?: string
  requestId?: string
}

export class OpenCodeProvider implements AIProvider {
  name = "opencode-zen"
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.baseUrl = config.opencodeBaseUrl
    this.apiKey = config.opencodeApiKey
  }

  private async _request(
    prompt: string,
    options: AIOptions | undefined,
    kind: "complete" | "structured",
  ): Promise<{ content: string; usage: AIResponse["usage"]; model: string; id: string }> {
    const model = options?.model || config.aiJudgeModel
    const maxTokens = options?.maxTokens || config.aiMaxTokensPerRequest
    const timeoutMs = options?.timeoutMs || config.aiRequestTimeoutMs
    const retries = options?.retries || config.aiMaxRetries
    const temperature = options?.temperature ?? (kind === "structured" ? 0.3 : 0.7)

    let lastError: Error | null = null
    const started = Date.now()

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

        const body: Record<string, unknown> = {
          model,
          messages: [{ role: "user", content: prompt }],
          max_tokens: maxTokens,
          temperature,
        }

        if (kind === "structured") {
          body.response_format = { type: "json_object" }
        }

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`OpenCode API error: ${response.status} ${errorText}`)
        }

        const data = await response.json()
        const content: string = data.choices[0]?.message?.content || ""
        const durationMs = Date.now() - started
        const usage = {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        }

        return {
          content,
          usage,
          model: data.model ?? model,
          id: data.id,
        }
      } catch (error) {
        lastError = error as Error

        if (lastError.name === "AbortError") {
          throw new Error(`AI request timeout after ${timeoutMs}ms`)
        }

        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError || new Error(`AI ${kind} request failed after all retries`)
  }

  async complete(prompt: string, options?: AIOptions): Promise<AIResponse> {
    const { content, usage, model, id } = await this._request(prompt, options, "complete")
    return { content, usage, model, requestId: id }
  }

  async structured<T>(prompt: string, _schema: object, options?: AIOptions): Promise<T> {
    const { data } = await this.structuredWithUsage<T>(prompt, _schema, options)
    return data
  }

  async structuredWithUsage<T>(prompt: string, _schema: object, options?: AIOptions): Promise<{ data: T; usage?: AIResponse["usage"]; requestId?: string }> {
    const { content, usage, id } = await this._request(prompt, options, "structured")

    const parsed = JSON.parse(content)
    return {
      data: parsed as T,
      usage,
      requestId: typeof id === "string" ? id : undefined,
    }
  }
}

let providerInstance: OpenCodeProvider | null = null

export function getProvider(): AIProvider {
  if (!providerInstance) {
    providerInstance = new OpenCodeProvider()
  }
  return providerInstance
}
```

### AI Lawyer

```typescript
// src/server/ai/lawyer.ts
import { getProvider } from "./provider"
import { config } from "@/server/lib/config"
import { z } from "zod"
import { lookupEvidence, scoreArgument, TOOL_DESCRIPTIONS, type ToolContext } from "./tools"
import { readFile } from "fs/promises"
import { join } from "path"

interface LawyerContext {
  debateTopic: string
  participantSide: "affirmative" | "negative"
  publicMessages: Array<{ side: string; content: string; createdAt: string }>
  participantRequest: string
  evidence?: Array<{ side: string; claim: string; source?: string | null }>
}

export const LawyerResponseSchema = z.object({
  assistanceType: z.enum([
    "supporting_argument",
    "rebuttal",
    "counterargument",
    "clarity_improvement",
    "weakness_identification",
    "evidence_suggestion",
    "summary",
    "safe_refusal",
  ]),
  advice: z.string(),
  uncertainty: z.string().nullish(),
  evidenceSuggestions: z.array(
    z.object({
      claim: z.string(),
      verificationNeeded: z.string(),
      providedSourceMessageId: z.string().nullish(),
    }),
  ),
  referencedMessageIds: z.array(z.string()).nullish(),
  conductConcern: z.enum([
    "none",
    "possible_harassment",
    "possible_threat",
    "possible_hate",
    "possible_harm",
    "other",
  ]),
})

export type ValidatedLawyerResponse = z.infer<typeof LawyerResponseSchema>

let lawyerPromptTemplate: string | null = null

async function loadLawyerPrompt(): Promise<string> {
  if (!lawyerPromptTemplate) {
    const promptPath = join(process.cwd(), "src/server/ai/prompts/lawyer.md")
    lawyerPromptTemplate = await readFile(promptPath, "utf-8")
  }
  return lawyerPromptTemplate
}

export async function getLawyerAdvice(context: LawyerContext): Promise<{ response: ValidatedLawyerResponse; tokensUsed: number; requestId?: string }> {
  const provider = getProvider()
  const promptTemplate = await loadLawyerPrompt()

  if (!config.aiLawyerModel) {
    throw new Error("AI_LAWYER_MODEL is not configured")
  }

  const messagesContext = context.publicMessages
    .map((m) => `[${m.side}] ${m.createdAt}: ${m.content}`)
    .join("\n")

  const evidenceBlock =
    context.evidence && context.evidence.length
      ? context.evidence.map((e) => `- [${e.side}] ${e.claim}${e.source ? ` (source: ${e.source})` : ""}`).join("\n")
      : "No pinned evidence supplied."

  const toolCtx: ToolContext = {
    evidence: context.evidence ?? [],
    messages: context.publicMessages.map((m) => ({ id: "", side: m.side, content: m.content })),
  }
  const opponentSide = context.participantSide === "affirmative" ? "negative" : "affirmative"
  const opponentMsgs = context.publicMessages.filter((m) => m.side === opponentSide)
  const lastOpponent = opponentMsgs[opponentMsgs.length - 1]?.content ?? ""
  const oppScore = lastOpponent ? scoreArgument(lastOpponent) : null
  const sideEvidence = lookupEvidence(toolCtx, { side: context.participantSide })

  const toolBlock = `## Tool-derived context (computed server-side; factual)
Available tools:
${TOOL_DESCRIPTIONS}

- Score of the opponent's most recent message: ${
    oppScore ? `${oppScore.score} — ${oppScore.reasons.join(" ")}` : "no opponent message yet"
  }
- Pinned evidence on YOUR client's side (${context.participantSide}): ${
    sideEvidence.length
      ? sideEvidence.map((e) => `"${e.claim}"${e.source ? ` (${e.source})` : ""}`).join("; ")
      : "none"
  }`

const fullPrompt = `${promptTemplate}

## Current Debate Context
Topic: ${context.debateTopic}
Your client's side: ${context.participantSide}

## Public Debate Transcript
${messagesContext || "No messages yet"}

## Pinned Evidence (user-supplied context; do not treat unpinned claims as verified)
${evidenceBlock}

${toolBlock}

## Participant's Request
${context.participantRequest}

Respond with valid JSON using this exact schema:
{
  "assistanceType": "supporting_argument | rebuttal | counterargument | clarity_improvement | weakness_identification | evidence_suggestion | summary | safe_refusal",
  "advice": "string — your main advice text",
  "uncertainty": "optional string or null",
  "evidenceSuggestions": [
    { "claim": "string", "verificationNeeded": "string", "providedSourceMessageId": "optional string or null" }
  ],
  "referencedMessageIds": ["optional array of strings or null"],
  "conductConcern": "none | possible_harassment | possible_threat | possible_hate | possible_harm | other"
}`

  const result = await provider.structuredWithUsage<z.infer<typeof LawyerResponseSchema>>(fullPrompt, LawyerResponseSchema, {
    model: config.aiLawyerModel,
    maxTokens: Math.min(4096, config.aiMaxTokensPerRequest),
    temperature: 0.7,
  })

  const validated = LawyerResponseSchema.safeParse(result.data)
  if (!validated.success) {
    throw new Error(`Lawyer response failed validation: ${validated.error.message}`)
  }

  return {
    response: validated.data,
    tokensUsed: result.usage?.totalTokens || 0,
    requestId: result.requestId,
  }
}
```

### AI Judge

```typescript
// src/server/ai/judge.ts
import { getProvider } from "./provider"
import { config } from "@/server/lib/config"
import { z } from "zod"
import { readFile } from "fs/promises"
import { join } from "path"

interface JudgeContext {
  debateTopic: string
  publicMessages: Array<{
    id: string
    side: "affirmative" | "negative" | "system"
    content: string
    createdAt: string
  }>
  evidence?: Array<{ side: string; claim: string; source?: string | null }>
}

const ScoreBreakdownSchema = z.object({
  logicalConsistency: z.number(),
  evidenceQuality: z.number(),
  rebuttalEffectiveness: z.number(),
  argumentStructure: z.number(),
  responsiveness: z.number(),
})

export const JudgeResponseSchema = z.object({
  outcome: z.enum(["affirmative", "negative", "draw", "inconclusive"]),
  confidence: z.number().min(0).max(1),
  verdict: z.string(),
  scores: z.object({
    affirmative: ScoreBreakdownSchema,
    negative: ScoreBreakdownSchema,
  }),
  strengths: z.object({ affirmative: z.array(z.string()), negative: z.array(z.string()) }),
  weaknesses: z.object({ affirmative: z.array(z.string()), negative: z.array(z.string()) }),
  feedback: z.object({ affirmative: z.string(), negative: z.string() }),
  fallacies: z.array(
    z.object({
      side: z.enum(["affirmative", "negative"]),
      label: z.string(),
      explanation: z.string(),
      messageIds: z.array(z.string()),
    }),
  ),
  conductFindings: z.array(
    z.object({
      side: z.enum(["affirmative", "negative"]),
      category: z.enum(["harassment", "threat", "hate", "spam", "disruption", "other"]),
      recommendedAction: z.enum(["none", "warning", "official_warning", "penalty", "terminate"]),
      explanation: z.string(),
      messageIds: z.array(z.string()),
    }),
  ),
  summary: z.string(),
})

export type ValidatedJudgeResponse = z.infer<typeof JudgeResponseSchema>

let judgePromptTemplate: string | null = null

async function loadJudgePrompt(): Promise<string> {
  if (!judgePromptTemplate) {
    const promptPath = join(process.cwd(), "src/server/ai/prompts/judge.md")
    judgePromptTemplate = await readFile(promptPath, "utf-8")
  }
  return judgePromptTemplate
}

export async function evaluateDebate(context: JudgeContext): Promise<{ response: ValidatedJudgeResponse; tokensUsed: number; requestId?: string }> {
  const provider = getProvider()
  const promptTemplate = await loadJudgePrompt()

  if (!config.aiJudgeModel) {
    throw new Error("AI_JUDGE_MODEL is not configured")
  }

  const transcript = context.publicMessages
    .map((m) => `[${m.id}] [${m.side}] ${m.createdAt}: ${m.content}`)
    .join("\n")

  const evidenceBlock =
    context.evidence && context.evidence.length
      ? context.evidence.map((e) => `- [${e.side}] ${e.claim}${e.source ? ` (source: ${e.source})` : ""}`).join("\n")
      : "No pinned evidence supplied."

  const fullPrompt = `${promptTemplate}

## Debate Topic
${context.debateTopic}

## Complete Public Transcript
${transcript || "No messages in this debate"}

## Pinned Evidence (user-supplied context; do not treat unpinned claims as verified)
${evidenceBlock}

Evaluate the debate and respond with valid JSON matching the JudgeResponse schema.`

  const result = await provider.structuredWithUsage<ValidatedJudgeResponse>(fullPrompt, JudgeResponseSchema, {
    model: config.aiJudgeModel,
    maxTokens: 4096,
    temperature: 0.3,
  })

  const parsed = JudgeResponseSchema.safeParse(result.data)
  if (!parsed.success) {
    throw new Error(`Judge response failed validation: ${parsed.error.message}`)
  }

  return {
    response: parsed.data,
    tokensUsed: result.usage?.totalTokens || 0,
    requestId: result.requestId,
  }
}
```

### AI Fact-Checker

```typescript
// src/server/ai/factChecker.ts
import { getProvider } from "./provider"
import { config } from "@/server/lib/config"
import { z } from "zod"
import { readFile } from "fs/promises"
import { join } from "path"

const FactClaimSchema = z.object({
  claim: z.string().min(1),
  assessment: z.enum(["verified", "disputed", "unverified"]),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().min(1),
  source: z.string().nullable().optional(),
})

export const FactCheckerResponseSchema = z.object({
  verdict: z.enum(["verified", "disputed", "unverified", "mixed"]),
  claims: z.array(FactClaimSchema).min(1),
})

export type FactCheckerResponse = z.infer<typeof FactCheckerResponseSchema>

let factCheckerPromptTemplate: string | null = null

async function loadFactCheckerPrompt(): Promise<string> {
  if (!factCheckerPromptTemplate) {
    const promptPath = join(process.cwd(), "src/server/ai/prompts/fact_checker.md")
    factCheckerPromptTemplate = await readFile(promptPath, "utf-8")
  }
  return factCheckerPromptTemplate
}

export interface FactCheckerContext {
  debateTopic: string
  messageContent: string
  messageSide: "affirmative" | "negative" | "system"
  evidence?: Array<{ side: string; claim: string; source?: string | null }>
}

export async function factCheckMessage(
  context: FactCheckerContext,
): Promise<{ response: FactCheckerResponse; tokensUsed: number; requestId?: string }> {
  const provider = getProvider()
  const promptTemplate = await loadFactCheckerPrompt()

  if (!config.aiFactCheckerModel) {
    throw new Error("AI_FACT_CHECKER_MODEL is not configured")
  }

  const evidenceBlock =
    context.evidence && context.evidence.length
      ? context.evidence.map((e) => `- [${e.side}] ${e.claim}${e.source ? ` (source: ${e.source})` : ""}`).join("\n")
      : "No pinned evidence supplied."

  const fullPrompt = `${promptTemplate}

## Debate Topic
${context.debateTopic}

## Message author side
${context.messageSide}

## Pinned evidence (user-supplied context; do not treat unpinned claims as verified)
${evidenceBlock}

## Message to fact-check
${context.messageContent}

Assess the factual claims in the message and respond with valid JSON matching the FactCheckerResponse schema.`

  const result = await provider.structuredWithUsage<FactCheckerResponse>(
    fullPrompt,
    FactCheckerResponseSchema,
    {
      model: config.aiFactCheckerModel,
      maxTokens: config.aiMaxTokensPerRequest,
      temperature: 0.2,
    },
  )

  const parsed = FactCheckerResponseSchema.safeParse(result.data)
  if (!parsed.success) {
    throw new Error(`Fact-checker response failed validation: ${parsed.error.message}`)
  }

  return {
    response: parsed.data,
    tokensUsed: result.usage?.totalTokens || 0,
    requestId: result.requestId,
  }
}
```

### AI Budget System

```typescript
// src/server/ai/budget.ts
import { prisma } from "@/server/db"
import { config } from "@/server/lib/config"

export interface BudgetCheck {
  allowed: boolean
  used: number
  limit: number
  remaining: number
}

export function evaluateBudget(used: number, limit: number): BudgetCheck {
  return {
    allowed: used < limit,
    used,
    limit,
    remaining: Math.max(0, limit - used),
  }
}

export async function checkDebateBudget(debateId: string): Promise<BudgetCheck> {
  const result = await prisma.aiUsage.aggregate({
    where: { debateId },
    _sum: { tokensUsed: true },
  })

  const limit = config.aiMaxTokensPerDebate
  const used = result._sum.tokensUsed ?? 0
  return evaluateBudget(used, limit)
}
```

### AI Tools (Server-Side)

```typescript
// src/server/ai/tools.ts
export interface ToolContext {
  evidence: Array<{ side: string; claim: string; source?: string | null }>
  messages: Array<{ id: string; side: string; content: string }>
}

export interface ToolCall {
  tool: string
  args: Record<string, any>
}

export interface ToolResult {
  tool: string
  ok: boolean
  result?: any
  error?: string
}

export function scoreArgument(content: string): { score: number; reasons: string[] } {
  const text = (content ?? "").trim()
  const reasons: string[] = []
  let score = 0.5

  if (text.length >= 120) {
    score += 0.1
    reasons.push("Developed point (>=120 chars).")
  }
  if (/\b(because|therefore|since|thus|according to|studies show|data shows)\b/i.test(text)) {
    score += 0.15
    reasons.push("Uses reasoning connectors.")
  }
  if (/\b\d+(\.\d+)?(%|x| times| billion| million)?\b/.test(text)) {
    score += 0.1
    reasons.push("Cites a quantity/statistic.")
  }
  if (/(https?:\/\/|source:|\[[0-9]+\]|\(.*\d{4}.*\))/.test(text)) {
    score += 0.1
    reasons.push("Includes a citation or source marker.")
  }
  if (text.split(/\s+/).length < 8) {
    score -= 0.2
    reasons.push("Very short / under-developed.")
  }

  score = Math.max(0, Math.min(1, Number(score.toFixed(2))))
  return { score, reasons }
}

export function lookupEvidence(ctx: ToolContext, args: { side?: string; query?: string }): any[] {
  let rows = ctx.evidence
  if (args.side) rows = rows.filter((e) => e.side === args.side)
  if (args.query) {
    const q = args.query.toLowerCase()
    rows = rows.filter(
      (e) => e.claim.toLowerCase().includes(q) || (e.source ?? "").toLowerCase().includes(q),
    )
  }
  return rows.map((e) => ({ side: e.side, claim: e.claim, source: e.source ?? null }))
}

export function searchTranscript(ctx: ToolContext, args: { query?: string }): any[] {
  const q = (args.query ?? "").toLowerCase()
  if (!q) return []
  return ctx.messages
    .filter((m) => m.content.toLowerCase().includes(q))
    .map((m) => ({ id: m.id, side: m.side, excerpt: m.content.slice(0, 200) }))
}

export function executeToolCall(call: ToolCall, ctx: ToolContext): ToolResult {
  try {
    switch (call.tool) {
      case "score_argument": {
        const content = typeof call.args?.content === "string" ? call.args.content : ""
        return { tool: call.tool, ok: true, result: scoreArgument(content) }
      }
      case "lookup_evidence": {
        return { tool: call.tool, ok: true, result: lookupEvidence(ctx, call.args ?? {}) }
      }
      case "search_transcript": {
        return { tool: call.tool, ok: true, result: searchTranscript(ctx, call.args ?? {}) }
      }
      default:
        return { tool: call.tool, ok: false, error: `Unknown tool: ${call.tool}` }
    }
  } catch (err) {
    return { tool: call.tool, ok: false, error: err instanceof Error ? err.message : "tool error" }
  }
}

export const TOOL_DESCRIPTIONS = [
  'score_argument(args: { content: string }) -> heuristic quality score 0..1 with reasons',
  'lookup_evidence(args: { side?: "affirmative"|"negative"|"neutral", query?: string }) -> pinned evidence rows',
  'search_transcript(args: { query: string }) -> transcript messages mentioning the query',
].join("\n")
```

---

## 10. Debate Engine

### Turn-Based State Machine

```typescript
// src/server/debate-engine/engine.ts
import { prisma } from "@/server/db"
import { randomUUID } from "crypto"

type DebateRow = any // Prisma Debate type
type TurnRow = any // Prisma Turn type

export type Side = "affirmative" | "negative"

function buildTurnPlan(maxRounds: number): Array<{ roundIndex: number; turnIndex: number; side: Side }> {
  const plan: Array<{ roundIndex: number; turnIndex: number; side: Side }> = []
  for (let round = 0; round < maxRounds; round++) {
    plan.push({ roundIndex: round, turnIndex: plan.length, side: "affirmative" })
    plan.push({ roundIndex: round, turnIndex: plan.length, side: "negative" })
  }
  return plan
}

export interface TurnPlanEntry {
  roundIndex: number
  turnIndex: number
  side: Side
}

export function planTurns(maxRounds: number): TurnPlanEntry[] {
  return buildTurnPlan(maxRounds)
}

export async function startDebateTurns(debate: DebateRow): Promise<void> {
  const plan = buildTurnPlan(debate.maxRounds)
  const now = new Date()

  const rows = plan.map((entry) => ({
    id: randomUUID(),
    debateId: debate.id,
    roundIndex: entry.roundIndex,
    turnIndex: entry.turnIndex,
    side: entry.side,
    participantId:
      entry.side === "affirmative"
        ? debate.participants.find((p: any) => p.side === "affirmative")?.userId
        : debate.participants.find((p: any) => p.side === "negative")?.userId,
    startTime: now,
    status: "pending" as const,
  }))

  await prisma.turn.createMany({ data: rows })

  const first = rows[0]
  await prisma.debate.update({
    where: { id: debate.id },
    data: {
      status: "active",
      currentRound: first.roundIndex,
      currentTurnId: first.id,
    },
  })

  await prisma.turn.update({
    where: { id: first.id },
    data: { status: "active" },
  })
}

export async function getActiveTurn(debateId: string): Promise<TurnRow | null> {
  const turn = await prisma.turn.findFirst({
    where: { debateId, status: "active" },
  })
  return turn ?? null
}

export async function getTurnById(turnId: string): Promise<TurnRow | null> {
  const turn = await prisma.turn.findUnique({ where: { id: turnId } })
  return turn ?? null
}

export interface AdvanceResult {
  completed: boolean
  nextTurn: TurnRow | null
}

export async function closeTurnAndAdvance(
  debateId: string,
  turnId: string,
): Promise<AdvanceResult> {
  const now = new Date()

  // Conditional close: only succeeds if the turn is still active
  const turn = await prisma.turn.findFirst({
    where: { id: turnId, status: "active" },
  })

  if (!turn) {
    // Already advanced by concurrent request
    const debate = await prisma.debate.findUnique({ where: { id: debateId } })
    const allTurns = await prisma.turn.findMany({
      where: { debateId },
      orderBy: { turnIndex: "asc" },
    })
    const idx = allTurns.findIndex((t) => t.id === turnId)
    const next = idx >= 0 ? allTurns[idx + 1] ?? null : null
    return {
      completed: debate?.currentTurnId === null,
      nextTurn: next && next.status === "active" ? next : null,
    }
  }

  // Close the turn
  await prisma.turn.update({
    where: { id: turnId },
    data: { status: "completed", endTime: now },
  })

  const allTurns = await prisma.turn.findMany({
    where: { debateId },
    orderBy: { turnIndex: "asc" },
  })

  const idx = allTurns.findIndex((t) => t.id === turnId)
  const next = idx >= 0 ? allTurns[idx + 1] ?? null : null

  if (!next) {
    await prisma.debate.update({
      where: { id: debateId },
      data: { currentRound: turn.roundIndex, currentTurnId: null },
    })
    return { completed: true, nextTurn: null }
  }

  await prisma.debate.update({
    where: { id: debateId },
    data: { currentRound: next.roundIndex, currentTurnId: next.id },
  })

  await prisma.turn.update({
    where: { id: next.id },
    data: { status: "active", startTime: now },
  })

  return { completed: false, nextTurn: next }
}

export async function timeoutActiveTurn(debateId: string): Promise<AdvanceResult> {
  const active = await getActiveTurn(debateId)
  if (!active) {
    throw new Error("No active turn to time out")
  }
  return closeTurnAndAdvance(debateId, active.id)
}

export function sideOfUser(debate: DebateRow, userId: string): Side | null {
  const participant = debate.participants?.find((p: any) => p.userId === userId)
  if (participant?.side === "affirmative") return "affirmative"
  if (participant?.side === "negative") return "negative"
  return null
}

export async function enterJudging(debateId: string): Promise<void> {
  await prisma.debate.update({
    where: { id: debateId },
    data: {
      status: "judging",
      currentTurnId: null,
    },
  })
}
```

---

## 11. Frontend Pages

### Page Structure

| Route | Page | Auth Required | Description |
|-------|------|---------------|-------------|
| `/` | Redirect | No | Redirects to `/debates` |
| `/sign-in` | SignInPage | No | Email/password login |
| `/sign-up` | SignUpPage | No | Registration with invitation code |
| `/forgot-password` | ForgotPasswordPage | No | Request password reset |
| `/reset-password` | ResetPasswordPage | No | Reset with token |
| `/verify-email` | VerifyEmailPage | No | Verify email token |
| `/debates` | DebateList | Yes | List user's debates |
| `/debates/new` | NewDebate | Yes | Create new debate |
| `/debates/[debateId]` | DebateView | Yes | Main debate view |
| `/debates/[debateId]/report` | JudgeReport | Yes | View judge report |
| `/debates/[debatesId]/spectate` | SpectateView | Yes | Spectate completed debate |
| `/analytics` | Analytics | Yes | Debate analytics |
| `/admin` | AdminDashboard | Yes (admin) | Admin dashboard |
| `/admin/users` | AdminUsers | Yes (admin) | User management |
| `/invitations` | Invitations | Yes | Manage invitations |
| `/settings` | Settings | Yes | User settings |
| `/bookmarks` | Bookmarks | Yes | Saved debates |
| `/legal-ai` | LegalAI | Yes | Standalone Legal AI page |

### Root Layout

```tsx
// src/app/layout.tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Debatr - AI-Assisted Structured Debate",
  description: "Private AI-assisted structured debate platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
```

### Debate View Page

```tsx
// src/app/(dashboard)/debates/[debateId]/page.tsx
"use client"

import { useParams } from "next/navigation"
import { trpc } from "@/lib/api"
import { useWebSocket } from "@/hooks/useWebSocket"
import { DebateView } from "@/components/debate/DebateView"
import { Navbar } from "@/components/layout/Navbar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function DebatePage() {
  const params = useParams()
  const debateId = params.debateId as string

  const { data: debate, isLoading, error } = trpc.debates.get.useQuery({ debateId })
  const { status: wsStatus, onlineUsers, sendTyping, sendReaction } = useWebSocket(debateId)

  if (isLoading) return <LoadingSpinner />
  if (error) return <div>Error loading debate</div>
  if (!debate) return <div>Debate not found</div>

  return (
    <div className="min-h-screen bg-[#f6f5f4]">
      <Navbar />
      <DebateView
        debate={debate}
        wsStatus={wsStatus}
        onlineUsers={onlineUsers}
        onTyping={sendTyping}
        onReaction={sendReaction}
      />
    </div>
  )
}
```

---

## 12. Design System

### Color Tokens (CSS Variables)

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Primary */
  --ink: #000000;
  --ink-secondary: #31302e;
  --ink-muted: #615d59;
  --ink-faint: #a39e98;

  /* Canvas */
  --canvas: #ffffff;
  --canvas-soft: #f6f5f4;

  /* Surface */
  --surface: #ffffff;
  --surface-hover: #f0f0f0;
  --surface-active: #e8e8e8;

  /* Borders */
  --hairline: #e6e6e6;
  --border-default: #d0d0d0;

  /* Accent */
  --accent: #1a1a1a;
  --accent-active: #000000;
  --on-primary: #ffffff;

  /* Status */
  --success: #1aae39;
  --warning: #dd5b00;
  --danger: #dc2626;

  /* Spacing */
  --spacing-xxs: 4px;
  --spacing-xs: 8px;
  --spacing-sm: 12px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 28px;
  --spacing-xxl: 32px;

  /* Border Radius */
  --radius-xs: 4px;
  --radius-sm: 5px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.03);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.06), 0 4px 6px rgba(0, 0, 0, 0.04);
}

.dark {
  --ink: #ffffff;
  --ink-secondary: #e0e0e0;
  --ink-muted: #a0a0a0;
  --ink-faint: #606060;

  --canvas: #1a1a1a;
  --canvas-soft: #222222;

  --surface: #2a2a2a;
  --surface-hover: #333333;
  --surface-active: #404040;

  --hairline: #3a3a3a;
  --border-default: #505050;

  --accent: #ffffff;
  --accent-active: #e0e0e0;
  --on-primary: #000000;

  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.2);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.4), 0 4px 6px rgba(0, 0, 0, 0.3);
}
```

### Tailwind Config

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "var(--ink)",
          secondary: "var(--ink-secondary)",
          muted: "var(--ink-muted)",
          faint: "var(--ink-faint)",
        },
        canvas: {
          DEFAULT: "var(--canvas)",
          soft: "var(--canvas-soft)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          hover: "var(--surface-hover)",
          active: "var(--surface-active)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          active: "var(--accent-active)",
        },
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
      },
      spacing: {
        xxs: "var(--spacing-xxs)",
        xs: "var(--spacing-xs)",
        sm: "var(--spacing-sm)",
        md: "var(--spacing-md)",
        lg: "var(--spacing-lg)",
        xl: "var(--spacing-xl)",
        xxl: "var(--spacing-xxl)",
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "system-ui", "Segoe UI", "Helvetica", "Arial", "sans-serif"],
        mono: ["SF Mono", "Fira Code", "JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
}

export default config
```

---

## 13. Component Library

### shadcn/ui Setup

```bash
# Initialize shadcn/ui
npx shadcn@latest init

# Add components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add toast
npx shadcn@latest add badge
npx shadcn@latest add avatar
npx shadcn@latest add tabs
npx shadcn@latest add select
npx shadcn@latest add textarea
npx shadcn@latest add separator
npx shadcn@latest add sheet
npx shadcn@latest add command
npx shadcn@latest add form
npx shadcn@latest add skeleton
npx shadcn@latest add spinner
```

### Custom Components

```tsx
// src/components/debate/DebateCard.tsx
"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DEBATE_STATUS_LABELS } from "@/types"

interface DebateCardProps {
  debate: {
    id: string
    topic: string
    status: string
    createdAt: Date
    participants: Array<{ side: string; displayName: string }>
    judgeReport?: { outcome: string; confidence: number } | null
  }
}

export function DebateCard({ debate }: DebateCardProps) {
  const statusVariant = debate.status === "completed" ? "success" :
                        debate.status === "active" ? "default" :
                        debate.status === "cancelled" ? "destructive" : "secondary"

  return (
    <Link href={`/debates/${debate.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{debate.topic}</CardTitle>
            <Badge variant={statusVariant}>
              {DEBATE_STATUS_LABELS[debate.status as keyof typeof DEBATE_STATUS_LABELS]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            {debate.participants.map((p) => (
              <span key={p.side} className={p.side === "affirmative" ? "text-green-600" : "text-red-600"}>
                {p.displayName}
              </span>
            ))}
          </div>
          {debate.judgeReport && (
            <div className="mt-2 text-sm text-ink-muted">
              Outcome: {debate.judgeReport.outcome} ({(debate.judgeReport.confidence * 100).toFixed(0)}% confidence)
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
```

```tsx
// src/components/debate/TurnTimer.tsx
"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"

interface TurnTimerProps {
  startTime: Date
  durationMs: number
  onTimeout?: () => void
}

export function TurnTimer({ startTime, durationMs, onTimeout }: TurnTimerProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const start = new Date(startTime).getTime()
      const progress = Math.min(((now - start) / durationMs) * 100, 100)
      setElapsed(progress)

      if (progress >= 100) {
        clearInterval(interval)
        onTimeout?.()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime, durationMs, onTimeout])

  const remaining = Math.max(0, durationMs - (elapsed / 100) * durationMs)
  const minutes = Math.floor(remaining / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-ink-muted">
        <span>Time remaining</span>
        <span className="font-mono">
          {minutes}:{seconds.toString().padStart(2, "0")}
        </span>
      </div>
      <Progress
        value={elapsed}
        className={elapsed > 80 ? "bg-warning" : ""}
      />
    </div>
  )
}
```

```tsx
// src/components/debate/LawyerPanel.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { trpc } from "@/lib/api"

interface LawyerPanelProps {
  debateId: string
}

export function LawyerPanel({ debateId }: LawyerPanelProps) {
  const [request, setRequest] = useState("")
  const [conversation, setConversation] = useState<Array<{ request: string; response: any }>>([])

  const requestLawyer = trpc.debates.requestLawyer.useMutation({
    onSuccess: (data) => {
      setConversation((prev) => [
        ...prev,
        { request, response: data.response },
      ])
      setRequest("")
    },
  })

  const handleSubmit = () => {
    if (!request.trim()) return
    requestLawyer.mutate({ debateId, request })
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>AI Lawyer</span>
          <Badge variant="secondary">Private</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {conversation.map((entry, i) => (
            <div key={i} className="space-y-2">
              <div className="text-sm font-medium">You: {entry.request}</div>
              <div className="text-sm text-ink-muted p-3 bg-canvas-soft rounded-lg">
                <div className="font-medium text-xs text-ink-faint mb-1">
                  {entry.response.assistanceType.replace(/_/g, " ")}
                </div>
                {entry.response.advice}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Textarea
            placeholder="Ask your lawyer for advice..."
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            rows={3}
          />
          <Button
            onClick={handleSubmit}
            disabled={!request.trim() || requestLawyer.isPending}
            className="w-full"
          >
            {requestLawyer.isPending ? "Consulting..." : "Ask Lawyer"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## 14. Implementation Phases

This project should be executed in delivery-oriented phases rather than calendar day buckets. The fastest path is to build a working foundation first, then layer in auth, debate logic, realtime, and AI features in overlapping streams. The repo already has a Next.js app shell and some core server scaffolding, so the rebuild can start from the current state.

### Phase 1: Foundation & App Shell (Current focus)

Goal: get the application running as a stable skeleton with routed pages, shared config, database access, and a minimal tRPC API.

Priority outcomes:
- App Router structure is clean and predictable
- Root page redirects to the main app flow
- Shared config and database client are working
- Minimal health + auth route exists for validation
- App shell is ready for authenticated pages and feature work

Key tasks:
1. Confirm the project runs under the current Next.js 16 setup
2. Replace the starter home screen with a redirect to the dashboard flow
3. Add the dashboard shell and first routed pages
4. Build a minimal tRPC router with health and authenticated user data
5. Add the API route for the app's server procedures
6. Validate build + route rendering before moving forward

Definition of done:
- `pnpm build` passes
- `/` redirects correctly
- `/debates` renders
- `/api/trpc/health` responds successfully

### Phase 2: Auth, Roles & Protected Access

Goal: make the app secure and ready for real user workflows.

Priority outcomes:
- Sign-up, sign-in, and email verification work
- Session/user context is available to protected routes
- Admin role enforcement is in place
- Protected layouts and route guards exist

Key tasks:
1. Finalize Auth.js configuration and user session callbacks
2. Add sign-in/up pages and protected dashboard layout
3. Add invitation code enforcement for registration
4. Create admin middleware and route restrictions
5. Add user profile and settings basics

Definition of done:
- User can register and sign in
- Authenticated session is available in tRPC context
- Admin-only pages are blocked for non-admin users

### Phase 3: Database, Debate Core & State Model

Goal: implement the system that powers all debate operations.

Priority outcomes:
- Prisma schema is migrated and stable
- Debate creation and participant assignment work
- Core turn model and debate lifecycle exist
- Message persistence and state transitions are testable

Key tasks:
1. Finish the Prisma schema for debates, turns, messages, and reports
2. Run migrations and verify indexes and constraints
3. Add debate CRUD and participant management procedures
4. Implement the debate engine state transitions
5. Add validation objects for turn timing and message limits

Definition of done:
- A user can create a debate
- Participants join and are tracked by side
- Turn state transitions are persisted in the database
- The app can render a real debate record

### Phase 4: AI Lawyer, Judge & Fact-Checker

Goal: add the intelligence layer that makes Debatr different from a plain chat app.

Priority outcomes:
- AI lawyer can answer participant requests using discussion context
- Judge produces structured evaluation and scores
- Fact-checker audits claims for sources and reliability
- AI budget and tool-use guardrails are enforced

Key tasks:
1. Implement the OpenCode provider and prompt templates
2. Add lawyer conversation request flow
3. Add structured judge report generation
4. Add fact-checking with evidence lookup and transcript search
5. Add token-budget and rate-limit enforcement

Definition of done:
- A lawyer response is generated for a live debate request
- A judge report can be produced from complete debate state
- AI tool calls are constrained, logged, and auditable

### Phase 5: Realtime Collaboration & Frontend Experience

Goal: make debate progress feel live and intuitive.

Priority outcomes:
- Socket.io server is connected to the app
- Presence, typing, and turn updates are live
- Debate view is usable for real-time participant interaction
- Dashboard, analytics, and admin screens are polished enough to use

Key tasks:
1. Set up Socket.io server and auth middleware
2. Broadcast presence, typing, and reaction events
3. Add turn timer and turn advancement hooks
4. Build the debate UI and judge report interface
5. Add analytics and admin dashboards

Definition of done:
- Multiple users can see synchronized state updates
- Turn timers and transitions update correctly
- Core debate pages are usable without hidden backend assumptions

### Phase 6: Hardening, QA & Launch

Goal: reduce risk before shipping and make the app robust enough for real use.

Priority outcomes:
- Error handling is consistent across app and API
- Export/import, email, and PWA basics are working
- QA pass covers core workflows
- Production config is documented and deployment-ready

Key tasks:
1. Add loading states, validation feedback, and error boundaries
2. Implement exports, email templates, and admin tooling
3. Add PWA support and installability
4. Run end-to-end checks for auth, debate creation, judge flow, admin access
5. Prepare environment configuration and deployment instructions

Definition of done:
- Core user journey works in production-like conditions
- Environmental config is documented for Vercel or VPS
- Launch checklist is complete

### Execution Rule for This Sprint

The team should work in overlapping streams rather than strictly sequential sprints:
- Stream A: app shell + tRPC + auth
- Stream B: Prisma schema + debate engine
- Stream C: AI lawyer/judge/fact-checker
- Stream D: realtime + dashboard UI
- Stream E: QA + hardening + launch prep

Current milestone: Phase 1 is active and must be completed before the next phases start.

---

## 15. Deployment

### Vercel (Free Tier)

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add OPENCODE_API_KEY
# ... etc
```

### Self-Hosted (VPS)

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma generate
RUN pnpm build

# Production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/server/ai/prompts ./src/server/ai/prompts

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: "3.8"
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: debatr
      POSTGRES_USER: debatr
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://debatr:${DB_PASSWORD}@db:5432/debatr
      NEXTAUTH_URL: http://localhost:3000
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
    depends_on:
      - db

volumes:
  postgres_data:
```

---

## 16. Testing Strategy

### Unit Tests (Vitest)

```typescript
// src/server/ai/__tests__/tools.test.ts
import { describe, it, expect } from "vitest"
import { scoreArgument, lookupEvidence, searchTranscript } from "../tools"

describe("scoreArgument", () => {
  it("scores short arguments lower", () => {
    const result = scoreArgument("Hi")
    expect(result.score).toBeLessThan(0.5)
    expect(result.reasons).toContain("Very short / under-developed.")
  })

  it("scores evidence-style arguments higher", () => {
    const result = scoreArgument(
      "According to studies show, the data indicates that climate change is accelerating because of human activity. Source: IPCC 2023"
    )
    expect(result.score).toBeGreaterThan(0.7)
  })
})

describe("lookupEvidence", () => {
  const ctx = {
    evidence: [
      { side: "affirmative", claim: "CO2 rose 50%", source: "NOAA" },
      { side: "negative", claim: "Solar activity increased", source: "NASA" },
    ],
    messages: [],
  }

  it("filters by side", () => {
    const result = lookupEvidence(ctx, { side: "affirmative" })
    expect(result).toHaveLength(1)
    expect(result[0].side).toBe("affirmative")
  })

  it("filters by query", () => {
    const result = lookupEvidence(ctx, { query: "climate" })
    expect(result).toHaveLength(1)
  })
})
```

### Integration Tests

```typescript
// src/server/trpc/__tests__/debates.test.ts
import { describe, it, expect, beforeEach } from "vitest"
import { prisma } from "@/server/db"
import { appRouter } from "../router"
import { createTRPCContext } from "../context"

describe("debates router", () => {
  let caller: any

  beforeEach(async () => {
    // Clean database
    await prisma.$executeRaw`TRUNCATE TABLE debates CASCADE`
    
    const ctx = await createTRPCContext()
    caller = appRouter.createCaller(ctx)
  })

  it("creates a debate", async () => {
    const result = await caller.debates.create({
      topic: "Test debate",
      opponentEmail: "opponent@test.com",
    })

    expect(result.topic).toBe("Test debate")
    expect(result.status).toBe("waiting_for_participants")
  })
})
```

---

## Appendix: AI Prompt Templates

### Lawyer Prompt

```markdown
# AI Lawyer Role

You are the private AI Legal Counsel for the assigned participant in a formal debate proceeding. You advise your client as a barrister would — with precision, strategy, and an eye for decorum.

## Courtroom Demeanor

- Coach your client to argue with formality and discipline
- When your client's draft contains undignified language, flag it and suggest alternatives
- Use formal framing: "My recommendation to counsel...", "The stronger position..."
- Remind your client that the judge is watching conduct, not just content

## You may

- Propose a supporting argument, counterargument, or rebuttal
- Identify weaknesses, unsupported assumptions, or contradictions
- Improve clarity while preserving the participant's intended position
- Suggest what evidence would strengthen a claim
- Summarize the relevant public debate context
- Warn your client about conduct risks

## You must not

- Post or claim to post a public debate message
- Impersonate the participant or the opponent
- See, request, reveal, or infer the opponent's private Lawyer exchange
- Fabricate citations, evidence, statistics, research, links, or quotations
- Claim web access, prior-debate memory, or verification unless supplied
- Encourage prohibited conduct or rule evasion
```

### Judge Prompt

```markdown
# AI Judge Role

You are the Honorable AI Judge presiding over a formal debate proceeding. You are not a passive scorer — you are the authority in this courtroom.

## Courtroom Demeanor

- Address the debate as a proceeding
- Use formal judicial language: "This court finds...", "The tribunal notes..."
- Your verdict is a ruling. Your feedback is a judicial opinion.
- Be authoritative, measured, and precise.

## Conduct & Decorum Enforcement

You MUST actively detect and penalize undignified or disrespectful language:
- Profanity, swearing, or vulgar language
- Personal insults, name-calling, or ad hominem attacks
- Sarcasm intended to demean rather than argue
- Shouting (excessive caps, multiple exclamation marks)
- Dismissive or contemptuous language

When you detect such conduct:
1. Call it out explicitly in conductFindings
2. Recommend escalating action
3. Reprimand in your verdict and feedback
4. Deduct from argument structure score

## Scoring Weights

- Logical consistency: 30%
- Evidence quality: 25%
- Rebuttal effectiveness: 20%
- Argument structure: 15%
- Responsiveness to opponent: 10%

## Verdict

Choose Affirmative, Negative, Draw, or Inconclusive. Use Inconclusive when the transcript is too incomplete for a meaningful verdict.
```

### Fact-Checker Prompt

```markdown
# AI Fact-Checker Role

You are the court-appointed Fact-Checker in a formal debate proceeding. Your role is to assess the factual accuracy of claims made in debate messages.

## Courtroom Demeanor

- Present findings as an officer of the court
- Be clinical, precise, and neutral
- If a message contains profanity alongside factual claims, note it briefly

## Hard rules

- Never fabricate sources
- Never silently alter the transcript
- Do not independently determine the debate winner
- Do not access or reference private Lawyer content
- Do not make personal attacks

## Assessment guidance

- `verified`: the claim is supported by a supplied or retrieved source
- `disputed`: the claim conflicts with supplied/retrieved sources
- `unverified`: there is no supplied or retrieved source
- A message with mixed findings yields an overall `mixed` verdict
```

---

**End of Rebuild Guide**
