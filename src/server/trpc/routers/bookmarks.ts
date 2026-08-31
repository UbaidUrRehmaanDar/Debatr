import { z } from "zod"
import { router, protectedProcedure } from "@/server/trpc/context"
import { TRPCError } from "@trpc/server"

export const bookmarksRouter = router({
  /**
   * Toggle bookmark for a debate
   */
  toggle: protectedProcedure
    .input(z.object({ debateId: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id

      // Check if debate exists and user is participant
      const debate = await ctx.db.debate.findUnique({
        where: { id: input.debateId },
        include: { participants: true },
      })

      if (!debate || !debate.participants.some((p) => p.userId === userId)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not a participant" })
      }

      // Check if already bookmarked
      const existing = await ctx.db.bookmark.findUnique({
        where: {
          userId_debateId: {
            userId,
            debateId: input.debateId,
          },
        },
      })

      if (existing) {
        // Remove bookmark
        await ctx.db.bookmark.delete({
          where: { id: existing.id },
        })
        return { bookmarked: false }
      } else {
        // Add bookmark
        await ctx.db.bookmark.create({
          data: {
            userId,
            debateId: input.debateId,
          },
        })
        return { bookmarked: true }
      }
    }),

  /**
   * List bookmarked debates
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    const bookmarks = await ctx.db.bookmark.findMany({
      where: { userId },
      include: {
        debate: {
          include: {
            participants: {
              include: { user: { select: { id: true, name: true, email: true } } },
            },
            judgeReport: {
              select: { outcome: true, confidence: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return bookmarks
  }),

  /**
   * Check if a debate is bookmarked
   */
  isBookmarked: protectedProcedure
    .input(z.object({ debateId: z.string().cuid() }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.session.user.id

      const bookmark = await ctx.db.bookmark.findUnique({
        where: {
          userId_debateId: {
            userId,
            debateId: input.debateId,
          },
        },
      })

      return { bookmarked: !!bookmark }
    }),
})
