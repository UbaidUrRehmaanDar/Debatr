"use client"

import { useState } from "react"
import { Topnav } from "@/components/topnav"
import { SearchModal } from "@/components/search-modal"

interface DashboardShellProps {
  children: React.ReactNode
  session?: {
    user?: {
      id?: string
      email?: string
      name?: string | null
      role?: string
    }
  } | null
}

export function DashboardShell({ children, session }: DashboardShellProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <Topnav onSearchOpen={() => setSearchOpen(true)} session={session} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      {children}
    </>
  )
}
