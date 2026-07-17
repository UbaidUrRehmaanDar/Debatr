// In-process debate event bus. The WebSocket layer subscribes to these events
// and fans them out to connected clients. Keeping it in-process matches the
// single-instance constraint in docs/ARCHITECTURE.md (no Redis/broker yet).
import { EventEmitter } from 'node:events';

export type DebateEvent =
  | { type: 'debate_state_changed'; debateId: string; status: string; currentTurnId: string | null; currentRound: number }
  | { type: 'turn_advanced'; debateId: string; completed: boolean; nextTurnId: string | null }
  | { type: 'message_posted'; debateId: string; turnId: string | null; side: string; messageId: string }
  | { type: 'raise_hand'; debateId: string; requestId: string; side: string }
  | { type: 'raise_hand_decided'; debateId: string; requestId: string; status: string };

class DebateEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
  }
}

export const debateEvents = new DebateEventBus();
