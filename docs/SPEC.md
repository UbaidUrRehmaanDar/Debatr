# Product specification

## Participants and roles

Each debate has two human participants: **Affirmative** and **Negative**. The platform also has three system roles:

- **AI Lawyer:** a private coach for one participant. It can help organise arguments, identify weaknesses, suggest rebuttals, improve clarity, and flag unsupported claims.
- **AI Judge:** a neutral evaluator. It evaluates only after the debate concludes and creates the final report.
- **Moderation authority:** initially implemented through the Judge’s rules and platform enforcement. A separate AI Moderator is future scope.

## Debate creation

A creator defines a topic or resolution, invites the other participant, and configures the debate within permitted limits. The project initially supports private debates only. A debate is ready when both participants have joined.

## Debate lifecycle

`draft → waiting_for_participants → active → judging → completed`

Exceptional transitions are `active → paused`, `paused → active`, and `waiting_for_participants|active → cancelled`. The detailed state and transition rules belong in `debates/FLOW.md`.

## Speaking rules

- Debates are turn-based; only the participant with the current turn can submit a debate message.
- A participant cannot interrupt directly. They may raise a hand to request an opportunity to speak; the judge-controlled debate flow decides whether and when that request is granted.
- Each turn has a time limit and a character limit. The confirmed initial defaults are four rounds, five minutes per turn, and a maximum of 2,000 public-message characters per turn. All defaults remain centrally configurable and are snapshotted into a debate when it starts.
- Participants may consult their private Lawyer without exposing that consultation to their opponent.
- Lawyer replies are delivered as complete responses, not token-by-token streams.

## AI context and memory

AI has no permanent, hidden memory of a user or their prior debates. For the current debate, the service provides the relevant rules, debate metadata, recent transcript, and structured pinned facts/evidence. This preserves important context without repeatedly sending the entire transcript on every request.

An exported debate can be imported as explicit reference material in a later debate. Importing is user-directed; it is not automatic memory.

## Lawyer requirements

The Lawyer must:

- remain private to its assigned participant;
- encourage a participant’s own reasoning rather than impersonating them publicly;
- distinguish reasoning, uncertainty, and evidence suggestions;
- refuse to invent evidence or citations; and
- return validated structured output.

The Lawyer may improve wording, propose an argument or rebuttal, identify a weakness, and recommend evidence to verify. It must not claim unverifiable research, statistics, links, or factual certainty.

## Judge requirements

After a completed debate, the Judge produces a structured report with:

- outcome: Affirmative, Negative, Draw, or Inconclusive where the evidence is insufficient for a meaningful decision;
- a confidence value and a narrative verdict;
- scores and explanations for each deduction;
- strengths, weaknesses, constructive feedback, and a concise summary;
- identified logical fallacies when supported by the transcript; and
- conduct findings and any warnings or termination reason.

Grammar, spelling, accent, vocabulary, and English fluency must not affect the verdict.

### Initial scoring rubric

| Criterion | Weight |
| --- | ---: |
| Logical consistency | 30% |
| Evidence quality | 25% |
| Rebuttal effectiveness | 20% |
| Argument structure | 15% |
| Responsiveness to opponent | 10% |

## Conduct and moderation

Abuse, repeated insults, hate speech, threats, spam, and persistent refusal to participate constructively are prohibited. The platform may apply a warning, official warning, penalty, or terminate the debate. Exact enforcement mechanics are documented in `debates/MODERATION.md`.

## Export and import

Users can export a saved debate to a portable JSON file containing the debate configuration, transcript, relevant metadata, and judge report when available. Lawyer logs are optional and must remain privacy-aware. The file format is defined by `schemas/debate-export.schema.json` and expanded in `debates/EXPORT.md`.
