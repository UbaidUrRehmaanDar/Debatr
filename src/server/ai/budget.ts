/**
 * AI Budget tracking and enforcement
 */

import { prisma } from "@/server/db"
import { getEnv } from "@/server/lib/env"

export async function checkDebateBudget(debateId: string): Promise<{
  allowed: boolean
  tokensUsed: number
  tokensRemaining: number
  limit: number
}> {
  const env = getEnv()
  const limit = env.AI_MAX_TOKENS_PER_DEBATE

  const usage = await prisma.aiUsage.aggregate({
    where: { debateId },
    _sum: { tokensUsed: true },
  })

  const tokensUsed = usage._sum.tokensUsed ?? 0
  const tokensRemaining = Math.max(0, limit - tokensUsed)

  return {
    allowed: tokensRemaining > 0,
    tokensUsed,
    tokensRemaining,
    limit,
  }
}

export async function recordAiUsage(
  debateId: string,
  role: "lawyer" | "judge" | "fact_checker",
  tokensUsed: number,
  model: string,
  requestId?: string
) {
  await prisma.aiUsage.create({
    data: {
      debateId,
      role,
      tokensUsed,
      model,
      requestId,
    },
  })
}

export function checkRequestBudget(tokensUsed: number): boolean {
  const env = getEnv()
  return tokensUsed <= env.AI_MAX_TOKENS_PER_REQUEST
}
