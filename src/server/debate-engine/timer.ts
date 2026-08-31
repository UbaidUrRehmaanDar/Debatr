// src/server/debate-engine/timer.ts
import { timeoutActiveTurn } from "./engine"
import { debateEvents } from "./events"
import { logger } from "@/server/lib/logger"

const activeTimers = new Map<string, ReturnType<typeof setTimeout>>()

export function startTurnTimer(debateId: string, durationMs: number): void {
  clearTurnTimer(debateId)

  const timer = setTimeout(async () => {
    try {
      logger.info("Turn timer expired", { debateId, durationMs })
      const result = await timeoutActiveTurn(debateId)

      debateEvents.publish(debateId, "turn_advanced", {
        debateId,
        completed: result.completed,
        nextTurnId: result.nextTurn?.id ?? null,
        timedOut: true,
      })

      if (result.completed) {
        debateEvents.publish(debateId, "debate_state_changed", {
          debateId,
          status: "judging",
          currentTurnId: null,
          currentRound: result.nextTurn?.roundIndex ?? 0,
        })
      } else if (result.nextTurn) {
        startTurnTimer(debateId, durationMs)
      }
    } catch (error) {
      logger.error("Failed to handle turn timeout", {
        debateId,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }, durationMs)

  activeTimers.set(debateId, timer)
}

export function clearTurnTimer(debateId: string): void {
  const existing = activeTimers.get(debateId)
  if (existing) {
    clearTimeout(existing)
    activeTimers.delete(debateId)
  }
}

export function hasActiveTimer(debateId: string): boolean {
  return activeTimers.has(debateId)
}
