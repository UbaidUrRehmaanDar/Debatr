import { getProvider } from './provider.js';
import { config } from '../config/env.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { lookupEvidence, scoreArgument, TOOL_DESCRIPTIONS, type ToolContext } from './tools.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface LawyerContext {
  debateTopic: string;
  participantSide: 'affirmative' | 'negative';
  publicMessages: Array<{ side: string; content: string; createdAt: string }>;
  participantRequest: string;
  evidence?: Array<{ side: string; claim: string; source?: string | null }>;
}

let lawyerPromptTemplate: string | null = null;

function loadLawyerPrompt(): string {
  if (!lawyerPromptTemplate) {
    const promptPath = join(__dirname, '../../../../prompts/lawyer.md');
    lawyerPromptTemplate = readFileSync(promptPath, 'utf-8');
  }
  return lawyerPromptTemplate;
}

// Strict validation of the model's output before it is persisted. Prevents
// malformed / over-reachable values (e.g. unknown enums, injected fields) from
// being written to lawyerRequests.
export const LawyerResponseSchema = z.object({
  assistanceType: z.enum([
    'supporting_argument',
    'rebuttal',
    'counterargument',
    'clarity_improvement',
    'weakness_identification',
    'evidence_suggestion',
    'summary',
    'safe_refusal',
  ]),
  advice: z.string(),
  uncertainty: z.string().nullish(),
  evidenceSuggestions: z.array(
    z.object({
      claim: z.string(),
      verificationNeeded: z.string(),
      providedSourceMessageId: z.string().nullish(),
    }),
  ),
  referencedMessageIds: z.array(z.string()).nullish(),
  conductConcern: z.enum([
    'none',
    'possible_harassment',
    'possible_threat',
    'possible_hate',
    'possible_harm',
    'other',
  ]),
});

export type ValidatedLawyerResponse = z.infer<typeof LawyerResponseSchema>;

export async function getLawyerAdvice(context: LawyerContext): Promise<{ response: ValidatedLawyerResponse; tokensUsed: number; requestId?: string }> {
  const provider = getProvider();
  const promptTemplate = loadLawyerPrompt();

  if (!config.aiLawyerModel) {
    throw new Error('AI_LAWYER_MODEL is not configured. Set it after a privacy-reviewed evaluation (see D-011).');
  }
  
  // Build the context for the AI
  const messagesContext = context.publicMessages.map(m => 
    `[${m.side}] ${m.createdAt}: ${m.content}`
  ).join('\n');

  const evidenceBlock = context.evidence && context.evidence.length
    ? context.evidence.map(e => `- [${e.side}] ${e.claim}${e.source ? ` (source: ${e.source})` : ''}`).join('\n')
    : 'No pinned evidence supplied.';

  // Provider-agnostic tool use: execute deterministic, server-side tools and
  // feed their results into the prompt so the Lawyer is grounded in real
  // computed facts (no reliance on the model emitting tool calls).
  const toolCtx: ToolContext = {
    evidence: context.evidence ?? [],
    messages: context.publicMessages.map((m) => ({ id: '', side: m.side, content: m.content })),
  };
  const opponentSide = context.participantSide === 'affirmative' ? 'negative' : 'affirmative';
  const opponentMsgs = context.publicMessages.filter((m) => m.side === opponentSide);
  const lastOpponent = opponentMsgs[opponentMsgs.length - 1]?.content ?? '';
  const oppScore = lastOpponent ? scoreArgument(lastOpponent) : null;
  const sideEvidence = lookupEvidence(toolCtx, { side: context.participantSide });

  const toolBlock = `## Tool-derived context (computed server-side; factual)
Available tools:
${TOOL_DESCRIPTIONS}

- Score of the opponent's most recent message: ${
    oppScore ? `${oppScore.score} — ${oppScore.reasons.join(' ')}` : 'no opponent message yet'
  }
- Pinned evidence on YOUR client's side (${context.participantSide}): ${
    sideEvidence.length
      ? sideEvidence.map((e) => `"${e.claim}"${e.source ? ` (${e.source})` : ''}`).join('; ')
      : 'none'
  }`;

  const fullPrompt = `${promptTemplate}

## Current Debate Context
Topic: ${context.debateTopic}
Your client's side: ${context.participantSide}

## Public Debate Transcript
${messagesContext || 'No messages yet'}

## Pinned Evidence (user-supplied context; do not treat unpinned claims as verified)
${evidenceBlock}

${toolBlock}

## Participant's Request
${context.participantRequest}

Respond with valid JSON using this exact schema:
{
  "assistanceType": "supporting_argument | rebuttal | counterargument | clarity_improvement | weakness_identification | evidence_suggestion | summary | safe_refusal",
  "advice": "string — your main advice text",
  "uncertainty": "optional string or null",
  "evidenceSuggestions": [
    { "claim": "string", "verificationNeeded": "string", "providedSourceMessageId": "optional string or null" }
  ],
  "referencedMessageIds": ["optional array of strings or null"],
  "conductConcern": "none | possible_harassment | possible_threat | possible_hate | possible_harm | other"
}`;

  const result = await provider.structuredWithUsage<z.infer<typeof LawyerResponseSchema>>(fullPrompt, LawyerResponseSchema, {
    model: config.aiLawyerModel,
    maxTokens: Math.min(4096, config.aiMaxTokensPerRequest),
    temperature: 0.7,
  });

  // Parse and strictly validate the response as JSON before returning it. A
  // malformed or prompt-injection-shaped payload fails validation and surfaces
  // as a 502 rather than persisting corrupt data.
  const validated = LawyerResponseSchema.safeParse(result.data);
  if (!validated.success) {
    throw new Error(`Lawyer response failed validation: ${validated.error.message}`);
  }

  return {
    response: validated.data,
    tokensUsed: result.usage?.totalTokens || 0,
    requestId: result.requestId,
  };
}
