import { router, publicProcedure, protectedProcedure } from "@/server/trpc/context"
import { debatesRouter } from "@/server/trpc/routers/debates"
import { adminRouter } from "@/server/trpc/routers/admin"
import { invitationsRouter } from "@/server/trpc/routers/invitations"
import { exportsRouter } from "@/server/trpc/routers/exports"
import { bookmarksRouter } from "@/server/trpc/routers/bookmarks"
import { templatesRouter } from "@/server/trpc/routers/templates"
import { legalAiRouter } from "@/server/trpc/routers/legal-ai"
import { evidenceRouter } from "@/server/trpc/routers/evidence"

export const appRouter = router({
  health: publicProcedure.query(() => ({
    ok: true,
    name: "Debatr",
    phase: "Phase 5 in progress",
    timestamp: new Date().toISOString(),
  })),

  appInfo: publicProcedure.query(() => ({
    name: "Debatr",
    status: "Phase 5: Realtime & Frontend",
    environment: process.env.NODE_ENV ?? "development",
  })),

  me: protectedProcedure.query(({ ctx }) => ({
    id: ctx.session.user.id,
    email: ctx.session.user.email,
    name: ctx.session.user.name ?? null,
    role: ctx.session.user.role,
  })),

  debates: debatesRouter,
  admin: adminRouter,
  invitations: invitationsRouter,
  exports: exportsRouter,
  bookmarks: bookmarksRouter,
  templates: templatesRouter,
  legalAi: legalAiRouter,
  evidence: evidenceRouter,
})

export type AppRouter = typeof appRouter
