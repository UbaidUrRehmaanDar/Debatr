"use client"

import { api } from "@/lib/trpc-client"
import { useState } from "react"

export default function AdminPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  const stats = api.admin.getStats.useQuery()
  const users = api.admin.listUsers.useQuery({ limit: 50 })
  const aiUsage = api.admin.getAiUsage.useQuery({ limit: 20 })
  const updateUserRole = api.admin.updateUserRole.useMutation()
  const deleteUser = api.admin.deleteUser.useMutation()

  const utils = api.useUtils()

  const handleBootstrap = async () => {
    const res = await fetch("/api/admin/bootstrap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    })
    const data = await res.json()
    if (res.ok) {
      alert("Admin created!")
      utils.invalidate()
      setEmail("")
      setPassword("")
      setName("")
    } else {
      alert(data.error || "Failed")
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="mt-1 text-slate-400">Manage users, monitor AI usage, and view platform stats.</p>
      </div>

      {/* Stats */}
      {stats.data && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Users" value={stats.data.userCount} />
          <StatCard label="Debates" value={stats.data.debateCount} />
          <StatCard label="Messages" value={stats.data.messageCount} />
          <StatCard label="AI Tokens" value={stats.data.totalAiTokens.toLocaleString()} />
        </div>
      )}

      {/* Bootstrap */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Bootstrap Admin</h2>
        <p className="mb-4 text-sm text-slate-400">Only works when no users exist in the database.</p>
        <div className="grid gap-3 md:grid-cols-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>
        <button
          onClick={handleBootstrap}
          disabled={!email || !password || !name}
          className="mt-3 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
        >
          Create Admin
        </button>
      </section>

      {/* Users */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Users</h2>
        {users.isLoading ? (
          <p className="text-slate-500">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Email</th>
                  <th className="pb-2">Role</th>
                  <th className="pb-2">Verified</th>
                  <th className="pb-2">Joined</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {users.data?.users.map((u) => (
                  <tr key={u.id} className="border-t border-slate-800">
                    <td className="py-2">{u.name || "-"}</td>
                    <td className="py-2">{u.email}</td>
                    <td className="py-2">
                      <select
                        value={u.role}
                        onChange={(e) => {
                          updateUserRole.mutate(
                            { userId: u.id, role: e.target.value as "user" | "admin" },
                            { onSuccess: () => utils.invalidate() }
                          )
                        }}
                        className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="py-2">{u.emailVerified ? "Yes" : "No"}</td>
                    <td className="py-2">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="py-2">
                      <button
                        onClick={() => {
                          if (confirm(`Delete user ${u.email}?`)) {
                            deleteUser.mutate(
                              { userId: u.id },
                              { onSuccess: () => utils.invalidate() }
                            )
                          }
                        }}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* AI Usage */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Recent AI Usage</h2>
        {aiUsage.isLoading ? (
          <p className="text-slate-500">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="pb-2">Role</th>
                  <th className="pb-2">Model</th>
                  <th className="pb-2">Tokens</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {aiUsage.data?.usage.map((u) => (
                  <tr key={u.id} className="border-t border-slate-800">
                    <td className="py-2 capitalize">{u.role}</td>
                    <td className="py-2 text-xs">{u.model}</td>
                    <td className="py-2">{u.tokensUsed.toLocaleString()}</td>
                    <td className="py-2">{new Date(u.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  )
}
