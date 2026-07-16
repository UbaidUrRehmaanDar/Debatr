# Backend API

## Role of the API

The Fastify API is the authoritative application server. The web client requests actions; it never determines permissions, turn ownership, debate transitions, Judge outcomes, or AI prompt composition.

## API principles

- Use HTTPS for request/response operations and WebSockets for live debate updates.
- Validate every request at the server boundary.
- Authorise against the current database state, never client-supplied role or side fields.
- Use stable resource-oriented paths and structured error responses.
- Keep the public API small for the initial private deployment.

## Initial resource areas

| Area | Responsibility |
| --- | --- |
| Authentication | establish and end authenticated sessions; see [AUTH.md](AUTH.md) |
| Users | current profile and authorised-user administration |
| Debates | create, invite, join, view, pause/resume, cancel, and complete debates |
| Turns and messages | retrieve transcript and submit an eligible public turn |
| Lawyer | request private coaching for the current participant |
| Judge | retrieve a report; trigger/retry evaluation only through authorised policy |
| Exports/imports | create JSON export and validate an import as explicit reference |
| Realtime | subscribe to debate state through the WebSocket contract |

## Illustrative endpoints

These paths are a design direction, not an implementation contract yet.

```text
POST   /v1/debates
GET    /v1/debates/:debateId
POST   /v1/debates/:debateId/invitations
POST   /v1/debates/:debateId/join
POST   /v1/debates/:debateId/pause
POST   /v1/debates/:debateId/resume
POST   /v1/debates/:debateId/cancel
POST   /v1/debates/:debateId/raise-hand
POST   /v1/debates/:debateId/messages
POST   /v1/debates/:debateId/lawyer-requests
GET    /v1/debates/:debateId/judge-report
POST   /v1/debates/:debateId/export
POST   /v1/debate-imports
GET    /v1/ws/debates/:debateId
```

## Request handling

Each state-changing request should use this order: authenticate → parse and validate body → load authoritative resource → authorise actor → enforce state/turn rule → perform one database transaction → publish an event after commit → return the new resource or action result.

## Errors

Errors return a stable code, safe human-readable message, and optional field details. Do not reveal provider keys, internal prompts, private Lawyer content, or whether another user has sensitive account information.

Examples: `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `INVALID_INPUT`, `INVALID_STATE`, `TURN_NOT_OWNED`, `TURN_EXPIRED`, `RATE_LIMITED`, and `AI_UNAVAILABLE`.
