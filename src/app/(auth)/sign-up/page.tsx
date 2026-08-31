import Image from "next/image"
import Link from "next/link"
import { signUpAction } from "@/app/actions/auth"

export const dynamic = "force-dynamic"

export default function SignUpPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
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

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Start debating with AI in a calm, focused workspace.</p>

        <SignUpForm searchParams={searchParams} />

        <div className="auth-divider"><span>or</span></div>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link href="/sign-in">Sign In</Link>
        </div>
      </div>
    </div>
  )
}

async function SignUpForm({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams

  const errorMessage =
    error === "invalid-invite"
      ? "Invalid or expired invitation code."
      : error === "email-exists"
        ? "An account with this email already exists."
        : error === "invalid-input"
          ? "Please check your input and try again."
          : null

  return (
    <form action={signUpAction} className="auth-form">
      <div className="form-group">
        <label className="form-label" htmlFor="name">Full Name</label>
        <input
          className="form-input"
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          placeholder="Jane Doe"
          autoComplete="name"
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="email">Email</label>
        <input
          className="form-input"
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
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
          minLength={8}
          autoComplete="new-password"
          placeholder="Create a strong password"
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="invitationCode">Invite Code</label>
        <input
          className="form-input"
          id="invitationCode"
          name="invitationCode"
          type="text"
          required
          placeholder="XXXX-XXXX"
          style={{ fontFamily: "'SF Mono','Fira Code',monospace", letterSpacing: "2px", textTransform: "uppercase" }}
        />
      </div>

      {errorMessage ? (
        <div style={{
          padding: "10px 14px",
          background: "rgba(212, 24, 61, 0.08)",
          borderRadius: "var(--radius-md)",
          fontSize: "13px",
          color: "var(--destructive)",
        }}>
          {errorMessage}
        </div>
      ) : null}

      <button
        type="submit"
        className="btn btn-primary btn-lg"
        style={{ width: "100%", marginTop: "8px" }}
      >
        Create Account
      </button>
    </form>
  )
}
