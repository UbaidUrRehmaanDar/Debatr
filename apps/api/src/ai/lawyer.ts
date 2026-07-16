import { getProvider } from './provider.js';
import { config } from '../config/env.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface LawyerContext {
  debateTopic: string;
  participantSide: 'affirmative' | 'negative';
  publicMessages: Array<{ side: string; content: string; createdAt: string }>;
  participantRequest: string;
}

interface LawyerResponse {
  assistanceType: 'supporting_argument' | 'rebuttal' | 'counterargument' | 'clarity_improvement' | 'weakness_identification' | 'evidence_suggestion' | 'summary' | 'safe_refusal';
  advice: string;
  uncertainty?: string;
  evidenceSuggestions: Array<{
    claim: string;
    verificationNeeded: string;
    providedSourceMessageId?: string;
  }>;
  referencedMessageIds?: string[];
  conductConcern: 'none' | 'possible_harassment' | 'possible_threat' | 'possible_hate' | 'possible_harm' | 'other';
}

let lawyerPromptTemplate: string | null = null;

function loadLawyerPrompt(): string {
  if (!lawyerPromptTemplate) {
    const promptPath = join(__dirname, '../../../../prompts/lawyer.md');
    lawyerPromptTemplate = readFileSync(promptPath, 'utf-8');
  }
  return lawyerPromptTemplate;
}

export async function getLawyerAdvice(context: LawyerContext): Promise<{ response: LawyerResponse; tokensUsed: number }> {
  const provider = getProvider();
  const promptTemplate = loadLawyerPrompt();

  if (!config.aiLawyerModel) {
    throw new Error('AI_LAWYER_MODEL is not configured. Set it after a privacy-reviewed evaluation (see D-011).');
  }
  
  // Build the context for the AI
  const messagesContext = context.publicMessages.map(m => 
    `[${m.side}] ${m.createdAt}: ${m.content}`
  ).join('\n');
  
  const fullPrompt = `${promptTemplate}

## Current Debate Context
Topic: ${context.debateTopic}
Your client's side: ${context.participantSide}

## Public Debate Transcript
${messagesContext || 'No messages yet'}

## Participant's Request
${context.participantRequest}

Respond with valid JSON matching the LawyerResponse schema.`;

  const result = await provider.complete(fullPrompt, {
    model: config.aiLawyerModel,
    maxTokens: 2048,
    temperature: 0.7,
  });
  
  // Parse the response as JSON
  try {
    const response: LawyerResponse = JSON.parse(result.content);
    return {
      response,
      tokensUsed: result.usage?.totalTokens || 0,
    };
  } catch (error) {
    throw new Error(`Failed to parse Lawyer AI response: ${error}`);
  }
}
