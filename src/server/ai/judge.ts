/**
 * AI Judge - Structured debate evaluation
 */

import { z } from "zod"
import { createJudgeProvider, OpenCodeProvider } from "@/server/ai/provider"
import { recordAiUsage } from "@/server/ai/budget"
import { getEnv } from "@/server/lib/env"

const JudgeReportSchema = z.object({
  outcome: z.enum(["affirmative", "negative", "draw", "inconclusive"]),
  confidence: z.number().min(0).max(1),
  verdict: z.string(),
  scores: z.object({
    affirmative: z.object({
      logicalConsistency: z.number().min(0).max(10),
      evidenceQuality: z.number().min(0).max(10),
      rebuttalEffectiveness: z.number().min(0).max(10),
      argumentStructure: z.number().min(0).max(10),
      responsiveness: z.number().min(0).max(10),
    }),
    negative: z.object({
      logicalConsistency: z.number().min(0).max(10),
      evidenceQuality: z.number().min(0).max(10),
      rebuttalEffectiveness: z.number().min(0).max(10),
      argumentStructure: z.number().min(0).max(10),
      responsiveness: z.number().min(0).max(10),
    }),
  }),
  strengths: z.object({
    affirmative: z.array(z.string()),
    negative: z.array(z.string()),
  }),
  weaknesses: z.object({
    affirmative: z.array(z.string()),
    negative: z.array(z.string()),
  }),
  fallacies: z.array(
    z.object({
      side: z.enum(["affirmative", "negative"]),
      fallacy: z.string(),
      description: z.string(),
    })
  ),
  conductFindings: z.array(z.string()),
  summary: z.string(),
})

export type JudgeReport = z.infer<typeof JudgeReportSchema>

interface DebateRecord {
  id: string
  topic: string
  participants: Array<{
    id: string
    side: "affirmative" | "negative"
    user: {
      name: string | null
      email: string
    }
  }>
  messages: Array<{
    side: "affirmative" | "negative" | "system"
    content: string
    sender: {
      name: string | null
    }
  }>
  turns: Array<{
    roundIndex: number
    side: "affirmative" | "negative"
  }>
}

/**
 * Evaluate a completed debate and generate a judge report
 */
export async function evaluateDebate(debate: DebateRecord): Promise<{
  report: JudgeReport
  tokensUsed: number
}> {
  const provider = createJudgeProvider()
  const systemPrompt = buildJudgeSystemPrompt(debate)
  const userMessage = buildDebateTranscript(debate)

  // Call API
  const response = await provider.chat(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    0.5 // Lower temperature for more consistent evaluation
  )

  const tokensUsed = response.usage.total_tokens

  // Parse response
  const responseText = response.choices[0]?.message.content ?? ""
  const parsed = OpenCodeProvider.extractJSON<JudgeReport>(responseText)

  if (!parsed) {
    throw new Error("Failed to parse Judge response")
  }

  // Validate schema
  const validated = JudgeReportSchema.parse(parsed)

  // Record usage
  await recordAiUsage(debate.id, "judge", tokensUsed, getEnv().AI_JUDGE_MODEL, response.id)

  return {
    report: validated,
    tokensUsed,
  }
}

function buildJudgeSystemPrompt(debate: DebateRecord): string {
  const affParticipant = debate.participants.find((p) => p.side === "affirmative")
  const negParticipant = debate.participants.find((p) => p.side === "negative")

  return `You are an expert debate judge tasked with evaluating a structured debate.

DEBATE TOPIC: ${debate.topic}

AFFIRMATIVE SIDE: ${affParticipant?.user.name || affParticipant?.user.email}
NEGATIVE SIDE: ${negParticipant?.user.name || negParticipant?.user.email}

SCORING RUBRIC (0-10 scale per category):
- Logical consistency (30%): coherence, valid reasoning, absence of contradictions
- Evidence quality (25%): relevance, support, and correct qualification of evidence
- Rebuttal effectiveness (20%): whether meaningful opposing claims were addressed
- Argument structure (15%): clear claims, reasons, and conclusions
- Responsiveness (10%): engagement with the opponent's actual position

JUDGE INSTRUCTIONS:
1. Evaluate each side fairly based on debate content only
2. Score independently for each rubric category
3. Identify fallacies by name and explain them
4. Note conduct issues if any
5. Determine the winning side based on total argument strength
6. Set confidence 0.5-1.0 based on how clear the decision was
7. Be concise but thorough

POSSIBLE OUTCOMES:
- "affirmative" - Affirmative side won clearly
- "negative" - Negative side won clearly
- "draw" - Both sides performed equally
- "inconclusive" - Decision is too close to call

Respond with ONLY valid JSON matching the exact structure provided. Use arrays for fallacies and lists.`
}

function buildDebateTranscript(debate: DebateRecord): string {
  const messages = debate.messages
    .filter((m) => m.side !== "system")
    .map((m) => `${m.side.toUpperCase()} (${m.sender.name || "Anonymous"}): ${m.content}`)
    .join("\n\n")

  return `DEBATE TRANSCRIPT:\n\n${messages || "(No messages in debate)"}`
}
