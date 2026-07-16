# Authentication and authorisation

## Status

The exact authentication provider and methods are not yet selected. Better Auth is a candidate from the earlier vision, not a final decision. Authentication must be resolved before implementation begins.

## Initial access model

Debatr is private and limited to approximately ten users. Access should therefore be allow-listed or invitation-only. A user must not be able to create a public account simply by discovering the application URL.

## Authorisation rules

Authentication establishes identity. Authorisation checks whether that identity may perform a specific action.

- Only a debate participant may view its private transcript and state.
- Only the assigned participant may access that side’s Lawyer requests and replies.
- Only an eligible invitee may join an invitation.
- Only authorised roles may cancel, pause/resume, retry judging, or administer users.
- Exports and imports are restricted as described in `docs/debates/EXPORT.md`.

Every protected server route and WebSocket subscription must perform an authorisation check. A hidden client button is not a security boundary.

## Session requirements

Use secure, HTTP-only session cookies or an equivalently secure mechanism appropriate to the final provider. Protect state-changing requests against CSRF where cookies are used. Rotate/revoke sessions when required by the chosen provider and never log raw tokens.

## Decisions required

Choose the sign-in method (email/password, magic link, invited OAuth identity, or another approach), initial administrator bootstrap method, invitation expiry, session duration, recovery process, and account deletion policy.
