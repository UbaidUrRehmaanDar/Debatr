# AI output contracts

## Principle

AI output is accepted only when it matches a server-enforced contract. The API validates it before storing, rendering, or acting on it. Natural-language text may exist within structured fields; free-form, unvalidated response blobs are not a contract.

## Canonical artifacts

- `schemas/lawyer-response.schema.json`
- `schemas/judge-response.schema.json`

These JSON Schema files are the portable canonical contracts. The API must implement matching Zod validation without creating a second, incompatible contract.

## Required changes before implementation

| Area | Contract rule | Implementation requirement |
| --- | --- | --- |
| Judge outcome | `affirmative`, `negative`, `draw`, or `inconclusive` | persist and render each outcome accurately |
| Judge scoring | five approved reasoning-first criteria; no grammar-related category | validate scores and calculate aggregate results server-side |
| Confidence | bounded 0–1 value | explain uncertainty in verdict/summary text |
| Conduct findings | category, recommendation, explanation, and message references | API, not model, decides any enforcement |
| Lawyer evidence | suggestions require verification language and may reference supplied messages only | do not display generated citations as verified sources |
| Traceability | response metadata is stored by the API alongside validated payload | record schema/prompt/model version safely |

## Validation process

1. Request structured output from the provider where supported.
2. Parse without executing content.
3. Validate against the canonical server schema.
4. Reject unknown fields and invalid enums/ranges.
5. Apply one bounded repair attempt only when safe.
6. Persist the accepted response with its role, model/config identifiers, prompt version, and timestamp.

The client must never be the sole validator of AI output.
