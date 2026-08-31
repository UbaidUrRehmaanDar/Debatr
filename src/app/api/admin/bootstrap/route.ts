import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/server/db"

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  // Only allow bootstrap if no users exist
  const userCount = await prisma.user.count()
  if (userCount > 0) {
    return NextResponse.json(
      { error: "Bootstrap already completed. Users exist." },
      { status: 403 }
    )
  }

  const body = await request.json()
  const { email, password, name } = body

  if (!email || !password || !name) {
    return NextResponse.json(
      { error: "Missing required fields: email, password, name" },
      { status: 400 }
    )
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    )
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const admin = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role: "admin",
      emailVerified: new Date(),
    },
  })

  return NextResponse.json({
    message: "Admin user created successfully",
    user: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
  })
}
