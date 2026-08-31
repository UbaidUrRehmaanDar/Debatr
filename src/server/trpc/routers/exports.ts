import { z } from "zod"
import { router, protectedProcedure } from "@/server/trpc/context"
import { TRPCError } from "@trpc/server"

export const exportsRouter = router({
  /**
   * Export a debate to JSON
   */
  exportDebate: protectedProcedure
    .input(
      z.object({
        debateId: z.string().cuid(),
        includeLawyerLogs: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id

      const debate = await ctx.db.debate.findUnique({
        where: { id: input.debateId },
        include: {
          participants: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
          messages: {
            include: { sender: { select: { id: true, name: true, email: true } } },
            orderBy: { createdAt: "asc" },
          },
          turns: { orderBy: { turnIndex: "asc" } },
          judgeReport: true,
          evidence: true,
          factChecks: true,
          moderationEvents: true,
          lawyerConversations: input.includeLawyerLogs
            ? {
                include: {
                  requests: true,
                },
              }
            : false,
        },
      })

      if (!debate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Debate not found" })
      }

      // Check if user is a participant
      if (!debate.participants.some((p) => p.userId === userId)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not a participant" })
      }

      // Create export record
      const exportData = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        debate: {
          id: debate.id,
          topic: debate.topic,
          description: debate.description,
          status: debate.status,
          maxRounds: debate.maxRounds,
          roundDurationMs: debate.roundDurationMs,
          maxCharactersPerTurn: debate.maxCharactersPerTurn,
          currentRound: debate.currentRound,
          createdAt: debate.createdAt.toISOString(),
          completedAt: debate.completedAt?.toISOString() ?? null,
        },
        participants: debate.participants.map((p) => ({
          id: p.id,
          side: p.side,
          displayName: p.displayName,
          userId: p.userId,
        })),
        turns: debate.turns.map((t) => ({
          id: t.id,
          roundIndex: t.roundIndex,
          turnIndex: t.turnIndex,
          side: t.side,
          status: t.status,
          startTime: t.startTime.toISOString(),
          endTime: t.endTime?.toISOString() ?? null,
        })),
        messages: debate.messages.map((m) => ({
          id: m.id,
          turnId: m.turnId,
          senderId: m.senderId,
          senderName: m.sender.name ?? m.sender.email,
          side: m.side,
          content: m.content,
          createdAt: m.createdAt.toISOString(),
        })),
        judgeReport: debate.judgeReport
          ? {
              outcome: debate.judgeReport.outcome,
              confidence: debate.judgeReport.confidence,
              verdict: debate.judgeReport.verdict,
              scores: debate.judgeReport.scores,
              strengths: debate.judgeReport.strengths,
              weaknesses: debate.judgeReport.weaknesses,
              feedback: debate.judgeReport.feedback,
              fallacies: debate.judgeReport.fallacies,
              conductFindings: debate.judgeReport.conductFindings,
              summary: debate.judgeReport.summary,
            }
          : null,
        evidence: debate.evidence.map((e) => ({
          id: e.id,
          side: e.side,
          claim: e.claim,
          source: e.source,
          pinnedById: e.pinnedById,
        })),
        factChecks: debate.factChecks.map((f) => ({
          id: f.id,
          messageId: f.messageId,
          verdict: f.verdict,
          claims: f.claims,
          createdAt: f.createdAt.toISOString(),
        })),
        moderationEvents: debate.moderationEvents.map((m) => ({
          id: m.id,
          category: m.category,
          action: m.action,
          explanation: m.explanation,
          createdAt: m.createdAt.toISOString(),
        })),
        lawyerLogs: input.includeLawyerLogs && debate.lawyerConversations
          ? (debate.lawyerConversations as unknown as Array<{ participantId: string; requests: Array<{ participantRequest: string; aiResponse: unknown; createdAt: Date }> }>).map((c) => ({
              participantId: c.participantId,
              requests: c.requests.map((r) => ({
                participantRequest: r.participantRequest,
                aiResponse: r.aiResponse,
                createdAt: r.createdAt.toISOString(),
              })),
            }))
          : undefined,
      }

      // Store export in database
      await ctx.db.export.create({
        data: {
          debateId: debate.id,
          createdById: userId,
          includeLawyerLogs: input.includeLawyerLogs,
          data: exportData as never,
        },
      })

      return exportData
    }),

  /**
   * List exports for a debate
   */
  listExports: protectedProcedure
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

      const exports = await ctx.db.export.findMany({
        where: { debateId: input.debateId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          includeLawyerLogs: true,
          createdAt: true,
        },
      })

      return exports
    }),

  /**
   * Import a debate from JSON (creates a new debate)
   */
  importDebate: protectedProcedure
    .input(
      z.object({
        data: z.any(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id
      const data = input.data

      // Validate structure
      if (!data.version || !data.debate || !data.participants || !data.messages) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid export format" })
      }

      // Create new debate from imported data
      const debate = await ctx.db.debate.create({
        data: {
          topic: `${data.debate.topic} (imported)`,
          description: data.debate.description,
          status: "completed",
          maxRounds: data.debate.maxRounds,
          roundDurationMs: data.debate.roundDurationMs,
          maxCharactersPerTurn: data.debate.maxCharactersPerTurn,
          currentRound: data.debate.currentRound,
          completedAt: new Date(),
          participants: {
            create: data.participants.map((p: { userId: string; side: string; displayName: string }) => ({
              userId: p.userId === data.participants[0].userId ? userId : p.userId,
              side: p.side,
              displayName: p.displayName,
            })),
          },
        },
      })

      // Create turns
      if (data.turns && data.turns.length > 0) {
        const participants = await ctx.db.debateParticipant.findMany({
          where: { debateId: debate.id },
        })

        await ctx.db.turn.createMany({
          data: data.turns.map((t: { roundIndex: number; turnIndex: number; side: string; startTime: string; endTime?: string; status: string }) => {
            const participant = participants.find((p) => p.side === t.side)
            return {
              debateId: debate.id,
              roundIndex: t.roundIndex,
              turnIndex: t.turnIndex,
              side: t.side,
              participantId: participant?.id ?? participants[0].id,
              startTime: new Date(t.startTime),
              endTime: t.endTime ? new Date(t.endTime) : null,
              status: t.status,
            }
          }),
        })
      }

      // Create messages
      if (data.messages && data.messages.length > 0) {
        await ctx.db.message.createMany({
          data: data.messages.map((m: { side: string; content: string; createdAt: string }) => ({
            debateId: debate.id,
            turnId: null,
            senderId: userId,
            side: m.side,
            content: m.content,
            createdAt: new Date(m.createdAt),
          })),
        })
      }

      // Store the import record
      await ctx.db.export.create({
        data: {
          sourceDebateId: data.debate.id,
          createdById: userId,
          includeLawyerLogs: false,
          data: data as never,
        },
      })

      return { debateId: debate.id, imported: true }
    }),
})
