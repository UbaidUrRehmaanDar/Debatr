# Database design

## Role

PostgreSQL is the source of truth. It stores durable product state; WebSocket connections, AI provider responses, and browser state are not authoritative.

## Initial entities

| Entity | Purpose |
| --- | --- |
| `users` | authenticated identity and limited account metadata |
| `debates` | topic, configuration snapshot, lifecycle state, and timestamps |
| `debate_participants` | participant-to-debate assignment, side, invitation/join metadata |
| `debate_turns` | ordered turn plan, owner side, deadline, and completion state |
| `debate_messages` | immutable public transcript entries |
| `raise_hand_requests` | request, decision, actor/system decision source, timestamps |
| `pinned_context_items` | structured positions, claims, agreements, and evidence references |
| `lawyer_requests` | private request metadata and validated coaching response, with access control |
| `judge_reports` | versioned validated outcome, scoring, explanations, and report metadata |
| `moderation_events` | conduct finding, rule category, action, and public evidence reference |
| `debate_imports` | validated export provenance and explicit link to a new debate context |
| `audit_events` | important state transitions and privileged actions |

## Data design rules

- Use server-generated opaque IDs; UUIDs are suitable for external identifiers.
- Store timestamps in UTC.
- Snapshot rule/configuration versions at debate start so reports remain interpretable later.
- Keep public transcript records immutable; corrections or moderation actions are separate records.
- Keep private Lawyer records separate from public messages and query them only by authorised participant.
- Prefer relational references over duplicating a transcript in a JSON column. Use JSON only for structured, versioned report payloads where appropriate.

## Transactions and concurrency

Submitting a turn, advancing to the next turn, and recording the resulting event must be atomic. Use transaction-level locking or an optimistic version check on the debate/turn row so two concurrent requests cannot both consume the same turn.

## Retention and deletion

Retention periods, account deletion behaviour, export retention, and Lawyer-log retention are unresolved. Do not assume “keep forever.” Once decided, define deletion/anonymisation jobs and export restrictions in the privacy policy and implementation.

## Migrations

Schema changes use reviewed, version-controlled migrations. Drizzle ORM is the intended tool, but the implementation must not generate destructive production changes automatically.
