/**
 * Legal AI Router - Handles legal research and document analysis queries
 */

import { z } from "zod"
import { router, protectedProcedure } from "@/server/trpc/context"
import { queryLegalAI, analyzeLegalDocument, generateLegalArguments } from "@/server/ai/legal-ai"

export const legalAiRouter = router({
  /**
   * Query the Legal AI for legal research and analysis
   */
  query: protectedProcedure
    .input(
      z.object({
        question: z.string().min(1).max(2000),
        jurisdiction: z.string().optional(),
        areaOfLaw: z.string().optional(),
        documentContext: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await queryLegalAI(input.question, {
        jurisdiction: input.jurisdiction,
        areaOfLaw: input.areaOfLaw,
        documentContext: input.documentContext,
      })

      return {
        response: result.response,
        tokensUsed: result.tokensUsed,
      }
    }),

  /**
   * Analyze a legal document and provide insights
   */
  analyzeDocument: protectedProcedure
    .input(
      z.object({
        documentText: z.string().min(1).max(50000),
        documentType: z.string().min(1).max(200),
      })
    )
    .mutation(async ({ input }) => {
      const result = await analyzeLegalDocument(input.documentText, input.documentType)

      return {
        response: result.response,
        tokensUsed: result.tokensUsed,
      }
    }),

  /**
   * Generate legal arguments for a debate position
   */
  generateArguments: protectedProcedure
    .input(
      z.object({
        topic: z.string().min(1).max(500),
        position: z.enum(["affirmative", "negative"]),
        jurisdiction: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await generateLegalArguments(
        input.topic,
        input.position,
        input.jurisdiction
      )

      return {
        response: result.response,
        tokensUsed: result.tokensUsed,
      }
    }),
})
