"use client"

import { useEffect, useRef, useState } from "react"
import type { Socket } from "socket.io-client"
import type { ServerToClientEvents, ClientToServerEvents } from "@/server/realtime/socket"
import { initializeSocket, getSocket } from "@/lib/socket-client"

export function useSocket(debateId?: string) {
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null)
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null)

  useEffect(() => {
    // Initialize socket if not already initialized
    if (!socketRef.current) {
      socketRef.current = initializeSocket()
      setSocket(socketRef.current)
    } else {
      setSocket(socketRef.current)
    }

    // Join debate room if debateId provided
    if (debateId && socketRef.current) {
      socketRef.current.emit("debate:join", { debateId }, (error) => {
        if (error) {
          console.error("Failed to join debate room:", error)
        }
      })

      return () => {
        // Leave room on unmount
        socketRef.current?.emit("debate:leave", { debateId })
      }
    }
  }, [debateId])

  return socket || getSocket()
}

export function useDebateMessages(
  debateId: string,
  onMessage?: (data: Parameters<ServerToClientEvents["debate:message-posted"]>[0]) => void
) {
  const socket = useSocket(debateId)

  useEffect(() => {
    if (!socket) return

    const handleMessage = (data: Parameters<ServerToClientEvents["debate:message-posted"]>[0]) => {
      onMessage?.(data)
    }

    socket.on("debate:message-posted", handleMessage)

    return () => {
      socket.off("debate:message-posted", handleMessage)
    }
  }, [socket, onMessage])
}

export function useDebateTurn(
  debateId: string,
  onTurnUpdate?: (data: Parameters<ServerToClientEvents["debate:turn-updated"]>[0]) => void
) {
  const socket = useSocket(debateId)

  useEffect(() => {
    if (!socket) return

    const handleTurnUpdate = (data: Parameters<ServerToClientEvents["debate:turn-updated"]>[0]) => {
      onTurnUpdate?.(data)
    }

    socket.on("debate:turn-updated", handleTurnUpdate)

    return () => {
      socket.off("debate:turn-updated", handleTurnUpdate)
    }
  }, [socket, onTurnUpdate])
}

export function useTypingIndicator(debateId: string) {
  const socket = useSocket(debateId)

  const setTyping = (isTyping: boolean) => {
    socket?.emit("debate:typing", { debateId, isTyping })
  }

  return { setTyping }
}

export function usePresence(debateId: string, _userId: string) {
  const socket = useSocket(debateId)

  useEffect(() => {
    if (!socket) return

    // Notify of online status
    socket.emit("debate:presence", { debateId, status: "online" })

    // Notify of offline status on disconnect
    const handleBeforeUnload = () => {
      socket.emit("debate:presence", { debateId, status: "offline" })
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      socket.emit("debate:presence", { debateId, status: "offline" })
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [socket, debateId])
}
