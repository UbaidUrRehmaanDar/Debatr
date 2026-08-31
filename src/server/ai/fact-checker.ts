/**
 * AI Fact-Checker - Per-message claim verification
 */

import { z } from "zod"
import { prisma } from "@/server/db"
import { createFactCheckerProvider, OpenCodeProvider } from "@/server/ai/provider"
import { recordAiUsage } from "@/server/ai/budget"
import { getEnv } from "@/server/lib/env"

const FactCheckSchema = z.object({
  verdict: z.enum(["accurate", "misleading", "false", "unclear"]),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  sources: z.array(z.string()),
})

export type FactCheckResult = z.infer<typeof FactCheckSchema>

/**
 * Fact-check a claim from a debate message
 */
export async function factCheckClaim(
  debateId: string,
  messageId: string,
  claim: string,
  debateContext?: string
): Promise<{
  result: FactCheckResult
  tokensUsed: number
}> {
  const provider = createFactCheckerProvider()
  const systemPrompt = buildFactCheckerSystemPrompt()
  const userMessage = buildFactCheckPrompt(claim, debateContext)

  // Call API
  const response = await provider.chat(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    0.5 // Low temperature for consistency
  )

  const tokensUsed = response.usage.total_tokens

  // Parse response
  const responseText = response.choices[0]?.message.content ?? ""
  const parsed = OpenCodeProvider.extractJSON<FactCheckResult>(responseText)

  if (!parsed) {
    throw new Error("Failed to parse Fact-Checker response")
  }

  // Validate schema
  const validated = FactCheckSchema.parse(parsed)

  // Record in database
  await Promise.all([
    recordAiUsage(debateId, "fact_checker", tokensUsed, getEnv().AI_FACT_CHECKER_MODEL, response.id),
    prisma.factCheck.create({
      data: {
        messageId,
        debateId,
        claims: {
          claim,
          verdict: validated.verdict,
          confidence: validated.confidence,
          reasoning: validated.reasoning,
          sources: validated.sources,
        },
        verdict: validated.verdict,
        model: getEnv().AI_FACT_CHECKER_MODEL,
        tokensUsed,
      },
    }),
  ])

  return {
    result: validated,
    tokensUsed,
  }
}

function buildFactCheckerSystemPrompt(): string {
  return `You are an expert fact-checker specializing in verifying claims made in debates.

YOUR ROLE:
- Evaluate claims for factual accuracy
- Identify misleading statements that are technically true but deceptive
- Distinguish between verifiable facts and opinion/speculation
- Rate confidence in your assessment

VERDICT CATEGORIES:
- "accurate" - The claim is factually correct
- "misleading" - The claim is partially true or omits important context
- "false" - The claim is factually incorrect
- "unclear" - The claim cannot be verified from available knowledge

INSTRUCTIONS:
1. Assess based on widely-accepted, verifiable information
2. Note if a claim is an opinion or speculative
3. Identify missing context that would change the assessment
4. List sources that support your verdict
5. Set confidence 0.5-1.0 based on how clear-cut the claim is

Respond with ONLY valid JSON matching this exact structure:
{
  "verdict": "accurate|misleading|false|unclear",
  "confidence": 0.85,
  "reasoning": "Clear explanation of the fact-check verdict",
  "sources": ["Source 1", "Source 2"]
}`
}

function buildFactCheckPrompt(claim: string, context?: string): string {
  return `Fact-check this claim${context ? ` from a debate about "${context}"` : ""}:

"${claim}"`
}
