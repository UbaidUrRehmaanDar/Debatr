# Models and providers

## Status

**Resolved:** Provider and model selection strategy confirmed. See D-011 in `docs/DECISIONS.md`.

## Confirmed strategy

Debatr uses separate model tiers:

| Role | Required qualities | Cost posture |
| --- | --- | --- |
| Lawyer | fast, inexpensive, follows instructions, returns reliable JSON | called during a debate; optimise for cost |
| Judge | stronger comparative reasoning, nuance, reliable JSON | called after a debate; allow a higher per-call budget |

Users do not select models. Central configuration assigns one model per role, which keeps the experience consistent and avoids accidental cost increases.

## Selected provider

**OpenCode Zen** is the initial AI provider, accessed directly via API (not through OpenRouter or other intermediaries).

Model selection (to be confirmed after local evaluation):
- **Lawyer:** OpenCode Zen's cheap/fast model
- **Judge:** OpenCode Zen's stronger reasoning model

Before enabling a model, verify:
- Structured JSON is reliable with our Lawyer and Judge schemas
- The model follows prompt constraints
- Its context window is sufficient for debate transcripts
- Its privacy/retention terms are suitable for private debate transcripts

## Provider abstraction

The application owns an interface with:
- Request completion
- Request structured output
- Expose usage metadata
- Normalise errors

A provider adapter handles API URLs, authentication, model identifiers, and provider-specific response shapes. This lets the team change providers or models when availability, limits, price, or quality changes, without rewriting debate logic or user-interface code.

At launch, the adapter is configured only for OpenCode Zen.

## Cost and safety controls

OpenCode Zen is not assumed to be free. The following controls are enforced from day one:

- Per-request token limits
- Per-debate AI usage limits
- Request timeouts
- Retry limits
- Usage logging (without exposing sensitive data)

## Configuration policy

Models, token limits, temperature, timeout, retry count, and enabled roles belong in server-side environment/configuration. Configuration must be validated at startup and logged without exposing secrets.
