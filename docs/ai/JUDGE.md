# AI Judge specification

## Role

The AI Judge is a neutral evaluator that runs after a debate reaches the judging state. It does not act as a coach, participant, or source of live tactical advice.

## Evaluation principles

The Judge evaluates the arguments actually made in the transcript. It must be transparent about uncertainty, avoid treating unsupported confidence as evidence, and not reward grammar, spelling, accent, vocabulary, or English fluency.

The initial weighted rubric is:

| Criterion | Weight | What it assesses |
| --- | ---: | --- |
| Logical consistency | 30% | coherence, valid reasoning, absence of contradictions |
| Evidence quality | 25% | relevance, support, and correct qualification of evidence |
| Rebuttal effectiveness | 20% | whether meaningful opposing claims were addressed |
| Argument structure | 15% | clear claims, reasons, and conclusions |
| Responsiveness | 10% | engagement with the opponent’s actual position |

## Required report

The Judge returns a structured report containing an outcome, confidence, per-side scoring, narrative verdict, strengths, weaknesses, constructive improvement advice, summary, and transcript-supported fallacies. Every material deduction must identify the underlying debate behaviour or missing support.

The outcome may be Affirmative, Negative, Draw, or Inconclusive. The storage representation remains an open question and must be resolved before the contract is finalised.

## Conduct authority

The Judge may identify prohibited conduct and recommend the configured action: warning, official warning, penalty, or termination. The authoritative API—not the model—records and executes that action. Imminent threats or disallowed content follow the safety policy and may require immediate termination.

## Limits

The Judge is not a fact oracle. It must distinguish a well-argued claim from a verified truth and must not invent research to settle a debate. If the transcript does not permit a confident outcome, it must choose Draw or Inconclusive and explain why.
