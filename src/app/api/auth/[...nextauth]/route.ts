// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/server/auth"

export const runtime = 'nodejs'

export const { GET, POST } = handlers
