import { describe, it, expect } from 'vitest';
import { planTurns } from './engine.js';

describe('planTurns', () => {
  it('produces alternating affirmative/negative turns', () => {
    const plan = planTurns(2);
    expect(plan).toHaveLength(4);
    expect(plan[0]).toEqual({ roundIndex: 0, turnIndex: 0, side: 'affirmative' });
    expect(plan[1]).toEqual({ roundIndex: 0, turnIndex: 1, side: 'negative' });
    expect(plan[2]).toEqual({ roundIndex: 1, turnIndex: 2, side: 'affirmative' });
    expect(plan[3]).toEqual({ roundIndex: 1, turnIndex: 3, side: 'negative' });
  });

  it('produces 2 * maxRounds entries', () => {
    expect(planTurns(4)).toHaveLength(8);
    expect(planTurns(1)).toHaveLength(2);
  });

  it('affirms always opens each round', () => {
    const plan = planTurns(3);
    for (let r = 0; r < 3; r++) {
      const roundTurns = plan.filter((t) => t.roundIndex === r);
      expect(roundTurns[0].side).toBe('affirmative');
    }
  });
});
