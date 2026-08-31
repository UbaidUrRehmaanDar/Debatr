"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { Message } from "ably"
import { getAblyClient, getChannel } from "@/lib/ably-client"
import type {
  DebateMessagePosted,
  DebateTurnUpdated,
  DebateTyping,
} from "@/server/realtime/types"

export function useAbly(debateId?: string) {
  const clientRef = useRef<ReturnType<typeof getAblyClient> | null>(null)
  const [client, setClient] = useState<ReturnType<typeof getAblyClient> | null>(null)

  useEffect(() => {
    if (!clientRef.current) {
      clientRef.current = getAblyClient()
      setClient(clientRef.current)
    } else {
      setClient(clientRef.current)
    }
  }, [])

  useEffect(() => {
    if (!debateId || !client) return

    const channel = getChannel(`debate:${debateId}`)

    channel.presence.enter().catch((err: Error) => {
      console.error("[Ably] Failed to enter presence:", err)
    })

    return () => {
      channel.presence.leave().catch(() => {})
    }
  }, [debateId, client])

  return client || getAblyClient()
}

export function useDebateMessages(
  debateId: string,
  onMessage?: (data: DebateMessagePosted) => void
) {
  const client = useAbly(debateId)

  useEffect(() => {
    if (!client) return

    const channel = getChannel(`debate:${debateId}`)

    const handler = (message: Message) => {
      onMessage?.(message.data as DebateMessagePosted)
    }

    channel.subscribe("debate:message-posted", handler)

    return () => {
      channel.unsubscribe("debate:message-posted", handler)
    }
  }, [client, debateId, onMessage])
}

export function useDebateTurn(
  debateId: string,
  onTurnUpdate?: (data: DebateTurnUpdated) => void
) {
  const client = useAbly(debateId)

  useEffect(() => {
    if (!client) return

    const channel = getChannel(`debate:${debateId}`)

    const handler = (message: Message) => {
      onTurnUpdate?.(message.data as DebateTurnUpdated)
    }

    channel.subscribe("debate:turn-updated", handler)

    return () => {
      channel.unsubscribe("debate:turn-updated", handler)
    }
  }, [client, debateId, onTurnUpdate])
}

export function useTypingIndicator(debateId: string) {
  const client = useAbly(debateId)

  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (!client) return
      const channel = getChannel(`debate:${debateId}`)
      channel.publish("debate:typing", {
        debateId,
        participantId: "",
        isTyping,
      } as DebateTyping)
    },
    [client, debateId]
  )

  return { setTyping }
}

export function usePresence(debateId: string, userId: string) {
  const client = useAbly(debateId)

  useEffect(() => {
    if (!client) return

    const channel = getChannel(`debate:${debateId}`)

    channel.presence.enter({ participantId: userId }).catch(() => {})

    const handleBeforeUnload = () => {
      channel.presence.leave().catch(() => {})
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      channel.presence.leave().catch(() => {})
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [client, debateId, userId])
}
