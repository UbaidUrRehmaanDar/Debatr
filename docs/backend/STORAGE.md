# File storage

## Status

Attachments are deferred unless explicitly prioritised. The initial core experience is text debates and JSON exports, which can be generated and downloaded without object storage.

Cloudflare R2 is a possible future object-storage provider, not a current implementation decision.

## When storage is introduced

Use object storage for approved user uploads, such as attachments or avatars, rather than storing large binary files in PostgreSQL. The API must create short-lived signed upload/download URLs only after authorisation.

## Requirements

- Allow-list file types and enforce file-size limits server-side.
- Generate server-owned object keys; never use untrusted filenames as keys.
- Scan or otherwise assess uploads before making them available where appropriate.
- Store metadata, ownership, purpose, and retention policy in PostgreSQL.
- Restrict private-debate objects to authorised participants.
- Do not place AI prompts, API keys, or raw private data in public storage.

## Exports

JSON exports are generated on demand. If stored temporarily, they require a short expiry, access control, and a record of the requesting user. PDF/Markdown exports are future scope.
