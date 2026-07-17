import { getDb } from '../db/index.js';
import { aiUsage } from '../db/schema/index.js';
import { sql, gte } from 'drizzle-orm';
import { config } from '../config/env.js';

export interface UsageTotals {
  requests: number;
  tokensUsed: number;
  byRole: { role: string; requests: number; tokensUsed: number }[];
  byModel: { model: string; requests: number; tokensUsed: number }[];
  /** Estimated USD cost; only present when AI_COST_PER_1K_TOKENS is configured. */
  costEstimateUsd?: number;
}

export interface DebateUsage {
  debateId: string;
  role: string;
  tokensUsed: number;
  requests: number;
}

export interface AiUsageDashboard {
  generatedAt: string;
  totals: UsageTotals;
  /** Only populated when `since` is provided (e.g. daily window). */
  window?: { since: string };
  perDebate: DebateUsage[];
}

/**
 * Aggregate all recorded AI token usage into a dashboard payload. Token counts
 * come directly from the `aiUsage` table (written on every Lawyer/Judge call),
 * so this never re-hits the model provider. Cost is an optional estimate.
 */
export async function getAiUsageDashboard(since?: Date): Promise<AiUsageDashboard> {
  const db = getDb();

  const sinceClause = since ? gte(aiUsage.createdAt, since) : undefined;

  const [{ requests, tokens }] = await db
    .select({
      requests: sql<number>`count(*)::int`,
      tokens: sql<number>`coalesce(sum(${aiUsage.tokensUsed}), 0)::int`,
    })
    .from(aiUsage)
    .where(sinceClause ?? sql`true`);

  const byRole = await db
    .select({
      role: aiUsage.role,
      requests: sql<number>`count(*)::int`,
      tokensUsed: sql<number>`coalesce(sum(${aiUsage.tokensUsed}), 0)::int`,
    })
    .from(aiUsage)
    .where(sinceClause ?? sql`true`)
    .groupBy(aiUsage.role);

  const byModel = await db
    .select({
      model: aiUsage.model,
      requests: sql<number>`count(*)::int`,
      tokensUsed: sql<number>`coalesce(sum(${aiUsage.tokensUsed}), 0)::int`,
    })
    .from(aiUsage)
    .where(sinceClause ?? sql`true`)
    .groupBy(aiUsage.model);

  const perDebate = await db
    .select({
      debateId: aiUsage.debateId,
      role: aiUsage.role,
      tokensUsed: sql<number>`coalesce(sum(${aiUsage.tokensUsed}), 0)::int`,
      requests: sql<number>`count(*)::int`,
    })
    .from(aiUsage)
    .where(sinceClause ?? sql`true`)
    .groupBy(aiUsage.debateId, aiUsage.role)
    .orderBy(sql`sum(${aiUsage.tokensUsed}) desc`);

  const totals: UsageTotals = {
    requests,
    tokensUsed: tokens ?? 0,
    byRole,
    byModel,
  };

  const price = config.aiCostPer1kTokens;
  if (typeof price === 'number' && price > 0) {
    totals.costEstimateUsd = Number(((totals.tokensUsed / 1000) * price).toFixed(4));
  }

  const dashboard: AiUsageDashboard = {
    generatedAt: new Date().toISOString(),
    totals,
    perDebate,
  };
  if (since) {
    dashboard.window = { since: since.toISOString() };
  }
  return dashboard;
}
