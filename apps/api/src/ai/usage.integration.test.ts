import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { randomUUID } from 'crypto';
import { getDb } from '../db/index.js';
import { aiUsage, debates } from '../db/schema/index.js';
import { getAiUsageDashboard } from './usage.js';
import {
  setupTestDb,
  teardownTestDb,
  truncateAll,
  hasTestDb,
} from '../../test/setup.js';

const maybe = hasTestDb ? describe : describe.skip;

maybe('aiUsage aggregation integration (real DB)', () => {
  beforeAll(async () => {
    await setupTestDb();
  });
  afterAll(async () => {
    await teardownTestDb();
  });
  afterEach(async () => {
    await truncateAll();
  });

  const debateRow = (id: string, topic: string) => ({
    id,
    topic,
    status: 'completed' as const,
    participants: {
      affirmative: { userId: 'user-a', displayName: 'A', joinedAt: new Date().toISOString() },
      negative: { userId: 'user-b', displayName: 'B', joinedAt: new Date().toISOString() },
    },
    maxRounds: 1,
    roundDurationMs: 1,
    maxCharactersPerTurn: 1,
    currentRound: 0,
  });

  it('aggregates token usage by role, model, and debate', async () => {
    const db = getDb();
    const deb1 = randomUUID();
    const deb2 = randomUUID();
    await db.insert(debates).values([
      debateRow(deb1, 't1'),
      debateRow(deb2, 't2'),
    ]);
    await db.insert(aiUsage).values([
      { debateId: deb1, role: 'lawyer', tokensUsed: 100, model: 'm1' },
      { debateId: deb1, role: 'lawyer', tokensUsed: 50, model: 'm1' },
      { debateId: deb1, role: 'judge', tokensUsed: 200, model: 'm2' },
      { debateId: deb2, role: 'lawyer', tokensUsed: 300, model: 'm1' },
    ]);

    const dash = await getAiUsageDashboard();
    expect(dash.totals.requests).toBe(4);
    expect(dash.totals.tokensUsed).toBe(650);
    expect(dash.totals.byRole).toContainEqual({ role: 'lawyer', requests: 3, tokensUsed: 450 });
    expect(dash.totals.byRole).toContainEqual({ role: 'judge', requests: 1, tokensUsed: 200 });
    expect(dash.totals.byModel).toContainEqual({ model: 'm1', requests: 3, tokensUsed: 450 });

    const deb1Rows = dash.perDebate.filter((d) => d.debateId === deb1);
    expect(deb1Rows.reduce((s, d) => s + d.tokensUsed, 0)).toBe(350);
    expect(dash.perDebate[0].debateId).toBe(deb2); // sorted by tokens desc
  });

  it('supports a since window filter', async () => {
    const db = getDb();
    const old = new Date(Date.now() - 1000 * 60 * 60 * 24 * 2);
    const recent = new Date();
    const debOld = randomUUID();
    const debNew = randomUUID();
    await db.insert(debates).values([
      debateRow(debOld, 'old'),
      debateRow(debNew, 'new'),
    ]);
    await db.insert(aiUsage).values([
      { debateId: debOld, role: 'lawyer', tokensUsed: 999, model: 'm1', createdAt: old },
      { debateId: debNew, role: 'lawyer', tokensUsed: 10, model: 'm1', createdAt: recent },
    ]);

    const dash = await getAiUsageDashboard(new Date(Date.now() - 1000 * 60 * 60));
    expect(dash.totals.tokensUsed).toBe(10);
    expect(dash.window?.since).toBeTruthy();
  });
});
