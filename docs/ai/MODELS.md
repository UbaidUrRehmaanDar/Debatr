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

The provider is decided: OpenCode Zen, called directly through the internal provider adapter using `OPENCODE_API_KEY` (no OpenRouter or other proxy). A small provider adapter remains so a provider can change later, but OpenCode Zen is the only configured provider at launch.

The exact Lawyer and Judge model IDs are not yet chosen. They must be confirmed only after a non-production evaluation that verifies:

- reliable structured JSON output and prompt adherence;
- sufficient context-window capacity for the assigned role;
- acceptable privacy and data-retention terms; and
- that the chosen model is not a free tier whose terms allow private debate data to be retained or used for training/improvement.

Record the selected model IDs in `docs/DECISIONS.md` once confirmed. Do not embed API keys or model IDs in prompts or documentation; `AI_LAWYER_MODEL` and `AI_JUDGE_MODEL` are server-side configuration only.

## Configuration policy

Models, token limits, temperature, timeout, retry count, and enabled roles belong in server-side environment/configuration. Configuration must be validated at startup and logged without exposing secrets.
