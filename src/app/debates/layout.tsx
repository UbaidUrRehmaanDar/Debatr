import React from "react"
import { redirect } from "next/navigation"
import { auth } from "@/server/auth"
import { DashboardShell } from "@/components/dashboard-shell"

export default async function DebatesLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/debates")
  }

  return <DashboardShell session={session}>{children}</DashboardShell>
}
