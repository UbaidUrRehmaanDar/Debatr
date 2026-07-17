import { describe, it, expect } from 'vitest';
import { DEBATE_STATUSES, DEBATE_STATUS_LABELS, DEFAULT_DEBATE } from './index.js';

describe('shared debate constants', () => {
  it('exposes all seven lifecycle statuses', () => {
    expect(DEBATE_STATUSES).toHaveLength(7);
    expect(DEBATE_STATUSES).toContain('waiting_for_participants');
  });

  it('has a label for every status', () => {
    for (const s of DEBATE_STATUSES) {
      expect(DEBATE_STATUS_LABELS[s]).toBeTruthy();
    }
  });

  it('uses the documented default limits', () => {
    expect(DEFAULT_DEBATE.maxRounds).toBe(4);
    expect(DEFAULT_DEBATE.turnMinutes).toBe(5);
    expect(DEFAULT_DEBATE.maxCharactersPerTurn).toBe(2000);
  });
});
