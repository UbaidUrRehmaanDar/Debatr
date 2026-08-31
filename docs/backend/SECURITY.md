# Backend security

## Security model

The backend assumes the browser, network input, uploaded files, and AI output can all be malformed or adversarial. The API authenticates, authorises, validates, and records sensitive actions before any state changes.

## Core controls

- Enforce HTTPS in deployed environments.
- Authenticate every protected HTTP route and WebSocket connection.
- Authorise every resource access against the current server-side record.
- Validate request bodies, parameters, query values, WebSocket events, imports, and AI outputs using shared schemas.
- Use parameterised database access through the ORM; never construct SQL from user input.
- Escape or safely render user content in the web application to prevent XSS.
- Apply request and message limits, including rate limits, payload-size limits, and character limits.
- Store secrets only in server-side configuration; redact them from logs and errors.

## AI-specific controls

Prompt injection is treated as untrusted debate content. The server loads its own prompts and context, never lets the client supply system instructions, limits context to authorised material, validates structured output, and keeps Lawyer conversations segregated by participant.

## Auditability

Record security-relevant actions: authentication events as appropriate, debate membership changes, state transitions, exports/imports, moderation actions, Judge retries, and administrator actions. Logs must minimise personal data and never contain credentials or raw session tokens.

## Dependencies and deployment

Pin and review dependencies, apply security updates, run automated checks, and use separate secrets/configuration for local and deployed environments. Backups, recovery targets, and operational access controls remain to be specified before any deployment holding user data.

## Incident response

For the private initial release, maintain a minimal process: revoke exposed credentials, disable affected functionality if needed, preserve relevant audit records, notify affected users when appropriate, and document the remediation before re-enabling the service.
