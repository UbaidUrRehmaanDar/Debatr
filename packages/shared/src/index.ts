// Shared, framework-agnostic types and constants for Debatr.
// Kept free of server/client-specific imports so both the API and web app can
// depend on it.

export type Side = 'affirmative' | 'negative' | 'system';

export type DebateStatus =
  | 'draft'
  | 'waiting_for_participants'
  | 'active'
  | 'paused'
  | 'judging'
  | 'completed'
  | 'cancelled';

export const DEBATE_STATUSES: DebateStatus[] = [
  'draft',
  'waiting_for_participants',
  'active',
  'paused',
  'judging',
  'completed',
  'cancelled',
];

// Human-readable labels matching docs/frontend copy. Avoid conveying state by
// colour alone (docs/frontend/DESIGN_SYSTEM.md).
export const DEBATE_STATUS_LABELS: Record<DebateStatus, string> = {
  draft: 'Draft',
  waiting_for_participants: 'Awaiting opponent',
  active: 'In progress',
  paused: 'Paused',
  judging: 'Judging',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export type JudgeOutcome = 'affirmative' | 'negative' | 'draw' | 'inconclusive';

export const JUDGE_OUTCOME_LABELS: Record<JudgeOutcome, string> = {
  affirmative: 'Affirmative wins',
  negative: 'Negative wins',
  draw: 'Draw',
  inconclusive: 'Inconclusive',
};

// Initial debate defaults mirror apps/api/src/config/env.ts. They are
// documented as centrally configurable and snapshotted per debate.
export const DEFAULT_DEBATE = {
  maxRounds: 4,
  turnMinutes: 5,
  maxCharactersPerTurn: 2000,
};
