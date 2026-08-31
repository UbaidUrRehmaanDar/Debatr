export { getAblyClient as getSocket, disconnectAbly as disconnectSocket } from "@/lib/ably-client"

export function initializeSocket(_token?: string) {
  return require("@/lib/ably-client").getAblyClient()
}
