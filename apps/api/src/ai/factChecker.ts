import { getProvider } from './provider.js';
import { config } from '../config/env.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __dirname = dirname(fileURLToPath(import.meta.url));

const FactClaimSchema = z.object({
  claim: z.string().min(1),
  assessment: z.enum(['verified', 'disputed', 'unverified']),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().min(1),
  source: z.string().nullable().optional(),
});

export const FactCheckerResponseSchema = z.object({
  verdict: z.enum(['verified', 'disputed', 'unverified', 'mixed']),
  claims: z.array(FactClaimSchema).min(1),
});

export type FactCheckerResponse = z.infer<typeof FactCheckerResponseSchema>;

let factCheckerPromptTemplate: string | null = null;
function loadFactCheckerPrompt(): string {
  if (!factCheckerPromptTemplate) {
    const promptPath = join(__dirname, '../../../../prompts/fact_checker.md');
    factCheckerPromptTemplate = readFileSync(promptPath, 'utf-8');
  }
  return factCheckerPromptTemplate;
}

export interface FactCheckerContext {
  debateTopic: string;
  messageContent: string;
  messageSide: 'affirmative' | 'negative' | 'system';
  evidence?: Array<{ side: string; claim: string; source?: string | null }>;
}

export async function factCheckMessage(
  context: FactCheckerContext,
): Promise<{ response: FactCheckerResponse; tokensUsed: number; requestId?: string }> {
  const provider = getProvider();
  const promptTemplate = loadFactCheckerPrompt();

  if (!config.aiFactCheckerModel) {
    throw new Error(
      'AI_FACT_CHECKER_MODEL is not configured. Set it after a privacy-reviewed evaluation (see D-011).',
    );
  }

  const evidenceBlock = context.evidence && context.evidence.length
    ? context.evidence.map((e) => `- [${e.side}] ${e.claim}${e.source ? ` (source: ${e.source})` : ''}`).join('\n')
    : 'No pinned evidence supplied.';

  const fullPrompt = `${promptTemplate}

## Debate Topic
${context.debateTopic}

## Message author side
${context.messageSide}

## Pinned evidence (user-supplied context; do not treat unpinned claims as verified)
${evidenceBlock}

## Message to fact-check
${context.messageContent}

Assess the factual claims in the message and respond with valid JSON matching the FactCheckerResponse schema.`;

  const result = await provider.structuredWithUsage<FactCheckerResponse>(
    fullPrompt,
    FactCheckerResponseSchema,
    {
      model: config.aiFactCheckerModel,
      maxTokens: config.aiMaxTokensPerRequest,
      temperature: 0.2,
    },
  );

  const parsed = FactCheckerResponseSchema.safeParse(result.data);
  if (!parsed.success) {
    throw new Error(`Fact-checker response failed validation: ${parsed.error.message}`);
  }

  return {
    response: parsed.data,
    tokensUsed: result.usage?.totalTokens || 0,
    requestId: result.requestId,
  };
}
