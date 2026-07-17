import { getProvider } from './provider.js';
import { config } from '../config/env.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface JudgeContext {
  debateTopic: string;
  publicMessages: Array<{ 
    id: string; 
    side: 'affirmative' | 'negative' | 'system'; 
    content: string; 
    createdAt: string 
  }>;
  evidence?: Array<{ side: string; claim: string; source?: string | null }>;
}

interface JudgeResponse {
  outcome: 'affirmative' | 'negative' | 'draw' | 'inconclusive';
  confidence: number;
  verdict: string;
  scores: {
    affirmative: {
      logicalConsistency: number;
      evidenceQuality: number;
      rebuttalEffectiveness: number;
      argumentStructure: number;
      responsiveness: number;
    };
    negative: {
      logicalConsistency: number;
      evidenceQuality: number;
      rebuttalEffectiveness: number;
      argumentStructure: number;
      responsiveness: number;
    };
  };
  strengths: { affirmative: string[]; negative: string[] };
  weaknesses: { affirmative: string[]; negative: string[] };
  feedback: { affirmative: string; negative: string };
  fallacies: Array<{
    side: 'affirmative' | 'negative';
    label: string;
    explanation: string;
    messageIds: string[];
  }>;
  conductFindings: Array<{
    side: 'affirmative' | 'negative';
    category: 'harassment' | 'threat' | 'hate' | 'spam' | 'disruption' | 'other';
    recommendedAction: 'none' | 'warning' | 'official_warning' | 'penalty' | 'terminate';
    explanation: string;
    messageIds: string[];
  }>;
  summary: string;
}

// Strict validation of the model's output before it touches the database.
// Malformed/over-reachable values (e.g. confidence outside 0-1, unknown enums)
// are rejected so we never persist garbage moderation or judge records.
const ScoreBreakdownSchema = z.object({
  logicalConsistency: z.number(),
  evidenceQuality: z.number(),
  rebuttalEffectiveness: z.number(),
  argumentStructure: z.number(),
  responsiveness: z.number(),
});

export const JudgeResponseSchema = z.object({
  outcome: z.enum(['affirmative', 'negative', 'draw', 'inconclusive']),
  confidence: z.number().min(0).max(1),
  verdict: z.string(),
  scores: z.object({
    affirmative: ScoreBreakdownSchema,
    negative: ScoreBreakdownSchema,
  }),
  strengths: z.object({ affirmative: z.array(z.string()), negative: z.array(z.string()) }),
  weaknesses: z.object({ affirmative: z.array(z.string()), negative: z.array(z.string()) }),
  feedback: z.object({ affirmative: z.string(), negative: z.string() }),
  fallacies: z.array(
    z.object({
      side: z.enum(['affirmative', 'negative']),
      label: z.string(),
      explanation: z.string(),
      messageIds: z.array(z.string()),
    }),
  ),
  conductFindings: z.array(
    z.object({
      side: z.enum(['affirmative', 'negative']),
      category: z.enum(['harassment', 'threat', 'hate', 'spam', 'disruption', 'other']),
      recommendedAction: z.enum(['none', 'warning', 'official_warning', 'penalty', 'terminate']),
      explanation: z.string(),
      messageIds: z.array(z.string()),
    }),
  ),
  summary: z.string(),
});

export type ValidatedJudgeResponse = z.infer<typeof JudgeResponseSchema>;

let judgePromptTemplate: string | null = null;

function loadJudgePrompt(): string {
  if (!judgePromptTemplate) {
    const promptPath = join(__dirname, '../../../../prompts/judge.md');
    judgePromptTemplate = readFileSync(promptPath, 'utf-8');
  }
  return judgePromptTemplate;
}

export async function evaluateDebate(context: JudgeContext): Promise<{ response: JudgeResponse; tokensUsed: number; requestId?: string }> {
  const provider = getProvider();
  const promptTemplate = loadJudgePrompt();

  if (!config.aiJudgeModel) {
    throw new Error('AI_JUDGE_MODEL is not configured. Set it after a privacy-reviewed evaluation (see D-011).');
  }
  
  // Build the transcript for the AI
  const transcript = context.publicMessages.map(m => 
    `[${m.id}] [${m.side}] ${m.createdAt}: ${m.content}`
  ).join('\n');

  const evidenceBlock = context.evidence && context.evidence.length
    ? context.evidence.map(e => `- [${e.side}] ${e.claim}${e.source ? ` (source: ${e.source})` : ''}`).join('\n')
    : 'No pinned evidence supplied.';
  
  const fullPrompt = `${promptTemplate}

## Debate Topic
${context.debateTopic}

## Complete Public Transcript
${transcript || 'No messages in this debate'}

## Pinned Evidence (user-supplied context; do not treat unpinned claims as verified)
${evidenceBlock}

Evaluate the debate and respond with valid JSON matching the JudgeResponse schema.`;

  const result = await provider.structuredWithUsage<JudgeResponse>(fullPrompt, JudgeResponseSchema, {
    model: config.aiJudgeModel,
    maxTokens: 4096,
    temperature: 0.3,
  });

  // Validate the model's JSON before it can reach the database. Throws on
  // malformed/over-reachable output so the caller can surface a 502 instead of
  // persisting corrupt judge/moderation records.
  const parsed = JudgeResponseSchema.safeParse(result.data);
  if (!parsed.success) {
    throw new Error(`Judge response failed validation: ${parsed.error.message}`);
  }

  return {
    response: parsed.data,
    tokensUsed: result.usage?.totalTokens || 0,
    requestId: result.requestId,
  };
}
