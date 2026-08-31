import { z } from "zod"
import { router, protectedProcedure } from "@/server/trpc/context"
import { TRPCError } from "@trpc/server"

export const evidenceRouter = router({
  /**
   * List evidence for a debate
   */
  list: protectedProcedure
    .input(z.object({ debateId: z.string().cuid() }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.session.user.id

      // Verify user is a participant
      const debate = await ctx.db.debate.findUnique({
        where: { id: input.debateId },
        include: { participants: true },
      })

      if (!debate || !debate.participants.some((p) => p.userId === userId)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not a participant" })
      }

      const evidence = await ctx.db.evidence.findMany({
        where: { debateId: input.debateId },
        include: {
          pinnedBy: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      })

      return evidence
    }),

  /**
   * Pin evidence to a debate
   */
  pin: protectedProcedure
    .input(
      z.object({
        debateId: z.string().cuid(),
        claim: z.string().min(1).max(1000),
        source: z.string().max(500).optional(),
        side: z.enum(["affirmative", "negative", "neutral"]).default("neutral"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id

      // Verify user is a participant
      const debate = await ctx.db.debate.findUnique({
        where: { id: input.debateId },
        include: { participants: true },
      })

      if (!debate || !debate.participants.some((p) => p.userId === userId)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not a participant" })
      }

      const evidence = await ctx.db.evidence.create({
        data: {
          debateId: input.debateId,
          pinnedById: userId,
          claim: input.claim,
          source: input.source,
          side: input.side,
        },
        include: {
          pinnedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      })

      return evidence
    }),

  /**
   * Remove evidence from a debate
   */
  remove: protectedProcedure
    .input(z.object({ evidenceId: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id

      const evidence = await ctx.db.evidence.findUnique({
        where: { id: input.evidenceId },
        include: { debate: { include: { participants: true } } },
      })

      if (!evidence) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Evidence not found" })
      }

      // Only the pinner or a participant can remove
      const isParticipant = evidence.debate.participants.some((p) => p.userId === userId)
      const isPinner = evidence.pinnedById === userId

      if (!isParticipant && !isPinner) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" })
      }

      await ctx.db.evidence.delete({
        where: { id: input.evidenceId },
      })

      return { success: true }
    }),
})
