import { Server as HTTPServer } from "http"
import { Server as SocketIOServer } from "socket.io"

declare global {
  var io: SocketIOServer | undefined
}

export interface ServerToClientEvents {
  "debate:message-posted": (data: {
    messageId: string
    debateId: string
    side: string
    content: string
    participantId: string
    turnNumber: number
    timestamp: Date
  }) => void
  "debate:turn-updated": (data: {
    debateId: string
    turnNumber: number
    currentSide: string
    timeRemainingMs: number
    isActive: boolean
  }) => void
  "debate:participant-presence": (data: {
    debateId: string
    participantId: string
    isOnline: boolean
    lastSeen: Date
  }) => void
  "debate:typing": (data: {
    debateId: string
    participantId: string
    isTyping: boolean
  }) => void
  "debate:judge-report": (data: {
    debateId: string
    reportId: string
    outcome: string
    confidence: number
    summary: string
  }) => void
  "debate:lawyer-advice": (data: {
    debateId: string
    requestId: string
    participantId: string
  }) => void
  "debate:status-changed": (data: {
    debateId: string
    status: string
    updatedAt: Date
  }) => void
  "error": (data: { message: string }) => void
}

export interface ClientToServerEvents {
  "debate:join": (data: { debateId: string }, callback?: (error?: Error) => void) => void
  "debate:leave": (data: { debateId: string }, callback?: (error?: Error) => void) => void
  "debate:typing": (data: { debateId: string; isTyping: boolean }) => void
  "debate:presence": (data: { debateId: string; status: "online" | "offline" }) => void
}

let io: SocketIOServer<ClientToServerEvents, ServerToClientEvents> | null = null

export function getIO(): SocketIOServer<ClientToServerEvents, ServerToClientEvents> | null {
  return io
}

export async function initializeSocket(
  httpServer: HTTPServer
): Promise<SocketIOServer<ClientToServerEvents, ServerToClientEvents>> {
  if (io) return io

  io = new SocketIOServer(httpServer, {
    path: "/api/socket.io",
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      credentials: true,
    },
    transports: ["websocket", "polling"],
  })

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      // For now, we'll allow connections without full auth
      // In production, verify NextAuth session token
      const sessionToken = socket.handshake.auth.token
      if (sessionToken) {
        // TODO: Verify token with NextAuth
        socket.data.authenticated = true
      } else {
        socket.data.authenticated = false
      }
      next()
    } catch (error) {
      next(error as Error)
    }
  })

  // Connection handler
  io.on("connection", (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`)

    socket.on("debate:join", (data, callback) => {
      socket.join(`debate:${data.debateId}`)
      console.log(`[Socket.io] ${socket.id} joined debate ${data.debateId}`)
      callback?.()
    })

    socket.on("debate:leave", (data, callback) => {
      socket.leave(`debate:${data.debateId}`)
      console.log(`[Socket.io] ${socket.id} left debate ${data.debateId}`)
      callback?.()
    })

    socket.on("debate:typing", (data) => {
      socket.to(`debate:${data.debateId}`).emit("debate:typing", {
        debateId: data.debateId,
        participantId: socket.data.participantId || socket.id,
        isTyping: data.isTyping,
      })
    })

    socket.on("debate:presence", (data) => {
      socket.to(`debate:${data.debateId}`).emit("debate:participant-presence", {
        debateId: data.debateId,
        participantId: socket.data.participantId || socket.id,
        isOnline: data.status === "online",
        lastSeen: new Date(),
      })
    })

    socket.on("disconnect", () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`)
    })
  })

  return io
}

export function emitDebateMessage(
  debateId: string,
  messageData: Parameters<ServerToClientEvents["debate:message-posted"]>[0]
): void {
  io?.to(`debate:${debateId}`).emit("debate:message-posted", messageData)
}

export function emitTurnUpdate(
  debateId: string,
  turnData: Parameters<ServerToClientEvents["debate:turn-updated"]>[0]
): void {
  io?.to(`debate:${debateId}`).emit("debate:turn-updated", turnData)
}

export function emitJudgeReport(
  debateId: string,
  reportData: Parameters<ServerToClientEvents["debate:judge-report"]>[0]
): void {
  io?.to(`debate:${debateId}`).emit("debate:judge-report", reportData)
}

export function emitLawyerAdvice(
  debateId: string,
  adviceData: Parameters<ServerToClientEvents["debate:lawyer-advice"]>[0]
): void {
  io?.to(`debate:${debateId}`).emit("debate:lawyer-advice", adviceData)
}

export function emitStatusChange(
  debateId: string,
  statusData: Parameters<ServerToClientEvents["debate:status-changed"]>[0]
): void {
  io?.to(`debate:${debateId}`).emit("debate:status-changed", statusData)
}
