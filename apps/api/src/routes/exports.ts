import Ajv from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { debates, turns, messages, judgeReports } from '../db/schema/index.js';

type DebateRow = typeof debates.$inferSelect;
type TurnRow = typeof turns.$inferSelect;
type MessageRow = typeof messages.$inferSelect;
type JudgeReportRow = typeof judgeReports.$inferSelect;

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA_DIR = join(__dirname, '../../../../schemas');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const exportSchema = JSON.parse(readFileSync(join(SCHEMA_DIR, 'debate-export.schema.json'), 'utf-8'));
// Resolve internal $refs by compiling sibling schemas alongside.
const debateSchema = JSON.parse(readFileSync(join(SCHEMA_DIR, 'debate.schema.json'), 'utf-8'));
const judgeSchema = JSON.parse(readFileSync(join(SCHEMA_DIR, 'judge-response.schema.json'), 'utf-8'));
ajv.addSchema(debateSchema);
ajv.addSchema(judgeSchema);
const validateExport = ajv.compile(exportSchema);

export const EXPORT_VERSION = '1.0.0';

/**
 * Serialise a debate + its turns/messages into the canonical export shape
 * (debate.schema.json). Lawyer logs are intentionally excluded.
 */
export function buildExportPayload(
  debate: DebateRow,
  turns: TurnRow[],
  messages: MessageRow[],
  judgeReport: JudgeReportRow | null,
  exporterId: string,
) {
  const roundsMap = new Map<number, any[]>();
  for (const t of turns) {
    if (!roundsMap.has(t.roundIndex)) roundsMap.set(t.roundIndex, []);
  }
  const rounds = [...roundsMap.keys()].sort((a, b) => a - b).map((idx) => ({
    index: idx,
    messages: messages
      .filter((m) => turns.find((t) => t.id === m.turnId)?.roundIndex === idx || (idx === 0 && !m.turnId))
      .map((m) => ({
        id: m.id,
        senderId: m.senderId,
        side: m.side,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
  }));

  const debatePayload = {
    id: debate.id,
    topic: debate.topic,
    description: debate.description,
    status: debate.status,
    participants: {
      affirmative: { ...debate.participants.affirmative, side: 'affirmative' },
      negative: { ...debate.participants.negative, side: 'negative' },
    },
    rounds,
    currentRound: debate.currentRound,
    currentTurnId: debate.currentTurnId,
    settings: {
      maxRounds: debate.maxRounds,
      roundDurationMs: debate.roundDurationMs,
      maxCharactersPerTurn: debate.maxCharactersPerTurn,
      allowSpectators: false,
      rulesVersion: '1.0.0',
    },
    judgeReportId: debate.judgeReportId,
    createdAt: debate.createdAt.toISOString(),
    updatedAt: debate.updatedAt.toISOString(),
    completedAt: debate.completedAt?.toISOString() ?? null,
  };

  const payload: any = {
    version: EXPORT_VERSION,
    debate: debatePayload,
    metadata: { source: 'debatr', exporter: exporterId, format: 'json' },
    exportedAt: new Date().toISOString(),
  };

  if (judgeReport) {
    payload.judgeReport = {
      outcome: judgeReport.outcome,
      confidence: judgeReport.confidence,
      verdict: judgeReport.verdict,
      scores: judgeReport.scores,
      strengths: judgeReport.strengths,
      weaknesses: judgeReport.weaknesses,
      feedback: judgeReport.feedback,
      fallacies: judgeReport.fallacies,
      conductFindings: judgeReport.conductFindings,
      summary: judgeReport.summary,
    };
  }

  return payload;
}

export function validateExportPayload(payload: unknown): { valid: boolean; errors: string[] } {
  const valid = validateExport(payload);
  return {
    valid: !!valid,
    errors: validateExport.errors?.map((e) => `${e.instancePath} ${e.message}`) ?? [],
  };
}

/**
 * Validate an imported export's declared version. Reject unsupported major
 * versions per docs/debates/EXPORT.md; accept same major with a clear note.
 */
export function checkImportVersion(version: string): { accepted: boolean; note: string } {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) return { accepted: false, note: 'Version string is not semver.' };
  const major = Number(match[1]);
  const [expMajor] = EXPORT_VERSION.split('.');
  if (major !== Number(expMajor)) {
    return { accepted: false, note: `Unsupported export major version ${major}; expected ${expMajor}.` };
  }
  return { accepted: true, note: 'Version compatible.' };
}
