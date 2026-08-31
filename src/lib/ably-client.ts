import * as Ably from "ably"

let client: Ably.Realtime | null = null

export function getAblyClient(): Ably.Realtime {
  if (client) return client

  client = new Ably.Realtime({
    authUrl: "/api/ably-token",
    transports: ["web_socket"],
    closeOnUnload: true,
  })

  client.connection.on("connected", () => {
    console.log("[Ably] Connected to server")
  })

  client.connection.on("failed", (err) => {
    console.error("[Ably] Connection failed:", err)
  })

  return client
}

export function getChannel(name: string) {
  return getAblyClient().channels.get(name)
}

export function disconnectAbly(): void {
  if (client) {
    client.close()
    client = null
  }
}
