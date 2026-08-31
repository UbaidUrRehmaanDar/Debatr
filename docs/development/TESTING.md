# Testing strategy

## Goal

Testing protects the product’s most important promises: private Lawyer isolation, server-enforced turn order, transparent Judge report validation, and durable debate records. The goal is confidence, not a superficial coverage percentage.

## Test layers

| Layer | Focus |
| --- | --- |
| Unit | state transitions, permission helpers, context builder, score calculation, configuration validation |
| Schema | API inputs, WebSocket envelopes, export/import files, Lawyer/Judge output contracts |
| Integration | database transactions, API authorisation, message submission, WebSocket subscription rules |
| End-to-end | invited-user journey from creation through report/export on a realistic private debate |
| Manual AI evaluation | prompt and model behaviour against curated non-production examples |

## High-priority scenarios

- Opponent cannot fetch or receive the other side’s Lawyer request/response.
- Two simultaneous turn submissions cannot both be accepted.
- A message after deadline, on pause, or from the wrong side is rejected.
- A reconnect recovers the correct authoritative debate state.
- Invalid or injected AI output is rejected and cannot change state.
- The Judge cannot score grammar/fluency as a criterion.
- Export/import rejects malformed, oversized, unsupported, or unauthorised files.
- A failed Judge request leaves the debate in `judging`, not falsely completed.
- A serious moderation event terminates/locks the debate according to policy.

## AI test fixtures

Use synthetic transcripts and fake provider responses for automated tests. Do not send real private transcripts to model tests without explicit consent and a documented retention policy. Track prompt/schema versions with evaluation results so a prompt change can be compared with its predecessor.

## Required checks

Before a change is merged or deployed: formatting, linting, type checking, relevant unit/integration tests, and targeted end-to-end tests for user-visible workflow changes. Add a regression test for each resolved defect affecting authorisation, state, privacy, or data integrity.
