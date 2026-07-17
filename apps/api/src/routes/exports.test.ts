import { describe, it, expect } from 'vitest';
import { buildExportPayload, validateExportPayload, checkImportVersion, EXPORT_VERSION } from './exports.js';

const A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const T1 = '11111111-1111-1111-1111-111111111111';
const T2 = '22222222-2222-2222-2222-222222222222';
const T3 = '33333333-3333-3333-3333-333333333333';
const T4 = '44444444-4444-4444-4444-444444444444';
const M1 = 'aaaaaaaa-0000-0000-0000-000000000001';
const M2 = 'aaaaaaaa-0000-0000-0000-000000000002';
const M3 = 'aaaaaaaa-0000-0000-0000-000000000003';
const M4 = 'aaaaaaaa-0000-0000-0000-000000000004';

const baseDebate: any = {
  id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
  topic: 'This house would test exports',
  description: null,
  status: 'completed',
  participants: {
    affirmative: { userId: A, displayName: 'Alice', joinedAt: new Date().toISOString() },
    negative: { userId: B, displayName: 'Bob', joinedAt: new Date().toISOString() },
  },
  maxRounds: 2,
  roundDurationMs: 300000,
  maxCharactersPerTurn: 2000,
  currentRound: 1,
  currentTurnId: null,
  judgeReportId: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T01:00:00Z'),
  completedAt: new Date('2025-01-01T02:00:00Z'),
};

const turns: any[] = [
  { id: T1, debateId: baseDebate.id, roundIndex: 0, turnIndex: 0, side: 'affirmative', participantId: A, startTime: new Date(), endTime: new Date(), status: 'completed' },
  { id: T2, debateId: baseDebate.id, roundIndex: 0, turnIndex: 1, side: 'negative', participantId: B, startTime: new Date(), endTime: new Date(), status: 'completed' },
  { id: T3, debateId: baseDebate.id, roundIndex: 1, turnIndex: 2, side: 'affirmative', participantId: A, startTime: new Date(), endTime: new Date(), status: 'completed' },
  { id: T4, debateId: baseDebate.id, roundIndex: 1, turnIndex: 3, side: 'negative', participantId: B, startTime: new Date(), endTime: new Date(), status: 'completed' },
];

const messages: any[] = [
  { id: M1, debateId: baseDebate.id, turnId: T1, senderId: A, side: 'affirmative', content: 'First point.', createdAt: new Date('2025-01-01T00:05:00Z') },
  { id: M2, debateId: baseDebate.id, turnId: T2, senderId: B, side: 'negative', content: 'Rebuttal.', createdAt: new Date('2025-01-01T00:10:00Z') },
  { id: M3, debateId: baseDebate.id, turnId: T3, senderId: A, side: 'affirmative', content: 'Second point.', createdAt: new Date('2025-01-01T00:30:00Z') },
  { id: M4, debateId: baseDebate.id, turnId: T4, senderId: B, side: 'negative', content: 'Closing.', createdAt: new Date('2025-01-01T00:35:00Z') },
];

const judgeReport: any = {
  id: '22222222-2222-2222-2222-222222222222',
  debateId: baseDebate.id,
  outcome: 'affirmative',
  confidence: 0.8,
  verdict: 'Affirmative made stronger arguments.',
  scores: {
    affirmative: { logicalConsistency: 80, evidenceQuality: 70, rebuttalEffectiveness: 75, argumentStructure: 80, responsiveness: 70 },
    negative: { logicalConsistency: 60, evidenceQuality: 55, rebuttalEffectiveness: 50, argumentStructure: 60, responsiveness: 65 },
  },
  strengths: { affirmative: ['clarity'], negative: ['effort'] },
  weaknesses: { affirmative: ['speed'], negative: ['structure'] },
  feedback: { affirmative: 'Good.', negative: 'Improve.' },
  fallacies: [],
  conductFindings: [],
  summary: 'Affirmative wins on logic and evidence.',
  tokensUsed: 1234,
  createdAt: new Date(),
};

describe('buildExportPayload', () => {
  it('produces a payload with version, debate, and judge report', () => {
    const payload = buildExportPayload(baseDebate, turns, messages, judgeReport, A);
    expect(payload.version).toBe(EXPORT_VERSION);
    expect(payload.debate.id).toBe(baseDebate.id);
    expect(payload.debate.rounds).toHaveLength(2);
    expect(payload.judgeReport.outcome).toBe('affirmative');
    expect(payload.metadata.exporter).toBe(A);
  });

  it('groups messages into the correct rounds', () => {
    const payload = buildExportPayload(baseDebate, turns, messages, null, 'a');
    expect(payload.debate.rounds[0].messages).toHaveLength(2);
    expect(payload.debate.rounds[1].messages).toHaveLength(2);
    expect(payload.judgeReport).toBeUndefined();
  });
});

describe('validateExportPayload', () => {
  it('accepts a well-formed payload', () => {
    const payload = buildExportPayload(baseDebate, turns, messages, judgeReport, A);
    const result = validateExportPayload(payload);
    expect(result.valid).toBe(true);
  });

  it('rejects a payload missing required fields', () => {
    const result = validateExportPayload({ foo: 'bar' });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('checkImportVersion', () => {
  it('accepts the current major version', () => {
    const r = checkImportVersion(EXPORT_VERSION);
    expect(r.accepted).toBe(true);
  });

  it('rejects a different major version', () => {
    const r = checkImportVersion('2.0.0');
    expect(r.accepted).toBe(false);
  });

  it('rejects a non-semver string', () => {
    const r = checkImportVersion('latest');
    expect(r.accepted).toBe(false);
  });
});
