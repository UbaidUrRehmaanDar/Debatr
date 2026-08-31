export interface DebateMessagePosted {
  messageId: string
  debateId: string
  side: string
  content: string
  participantId: string
  turnNumber: number
  timestamp: Date
}

export interface DebateTurnUpdated {
  debateId: string
  turnNumber: number
  currentSide: string
  timeRemainingMs: number
  isActive: boolean
}

export interface DebateParticipantPresence {
  debateId: string
  participantId: string
  isOnline: boolean
  lastSeen: Date
}

export interface DebateTyping {
  debateId: string
  participantId: string
  isTyping: boolean
}

export interface DebateJudgeReport {
  debateId: string
  reportId: string
  outcome: string
  confidence: number
  summary: string
}

export interface DebateLawyerAdvice {
  debateId: string
  requestId: string
  participantId: string
}

export interface DebateStatusChanged {
  debateId: string
  status: string
  updatedAt: Date
}
