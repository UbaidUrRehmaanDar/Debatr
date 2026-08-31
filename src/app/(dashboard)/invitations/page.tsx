"use client"

import { api } from "@/lib/trpc-client"
import { useState } from "react"

export default function InvitationsPage() {
  const invitations = api.invitations.list.useQuery()
  const createInvitation = api.invitations.create.useMutation()
  const revokeInvitation = api.invitations.revoke.useMutation()
  const utils = api.useUtils()

  const [email, setEmail] = useState("")
  const [expiresInDays, setExpiresInDays] = useState(7)

  const handleCreate = () => {
    createInvitation.mutate(
      { email: email || undefined, expiresInDays },
      {
        onSuccess: () => {
          utils.invalidate()
          setEmail("")
          setExpiresInDays(7)
        },
      }
    )
  }

  const handleRevoke = (id: string) => {
    if (confirm("Revoke this invitation?")) {
      revokeInvitation.mutate({ invitationId: id }, { onSuccess: () => utils.invalidate() })
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).catch(() => {})
  }

  return (
    <main className="page-content page-enter">
      <div className="page-header">
        <h1>Invitations</h1>
        <p>Manage invitation codes for new users.</p>
      </div>

      {/* Create form */}
      <div className="card" style={{ marginBottom: 32, maxWidth: 560 }}>
        <div className="settings-section-title" style={{ marginBottom: 16 }}>Create Invitation</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="inv-email">Email (optional)</label>
            <input
              className="form-input"
              id="inv-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="person@example.com"
            />
            <span className="form-hint">If provided, only this email can use the code.</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="expires">Expires in (days)</label>
            <input
              className="form-input"
              id="expires"
              type="number"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(Number(e.target.value))}
              min={1}
              max={365}
              style={{ maxWidth: 120 }}
            />
          </div>

          <div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCreate}
              disabled={createInvitation.isPending}
            >
              {createInvitation.isPending ? "Creating..." : "Create Invitation"}
            </button>
          </div>
        </div>
      </div>

      {/* Invitation list */}
      <div>
        <div className="section-header" style={{ marginBottom: 12 }}>
          <span className="section-title">All Invitations</span>
          <span className="section-line" />
        </div>

        {invitations.isLoading ? (
          <div className="spinner" style={{ marginTop: 24 }} />
        ) : invitations.data?.length === 0 ? (
          <div className="empty-state" style={{ paddingBlock: 48 }}>
            <div className="empty-state-title">No invitations yet</div>
            <p className="empty-state-desc">Create one above to invite someone to join Debatr.</p>
          </div>
        ) : (
          <div className="admin-table">
            {/* Header */}
            <div className="admin-table-header" style={{ gridTemplateColumns: "1fr 80px 90px 80px 80px" }}>
              <span>CODE / EMAIL</span>
              <span>STATUS</span>
              <span>CREATED</span>
              <span>EXPIRES</span>
              <span></span>
            </div>

            {/* Rows */}
            {invitations.data?.map((inv) => {
              const expiresAt = new Date(inv.expiresAt)
              const isExpired = expiresAt < new Date()
              const isUsed = !!inv.usedById

              const statusBadge = isUsed
                ? <span className="badge badge-success">Used</span>
                : isExpired
                  ? <span className="badge badge-danger">Expired</span>
                  : <span className="badge badge-info">Active</span>

              return (
                <div
                  key={inv.id}
                  className="admin-table-row"
                  style={{ gridTemplateColumns: "1fr 80px 90px 80px 80px" }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <code style={{
                        fontSize: 12,
                        fontFamily: "'SF Mono','Fira Code',monospace",
                        letterSpacing: "0.06em",
                        color: "var(--foreground)",
                        background: "var(--muted)",
                        padding: "2px 7px",
                        borderRadius: "var(--radius-xs)",
                        cursor: "pointer",
                      }}
                        title="Click to copy"
                        onClick={() => copyCode(inv.code)}
                      >
                        {inv.code}
                      </code>
                    </div>
                    {inv.email && (
                      <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 3 }}>
                        {inv.email}
                      </div>
                    )}
                    {inv.usedBy && (
                      <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>
                        Used by {inv.usedBy.email}
                      </div>
                    )}
                  </div>
                  <div>{statusBadge}</div>
                  <div className="admin-table-cell-muted">
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </div>
                  <div className="admin-table-cell-muted">
                    {expiresAt.toLocaleDateString()}
                  </div>
                  <div className="admin-table-actions">
                    {!isUsed && !isExpired && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ color: "var(--destructive)", fontSize: 12 }}
                        onClick={() => handleRevoke(inv.id)}
                        disabled={revokeInvitation.isPending}
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
