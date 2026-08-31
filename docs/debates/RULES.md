# Debate rules

## Scope

These rules apply to the initial private, two-person text debate format. They are the product rules; the API is responsible for enforcing them.

## Participants

- A debate has exactly two participants: Affirmative and Negative.
- Each participant argues their assigned side of the stated motion.
- Neither participant may submit messages for the other side.
- Each participant can privately request help from only their assigned AI Lawyer.

## Turn-taking

- The debate is turn-based and only the active participant may publish a public turn.
- Direct interruption is not allowed.
- Participants may raise a hand during the other side’s turn, but a request does not permit public messaging.
- Turn order, round order, time limits, and character limits are chosen by the debate configuration and enforced by the server.

## Message limits

The recommended initial maximum is 2,000 characters per public turn. This is long enough for a substantial argument while keeping debates readable and controlling AI context cost. The actual default and maximum must be configured centrally; clients must not rely on their own limit alone.

## Evidence and claims

- Participants may make personal or reasoned arguments without citations.
- Claims presented as research, statistics, or external facts should identify a source when possible.
- A participant may challenge an unsupported factual claim.
- An unverified citation is not treated as established evidence merely because it appears in a message.

## Permitted disagreement

Participants may strongly disagree with a claim, policy, belief, ideology, or worldview. They must address ideas and arguments without harassment, threats, hate speech, repeated personal insults, spam, or deliberate disruption.

## AI assistance

Lawyer assistance is private and optional. It must not be copied automatically into a public message, and it does not make an AI-generated assertion verified. Participants remain responsible for what they publish.

## Rule changes

Rules affecting active debates are snapshotted at debate start. A later global configuration change applies only to newly created debates unless an explicit migration policy is approved.
