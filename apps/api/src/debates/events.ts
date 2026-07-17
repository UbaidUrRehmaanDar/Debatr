// In-process debate event bus. The WebSocket layer subscribes to these events
// and fans them out to connected clients. Keeping it in-process matches the
// single-instance constraint in docs/ARCHITECTURE.md (no Redis/broker yet).
import { EventEmitter } from 'node:events';

export type DebateEvent =
  | { type: 'debate_state_changed'; debateId: string; status: string; currentTurnId: string | null; currentRound: number }
  | { type: 'turn_advanced'; debateId: string; completed: boolean; nextTurnId: string | null }
  | { type: 'message_posted'; debateId: string; turnId: string | null; side: string; messageId: string }
  | { type: 'raise_hand'; debateId: string; requestId: string; side: string }
  | { type: 'raise_hand_decided'; debateId: string; requestId: string; status: string }
  | { type: 'fact_checked'; debateId: string; messageId: string; verdict: string; factCheckId: string }
  | { type: 'typing'; debateId: string; userId: string; side: string; isTyping: boolean }
  | { type: 'reaction'; debateId: string; userId: string; side: string; emoji: string }
  | { type: 'ai_thinking'; debateId: string; role: 'lawyer' | 'judge'; isThinking: boolean };

class DebateEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
  }
}

export const debateEvents = new DebateEventBus();
