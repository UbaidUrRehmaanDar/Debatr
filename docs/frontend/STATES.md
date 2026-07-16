# Frontend state management

## Principle

The server owns durable debate state. The client maintains only presentation state, in-flight interactions, cached API results, and the latest realtime view. It must be able to discard local state and recover accurately from a server snapshot.

## State categories

| Category | Examples | Source of truth |
| --- | --- | --- |
| Server state | debate lifecycle, participants, transcript, active turn, report | API/database |
| Realtime state | latest event sequence, connection status, ephemeral presence | WebSocket plus server recovery |
| Local UI state | open panels, draft text, selected report section | browser/client |
| Private view data | current participant’s Lawyer history/request status | API, scoped to user and debate |

## Data flow

1. Load a route from the API using an authenticated request.
2. Subscribe to its authorised debate channel.
3. Apply only ordered, validated events newer than the loaded version.
4. On reconnect, missing sequence, rejected action, or uncertainty, refetch the authoritative snapshot.

## Optimistic interaction policy

Do not optimistically append a public message as accepted, advance a turn, show a moderation action, or mark a debate completed. These actions depend on server-side state and permission checks. Optimistic UI is acceptable for local typing, a raise-hand request marked “sending,” or a Lawyer request marked “pending,” as long as rejection is explicit.

## Cache and privacy

Scope cached data by authenticated user and debate ID. Clear sensitive private Lawyer data on sign-out, account switch, and unauthorised response. Do not persist it in shared browser storage unless an explicit security decision permits it.

## Library choice

TanStack Query is a planned option for server-state caching. Its use is not a licence to duplicate server authority in client stores. The final state-library selection belongs in the implementation plan once the SvelteKit version and data-loading approach are confirmed.
