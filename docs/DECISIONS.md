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
