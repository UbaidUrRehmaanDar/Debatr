# Realtime and WebSockets

## Purpose

WebSockets keep participants’ debate view current: accepted public messages, turn changes, timers, presence, raise-hand status, pause/resume, and safe error notifications. They are not the source of truth; reconnecting clients fetch the current state through the API.

## Connection rules

1. Authenticate during the connection handshake using the chosen secure session method.
2. Authorise subscription to the requested debate before joining its channel.
3. Associate the socket with a server-side user identity; do not trust a `userId` supplied in an event payload.
4. Validate every inbound envelope and rate-limit noisy events.
5. Remove the connection and update presence on close.

## Event contract

`schemas/websocket.schema.json` is an initial artifact. Its canonical successor must define each event’s direction, permissions, payload, version, and error behaviour.

| Event family | Direction | Notes |
| --- | --- | --- |
| `debate_state` | server → client | authoritative state/turn transition summary |
| `message_created` | server → client | emitted only after persisted public message |
| `timer_updated` | server → client | display hint; server deadline remains authoritative |
| `presence_changed` | server → client | best-effort presence, not proof of availability |
| `raise_hand_*` | client → server / server → client | request and decision events, all authorised |
| `typing_changed` | client → server / server → client | ephemeral, throttled, and never stored as transcript |
| `error` | server → client | safe structured error |

`ai_stream` is intentionally not part of the initial product: Lawyer replies are delivered as complete responses. It should be removed or marked unsupported when the schema is finalised.

## Ordering and recovery

Events include a server timestamp and monotonically increasing debate event/version number. Clients ignore stale events and re-fetch current debate state after a reconnect, missed sequence, or validation failure.

## Broadcasting

Publish only after the corresponding database transaction commits. Do not broadcast private Lawyer output to a shared debate room; deliver it only to the requesting participant’s authenticated connection.
