/**
 * Email service - Resend integration
 */

import { Resend } from "resend"
import { getEnv } from "./lib/env"

let resendClient: Resend | null = null

function getResend(): Resend | null {
  const key = getEnv().RESEND_API_KEY
  if (!key || key === "re_xxx_replace_with_your_resend_api_key") return null
  if (!resendClient) resendClient = new Resend(key)
  return resendClient
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const resend = getResend()
  if (!resend) {
    console.log("[Email] Verification link (no Resend key):", buildVerifyLink(token))
    return
  }

  const link = buildVerifyLink(token)
  const env = getEnv()

  await resend.emails.send({
    from: env.EMAIL_FROM,
    to: email,
    subject: "Verify your Debatr account",
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Welcome to Debatr</h2>
        <p>Click the link below to verify your email address:</p>
        <a href="${link}" style="display: inline-block; padding: 12px 24px; background: #06b6d4; color: #000; text-decoration: none; border-radius: 8px; font-weight: 600;">Verify Email</a>
        <p style="margin-top: 16px; color: #666; font-size: 14px;">This link expires in 24 hours.</p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resend = getResend()
  if (!resend) {
    console.log("[Email] Password reset link (no Resend key):", buildResetLink(token))
    return
  }

  const link = buildResetLink(token)
  const env = getEnv()

  await resend.emails.send({
    from: env.EMAIL_FROM,
    to: email,
    subject: "Reset your Debatr password",
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${link}" style="display: inline-block; padding: 12px 24px; background: #06b6d4; color: #000; text-decoration: none; border-radius: 8px; font-weight: 600;">Reset Password</a>
        <p style="margin-top: 16px; color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
  })
}

function buildVerifyLink(token: string): string {
  const base = getEnv().NEXTAUTH_URL
  return `${base}/verify-email?token=${encodeURIComponent(token)}`
}

function buildResetLink(token: string): string {
  const base = getEnv().NEXTAUTH_URL
  return `${base}/reset-password?token=${encodeURIComponent(token)}`
}
