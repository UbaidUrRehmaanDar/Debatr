# Judging system

## Timing and input

Judging begins only after the public transcript is locked. The Judge evaluates the completed debate according to the rules snapshot that was active when the debate began. Private Lawyer exchanges are excluded from the Judge’s input in the initial design.

## Rubric

| Criterion | Weight | Examples of relevant behaviour |
| --- | ---: | --- |
| Logical consistency | 30% | coherent reasoning, no material contradiction, appropriate inference |
| Evidence quality | 25% | relevant support, clear qualification, reliable supplied evidence |
| Rebuttal effectiveness | 20% | addresses central opposing claims instead of evading them |
| Argument structure | 15% | understandable claims, reasons, examples, and conclusions |
| Responsiveness | 10% | engages with the opponent’s actual position and questions |

Grammar, spelling, accent, vocabulary, and English fluency are excluded. A polished style cannot compensate for poor reasoning or unsupported claims.

## Outcomes

- **Affirmative:** Affirmative performed better under the rubric.
- **Negative:** Negative performed better under the rubric.
- **Draw:** neither side has a meaningful advantage under the rubric.
- **Inconclusive:** the transcript is too incomplete, non-responsive, or unreliable to justify a meaningful competitive verdict.

The distinction between stored `draw` and `inconclusive` must be implemented in the canonical Judge schema before judging is built.

## Transparency requirements

The report must state the outcome, calibrated confidence, weighted category results for each side, strengths, weaknesses, constructive advice, fallacies when transcript-supported, and a concise summary. Every material deduction needs a clear explanation tied to messages, claims, omissions, or conduct—not a vague label.

## Scoring responsibilities

The model offers category assessments and explanations. The server validates ranges and calculates any aggregate score from the approved weights. The client displays the report; it does not calculate the winner.

## Handling uncertainty

The Judge must not pretend external facts were verified unless the service supplied verified evidence. It should explain when a decision is limited by missing sources, incomplete engagement, ambiguity, or an interrupted debate.

## Re-evaluation

Initial release policy: a completed report is immutable. Re-evaluation, if ever supported, must create a versioned replacement report rather than overwrite the original result.
