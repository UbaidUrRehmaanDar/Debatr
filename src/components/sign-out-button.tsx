"use client"

import { signOut } from "next-auth/react"

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/sign-in" })}
      className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-500/60 hover:text-cyan-300"
    >
      Sign out
    </button>
  )
}
