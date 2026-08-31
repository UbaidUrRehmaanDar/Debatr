"use client"

import { api } from "@/lib/trpc-client"
import { useParams } from "next/navigation"
import Link from "next/link"

export default function DebateReportPage() {
  const params = useParams()
  const debateId = params.debateId as string

  const debate = api.debates.get.useQuery({ debateId })

  function formatScoreKey(key: string): string {
    const labels: Record<string, string> = {
      logicalConsistency: "Logical Consistency",
      evidenceQuality: "Evidence Quality",
      rebuttalEffectiveness: "Rebuttal Effectiveness",
      argumentStructure: "Argument Structure",
      responsiveness: "Responsiveness",
      argumentation: "Argumentation",
      evidence: "Evidence",
      clarity: "Clarity",
      rebuttal: "Rebuttal",
    }
    return labels[key] || key
  }

  if (debate.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-400">Loading report...</p>
      </div>
    )
  }

  if (!debate.data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-400">Debate not found</p>
      </div>
    )
  }

  if (!debate.data.judgeReport) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400">No judge report available yet.</p>
          <Link
            href={`/debates/${debateId}`}
            className="mt-4 inline-block rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
          >
            Back to Debate
          </Link>
        </div>
      </div>
    )
  }

  const report = debate.data.judgeReport as unknown as {
    outcome: string
    confidence: number
    verdict: string
    scores: {
      affirmative: Record<string, number>
      negative: Record<string, number>
    }
    strengths: { affirmative: string[]; negative: string[] }
    weaknesses: { affirmative: string[]; negative: string[] }
    fallacies: Array<{ side: string; fallacy: string; description: string }>
    conductFindings: string[]
    summary: string
  }

  const outcomeLabel = {
    affirmative: "Affirmative Wins",
    negative: "Negative Wins",
    draw: "Draw",
    inconclusive: "Inconclusive",
  }[report.outcome] || report.outcome

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div>
        <Link
          href={`/debates/${debateId}`}
          className="text-sm text-cyan-400 hover:text-cyan-300"
        >
          Back to Debate
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-white">Judge Report</h1>
        <p className="mt-1 text-slate-400">{debate.data.topic}</p>
      </div>

      {/* Verdict */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-500">Verdict</p>
            <p className="mt-1 text-2xl font-bold capitalize text-white">
              {outcomeLabel}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm uppercase tracking-wide text-slate-500">Confidence</p>
            <p className="mt-1 text-2xl font-bold text-cyan-400">
              {(report.confidence * 100).toFixed(0)}%
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-slate-950/50 p-4">
          <p className="text-slate-300">{report.verdict}</p>
        </div>
      </section>

      {/* Scores */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Scores</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-green-900/30 bg-green-950/20 p-4">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-green-400">
              Affirmative
            </p>
            <div className="space-y-2">
              {Object.entries(report.scores.affirmative).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm capitalize text-slate-300">{formatScoreKey(key)}</span>
                  <span className="font-mono text-sm text-white">{value}/10</span>
                </div>
              ))}
              <div className="mt-3 border-t border-green-900/30 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-green-400">Total</span>
                  <span className="font-mono text-sm font-semibold text-white">
                    {Object.values(report.scores.affirmative).reduce(
                      (a, b) => a + b,
                      0
                    )}
                    /50
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-red-900/30 bg-red-950/20 p-4">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-red-400">
              Negative
            </p>
            <div className="space-y-2">
              {Object.entries(report.scores.negative).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm capitalize text-slate-300">{formatScoreKey(key)}</span>
                  <span className="font-mono text-sm text-white">{value}/10</span>
                </div>
              ))}
              <div className="mt-3 border-t border-red-900/30 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-red-400">Total</span>
                  <span className="font-mono text-sm font-semibold text-white">
                    {Object.values(report.scores.negative).reduce(
                      (a, b) => a + b,
                      0
                    )}
                    /50
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Strengths */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Strengths</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold text-green-400">Affirmative</p>
            <ul className="list-inside list-disc space-y-1 text-sm text-slate-300">
              {report.strengths.affirmative.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-red-400">Negative</p>
            <ul className="list-inside list-disc space-y-1 text-sm text-slate-300">
              {report.strengths.negative.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Weaknesses */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Weaknesses</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold text-green-400">Affirmative</p>
            <ul className="list-inside list-disc space-y-1 text-sm text-slate-300">
              {report.weaknesses.affirmative.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-red-400">Negative</p>
            <ul className="list-inside list-disc space-y-1 text-sm text-slate-300">
              {report.weaknesses.negative.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Fallacies */}
      {report.fallacies.length > 0 && (
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Logical Fallacies</h2>
          <div className="space-y-3">
            {report.fallacies.map((f, i) => (
              <div
                key={i}
                className="rounded-lg border border-slate-800 bg-slate-950/50 p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-white">{f.fallacy}</p>
                    <p className="mt-1 text-sm text-slate-400">{f.description}</p>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      f.side === "affirmative"
                        ? "bg-green-900/30 text-green-400"
                        : "bg-red-900/30 text-red-400"
                    }`}
                  >
                    {f.side}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Conduct Findings */}
      {report.conductFindings.length > 0 && (
        <section className="rounded-xl border border-yellow-900/30 bg-yellow-950/20 p-6">
          <h2 className="mb-4 text-lg font-semibold text-yellow-400">Conduct Findings</h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-slate-300">
            {report.conductFindings.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Summary */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Summary</h2>
        <p className="text-slate-300">{report.summary}</p>
      </section>
    </div>
  )
}
