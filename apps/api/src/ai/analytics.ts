import { getDb } from '../db/index.js';
import { judgeReports } from '../db/schema/index.js';
import { desc } from 'drizzle-orm';

export interface DebateAnalytics {
  generatedAt: string;
  totalJudged: number;
  outcomeCounts: { outcome: string; count: number }[];
  // Affirmative win-rate (0..1) over decided debates.
  affirmativeWinRate: number;
  // Most common fallacies across all judge reports.
  topFallacies: { fallacy: string; count: number }[];
  // Average judge confidence.
  avgConfidence: number;
  // Confidence trend (oldest -> newest) for a simple sparkline.
  confidenceTrend: { debateId: string; confidence: number; outcome: string; at: string }[];
}

// Aggregate debate-level analytics from completed judge reports. Pure reads
// against the `judgeReports` table — no provider calls, no new dependency.
export async function getDebateAnalytics(): Promise<DebateAnalytics> {
  const db = getDb();

  const rows = await db
    .select({
      id: judgeReports.id,
      debateId: judgeReports.debateId,
      outcome: judgeReports.outcome,
      confidence: judgeReports.confidence,
      fallacies: judgeReports.fallacies,
      createdAt: judgeReports.createdAt,
    })
    .from(judgeReports)
    .orderBy(desc(judgeReports.createdAt));

  const total = rows.length;
  const outcomeCounts = new Map<string, number>();
  const fallacyCounts = new Map<string, number>();
  let confidenceSum = 0;
  let decided = 0;
  let affirmativeWins = 0;

  for (const r of rows) {
    outcomeCounts.set(r.outcome, (outcomeCounts.get(r.outcome) ?? 0) + 1);
    if (r.outcome === 'affirmative' || r.outcome === 'negative' || r.outcome === 'draw') {
      decided += 1;
      if (r.outcome === 'affirmative') affirmativeWins += 1;
    }
    confidenceSum += Number(r.confidence) || 0;

    const fs = Array.isArray(r.fallacies) ? r.fallacies : [];
    for (const f of fs) {
      const key = typeof f === 'string' ? f : (f?.type ?? f?.name ?? JSON.stringify(f));
      if (key) fallacyCounts.set(String(key), (fallacyCounts.get(String(key)) ?? 0) + 1);
    }
  }

  const topFallacies = [...fallacyCounts.entries()]
    .map(([fallacy, count]) => ({ fallacy, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Trend ordered oldest -> newest for a sparkline.
  const confidenceTrend = [...rows]
    .reverse()
    .map((r) => ({
      debateId: r.debateId,
      confidence: Number(r.confidence) || 0,
      outcome: r.outcome,
      at: r.createdAt.toISOString(),
    }));

  return {
    generatedAt: new Date().toISOString(),
    totalJudged: total,
    outcomeCounts: [...outcomeCounts.entries()].map(([outcome, count]) => ({ outcome, count })),
    affirmativeWinRate: decided > 0 ? Number((affirmativeWins / decided).toFixed(3)) : 0,
    topFallacies,
    avgConfidence: total > 0 ? Number((confidenceSum / total).toFixed(3)) : 0,
    confidenceTrend,
  };
}
