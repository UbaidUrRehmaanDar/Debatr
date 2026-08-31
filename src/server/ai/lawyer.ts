/**
 * AI Lawyer - Private per-participant coaching
 */

import { z } from "zod"
import { prisma } from "@/server/db"
import { createLawyerProvider, OpenCodeProvider } from "@/server/ai/provider"
import { checkDebateBudget, recordAiUsage } from "@/server/ai/budget"
import { getEnv } from "@/server/lib/env"

const LawyerResponseSchema = z.object({
  advice: z.string().describe("Coaching advice for the participant"),
  reasoning: z.string().describe("Reasoning behind the advice"),
  suggestions: z.array(z.string()).describe("Tactical suggestions"),
  confidence: z.number().min(0).max(1).describe("Confidence in the advice"),
})

export type LawyerResponse = z.infer<typeof LawyerResponseSchema>

interface LawyerContext {
  debateTopic: string
  participantSide: "affirmative" | "negative"
  participantName: string
  publicTranscript: Array<{
    side: "affirmative" | "negative"
    message: string
  }>
  pinnedEvidence: Array<{
    claim: string
    source?: string
  }>
}

/**
 * Get coaching advice from the AI Lawyer
 */
export async function getLawyerAdvice(
  debateId: string,
  userId: string,
  context: LawyerContext,
  request: string
): Promise<{
  advice: LawyerResponse
  tokensUsed: number
}> {
  // Check budget
  const budget = await checkDebateBudget(debateId)
  if (!budget.allowed) {
    throw new Error(`Debate AI budget exhausted. Used ${budget.tokensUsed}/${budget.limit} tokens.`)
  }

  // Find or create lawyer conversation
  let conversation = await prisma.lawyerConversation.findFirst({
    where: {
      debateId,
      participantId: userId,
    },
  })

  if (!conversation) {
    conversation = await prisma.lawyerConversation.create({
      data: {
        debateId,
        participantId: userId,
      },
    })
  }

  // Build prompt
  const provider = createLawyerProvider()
  const systemPrompt = buildLawyerSystemPrompt(context)
  const userMessage = `Participant request: ${request}`

  // Call API
  const response = await provider.chat(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    0.7
  )

  const tokensUsed = response.usage.total_tokens

  // Parse response
  const responseText = response.choices[0]?.message.content ?? ""
  const parsed = OpenCodeProvider.extractJSON<LawyerResponse>(responseText)

  if (!parsed) {
    throw new Error("Failed to parse Lawyer response")
  }

  // Validate schema
  const validated = LawyerResponseSchema.parse(parsed)

  // Record usage and conversation
  await Promise.all([
    recordAiUsage(debateId, "lawyer", tokensUsed, getEnv().AI_LAWYER_MODEL, response.id),
    prisma.lawyerRequest.create({
      data: {
        conversationId: conversation.id,
        participantRequest: request,
        context: context as never,
        aiResponse: validated as never,
        tokensUsed,
      },
    }),
  ])

  return {
    advice: validated,
    tokensUsed,
  }
}

function buildLawyerSystemPrompt(context: LawyerContext): string {
  const evidenceText =
    context.pinnedEvidence.length > 0
      ? `\n\nPinned Evidence:\n${context.pinnedEvidence.map((e) => `- "${e.claim}"${e.source ? ` (Source: ${e.source})` : ""}`).join("\n")}`
      : ""

  const transcriptText =
    context.publicTranscript.length > 0
      ? `\n\nPublic Debate Transcript:\n${context.publicTranscript.map((m) => `${m.side.toUpperCase()}: ${m.message}`).join("\n\n")}`
      : ""

  return `You are a private debate coach for a participant in a structured debate competition.

DEBATE TOPIC: ${context.debateTopic}
PARTICIPANT SIDE: ${context.participantSide.toUpperCase()}
PARTICIPANT NAME: ${context.participantName}
${evidenceText}
${transcriptText}

Your role is to provide tactical, evidence-based coaching to help the participant present their arguments effectively within the debate format.

IMPORTANT CONSTRAINTS:
1. Keep advice concise and actionable
2. Never disclose the participant's strategy to the opponent
3. Base advice on the debate evidence and transcript only
4. Rate your confidence in the advice (0-1)
5. Provide specific suggestions for argument strengthening

Respond with ONLY valid JSON matching this structure:
{
  "advice": "Brief coaching guidance",
  "reasoning": "Why this advice is sound",
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
  "confidence": 0.85
}`
}
