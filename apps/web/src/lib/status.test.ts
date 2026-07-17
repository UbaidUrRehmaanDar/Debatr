import { describe, it, expect } from 'vitest';
import { DEBATE_STATUS_LABELS, JUDGE_OUTCOME_LABELS } from '@debatr/shared';

describe('status labels', () => {
  it('labels the active status', () => {
    expect(DEBATE_STATUS_LABELS.active).toBe('In progress');
  });

  it('labels inconclusive judge outcomes', () => {
    expect(JUDGE_OUTCOME_LABELS.inconclusive).toBe('Inconclusive');
  });
});
