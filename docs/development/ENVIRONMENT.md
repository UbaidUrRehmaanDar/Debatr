# Environment configuration

## Principles

Environment configuration contains deployment-specific values and secrets. It is validated on API startup, never committed with real credentials, and never exposed to browser bundles unless a value is intentionally public.

## Required environment variables

| Variable | Description | Example | Required |
| --- | --- | --- | --- |
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` | Yes |
| `BETTER_AUTH_SECRET` | Secret key for Better Auth session signing | 32+ random characters | Yes |
| `BETTER_AUTH_URL` | Base URL for Better Auth endpoints | `http://localhost:3000` | Yes |
| `WEB_ORIGIN` | Frontend origin for CORS and CSRF | `http://localhost:5173` | Yes |
| `API_ORIGIN` | Backend API origin | `http://localhost:3000` | Yes |
| `OPENCODE_API_KEY` | OpenCode Zen API key | `sk-...` | Yes |
| `OPENCODE_BASE_URL` | OpenCode Zen API base URL | `https://api.opencode.ai/v1` | Yes |
| `AI_LAWYER_MODEL` | Model ID for Lawyer role | `opencode/fast-model` | Yes |
| `AI_JUDGE_MODEL` | Model ID for Judge role | `opencode/reasoning-model` | Yes |
| `AI_MAX_TOKENS_PER_REQUEST` | Maximum tokens per AI request | `4096` | No (default: 4096) |
| `AI_MAX_TOKENS_PER_DEBATE` | Maximum tokens per debate (all AI calls) | `50000` | No (default: 50000) |
| `AI_REQUEST_TIMEOUT_MS` | Timeout for AI requests in milliseconds | `30000` | No (default: 30000) |
| `AI_MAX_RETRIES` | Maximum retry attempts for failed AI requests | `3` | No (default: 3) |
| `NODE_ENV` | Environment name | `development`, `production` | No (default: `development`) |

## Validation

Use a typed, schema-validated configuration module. Startup must fail with a safe, actionable message when a required variable is absent or invalid. Logs may name a missing variable but must never print its value.

## Files and secrets

Maintain a committed `.env.example` with names, safe sample values, and explanatory comments only. Keep developer `.env` files ignored. Use the deployment platform's encrypted secret store for deployed environments and rotate a credential immediately if it is exposed.

## Frontend environment values

Only non-sensitive values required by the web application may be published through the SvelteKit-approved public environment mechanism. API keys, database URLs, provider secrets, and internal AI settings must remain server-side.

## Secrets management

- Never commit `.env` files to Git
- Rotate secrets immediately if exposed
- Use separate Neon branches for development and production
- Store production secrets in deployment platform's secret manager
