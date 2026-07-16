# Authentication and authorisation

## Status

**Resolved:** Authentication method and provider selected. See D-010 in `docs/DECISIONS.md`.

## Selected method

Debatr uses **Better Auth** with:
- Email and password sign-up/sign-in
- Required email verification
- Password-reset by email
- Secure HTTP-only session cookies
- Invitation-only registration

## Initial access model

Debatr is private and limited to approximately ten users. Access is invitation-only. A user must not be able to create a public account simply by discovering the application URL.

Only an administrator may create and send invitations. A person without a valid invitation cannot register.

## Authorisation rules

Authentication establishes identity. Authorisation checks whether that identity may perform a specific action.

- Only a debate participant may view its private transcript and state.
- Only the assigned participant may access that side's Lawyer requests and replies.
- Only an eligible invitee may join an invitation.
- Only authorised roles may cancel, pause/resume, retry judging, or administer users.
- Exports and imports are restricted as described in `docs/debates/EXPORT.md`.

Every protected server route and WebSocket subscription must perform an authorisation check. A hidden client button is not a security boundary.

## Session requirements

Use secure, HTTP-only session cookies provided by Better Auth. Protect state-changing requests against CSRF where cookies are used. Rotate/revoke sessions when required and never log raw tokens.

## Administrator bootstrap

The first administrator must be created through a documented initialisation process (e.g., environment variable flag or CLI command). This is resolved during implementation.
