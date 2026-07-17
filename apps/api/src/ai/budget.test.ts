import { describe, it, expect } from 'vitest';
import { evaluateBudget } from './budget.js';

describe('evaluateBudget', () => {
  it('allows when under the limit', () => {
    const r = evaluateBudget(100, 50000);
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(49900);
  });

  it('allows when exactly at the limit boundary (strictly less)', () => {
    const r = evaluateBudget(50000, 50000);
    expect(r.allowed).toBe(false);
    expect(r.remaining).toBe(0);
  });

  it('blocks when over the limit', () => {
    const r = evaluateBudget(60000, 50000);
    expect(r.allowed).toBe(false);
  });

  it('never returns negative remaining', () => {
    const r = evaluateBudget(999999, 50000);
    expect(r.remaining).toBe(0);
  });
});
