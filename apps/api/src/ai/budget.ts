import { getDb } from '../db/index.js';
import { aiUsage } from '../db/schema/index.js';
import { eq, sql } from 'drizzle-orm';
import { config } from '../config/env.js';

export interface BudgetCheck {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
}

/**
 * Pure comparison of used tokens against a limit. Extracted so the budget rule
 * can be unit-tested without a database.
 */
export function evaluateBudget(used: number, limit: number): BudgetCheck {
  return {
    allowed: used < limit,
    used,
    limit,
    remaining: Math.max(0, limit - used),
  };
}

/**
 * Sum the recorded token usage for a debate and compare against the configured
 * per-debate ceiling. Returns whether another AI request may proceed.
 */
export async function checkDebateBudget(debateId: string): Promise<BudgetCheck> {
  const db = getDb();
  const [{ total }] = await db
    .select({ total: sql<number>`coalesce(sum(${aiUsage.tokensUsed}), 0)::int` })
    .from(aiUsage)
    .where(eq(aiUsage.debateId, debateId));

  const limit = config.aiMaxTokensPerDebate;
  const used = total ?? 0;
  return evaluateBudget(used, limit);
}
