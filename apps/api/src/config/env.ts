import { z } from 'zod';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Load .env from the app dir or repo root (pnpm --filter runs from apps/api,
// but .env lives at the repo root). Mirrors the loader in db/migrate.ts.
for (const candidate of [resolve(process.cwd(), '.env'), resolve(process.cwd(), '..', '..', '.env')]) {
  if (existsSync(candidate)) {
    try {
      process.loadEnvFile(candidate);
    } catch {
      // ignore parse errors
    }
    break;
  }
}

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
  
  // Better Auth
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  
  // Application origins
  WEB_ORIGIN: z.string().url(),
  API_ORIGIN: z.string().url(),
  
  // OpenCode Zen AI Provider
  OPENCODE_API_KEY: z.string().min(1),
  OPENCODE_BASE_URL: z.string().url(),
  // Model IDs are chosen after evaluation; optional until then (see D-011).
  AI_LAWYER_MODEL: z.string().optional(),
  AI_JUDGE_MODEL: z.string().optional(),

  // Email service (Resend)
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().min(1),
  
  // AI usage limits and timeouts
  AI_MAX_TOKENS_PER_REQUEST: z.string().transform(Number).default('4096'),
  AI_MAX_TOKENS_PER_DEBATE: z.string().transform(Number).default('50000'),
  AI_REQUEST_TIMEOUT_MS: z.string().transform(Number).default('30000'),
  AI_MAX_RETRIES: z.string().transform(Number).default('3'),
  // Optional cost estimate input: USD per 1,000 tokens (prompt + completion
  // combined). Leave unset to report token totals only (no fabricated cost).
  AI_COST_PER_1K_TOKENS: z.string().transform(Number).optional(),
  
  // Debate settings (defaults)
  DEBATE_DEFAULT_ROUNDS: z.string().transform(Number).default('4'),
  DEBATE_DEFAULT_TURN_MINUTES: z.string().transform(Number).default('5'),
  DEBATE_DEFAULT_MAX_CHARACTERS: z.string().transform(Number).default('2000'),
  
  // Environment
  NODE_ENV: z.enum(['development', 'production']).default('development'),
});

export type EnvConfig = z.infer<typeof envSchema>;

class Config {
  private config: EnvConfig | null = null;
  
  load(): boolean {
    try {
      const result = envSchema.safeParse(process.env);
      
      if (!result.success) {
        const errors = result.error.errors.map(e => 
          `${e.path.join('.')}: ${e.message}`
        );
        console.error('Environment validation errors:', errors);
        this.config = null;
        return false;
      }
      
      this.config = result.data;
      return true;
    } catch (error) {
      console.error('Failed to load configuration:', error);
      this.config = null;
      return false;
    }
  }
  
  validate(): boolean {
    return this.config !== null;
  }
  
  get databaseUrl(): string {
    return this.config!.DATABASE_URL;
  }
  
  get betterAuthSecret(): string {
    return this.config!.BETTER_AUTH_SECRET;
  }
  
  get betterAuthUrl(): string {
    return this.config!.BETTER_AUTH_URL;
  }
  
  get webOrigin(): string {
    return this.config!.WEB_ORIGIN;
  }
  
  get apiOrigin(): string {
    return this.config!.API_ORIGIN;
  }
  
  get opencodeApiKey(): string {
    return this.config!.OPENCODE_API_KEY;
  }
  
  get opencodeBaseUrl(): string {
    return this.config!.OPENCODE_BASE_URL;
  }
  
  get aiLawyerModel(): string | undefined {
    return this.config!.AI_LAWYER_MODEL;
  }
  
  get aiJudgeModel(): string | undefined {
    return this.config!.AI_JUDGE_MODEL;
  }
  
  get aiMaxTokensPerRequest(): number {
    return this.config!.AI_MAX_TOKENS_PER_REQUEST;
  }
  
  get aiMaxTokensPerDebate(): number {
    return this.config!.AI_MAX_TOKENS_PER_DEBATE;
  }
  
  get aiRequestTimeoutMs(): number {
    return this.config!.AI_REQUEST_TIMEOUT_MS;
  }
  
  get aiMaxRetries(): number {
    return this.config!.AI_MAX_RETRIES;
  }

  get aiCostPer1kTokens(): number | undefined {
    return this.config!.AI_COST_PER_1K_TOKENS;
  }

  get resendApiKey(): string {
    return this.config!.RESEND_API_KEY;
  }

  get emailFrom(): string {
    return this.config!.EMAIL_FROM;
  }
  
  get debateDefaultRounds(): number {
    return this.config!.DEBATE_DEFAULT_ROUNDS;
  }
  
  get debateDefaultTurnMinutes(): number {
    return this.config!.DEBATE_DEFAULT_TURN_MINUTES;
  }
  
  get debateDefaultMaxCharacters(): number {
    return this.config!.DEBATE_DEFAULT_MAX_CHARACTERS;
  }
  
  get nodeEnv(): 'development' | 'production' {
    return this.config!.NODE_ENV;
  }
  
  get port(): number {
    return this.nodeEnv === 'production' ? 3000 : 3000;
  }
  
  get host(): string {
    return '0.0.0.0';
  }
}

export const config = new Config();
