import { NextResponse } from "next/server"
import Ably from "ably"
import { auth } from "@/server/auth"

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const apiKey = process.env.ABLY_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Ably not configured" }, { status: 500 })
  }

  const rest = new Ably.Rest(apiKey)

  const tokenRequest = await rest.auth.createTokenRequest({
    clientId: session.user.id,
  })

  return NextResponse.json(tokenRequest)
}
