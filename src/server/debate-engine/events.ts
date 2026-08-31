// src/server/debate-engine/events.ts
import { EventEmitter } from "events"

export type DebateEventType =
  | "debate_state_changed"
  | "turn_advanced"
  | "message_posted"
  | "raise_hand"
  | "raise_hand_decided"
  | "fact_checked"
  | "ai_thinking"
  | "judge_complete"

export interface DebateEvent {
  type: DebateEventType
  debateId: string
  payload: Record<string, unknown>
}

class DebateEventBus extends EventEmitter {
  emit(event: string, data: DebateEvent): boolean {
    return super.emit(event, data)
  }

  on(event: string, listener: (data: DebateEvent) => void): this {
    return super.on(event, listener)
  }

  off(event: string, listener: (data: DebateEvent) => void): this {
    return super.off(event, listener)
  }

  publish(debateId: string, type: DebateEventType, payload: Record<string, unknown>) {
    const event: DebateEvent = { type, debateId, payload }
    // Emit to debate-specific channel
    this.emit(`debate:${debateId}`, event)
    // Emit to global channel for cross-cutting listeners
    this.emit("debate:*", event)
  }
}

export const debateEvents = new DebateEventBus()
debateEvents.setMaxListeners(100)
