"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

const PAGES = [
  { label: "Debates",     href: "/debates"       },
  { label: "New Debate",  href: "/debates/new"   },
  { label: "Settings",    href: "/settings"      },
  { label: "Invitations", href: "/invitations"   },
]

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      setQuery("")
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Esc to close
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  if (!open) return null

  const results = PAGES.filter((p) =>
    p.label.toLowerCase().includes(query.toLowerCase())
  )

  function handleSelect(href: string) {
    onClose()
    router.push(href)
  }

  return (
    <div
      className="search-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        {/* Input row */}
        <div className="search-input-row">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search debates, topics, pages..."
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="search-close-btn" onClick={onClose} type="button">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/>
              <path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>

        {/* Results */}
        <div className="search-results">
          {results.length > 0 ? (
            results.map((r) => (
              <button
                key={r.href}
                className="search-result-item"
                type="button"
                onClick={() => handleSelect(r.href)}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span className="search-result-title">{r.label}</span>
                <span className="search-result-topic">Page</span>
              </button>
            ))
          ) : (
            <div style={{ padding: "16px", textAlign: "center", color: "var(--muted-foreground)", fontSize: "13px" }}>
              No results found
            </div>
          )}
        </div>

        {/* Footer hints */}
        <div className="search-footer">
          <div className="search-hint">
            <kbd>Enter</kbd> Open
          </div>
          <div className="search-hint">
            <kbd>Esc</kbd> Close
          </div>
        </div>
      </div>
    </div>
  )
}
