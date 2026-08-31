import { z } from "zod"
import { router, adminProcedure } from "@/server/trpc/context"
import { TRPCError } from "@trpc/server"

export const adminRouter = router({
  listUsers: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { limit, cursor } = input

      const users = await ctx.db.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
      })

      let nextCursor: string | undefined
      if (users.length > limit) {
        const next = users.pop()
        nextCursor = next?.id
      }

      return { users, nextCursor }
    }),

  updateUserRole: adminProcedure
    .input(
      z.object({
        userId: z.string().cuid(),
        role: z.enum(["user", "admin"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.db.user.update({
        where: { id: input.userId },
        data: { role: input.role },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      })

      return user
    }),

  deleteUser: adminProcedure
    .input(z.object({ userId: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      // Prevent deleting yourself
      if (input.userId === ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete your own account",
        })
      }

      await ctx.db.user.delete({
        where: { id: input.userId },
      })

      return { success: true }
    }),

  getAiUsage: adminProcedure
    .input(
      z.object({
        debateId: z.string().cuid().optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      const { debateId, limit } = input

      const where = debateId ? { debateId } : {}

      const usage = await ctx.db.aiUsage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          debateId: true,
          role: true,
          tokensUsed: true,
          model: true,
          createdAt: true,
        },
      })

      const totalTokens = usage.reduce((sum, u) => sum + u.tokensUsed, 0)

      return {
        usage,
        totalTokens,
        count: usage.length,
      }
    }),

  getStats: adminProcedure.query(async ({ ctx }) => {
    const [userCount, debateCount, messageCount, totalAiTokens] = await Promise.all([
      ctx.db.user.count(),
      ctx.db.debate.count(),
      ctx.db.message.count(),
      ctx.db.aiUsage.aggregate({
        _sum: { tokensUsed: true },
      }),
    ])

    return {
      userCount,
      debateCount,
      messageCount,
      totalAiTokens: totalAiTokens._sum.tokensUsed ?? 0,
    }
  }),
})
