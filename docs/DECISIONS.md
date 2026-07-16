# Decision log

## D-001 — Private, small-scale first release

**Status:** accepted

Debatr will serve no more than ten private users for roughly its first year. The system prioritises simplicity and low operating cost over scalability.

## D-002 — AI is assistance, not a debater

**Status:** accepted

Lawyers are private coaches; they do not post public debate messages. The Judge is neutral and evaluates after the debate.

## D-003 — Separate Lawyer and Judge model tiers

**Status:** accepted

Lawyers use a lower-cost, instruction-following model. The Judge uses a stronger reasoning model because it runs once per completed debate and needs more reliable comparative analysis.

## D-004 — Provider abstraction

**Status:** accepted

AI calls are routed through an internal adapter so a provider or model can change without changing debate logic.

## D-005 — Session-only AI memory

**Status:** accepted

No automatic cross-debate or user-history memory. Users may explicitly import an exported debate as reference.

## D-006 — Turn-based, judge-controlled debate

**Status:** accepted

Participants alternate turns. Interruptions are not direct; a raise-hand mechanism requests permission within the debate flow.

## D-007 — No AI token streaming in the initial release

**Status:** accepted

Lawyer output is sent only after generation completes. Realtime debate updates still use WebSockets.

## D-008 — Reasoning-first judging

**Status:** accepted

Grammar and language fluency do not influence judging. Logic, evidence, rebuttal, structure, and responsiveness do.

## D-009 — Prompts are runtime, version-controlled assets

**Status:** accepted

Runtime instructions belong under `prompts/`, not hard-coded inside application logic. They use a layered constitution, role, safety, rules, and output-schema approach.

## D-010 — Better Auth with verified email and password

**Status:** accepted

Debatr will use Better Auth with email-and-password sign-in, required email verification, password reset by email, secure HTTP-only sessions, and invitation-only registration. Magic links, social sign-in, and public self-registration are not part of the initial release.

## D-011 — OpenCode Zen is the initial AI provider

**Status:** accepted

The application calls OpenCode Zen directly using `OPENCODE_API_KEY` (no OpenRouter or other proxy). A small provider adapter remains so a provider can change later, but OpenCode Zen is the only configured provider at launch.

Exact Lawyer and Judge model IDs are not chosen yet. They require a non-production evaluation that confirms: reliable structured JSON, prompt adherence, sufficient context capacity, and acceptable privacy/retention terms. Do not use a free model whose terms allow private debate data to be retained or used for training/improvement.

## D-012 — Initial debate defaults

**Status:** accepted

New debates default to four rounds, five minutes per turn, and a maximum of 2,000 public-message characters per turn. These settings remain centrally configurable and are snapshotted at debate start.

## D-013 — Neon PostgreSQL with Drizzle ORM

**Status:** accepted

Debatr will use Neon PostgreSQL, with separate development and production databases or branches. Drizzle ORM is the data-access and migration tool; migrations are reviewed and version-controlled, and must not auto-apply destructive production changes.
