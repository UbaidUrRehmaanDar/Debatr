/**
 * Legal AI Service - Optimized for legal research and document analysis
 * Uses OpenCode with legal-specific prompts and structured responses
 */

import { z } from "zod"
import { OpenCodeProvider } from "@/server/ai/provider"
import { getEnv } from "@/server/lib/env"

const LegalAIResponseSchema = z.object({
  answer: z.string().describe("Direct answer to the legal question"),
  reasoning: z.string().describe("Legal reasoning and analysis"),
  relevantCases: z.array(z.object({
    name: z.string().describe("Case name"),
    citation: z.string().describe("Legal citation"),
    relevance: z.string().describe("Why this case is relevant"),
    year: z.number().describe("Year of decision"),
  })).describe("Relevant case law"),
  statutes: z.array(z.object({
    name: z.string().describe("Statute or regulation name"),
    citation: z.string().describe("Legal citation"),
    relevance: z.string().describe("Why this statute is relevant"),
  })).describe("Relevant statutes and regulations"),
  confidence: z.number().min(0).max(1).describe("Confidence in the answer"),
  disclaimer: z.string().describe("Legal disclaimer"),
})

export type LegalAIResponse = z.infer<typeof LegalAIResponseSchema>

interface LegalQueryContext {
  jurisdiction?: string
  areaOfLaw?: string
  documentContext?: string
}

/**
 * Query the Legal AI for legal research and analysis
 */
export async function queryLegalAI(
  question: string,
  context?: LegalQueryContext
): Promise<{
  response: LegalAIResponse
  tokensUsed: number
}> {
  try {
    const provider = new OpenCodeProvider(getEnv().AI_LEGAL_MODEL || "nemotron-3-ultra-free")
    
    const systemPrompt = buildLegalSystemPrompt(context)
    const userMessage = `Legal Question: ${question}`

    const response = await provider.chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      0.3 // Lower temperature for more precise legal analysis
    )

    const tokensUsed = response.usage.total_tokens
    const responseText = response.choices[0]?.message.content ?? ""

    if (!responseText) {
      throw new Error("Empty response from AI provider")
    }

    const parsed = OpenCodeProvider.extractJSON<LegalAIResponse>(responseText)
    if (!parsed) {
      // Fallback: try to create a basic response if JSON parsing fails
      console.warn("Failed to parse JSON, creating fallback response")
      return {
        response: {
          answer: responseText.substring(0, 500),
          reasoning: "AI response was received but could not be parsed into structured format.",
          relevantCases: [],
          statutes: [],
          confidence: 0.5,
          disclaimer: "This information is for educational and research purposes only and does not constitute legal advice."
        },
        tokensUsed,
      }
    }

    const validated = LegalAIResponseSchema.parse(parsed)

    return {
      response: validated,
      tokensUsed,
    }
  } catch (error) {
    console.error("Legal AI query error:", error)
    throw new Error(`Legal AI error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Analyze a legal document and provide insights
 */
export async function analyzeLegalDocument(
  documentText: string,
  documentType: string
): Promise<{
  response: LegalAIResponse
  tokensUsed: number
}> {
  const provider = new OpenCodeProvider(getEnv().AI_LEGAL_MODEL || "nemotron-3-ultra-free")
  
  const systemPrompt = `You are an expert legal document analyst. Your role is to analyze legal documents and provide insights about their content, structure, legal implications, and potential issues.

Document Type: ${documentType}

IMPORTANT CONSTRAINTS:
1. Provide detailed analysis of the document's legal implications
2. Identify key clauses and their significance
3. Flag potential risks or issues
4. Suggest improvements or areas for clarification
5. Reference relevant legal principles where applicable
6. Always include appropriate legal disclaimers

Respond with ONLY valid JSON matching this structure:
{
  "answer": "Summary of document analysis",
  "reasoning": "Detailed legal reasoning",
  "relevantCases": [{"name": "Case name", "citation": "Citation", "relevance": "Why relevant", "year": 2020}],
  "statutes": [{"name": "Statute name", "citation": "Citation", "relevance": "Why relevant"}],
  "confidence": 0.85,
  "disclaimer": "Legal disclaimer"
}`

  const userMessage = `Document to analyze:\n\n${documentText}`

  const response = await provider.chat(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    0.3
  )

  const tokensUsed = response.usage.total_tokens
  const responseText = response.choices[0]?.message.content ?? ""

  const parsed = OpenCodeProvider.extractJSON<LegalAIResponse>(responseText)
  if (!parsed) {
    throw new Error("Failed to parse Legal AI document analysis")
  }

  const validated = LegalAIResponseSchema.parse(parsed)

  return {
    response: validated,
    tokensUsed,
  }
}

/**
 * Generate legal arguments for a debate position
 */
export async function generateLegalArguments(
  topic: string,
  position: "affirmative" | "negative",
  jurisdiction?: string
): Promise<{
  response: LegalAIResponse
  tokensUsed: number
}> {
  const provider = new OpenCodeProvider(getEnv().AI_LEGAL_MODEL || "nemotron-3-ultra-free")
  
  const jurisdictionText = jurisdiction ? `Jurisdiction: ${jurisdiction}` : ""
  
  const systemPrompt = `You are an expert legal argument generator for debate competitions. Your role is to provide well-reasoned legal arguments supporting a specific position on a legal topic.

${jurisdictionText}

IMPORTANT CONSTRAINTS:
1. Provide strong, legally sound arguments
2. Support arguments with relevant case law and statutes
3. Address potential counterarguments
4. Structure arguments logically
5. Include legal reasoning and precedent
6. Always include appropriate legal disclaimers

Respond with ONLY valid JSON matching this structure:
{
  "answer": "Primary legal argument summary",
  "reasoning": "Detailed legal reasoning and argument structure",
  "relevantCases": [{"name": "Case name", "citation": "Citation", "relevance": "Why relevant", "year": 2020}],
  "statutes": [{"name": "Statute name", "citation": "Citation", "relevance": "Why relevant"}],
  "confidence": 0.85,
  "disclaimer": "Legal disclaimer"
}`

  const userMessage = `Topic: ${topic}\nPosition: ${position}\n\nGenerate legal arguments supporting this position.`

  const response = await provider.chat(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    0.4
  )

  const tokensUsed = response.usage.total_tokens
  const responseText = response.choices[0]?.message.content ?? ""

  const parsed = OpenCodeProvider.extractJSON<LegalAIResponse>(responseText)
  if (!parsed) {
    throw new Error("Failed to parse Legal AI argument generation")
  }

  const validated = LegalAIResponseSchema.parse(parsed)

  return {
    response: validated,
    tokensUsed,
  }
}

function buildLegalSystemPrompt(context?: LegalQueryContext): string {
  const jurisdictionText = context?.jurisdiction 
    ? `Jurisdiction: ${context.jurisdiction}` 
    : "Jurisdiction: General/Common Law"
  
  const areaOfLawText = context?.areaOfLaw 
    ? `Area of Law: ${context.areaOfLaw}` 
    : ""
  
  const documentContextText = context?.documentContext 
    ? `Document Context: ${context.documentContext}` 
    : ""

  return `You are an expert legal research assistant with deep knowledge of case law, statutes, regulations, and legal principles across multiple jurisdictions.

${jurisdictionText}
${areaOfLawText}
${documentContextText}

Your role is to provide accurate, well-reasoned legal information to support research, debate preparation, and legal document analysis.

IMPORTANT CONSTRAINTS:
1. Provide precise, legally accurate information
2. Support answers with relevant case law and statutes when applicable
3. Explain legal reasoning clearly
4. Distinguish between settled law and unsettled/controversial areas
5. Include appropriate legal citations
6. Rate your confidence in the answer (0-1)
7. Always include appropriate disclaimers that this is not legal advice
8. Be concise but thorough in your analysis

Respond with ONLY valid JSON matching this structure:
{
  "answer": "Direct answer to the legal question",
  "reasoning": "Detailed legal reasoning and analysis",
  "relevantCases": [
    {
      "name": "Case name (e.g., 'Brown v. Board of Education')",
      "citation": "Legal citation (e.g., '347 U.S. 483 (1954)')",
      "relevance": "Why this case is relevant to the question",
      "year": 1954
    }
  ],
  "statutes": [
    {
      "name": "Statute or regulation name",
      "citation": "Legal citation",
      "relevance": "Why this statute is relevant"
    }
  ],
  "confidence": 0.85,
  "disclaimer": "This information is for educational and research purposes only and does not constitute legal advice."
}`
}
