import { getProvider } from './provider.js';
import { config } from '../config/env.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

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
  uncertainty: z.string().optional(),
  evidenceSuggestions: z.array(
    z.object({
      claim: z.string(),
      verificationNeeded: z.string(),
      providedSourceMessageId: z.string().optional(),
    }),
  ),
  referencedMessageIds: z.array(z.string()).optional(),
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
  
  const fullPrompt = `${promptTemplate}

## Current Debate Context
Topic: ${context.debateTopic}
Your client's side: ${context.participantSide}

## Public Debate Transcript
${messagesContext || 'No messages yet'}

## Pinned Evidence (user-supplied context; do not treat unpinned claims as verified)
${evidenceBlock}

## Participant's Request
${context.participantRequest}

Respond with valid JSON matching the LawyerResponse schema.`;

  const result = await provider.complete(fullPrompt, {
    model: config.aiLawyerModel,
    maxTokens: 2048,
    temperature: 0.7,
  });
  
  // Parse and strictly validate the response as JSON before returning it. A
  // malformed or prompt-injection-shaped payload fails validation and surfaces
  // as a 502 rather than persisting corrupt data.
  let parsed: unknown;
  try {
    parsed = JSON.parse(result.content);
  } catch (error) {
    throw new Error(`Failed to parse Lawyer AI response: ${error}`);
  }

  const validated = LawyerResponseSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(`Lawyer response failed validation: ${validated.error.message}`);
  }

  return {
    response: validated.data,
    tokensUsed: result.usage?.totalTokens || 0,
    requestId: result.requestId,
  };
}
