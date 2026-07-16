# Environment configuration

## Principles

Environment configuration contains deployment-specific values and secrets. It is validated on API startup, never committed with real credentials, and never exposed to browser bundles unless a value is intentionally public.

## Expected server-side groups

| Group | Examples | Notes |
| --- | --- | --- |
| Application | environment name, API origin, web origin, log level | no secrets unless required |
| Database | PostgreSQL connection URL | server only |
| Authentication | provider secret, trusted origins, session settings | provider not yet selected |
| AI provider | API key, API base URL, Lawyer/Judge model identifiers | server only; never load in browser |
| AI controls | token budgets, timeouts, retry limits, enabled roles | validate ranges at startup |
| Storage | endpoint, bucket, access credentials | only when uploads are enabled |
| Observability | error reporting/logging credentials | minimise personal data |

## Validation

Use a typed, schema-validated configuration module. Startup must fail with a safe, actionable message when a required variable is absent or invalid. Logs may name a missing variable but must never print its value.

## Files and secrets

Maintain a committed `.env.example` with names, safe sample values, and explanatory comments only. Keep developer `.env` files ignored. Use the deployment platform’s encrypted secret store for deployed environments and rotate a credential immediately if it is exposed.

## Frontend environment values

Only non-sensitive values required by the web application may be published through the SvelteKit-approved public environment mechanism. API keys, database URLs, provider secrets, and internal AI settings must remain server-side.
