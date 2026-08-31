"use client"

import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { resetPasswordAction } from "@/app/actions/auth"
import { Suspense, type FormEvent, useState } from "react"

function ResetPasswordFormInner() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const error = searchParams.get("error")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const errorMessage =
    error === "invalid-token"
      ? "Invalid or expired reset link. Please request a new one."
      : error === "invalid-input"
        ? "Password must be at least 8 characters."
        : null

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    const form = event.currentTarget
    form.submit()
  }

  if (!token) {
    return (
      <>
        <div style={{
          padding: "10px 14px",
          background: "rgba(212, 24, 61, 0.08)",
          borderRadius: "var(--radius-md)",
          fontSize: "13px",
          color: "var(--destructive)",
          marginBottom: "16px",
        }}>
          Invalid or missing reset token. Please request a new password reset link.
        </div>
        <div className="auth-footer">
          <Link href="/forgot-password">Request new link</Link>
        </div>
      </>
    )
  }

  return (
    <form action={resetPasswordAction} onSubmit={handleSubmit} className="auth-form">
      <input type="hidden" name="token" value={token} />

      <div className="form-group">
        <label className="form-label" htmlFor="password">New Password</label>
        <input
          className="form-input"
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          autoFocus
        />
      </div>

      {errorMessage && (
        <div style={{
          padding: "10px 14px",
          background: "rgba(212, 24, 61, 0.08)",
          borderRadius: "var(--radius-md)",
          fontSize: "13px",
          color: "var(--destructive)",
        }}>
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary btn-lg"
        style={{ width: "100%", marginTop: "8px" }}
      >
        {isSubmitting ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  )
}

export default function ResetPasswordForm({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>
}) {
  return (
    <Suspense fallback={<div className="spinner" style={{ margin: "0 auto" }} />}>
      <ResetPasswordFormInner />
    </Suspense>
  )
}
