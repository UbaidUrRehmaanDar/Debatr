"use server"

import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { z } from "zod"
import { randomBytes } from "crypto"

import { prisma } from "@/server/db"
import { sendVerificationEmail, sendPasswordResetEmail } from "@/server/email"

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function signUpAction(formData: FormData) {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  }

  const parsed = signUpSchema.safeParse(raw)
  if (!parsed.success) {
    redirect("/sign-up?error=invalid-input")
  }

  const { name, email, password } = parsed.data

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    redirect("/sign-up?error=email-exists")
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "user",
    },
  })

  // Send verification email
  const token = randomBytes(32).toString("hex")
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  })
  await sendVerificationEmail(email, token)

  redirect("/sign-in?registered=1")
}

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
})

export async function forgotPasswordAction(formData: FormData) {
  const raw = {
    email: String(formData.get("email") ?? ""),
  }

  const parsed = forgotPasswordSchema.safeParse(raw)
  if (!parsed.success) {
    redirect("/forgot-password?error=invalid-email")
  }

  const { email } = parsed.data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    // Don't reveal whether the email exists
    redirect("/forgot-password?sent=1")
  }

  const token = randomBytes(32).toString("hex")
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  })

  await sendPasswordResetEmail(email, token)
  redirect("/forgot-password?sent=1")
}

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function resetPasswordAction(formData: FormData) {
  const raw = {
    token: String(formData.get("token") ?? ""),
    password: String(formData.get("password") ?? ""),
  }

  const parsed = resetPasswordSchema.safeParse(raw)
  if (!parsed.success) {
    redirect("/reset-password?error=invalid-input")
  }

  const { token, password } = parsed.data

  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  })

  if (!verificationToken || verificationToken.expires < new Date()) {
    redirect("/reset-password?error=invalid-token")
  }

  const user = await prisma.user.findUnique({
    where: { email: verificationToken.identifier },
  })

  if (!user) {
    redirect("/reset-password?error=invalid-token")
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  })

  // Delete the used token
  await prisma.verificationToken.delete({
    where: { token },
  })

  redirect("/sign-in?reset=1")
}

export async function verifyEmailAction(formData: FormData) {
  const token = String(formData.get("token") ?? "")

  if (!token) {
    redirect("/verify-email?error=invalid-token")
  }

  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  })

  if (!verificationToken || verificationToken.expires < new Date()) {
    redirect("/verify-email?error=invalid-token")
  }

  const user = await prisma.user.findUnique({
    where: { email: verificationToken.identifier },
  })

  if (!user) {
    redirect("/verify-email?error=invalid-token")
  }

  // Mark email as verified
  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date() },
  })

  // Delete the used token
  await prisma.verificationToken.delete({
    where: { token },
  })

  redirect("/sign-in?verified=1")
}
