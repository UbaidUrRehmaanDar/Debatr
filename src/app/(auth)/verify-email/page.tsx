"use client"

import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { verifyEmailAction } from "@/app/actions/auth"
import { Suspense } from "react"

function VerifyEmailFormInner() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const error = searchParams.get("error")

  if (!token) {
    return (
      <>
        <div style={{ fontSize: "13px", color: "var(--muted-foreground)", textAlign: "center", marginBottom: "16px", lineHeight: 1.6 }}>
          No verification token provided. Please check your email or sign up again.
        </div>
        <div className="auth-footer">
          <Link href="/sign-up">Sign Up</Link>
        </div>
      </>
    )
  }

  if (error === "invalid-token") {
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
          Invalid or expired verification link. Please sign up again to receive a new one.
        </div>
        <div className="auth-footer">
          <Link href="/sign-up">Sign Up</Link>
        </div>
      </>
    )
  }

  return (
    <div className="auth-form">
      <p style={{ fontSize: "13px", color: "var(--muted-foreground)", textAlign: "center" }}>
        Click below to verify your email address.
      </p>
      <form action={verifyEmailAction}>
        <input type="hidden" name="token" value={token} />
        <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: "8px" }}>
          Verify Email
        </button>
      </form>
      <div className="auth-footer">
        <Link href="/sign-in">Back to Sign In</Link>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Image src="/debatr-logo.png" alt="Debatr" width={32} height={32} className="auth-logo-img" />
          <span className="auth-logo-text">Debatr</span>
        </div>
        <h1 className="auth-title">Verify your email</h1>
        <p className="auth-subtitle">One last step to activate your account.</p>
        <Suspense fallback={<div className="spinner" style={{ margin: "0 auto" }} />}>
          <VerifyEmailFormInner />
        </Suspense>
      </div>
    </div>
  )
}
