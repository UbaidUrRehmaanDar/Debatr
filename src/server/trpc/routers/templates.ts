import { z } from "zod"
import { router, protectedProcedure, adminProcedure } from "@/server/trpc/context"
import { TRPCError } from "@trpc/server"

export const templatesRouter = router({
  /**
   * List all debate templates
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const templates = await ctx.db.debateTemplate.findMany({
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    })

    return templates
  }),

  /**
   * Get a single template
   */
  get: protectedProcedure
    .input(z.object({ templateId: z.string().cuid() }))
    .query(async ({ input, ctx }) => {
      const template = await ctx.db.debateTemplate.findUnique({
        where: { id: input.templateId },
      })

      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" })
      }

      return template
    }),

  /**
   * Create a new template (admin only)
   */
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        topic: z.string().min(1).max(500),
        description: z.string().max(2000).optional(),
        category: z.enum([
          "philosophy",
          "politics",
          "technology",
          "science",
          "ethics",
          "education",
          "economics",
          "culture",
          "other",
        ]),
        maxRounds: z.number().int().min(1).max(20).default(4),
        roundDurationMs: z.number().int().min(60000).max(1800000).default(300000),
        maxCharactersPerTurn: z.number().int().min(100).max(10000).default(2000),
        isDefault: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const template = await ctx.db.debateTemplate.create({
        data: input,
      })

      return template
    }),

  /**
   * Update a template (admin only)
   */
  update: adminProcedure
    .input(
      z.object({
        templateId: z.string().cuid(),
        name: z.string().min(1).max(100).optional(),
        topic: z.string().min(1).max(500).optional(),
        description: z.string().max(2000).optional(),
        category: z
          .enum([
            "philosophy",
            "politics",
            "technology",
            "science",
            "ethics",
            "education",
            "economics",
            "culture",
            "other",
          ])
          .optional(),
        maxRounds: z.number().int().min(1).max(20).optional(),
        roundDurationMs: z.number().int().min(60000).max(1800000).optional(),
        maxCharactersPerTurn: z.number().int().min(100).max(10000).optional(),
        isDefault: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { templateId, ...data } = input

      const template = await ctx.db.debateTemplate.update({
        where: { id: templateId },
        data,
      })

      return template
    }),

  /**
   * Delete a template (admin only)
   */
  delete: adminProcedure
    .input(z.object({ templateId: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db.debateTemplate.delete({
        where: { id: input.templateId },
      })

      return { success: true }
    }),

  /**
   * Set a template as default (admin only)
   */
  setDefault: adminProcedure
    .input(z.object({ templateId: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      // First, unset all defaults
      await ctx.db.debateTemplate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      })

      // Then set this one as default
      const template = await ctx.db.debateTemplate.update({
        where: { id: input.templateId },
        data: { isDefault: true },
      })

      return template
    }),
})
