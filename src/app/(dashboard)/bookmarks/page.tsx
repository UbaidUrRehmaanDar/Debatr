"use client"

import { api } from "@/lib/trpc-client"
import Link from "next/link"

export default function BookmarksPage() {
  const bookmarks = api.bookmarks.list.useQuery()
  const toggleBookmark = api.bookmarks.toggle.useMutation()
  const utils = api.useUtils()

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Bookmarks</h1>
        <p className="mt-1 text-slate-400">Your saved debates for quick access.</p>
      </div>

      {bookmarks.isLoading ? (
        <p className="text-slate-500">Loading...</p>
      ) : bookmarks.data?.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-12 text-center">
          <p className="text-slate-400">No bookmarks yet.</p>
          <Link
            href="/debates"
            className="mt-4 inline-block rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
          >
            Browse Debates
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.data?.map((b) => (
            <div
              key={b.debate.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link
                    href={`/debates/${b.debate.id}`}
                    className="text-lg font-semibold text-white hover:text-cyan-400"
                  >
                    {b.debate.topic}
                  </Link>
                  <div className="mt-2 flex items-center gap-4 text-sm text-slate-400">
                    <span className="capitalize">{b.debate.status.replace(/_/g, " ")}</span>
                    <span>-</span>
                    <span>
                      {b.debate.participants.length} participant
                      {b.debate.participants.length !== 1 ? "s" : ""}
                    </span>
                    {b.debate.judgeReport && (
                      <>
                        <span>-</span>
                        <span className="capitalize">
                          Winner: {b.debate.judgeReport.outcome}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    toggleBookmark.mutate(
                      { debateId: b.debate.id },
                      { onSuccess: () => utils.invalidate() }
                    )
                  }}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-red-700 hover:text-red-400"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
