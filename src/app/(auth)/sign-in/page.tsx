"use client"

import Image from "next/image"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, type FormEvent, useState } from "react"

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/debates"
  const registered = searchParams.get("registered")
  const reset = searchParams.get("reset")
  const verified = searchParams.get("verified")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const successMessage = registered
    ? "Account created! Please sign in."
    : reset
      ? "Password reset successful! Please sign in."
      : verified
        ? "Email verified! Please sign in."
        : null

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") ?? "").trim()
    const password = String(formData.get("password") ?? "")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Invalid email or password.")
      setIsSubmitting(false)
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <Image
            src="/debatr-logo.png"
            alt="Debatr"
            width={32}
            height={32}
            className="auth-logo-img"
          />
          <span className="auth-logo-text">Debatr</span>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to continue your debates.</p>

        {successMessage && (
          <div style={{
            marginBottom: "16px",
            padding: "10px 14px",
            background: "rgba(26, 174, 57, 0.08)",
            borderRadius: "var(--radius-md)",
            fontSize: "13px",
            color: "var(--notion-accent-green)",
          }}>
            {successMessage}
          </div>
        )}

        {error && (
          <div style={{
            marginBottom: "16px",
            padding: "10px 14px",
            background: "rgba(212, 24, 61, 0.08)",
            borderRadius: "var(--radius-md)",
            fontSize: "13px",
            color: "var(--destructive)",
          }}>
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
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

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              className="form-input"
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Enter your password"
            />
            <div style={{ textAlign: "right", marginTop: "4px" }}>
              <Link
                href="/forgot-password"
                style={{ fontSize: "13px", color: "var(--foreground)", fontWeight: 500 }}
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-lg"
            style={{ width: "100%", marginTop: "8px" }}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <div className="auth-footer">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up">Sign Up</Link>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="auth-page">
        <div className="auth-card">
          <div className="spinner" style={{ margin: "0 auto" }} />
        </div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}
