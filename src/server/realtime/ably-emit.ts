import { Rest } from "ably"

import type {
  DebateMessagePosted,
  DebateTurnUpdated,
  DebateParticipantPresence,
  DebateTyping,
  DebateJudgeReport,
  DebateLawyerAdvice,
  DebateStatusChanged,
} from "./types"

function getAbly(): Rest {
  const apiKey = process.env.ABLY_API_KEY
  if (!apiKey) throw new Error("ABLY_API_KEY is not set")
  return new Rest(apiKey)
}

function debateChannel(debateId: string) {
  return getAbly().channels.get(`debate:${debateId}`)
}

export async function emitDebateMessage(
  debateId: string,
  messageData: DebateMessagePosted
): Promise<void> {
  const channel = debateChannel(debateId)
  await channel.publish("debate:message-posted", messageData)
}

export async function emitTurnUpdate(
  debateId: string,
  turnData: DebateTurnUpdated
): Promise<void> {
  const channel = debateChannel(debateId)
  await channel.publish("debate:turn-updated", turnData)
}

export async function emitJudgeReport(
  debateId: string,
  reportData: DebateJudgeReport
): Promise<void> {
  const channel = debateChannel(debateId)
  await channel.publish("debate:judge-report", reportData)
}

export async function emitLawyerAdvice(
  debateId: string,
  adviceData: DebateLawyerAdvice
): Promise<void> {
  const channel = debateChannel(debateId)
  await channel.publish("debate:lawyer-advice", adviceData)
}

export async function emitStatusChange(
  debateId: string,
  statusData: DebateStatusChanged
): Promise<void> {
  const channel = debateChannel(debateId)
  await channel.publish("debate:status-changed", statusData)
}

export async function emitTyping(
  debateId: string,
  typingData: DebateTyping
): Promise<void> {
  const channel = debateChannel(debateId)
  await channel.publish("debate:typing", typingData)
}

export async function emitPresence(
  debateId: string,
  presenceData: DebateParticipantPresence
): Promise<void> {
  const channel = debateChannel(debateId)
  await channel.publish("debate:participant-presence", presenceData)
}
