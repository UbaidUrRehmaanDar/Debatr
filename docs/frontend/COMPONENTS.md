# Frontend components

## Component boundaries

Components render state and emit user intent. Server actions and data clients perform network calls; the server validates the intent. Do not embed debate state-machine logic or AI prompts in components.

## Initial component groups

### Debate room

- `DebateHeader`: topic, lifecycle state, participant sides, current round.
- `TurnIndicator`: active side, deadline, server-time/reconnect clarity.
- `Transcript`: ordered, accessible public messages with safe text rendering.
- `MessageComposer`: only enabled for the active participant; displays current limits.
- `RaiseHandControl`: creates and displays a request, never sends a public turn.
- `DebateStatus`: waiting, active, paused, judging, completed, or cancelled state.

### Private Lawyer

- `LawyerPanel`: clear privacy label and role boundary.
- `LawyerRequestForm`: constrained request input and pending/error state.
- `LawyerResponse`: structured advice, uncertainty, and evidence-suggestion display.

### Judge report

- `VerdictCard`: outcome and confidence.
- `RubricBreakdown`: both-side scores and criterion explanations.
- `FeedbackPanel`: strengths, weaknesses, and constructive next steps.
- `ConductNotice`: warnings/termination explanation where relevant.

### Shared

- `ConnectionStatus`, `ErrorMessage`, `LoadingState`, `EmptyState`, and accessible dialogs/notifications.

## Privacy safeguards

Private Lawyer components receive only the current user’s authorised data. Do not reuse a component/store that can accidentally mix Lawyer and transcript records. Screen reader labels, browser titles, notifications, and telemetry must not expose private coaching text to another participant.
