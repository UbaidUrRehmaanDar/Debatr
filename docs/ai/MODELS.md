# Models and providers

## Confirmed strategy

Debatr will use separate model tiers:

| Role | Required qualities | Cost posture |
| --- | --- | --- |
| Lawyer | fast, inexpensive, follows instructions, returns reliable JSON | called during a debate; optimise for cost |
| Judge | stronger comparative reasoning, nuance, reliable JSON | called after a debate; allow a higher per-call budget |

Users do not select models. Central configuration assigns one model per role, which keeps the experience consistent and avoids accidental cost increases.

## Provider abstraction

The application owns an interface similar to: request completion, request structured output, expose usage metadata, and normalise errors. A provider adapter handles API URLs, authentication, model identifiers, and provider-specific response shapes.

This lets the team change providers or models when availability, limits, price, or quality changes, without rewriting debate rules or user-interface code.

## Initial provider selection

The initial provider and model identifiers are not yet decided. They must be chosen only after confirming:

- that the provider’s acceptable-use policy permits this non-coding, debate-coaching use;
- API stability, privacy terms, and data-retention policy;
- structured JSON support and context-window limits;
- usable free-tier/request limits for the ten-user scope; and
- satisfactory tests on neutral reasoning, refusal behaviour, and citation integrity.

Record the selected provider and models in `docs/DECISIONS.md` once confirmed. Do not embed API keys or model IDs in prompts or documentation.

## Configuration policy

Models, token limits, temperature, timeout, retry count, and enabled roles belong in server-side environment/configuration. Configuration must be validated at startup and logged without exposing secrets.
