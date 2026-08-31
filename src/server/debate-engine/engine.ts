// src/server/debate-engine/engine.ts
import { prisma } from "@/server/db"
import { randomUUID } from "crypto"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DebateRow = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TurnRow = any

export type Side = "affirmative" | "negative"

function buildTurnPlan(
  maxRounds: number,
): Array<{ roundIndex: number; turnIndex: number; side: Side }> {
  const plan: Array<{ roundIndex: number; turnIndex: number; side: Side }> = []
  for (let round = 0; round < maxRounds; round++) {
    plan.push({ roundIndex: round, turnIndex: plan.length, side: "affirmative" })
    plan.push({ roundIndex: round, turnIndex: plan.length, side: "negative" })
  }
  return plan
}

export interface TurnPlanEntry {
  roundIndex: number
  turnIndex: number
  side: Side
}

export function planTurns(maxRounds: number): TurnPlanEntry[] {
  return buildTurnPlan(maxRounds)
}

export async function startDebateTurns(debate: DebateRow): Promise<void> {
  const plan = buildTurnPlan(debate.maxRounds)
  const now = new Date()

  const rows = plan.map((entry) => ({
    id: randomUUID(),
    debateId: debate.id,
    roundIndex: entry.roundIndex,
    turnIndex: entry.turnIndex,
    side: entry.side,
    participantId:
      entry.side === "affirmative"
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          debate.participants.find((p: any) => p.side === "affirmative")?.userId
        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
          debate.participants.find((p: any) => p.side === "negative")?.userId,
    startTime: now,
    status: "pending" as const,
  }))

  await prisma.turn.createMany({ data: rows })

  const first = rows[0]
  await prisma.debate.update({
    where: { id: debate.id },
    data: {
      status: "active",
      currentRound: first.roundIndex,
      currentTurnId: first.id,
    },
  })

  await prisma.turn.update({
    where: { id: first.id },
    data: { status: "active" },
  })
}

export async function getActiveTurn(debateId: string): Promise<TurnRow | null> {
  const turn = await prisma.turn.findFirst({
    where: { debateId, status: "active" },
  })
  return turn ?? null
}

export async function getTurnById(turnId: string): Promise<TurnRow | null> {
  const turn = await prisma.turn.findUnique({ where: { id: turnId } })
  return turn ?? null
}

export interface AdvanceResult {
  completed: boolean
  nextTurn: TurnRow | null
}

export async function closeTurnAndAdvance(
  debateId: string,
  turnId: string,
): Promise<AdvanceResult> {
  const now = new Date()

  // Conditional close: only succeeds if the turn is still active
  const turn = await prisma.turn.findFirst({
    where: { id: turnId, status: "active" },
  })

  if (!turn) {
    // Already advanced by concurrent request
    const debate = await prisma.debate.findUnique({ where: { id: debateId } })
    const allTurns = await prisma.turn.findMany({
      where: { debateId },
      orderBy: { turnIndex: "asc" },
    })
    const idx = allTurns.findIndex((t: TurnRow) => t.id === turnId)
    const next = idx >= 0 ? (allTurns[idx + 1] ?? null) : null
    return {
      completed: debate?.currentTurnId === null,
      nextTurn: next && next.status === "active" ? next : null,
    }
  }

  // Close the turn
  await prisma.turn.update({
    where: { id: turnId },
    data: { status: "completed", endTime: now },
  })

  const allTurns = await prisma.turn.findMany({
    where: { debateId },
    orderBy: { turnIndex: "asc" },
  })

  const idx = allTurns.findIndex((t: TurnRow) => t.id === turnId)
  const next = idx >= 0 ? (allTurns[idx + 1] ?? null) : null

  if (!next) {
    await prisma.debate.update({
      where: { id: debateId },
      data: { currentRound: turn.roundIndex, currentTurnId: null },
    })
    return { completed: true, nextTurn: null }
  }

  await prisma.debate.update({
    where: { id: debateId },
    data: { currentRound: next.roundIndex, currentTurnId: next.id },
  })

  await prisma.turn.update({
    where: { id: next.id },
    data: { status: "active", startTime: now },
  })

  return { completed: false, nextTurn: next }
}

export async function timeoutActiveTurn(debateId: string): Promise<AdvanceResult> {
  const active = await getActiveTurn(debateId)
  if (!active) {
    throw new Error("No active turn to time out")
  }
  // Mark as timeout before advancing
  await prisma.turn.update({
    where: { id: active.id },
    data: { status: "timeout" },
  })
  return closeTurnAndAdvance(debateId, active.id)
}

export function sideOfUser(debate: DebateRow, userId: string): Side | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const participant = debate.participants?.find((p: any) => p.userId === userId)
  if (participant?.side === "affirmative") return "affirmative"
  if (participant?.side === "negative") return "negative"
  return null
}

export async function enterJudging(debateId: string): Promise<void> {
  await prisma.debate.update({
    where: { id: debateId },
    data: {
      status: "judging",
      currentTurnId: null,
    },
  })
}
