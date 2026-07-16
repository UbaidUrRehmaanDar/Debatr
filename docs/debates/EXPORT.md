# Debate export and import

## Purpose

An export lets authorised users keep a portable record of a debate and optionally use it as explicit context for a future discussion. It is not a replacement for application backups and does not create automatic AI memory.

## Export format

The canonical portable format is JSON, validated against `schemas/debate-export.schema.json`. It contains the format version, debate metadata and configuration, participant-facing transcript, final Judge report when available, and export timestamp.

Optional Lawyer response logs require a deliberate privacy policy. They are private coaching records and must not be included by default until consent, access, retention, and redaction rules are agreed.

## Authorisation

Only an authenticated participant, or an explicitly authorised administrator, may export a private debate. Exports must not disclose private Lawyer content, internal moderation notes, credentials, or other users’ personal data.

## Import as reference

1. The user uploads a JSON export.
2. The server validates file size, schema version, JSON structure, and authorisation/provenance policy.
3. The server shows the material that will be used as reference.
4. The user confirms import into a new debate context.
5. The new debate stores a reference to the import rather than silently merging transcripts.

Imported material is context, not truth. The AI must describe it as prior debate content and preserve uncertainty about unverified claims.

## Versioning and compatibility

Exports declare a semantic version. Import code must reject unsupported major versions with a clear error and migrate older compatible versions only through explicit, tested transforms.
