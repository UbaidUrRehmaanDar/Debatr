/**
 * Socket.io has been replaced by Ably for real-time features.
 *
 * - Server-to-client push: use src/server/realtime/ably-emit.ts
 * - Client subscriptions: use src/lib/hooks/useAbly.ts
 * - Ably client: use src/lib/ably-client.ts
 * - Token auth: use src/app/api/ably-token/route.ts
 *
 * This file is kept for backward compatibility only.
 * All types have moved to src/server/realtime/types.ts
 */

export {
  emitDebateMessage,
  emitTurnUpdate,
  emitJudgeReport,
  emitLawyerAdvice,
  emitStatusChange,
  emitTyping,
  emitPresence,
} from "./ably-emit"
