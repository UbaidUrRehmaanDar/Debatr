"use client"

import { api } from "@/lib/trpc-client"
import { useState } from "react"

const NAV_ITEMS = ["Profile", "Appearance", "Notifications", "Security", "Billing"] as const
type NavItem = typeof NAV_ITEMS[number]

export default function SettingsPage() {
  const me = api.me.useQuery()
  const [activeNav, setActiveNav] = useState<NavItem>("Profile")
  const [darkMode, setDarkMode] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [pwError, setPwError] = useState("")
  const [pwSuccess, setPwSuccess] = useState("")

  function toggleDarkMode() {
    const next = !darkMode
    setDarkMode(next)
    document.documentElement.classList.toggle("dark", next)
  }

  function handleChangePassword() {
    setPwError("")
    setPwSuccess("")
    if (newPassword !== confirmPassword) { setPwError("Passwords do not match"); return }
    if (newPassword.length < 8) { setPwError("Password must be at least 8 characters"); return }
    setPwError("Password change not yet implemented")
  }

  return (
    <main className="page-content page-enter">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account and application preferences.</p>
      </div>

      <div className="settings-layout">
        {/* Left nav */}
        <nav className="settings-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              type="button"
              className={`settings-nav-item${activeNav === item ? " active" : ""}`}
              onClick={() => setActiveNav(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        {/* Right content */}
        <div className="settings-section">
          {activeNav === "Profile" && (
            <>
              <div className="settings-section-title">Profile</div>

              {/* Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "var(--notion-accent-purple)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 500,
                  color: "var(--notion-accent-purple-deep)",
                  position: "relative",
                }}>
                  {me.data?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() ?? "?"}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "var(--foreground)" }}>
                    {me.data?.name ?? "—"}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>
                    {me.data?.email ?? "—"}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="display-name">Display Name</label>
                <input
                  className="form-input"
                  id="display-name"
                  type="text"
                  defaultValue={me.data?.name ?? ""}
                  placeholder="Your name"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email-field">Email</label>
                <input
                  className="form-input"
                  id="email-field"
                  type="email"
                  defaultValue={me.data?.email ?? ""}
                  placeholder="you@example.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="bio-field">Bio</label>
                <textarea
                  className="form-input form-textarea"
                  id="bio-field"
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>

              <div className="settings-row">
                <div>
                  <div className="settings-row-label">Dark Mode</div>
                  <div className="settings-row-desc">Switch to dark theme</div>
                </div>
                <button
                  type="button"
                  className={`toggle${darkMode ? " active" : ""}`}
                  onClick={toggleDarkMode}
                  aria-label="Toggle dark mode"
                />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button type="button" className="btn btn-primary">Save Changes</button>
                <button type="button" className="btn btn-secondary">Cancel</button>
              </div>
            </>
          )}

          {activeNav === "Security" && (
            <>
              <div className="settings-section-title">Change Password</div>
              <div className="form-group">
                <label className="form-label" htmlFor="current-password">Current Password</label>
                <input
                  className="form-input"
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Your current password"
                  autoComplete="current-password"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="new-password">New Password</label>
                <input
                  className="form-input"
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="confirm-password">Confirm New Password</label>
                <input
                  className="form-input"
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                />
              </div>
              {pwError && <div style={{ fontSize: 13, color: "var(--destructive)" }}>{pwError}</div>}
              {pwSuccess && <div style={{ fontSize: 13, color: "var(--notion-accent-green)" }}>{pwSuccess}</div>}
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleChangePassword}
                disabled={!currentPassword || !newPassword || !confirmPassword}
              >
                Update Password
              </button>

              <div style={{ marginTop: 32 }}>
                <div className="settings-section-title" style={{ color: "var(--destructive)", marginBottom: 12 }}>
                  Danger Zone
                </div>
                <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 12 }}>
                  Once you delete your account, there is no going back.
                </p>
                <button type="button" className="btn btn-danger btn-sm">Delete Account</button>
              </div>
            </>
          )}

          {activeNav === "Appearance" && (
            <>
              <div className="settings-section-title">Appearance</div>
              <div className="settings-row">
                <div>
                  <div className="settings-row-label">Dark Mode</div>
                  <div className="settings-row-desc">Switch to dark theme</div>
                </div>
                <button
                  type="button"
                  className={`toggle${darkMode ? " active" : ""}`}
                  onClick={toggleDarkMode}
                  aria-label="Toggle dark mode"
                />
              </div>
            </>
          )}

          {(activeNav === "Notifications" || activeNav === "Billing") && (
            <div className="empty-state" style={{ alignItems: "flex-start", padding: "24px 0" }}>
              <div className="empty-state-title">{activeNav}</div>
              <p className="empty-state-desc">This section is coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
