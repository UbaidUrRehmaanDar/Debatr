# Monorepo structure

## Intended layout

```text
Debatr/
├── apps/
│   ├── web/             # SvelteKit user interface
│   └── api/             # Fastify authoritative server
├── packages/
│   ├── shared/          # domain types, validation, safe shared utilities
│   ├── ui/              # optional reusable UI primitives
│   └── config/          # shared non-secret tooling configuration
├── docs/                # project source of truth
├── prompts/             # runtime version-controlled AI instructions
├── schemas/             # portable JSON Schema artifacts
├── scripts/             # bounded maintenance/development scripts
└── .github/             # CI/workflow configuration if adopted
```

## Package boundaries

The web application may depend on safe shared types/schemas, but never on API secrets, database clients, or provider adapters. The API owns database access, sessions, AI orchestration, and security policy. Runtime prompt loading occurs only on the server.

## Shared contracts

Domain contracts should have one canonical implementation. If JSON Schema is used for exports or provider outputs, maintain matching server validation and deliberate client-safe types rather than hand-copying incompatible definitions across packages.

## Dependency rules

- Dependencies flow from apps to packages, not from reusable packages back into an app.
- `packages/shared` must not import browser-only or server-secret modules.
- Avoid adding a package until at least two consumers justify it.
- Keep deployment configuration and credentials outside package source.

## Tooling

The intended workspace manager is pnpm. A Turborepo-style task runner is optional; for this small project it should be introduced only if it meaningfully improves task coordination rather than as a default architectural requirement.
