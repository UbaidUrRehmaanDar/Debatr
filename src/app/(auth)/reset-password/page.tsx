import Image from "next/image"
import Link from "next/link"
import ResetPasswordForm from "./ResetPasswordForm"

export const dynamic = "force-dynamic"

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>
}) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Image src="/debatr-logo.png" alt="Debatr" width={32} height={32} className="auth-logo-img" />
          <span className="auth-logo-text">Debatr</span>
        </div>
        <h1 className="auth-title">Set new password</h1>
        <p className="auth-subtitle">Enter your new password below.</p>
        <ResetPasswordForm searchParams={searchParams} />
        <div className="auth-footer" style={{ marginTop: "16px" }}>
          <Link href="/sign-in">Back to Sign In</Link>
        </div>
      </div>
    </div>
  )
}
