# Local development setup

## Status

The repository is currently documentation-first; the application workspace must be restored or scaffolded before these instructions become executable. This document defines the expected setup rather than pretending the package scripts already exist.

## Intended prerequisites

- Current supported Node.js LTS version, recorded in the repository once selected.
- `pnpm` as the workspace package manager.
- A Neon PostgreSQL development branch or local PostgreSQL instance with Drizzle migrations applied.
- Environment variables described in [ENVIRONMENT.md](ENVIRONMENT.md), including a server-side `OPENCODE_API_KEY` for local AI integration tests only.
- An OpenCode Zen account/key for local AI integration tests only.

## Expected workflow

1. Clone the repository and install locked workspace dependencies.
2. Copy the documented environment example to a local, ignored environment file.
3. Run database migrations against a non-production database.
4. Start the web and API applications in development mode.
5. Run type checks, linting, and tests before submitting work.

## Local safety

Never use production credentials or a production database for ordinary local development. Do not commit local environment files, exports containing private debate data, or downloaded production data. Use test accounts and synthetic debate transcripts.

## Required follow-up

Once the workspace is scaffolded, replace this document’s conceptual steps with exact supported commands, the Node/pnpm version, migration command, local URLs, and troubleshooting notes.
