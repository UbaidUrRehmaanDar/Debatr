"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { signOut } from "next-auth/react"
import { Search, Bell, Settings } from "lucide-react"

interface TopnavProps {
  onSearchOpen?: () => void
  session?: {
    user?: {
      id?: string
      email?: string
      name?: string | null
      role?: string
    }
  } | null
}

const NAV_LINKS = [
  { href: "/debates",          label: "Debates"     },
  { href: "/debates/new",      label: "New Debate"  },
  { href: "/import",           label: "Import"      },
  { href: "/insights",         label: "Analytics"    },
  { href: "/legal-ai",         label: "Legal AI"    },
  { href: "/templates",        label: "Templates"   },
]

export function Topnav({ onSearchOpen, session }: TopnavProps) {
  const pathname = usePathname()
  const [avatarOpen, setAvatarOpen] = useState(false)
  const avatarRef = useRef<HTMLDivElement>(null)

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : session?.user?.email?.[0]?.toUpperCase() ?? "?"

  // Close avatar menu on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Keyboard shortcut: Cmd/Ctrl+K for search
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        onSearchOpen?.()
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onSearchOpen])

  return (
    <nav id="topnav">
      <div className="nav-inner">
        {/* Left: Logo */}
        <Link href="/debates" className="nav-logo" prefetch={true}>
          <Image
            src="/debatr-logo.png"
            alt="Debatr"
            width={24}
            height={24}
            className="nav-logo-img"
          />
          <span className="nav-logo-text">Debatr</span>
        </Link>

        {/* Center: Nav links */}
        <div className="nav-links">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive =
              href === "/debates"
                ? pathname === "/debates"
                : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`nav-link${isActive ? " active" : ""}`}
                prefetch={true}
              >
                {label}
              </Link>
            )
          })}
        </div>

        {/* Right: Actions */}
        <div className="nav-actions">
          {/* Search */}
          <button className="nav-search-btn" onClick={onSearchOpen} type="button">
            <Search size={13} />
            <span>Search</span>
            <kbd>
              <span className="cmd-key">Cmd</span>K
            </kbd>
          </button>

          {/* Bell */}
          <button className="nav-bell-btn" title="Notifications" type="button">
            <Bell size={14} />
            <span className="bell-dot" />
          </button>

          {/* Avatar / Account */}
          <div className="avatar-root" ref={avatarRef}>
            <button
              className="avatar-btn"
              title="Account"
              type="button"
              onClick={() => setAvatarOpen((v) => !v)}
            >
              {initials}
            </button>

            {avatarOpen && (
              <div className="avatar-menu">
                <div className="avatar-menu-header">
                  <div className="avatar-menu-name">
                    {session?.user?.name ?? "Account"}
                  </div>
                  <div className="avatar-menu-email">
                    {session?.user?.email ?? ""}
                  </div>
                </div>
                <div className="avatar-menu-items">
                  <Link
                    href="/settings"
                    className="avatar-menu-item"
                    onClick={() => setAvatarOpen(false)}
                    prefetch={true}
                  >
                    <Settings size={16} />
                    Settings
                  </Link>
                </div>
                <div className="avatar-menu-footer">
                  <button
                    className="avatar-menu-item avatar-menu-logout"
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/sign-in" })}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
