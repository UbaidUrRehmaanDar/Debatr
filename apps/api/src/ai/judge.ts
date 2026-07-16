import { getProvider } from './provider.js';
import { config } from '../config/env.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface JudgeContext {
  debateTopic: string;
  publicMessages: Array<{ 
    id: string; 
    side: 'affirmative' | 'negative' | 'system'; 
    content: string; 
    createdAt: string 
  }>;
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

let judgePromptTemplate: string | null = null;

function loadJudgePrompt(): string {
  if (!judgePromptTemplate) {
    const promptPath = join(__dirname, '../../../../prompts/judge.md');
    judgePromptTemplate = readFileSync(promptPath, 'utf-8');
  }
  return judgePromptTemplate;
}

export async function evaluateDebate(context: JudgeContext): Promise<{ response: JudgeResponse; tokensUsed: number }> {
  const provider = getProvider();
  const promptTemplate = loadJudgePrompt();

  if (!config.aiJudgeModel) {
    throw new Error('AI_JUDGE_MODEL is not configured. Set it after a privacy-reviewed evaluation (see D-011).');
  }
  
  // Build the transcript for the AI
  const transcript = context.publicMessages.map(m => 
    `[${m.id}] [${m.side}] ${m.createdAt}: ${m.content}`
  ).join('\n');
  
  const fullPrompt = `${promptTemplate}

## Debate Topic
${context.debateTopic}

## Complete Public Transcript
${transcript || 'No messages in this debate'}

Evaluate the debate and respond with valid JSON matching the JudgeResponse schema.`;

  const result = await provider.structured<JudgeResponse>(fullPrompt, {}, {
    model: config.aiJudgeModel,
    maxTokens: 4096,
    temperature: 0.3,
  });
  
  return {
    response: result,
    tokensUsed: 0, // Will be populated by provider if available
  };
}
