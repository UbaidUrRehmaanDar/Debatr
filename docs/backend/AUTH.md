# Authentication and authorisation

## Selected approach

Debatr uses Better Auth with email-and-password authentication, required email verification, password reset by email, secure HTTP-only sessions, and invitation-only registration. Magic links, social sign-in (Google, GitHub, or others), and public self-registration are explicitly excluded from the initial release. Secrets such as `BETTER_AUTH_SECRET` remain server-side and are never committed or exposed to the browser.

## Initial access model

Debatr is private and limited to approximately ten users. Access is invitation-only. A user must not be able to create an account simply by discovering the application URL.

## Authorisation rules

Authentication establishes identity. Authorisation checks whether that identity may perform a specific action.

- Only a debate participant may view its private transcript and state.
- Only the assigned participant may access that side’s Lawyer requests and replies.
- Only an eligible invitee may join an invitation.
- Only authorised roles may cancel, pause/resume, retry judging, or administer users.
- Exports and imports are restricted as described in `docs/debates/EXPORT.md`.

Every protected server route and WebSocket subscription must perform an authorisation check. A hidden client button is not a security boundary.

## Session requirements

Use Better Auth’s secure, HTTP-only session cookies. Protect state-changing requests against CSRF where cookies are used. Rotate/revoke sessions according to Better Auth configuration and never log raw tokens.

## Remaining implementation decisions

Define the initial administrator bootstrap method, invitation expiry, session duration, the email service used for verification and password-reset messages, and the account-deletion policy. These details do not change the selected authentication method.
