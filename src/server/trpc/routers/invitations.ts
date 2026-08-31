import { z } from "zod"
import { router, protectedProcedure, adminProcedure } from "@/server/trpc/context"
import { TRPCError } from "@trpc/server"
import { randomBytes } from "crypto"

export const invitationsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const invitations = await ctx.db.invitation.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        usedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    return invitations
  }),

  create: adminProcedure
    .input(
      z.object({
        email: z.string().email().optional(),
        expiresInDays: z.number().min(1).max(365).default(7),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const code = randomBytes(8).toString("hex").toUpperCase()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + input.expiresInDays)

      const invitation = await ctx.db.invitation.create({
        data: {
          code,
          email: input.email ?? "",
          createdById: ctx.session.user.id,
          expiresAt,
        },
      })

      return invitation
    }),

  revoke: adminProcedure
    .input(z.object({ invitationId: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      const invitation = await ctx.db.invitation.findUnique({
        where: { id: input.invitationId },
      })

      if (!invitation) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invitation not found" })
      }

      if (invitation.usedById) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot revoke an invitation that has already been used",
        })
      }

      await ctx.db.invitation.delete({
        where: { id: input.invitationId },
      })

      return { success: true }
    }),
})
