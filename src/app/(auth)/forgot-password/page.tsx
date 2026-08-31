"use client"

import Image from "next/image"
import Link from "next/link"
import { forgotPasswordAction } from "@/app/actions/auth"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"

function ForgotPasswordFormInner() {
  const searchParams = useSearchParams()
  const sent = searchParams.get("sent")
  const error = searchParams.get("error")
  const errorMessage = error === "invalid-email" ? "Please enter a valid email address." : null

  if (sent) {
    return (
      <>
        <div style={{
          padding: "12px 14px",
          background: "rgba(26, 174, 57, 0.08)",
          borderRadius: "var(--radius-md)",
          fontSize: "13px",
          color: "var(--notion-accent-green)",
          marginBottom: "16px",
        }}>
          If an account exists with that email, we&apos;ve sent a reset link.
        </div>
        <div className="auth-footer">
          <Link href="/sign-in">Back to Sign In</Link>
        </div>
      </>
    )
  }

  return (
    <form action={forgotPasswordAction} className="auth-form">
      <div className="form-group">
        <label className="form-label" htmlFor="email">Email</label>
        <input
          className="form-input"
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          placeholder="you@example.com"
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

      <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: "8px" }}>
        Send Reset Link
      </button>

      <div className="auth-footer">
        <Link href="/sign-in">Back to Sign In</Link>
      </div>
    </form>
  )
}

export default function ForgotPasswordPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Image src="/debatr-logo.png" alt="Debatr" width={32} height={32} className="auth-logo-img" />
          <span className="auth-logo-text">Debatr</span>
        </div>
        <h1 className="auth-title">Reset password</h1>
        <p className="auth-subtitle">Enter your email to receive a reset link.</p>
        <Suspense fallback={<div className="spinner" style={{ margin: "0 auto" }} />}>
          <ForgotPasswordFormInner />
        </Suspense>
      </div>
    </div>
  )
}
