/**
 * Debate CRUD and management procedures
 */

import { z } from "zod"
import { router, protectedProcedure } from "@/server/trpc/context"
import { TRPCError } from "@trpc/server"
import { getLawyerAdvice } from "@/server/ai/lawyer"
import { evaluateDebate } from "@/server/ai/judge"
import { factCheckClaim } from "@/server/ai/fact-checker"
import { checkDebateBudget } from "@/server/ai/budget"
import { closeTurnAndAdvance, planTurns } from "@/server/debate-engine/engine"
import { canTransition, type DebateStatus } from "@/server/debate-engine/state"
import {
  emitDebateMessage,
  emitTurnUpdate,
  emitStatusChange,
} from "@/server/realtime/ably-emit"

export const debatesRouter = router({
  /**
   * List debates for the current user
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const userId = ctx.session.user.id
      const { limit, cursor } = input

      const debates = await ctx.db.debate.findMany({
        where: {
          participants: {
            some: { userId },
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: { id: true, email: true, name: true },
              },
            },
          },
          judgeReport: {
            select: { outcome: true, confidence: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
      })

      let nextCursor: string | undefined
      if (debates.length > limit) {
        const next = debates.pop()
        nextCursor = next?.id
      }

      return { debates, nextCursor }
    }),

  /**
   * Get a single debate by ID
   */
  get: protectedProcedure
    .input(z.object({ debateId: z.string().cuid() }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.session.user.id
      const debate = await ctx.db.debate.findUnique({
        where: { id: input.debateId },
        include: {
          participants: {
            include: {
              user: {
                select: { id: true, email: true, name: true },
              },
            },
          },
          turns: {
            orderBy: { turnIndex: "asc" },
          },
          messages: {
            orderBy: { createdAt: "asc" },
            include: {
              sender: { select: { id: true, email: true, name: true } },
            },
          },
          judgeReport: true,
        },
      })

      if (!debate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Debate not found" })
      }

      // Check if user is a participant
      const isParticipant = debate.participants.some((p) => p.userId === userId)
      if (!isParticipant) {
        // Could allow spectating completed debates later
        throw new TRPCError({ code: "FORBIDDEN", message: "Not a participant" })
      }

      return debate
    }),

  /**
   * Create a new debate
   */
  create: protectedProcedure
    .input(
      z.object({
        topic: z.string().min(1).max(500),
        description: z.string().max(2000).optional(),
        opponentEmail: z.string().email(),
        maxRounds: z.number().int().min(1).max(20).default(4),
        roundDurationMs: z.number().int().min(60000).max(1800000).default(300000), // 1 min to 30 min
        maxCharactersPerTurn: z.number().int().min(100).max(10000).default(2000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id
      const user = ctx.session.user

      // Check if opponent exists
      const opponent = await ctx.db.user.findUnique({
        where: { email: input.opponentEmail },
      })

      if (!opponent) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Opponent not found. They must have an account.",
        })
      }

      if (opponent.id === userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot debate yourself.",
        })
      }

      // Create the debate and participants
      const debate = await ctx.db.debate.create({
        data: {
          topic: input.topic,
          description: input.description,
          status: "waiting_for_participants",
          maxRounds: input.maxRounds,
          roundDurationMs: input.roundDurationMs,
          maxCharactersPerTurn: input.maxCharactersPerTurn,
          participants: {
            create: [
              {
                userId,
                side: "affirmative",
                displayName: user.name ?? user.email,
              },
              {
                userId: opponent.id,
                side: "negative",
                displayName: opponent.name ?? opponent.email,
              },
            ],
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: { id: true, email: true, name: true },
              },
            },
          },
        },
      })

      return debate
    }),

  /**
   * Join/accept a debate (opponent accepts the invitation)
   */
  join: protectedProcedure
    .input(z.object({ debateId: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id
      const debate = await ctx.db.debate.findUnique({
        where: { id: input.debateId },
        include: {
          participants: true,
        },
      })

      if (!debate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Debate not found" })
      }

      if (debate.status !== "waiting_for_participants") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Debate is not waiting for participants",
        })
      }

      // Check if user is an invited participant
      const participant = debate.participants.find((p) => p.userId === userId)
      if (!participant) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not invited to this debate",
        })
      }

      // Generate turns and transition to active
      const turnSequence = planTurns(debate.maxRounds)

      // Create all turns upfront
      await ctx.db.turn.createMany({
        data: turnSequence.map((t: { roundIndex: number; turnIndex: number; side: string }, idx: number) => {
          const participant = debate.participants.find((p) => p.side === t.side)!
          return {
            debateId: debate.id,
            roundIndex: t.roundIndex,
            turnIndex: t.turnIndex,
            side: t.side,
            participantId: participant.id,
            startTime: idx === 0 ? new Date() : new Date(Date.now() + idx * debate.roundDurationMs),
            status: idx === 0 ? "active" : "pending",
          }
        }),
      })

      // Update debate to active
      const updatedDebate = await ctx.db.debate.update({
        where: { id: debate.id },
        data: {
          status: "active",
          currentRound: 0,
        },
        include: {
          participants: {
            include: {
              user: {
                select: { id: true, email: true, name: true },
              },
            },
          },
          turns: {
            orderBy: { turnIndex: "asc" },
          },
        },
      })

      return updatedDebate
    }),

  /**
   * Post a message during a turn
   */
  postMessage: protectedProcedure
    .input(
      z.object({
        debateId: z.string().cuid(),
        content: z.string().min(1).max(10000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id

      const debate = await ctx.db.debate.findUnique({
        where: { id: input.debateId },
        include: {
          participants: true,
          turns: {
            where: { status: "active" },
            take: 1,
          },
        },
      })

      if (!debate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Debate not found" })
      }

      if (debate.status !== "active") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Debate is not active",
        })
      }

      // Find user's side
      const userParticipant = debate.participants.find((p) => p.userId === userId)
      if (!userParticipant) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a participant in this debate",
        })
      }

      // Check active turn
      const activeTurn = debate.turns[0]
      if (!activeTurn) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No active turn",
        })
      }

      // Check if it's user's turn
      if (activeTurn.participantId !== userParticipant.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "It is not your turn",
        })
      }

      // Check character limit
      if (input.content.length > debate.maxCharactersPerTurn) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Message exceeds ${debate.maxCharactersPerTurn} characters`,
        })
      }

      // Create message
      const message = await ctx.db.message.create({
        data: {
          debateId: debate.id,
          turnId: activeTurn.id,
          senderId: userId,
          side: userParticipant.side,
          content: input.content,
        },
        include: {
          sender: { select: { id: true, email: true, name: true } },
        },
      })

      // Use debate engine to close turn and advance
      const result = await closeTurnAndAdvance(debate.id, activeTurn.id)

      // Emit realtime events
      emitDebateMessage(debate.id, {
        messageId: message.id,
        debateId: debate.id,
        side: userParticipant.side,
        content: input.content,
        participantId: userParticipant.id,
        turnNumber: activeTurn.turnIndex,
        timestamp: message.createdAt,
      })

      if (result.completed) {
        emitStatusChange(debate.id, {
          debateId: debate.id,
          status: "judging",
          updatedAt: new Date(),
        })
      } else if (result.nextTurn) {
        emitTurnUpdate(debate.id, {
          debateId: debate.id,
          turnNumber: result.nextTurn.turnIndex,
          currentSide: result.nextTurn.side,
          timeRemainingMs: debate.roundDurationMs,
          isActive: true,
        })
      }

      return { message, turnAdvanced: result.completed, nextTurnId: result.nextTurn?.id ?? null }
    }),

  /**
   * Move debate to judging phase
   */
  enterJudging: protectedProcedure
    .input(z.object({ debateId: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id

      const debate = await ctx.db.debate.findUnique({
        where: { id: input.debateId },
        include: {
          participants: true,
          turns: true,
        },
      })

      if (!debate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Debate not found" })
      }

      // Check if user is a participant
      const isParticipant = debate.participants.some((p) => p.userId === userId)
      if (!isParticipant) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only participants can move to judging",
        })
      }

      if (debate.status !== "active") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Debate is not active",
        })
      }

      const updatedDebate = await ctx.db.debate.update({
        where: { id: debate.id },
        data: { status: "judging" },
        include: {
          participants: {
            include: {
              user: {
                select: { id: true, email: true, name: true },
              },
            },
          },
        },
      })

      return updatedDebate
    }),

  /**
   * Cancel a debate
   */
  cancel: protectedProcedure
    .input(
      z.object({
        debateId: z.string().cuid(),
        reason: z.string().max(1000).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id

      const debate = await ctx.db.debate.findUnique({
        where: { id: input.debateId },
        include: {
          participants: true,
        },
      })

      if (!debate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Debate not found" })
      }

      const isParticipant = debate.participants.some((p) => p.userId === userId)
      if (!isParticipant) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only participants can cancel",
        })
      }

      if (debate.status === "completed" || debate.status === "cancelled") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Debate is already finished",
        })
      }

      const updatedDebate = await ctx.db.debate.update({
        where: { id: debate.id },
        data: { status: "cancelled" },
      })

      // Log if reason provided
      if (input.reason) {
        await ctx.db.moderationEvent.create({
          data: {
            debateId: debate.id,
            userId,
            category: "other",
            action: "none",
            explanation: input.reason,
          },
        })
      }

      return updatedDebate
    }),

  /**
   * Request Lawyer advice (private per-participant coaching)
   */
  requestLawyer: protectedProcedure
    .input(
      z.object({
        debateId: z.string().cuid(),
        request: z.string().min(1).max(2000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id

      const debate = await ctx.db.debate.findUnique({
        where: { id: input.debateId },
        include: {
          participants: { include: { user: { select: { id: true, email: true, name: true } } } },
          messages: { include: { sender: { select: { id: true, email: true, name: true } } } },
        },
      })

      if (!debate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Debate not found" })
      }

      // Find user's side
      const userParticipant = debate.participants.find((p) => p.userId === userId)
      if (!userParticipant) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not a participant" })
      }

      // Check budget
      const budget = await checkDebateBudget(debate.id)
      if (!budget.allowed) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `AI budget exhausted: ${budget.tokensUsed}/${budget.limit} tokens used`,
        })
      }

      // Call AI Lawyer (handles conversation + request storage internally)
      const advice = await getLawyerAdvice(
        debate.id,
        userId,
        {
          debateTopic: debate.topic,
          participantSide: userParticipant.side as "affirmative" | "negative",
          participantName: userParticipant.user.name ?? userParticipant.user.email,
          publicTranscript: debate.messages
            .filter((m) => m.side !== "system")
            .map((m) => ({
              side: m.side as "affirmative" | "negative",
              message: m.content,
            }))
            .filter((m): m is { side: "affirmative" | "negative"; message: string } =>
              m.side === "affirmative" || m.side === "negative"
            ),
          pinnedEvidence: [],
        },
        input.request
      )

      return {
        advice: advice.advice,
        tokensUsed: advice.tokensUsed,
      }
    }),

  /**
   * Generate Judge report for a completed debate
   */
  generateJudgeReport: protectedProcedure
    .input(z.object({ debateId: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      const debate = await ctx.db.debate.findUnique({
        where: { id: input.debateId },
        include: {
          participants: { include: { user: { select: { id: true, email: true, name: true } } } },
          messages: { include: { sender: { select: { id: true, email: true, name: true } } } },
          turns: true,
        },
      })

      if (!debate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Debate not found" })
      }

      if (debate.status !== "judging" && debate.status !== "completed") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Debate must be in judging phase" })
      }

      // Check if report already exists
      if (debate.judgeReportId) {
        const existing = await ctx.db.judgeReport.findUnique({
          where: { id: debate.judgeReportId },
        })
        if (existing) return existing
      }

      // Call AI Judge
      const { report, tokensUsed } = await evaluateDebate(debate as unknown as Parameters<typeof evaluateDebate>[0])

      // Store report
      const judgeReport = await ctx.db.judgeReport.create({
        data: {
          debateId: debate.id,
          outcome: report.outcome,
          confidence: report.confidence,
          verdict: report.verdict,
          scores: report.scores as never,
          strengths: report.strengths as never,
          weaknesses: report.weaknesses as never,
          feedback: report as never,
          fallacies: report.fallacies as never,
          conductFindings: report.conductFindings as never,
          summary: report.summary,
          tokensUsed,
        },
      })

      // Update debate to completed
      await ctx.db.debate.update({
        where: { id: debate.id },
        data: {
          status: "completed",
          judgeReportId: judgeReport.id,
          completedAt: new Date(),
        },
      })

      return judgeReport
    }),

  /**
   * Pause an active debate
   */
  pause: protectedProcedure
    .input(z.object({ debateId: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id

      const debate = await ctx.db.debate.findUnique({
        where: { id: input.debateId },
        include: { participants: true },
      })

      if (!debate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Debate not found" })
      }

      if (!debate.participants.some((p) => p.userId === userId)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only participants can pause" })
      }

      if (!canTransition(debate.status as DebateStatus, "paused")) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot pause debate in current state" })
      }

      const updated = await ctx.db.debate.update({
        where: { id: debate.id },
        data: { status: "paused" },
      })

      emitStatusChange(debate.id, {
        debateId: debate.id,
        status: "paused",
        updatedAt: new Date(),
      })

      return updated
    }),

  /**
   * Resume a paused debate
   */
  resume: protectedProcedure
    .input(z.object({ debateId: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id

      const debate = await ctx.db.debate.findUnique({
        where: { id: input.debateId },
        include: { participants: true },
      })

      if (!debate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Debate not found" })
      }

      if (!debate.participants.some((p) => p.userId === userId)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only participants can resume" })
      }

      if (!canTransition(debate.status as DebateStatus, "active")) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot resume debate in current state" })
      }

      const updated = await ctx.db.debate.update({
        where: { id: debate.id },
        data: { status: "active" },
      })

      emitStatusChange(debate.id, {
        debateId: debate.id,
        status: "active",
        updatedAt: new Date(),
      })

      return updated
    }),

  /**
   * Request to raise hand (e.g., for a point of order)
   */
  raiseHand: protectedProcedure
    .input(
      z.object({
        debateId: z.string().cuid(),
        reason: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id

      const debate = await ctx.db.debate.findUnique({
        where: { id: input.debateId },
        include: { participants: true },
      })

      if (!debate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Debate not found" })
      }

      const participant = debate.participants.find((p) => p.userId === userId)
      if (!participant) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not a participant" })
      }

      if (debate.status !== "active") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Debate is not active" })
      }

      const request = await ctx.db.raiseHandRequest.create({
        data: {
          debateId: debate.id,
          requesterId: userId,
          side: participant.side,
          reason: input.reason,
        },
      })

      return request
    }),

  /**
   * Decide on a raise-hand request (grant or decline)
   */
  decideRaiseHand: protectedProcedure
    .input(
      z.object({
        requestId: z.string().cuid(),
        decision: z.enum(["granted", "declined"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id

      const request = await ctx.db.raiseHandRequest.findUnique({
        where: { id: input.requestId },
        include: { debate: { include: { participants: true } } },
      })

      if (!request) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Request not found" })
      }

      if (request.status !== "pending") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Request already decided" })
      }

      // Only the other participant can decide
      const otherParticipant = request.debate.participants.find((p) => p.userId !== userId)
      if (!otherParticipant || otherParticipant.id !== request.requesterId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the other participant can decide" })
      }

      const updated = await ctx.db.raiseHandRequest.update({
        where: { id: input.requestId },
        data: {
          status: input.decision,
          decidedById: userId,
          decidedAt: new Date(),
        },
      })

      return updated
    }),

  /**
   * Fact-check a specific message from the debate
   */
  factCheckMessage: protectedProcedure
    .input(
      z.object({
        debateId: z.string().cuid(),
        messageId: z.string().cuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id

      const debate = await ctx.db.debate.findUnique({
        where: { id: input.debateId },
        include: { participants: true },
      })

      if (!debate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Debate not found" })
      }

      // Check if user is a participant
      if (!debate.participants.some((p) => p.userId === userId)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not a participant" })
      }

      // Get the message
      const message = await ctx.db.message.findFirst({
        where: {
          id: input.messageId,
          debateId: input.debateId,
        },
      })

      if (!message) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Message not found" })
      }

      // Check if already fact-checked
      const existing = await ctx.db.factCheck.findFirst({
        where: { messageId: input.messageId },
      })

      if (existing) {
        return existing
      }

      // Check budget
      const budget = await checkDebateBudget(debate.id)
      if (!budget.allowed) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `AI budget exhausted: ${budget.tokensUsed}/${budget.limit} tokens used`,
        })
      }

      // Run fact-check
      const { result, tokensUsed } = await factCheckClaim(
        debate.id,
        message.id,
        message.content,
        debate.topic
      )

      return {
        id: result.verdict,
        messageId: message.id,
        debateId: debate.id,
        verdict: result.verdict,
        confidence: result.confidence,
        reasoning: result.reasoning,
        sources: result.sources,
        tokensUsed,
      }
    }),
})
