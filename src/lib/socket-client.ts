import { io, Socket } from "socket.io-client"
import type { ServerToClientEvents, ClientToServerEvents } from "@/server/realtime/socket"

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null

export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> | null {
  return socket
}

export function initializeSocket(token?: string): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (socket) return socket

  const url = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"

  socket = io(url, {
    path: "/api/socket.io",
    addTrailingSlash: false,
    auth: token ? { token } : undefined,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  })

  socket.on("connect", () => {
    console.log("[Socket.io] Connected to server")
  })

  socket.on("connect_error", (error) => {
    console.error("[Socket.io] Connection error:", error)
  })

  socket.on("disconnect", (reason) => {
    console.log("[Socket.io] Disconnected:", reason)
  })

  return socket
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
