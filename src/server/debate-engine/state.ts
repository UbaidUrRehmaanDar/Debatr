/**
 * Debate state machine and lifecycle management
 * Enforces valid state transitions and manages turn generation
 */

export type DebateStatus =
  | "draft"
  | "waiting_for_participants"
  | "active"
  | "paused"
  | "judging"
  | "completed"
  | "cancelled"

export type TurnStatus = "pending" | "active" | "completed" | "timeout"

export type Side = "affirmative" | "negative"

/**
 * Valid state transitions
 */
const VALID_TRANSITIONS: Record<DebateStatus, DebateStatus[]> = {
  draft: ["waiting_for_participants", "cancelled"],
  waiting_for_participants: ["active", "cancelled"],
  active: ["paused", "judging", "cancelled"],
  paused: ["active", "cancelled"],
  judging: ["completed"],
  completed: [],
  cancelled: [],
}

/**
 * Check if a transition is valid
 */
export function canTransition(from: DebateStatus, to: DebateStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false
}

/**
 * Get all valid next states
 */
export function getValidNextStates(currentStatus: DebateStatus): DebateStatus[] {
  return VALID_TRANSITIONS[currentStatus] ?? []
}

/**
 * Check if a debate is active (allows messaging and turn submission)
 */
export function isDebateActive(status: DebateStatus): boolean {
  return status === "active"
}

/**
 * Check if a debate can be modified (not yet started or still in waiting)
 */
export function isDebateModifiable(status: DebateStatus): boolean {
  return status === "draft" || status === "waiting_for_participants"
}

/**
 * Check if a debate is terminal (no further changes)
 */
export function isDebateTerminal(status: DebateStatus): boolean {
  return status === "completed" || status === "cancelled"
}

/**
 * Generate turn sequence for a debate
 * Returns array of { roundIndex, turnIndex, side }
 */
export function generateTurnSequence(maxRounds: number): Array<{
  roundIndex: number
  turnIndex: number
  side: Side
}> {
  const turns: Array<{ roundIndex: number; turnIndex: number; side: Side }> = []

  for (let round = 0; round < maxRounds; round++) {
    // Each round has 2 turns: affirmative then negative
    turns.push({ roundIndex: round, turnIndex: round * 2, side: "affirmative" })
    turns.push({ roundIndex: round, turnIndex: round * 2 + 1, side: "negative" })
  }

  return turns
}
