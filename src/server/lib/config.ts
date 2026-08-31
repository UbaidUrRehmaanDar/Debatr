// src/server/lib/config.ts
import { z } from "zod"

const configSchema = z.object({
  // App
  nodeEnv: z.enum(["development", "test", "production"]).default("development"),
  nextAuthUrl: z.string().url().default("http://localhost:3000"),
  nextAuthSecret: z.string().min(32),

  // Database
  databaseUrl: z.string().url(),

  // AI Provider
  opencodeApiKey: z.string().min(1),
  opencodeBaseUrl: z.string().url().optional(),
  aiLawyerModel: z.string().optional(),
  aiJudgeModel: z.string().optional(),
  aiFactCheckerModel: z.string().optional(),

  // AI Controls
  aiMaxTokensPerRequest: z.coerce.number().default(4096),
  aiMaxTokensPerDebate: z.coerce.number().default(50000),
  aiRequestTimeoutMs: z.coerce.number().default(60000),
  aiMaxRetries: z.coerce.number().default(3),

  // Email
  resendApiKey: z.string().optional(),
  emailFrom: z.string().optional(),

  // Debate defaults
  debateDefaultRounds: z.coerce.number().optional(),
  debateDefaultTurnMinutes: z.coerce.number().optional(),
  debateDefaultMaxCharacters: z.coerce.number().optional(),

  // WebSocket
  wsPort: z.coerce.number().optional(),
})

function loadConfig() {
  const raw = {
    nodeEnv: process.env.NODE_ENV,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    nextAuthSecret: process.env.NEXTAUTH_SECRET,
    databaseUrl: process.env.DATABASE_URL,
    opencodeApiKey: process.env.OPENCODE_API_KEY,
    opencodeBaseUrl: process.env.OPENCODE_BASE_URL,
    aiLawyerModel: process.env.AI_LAWYER_MODEL,
    aiJudgeModel: process.env.AI_JUDGE_MODEL,
    aiFactCheckerModel: process.env.AI_FACT_CHECKER_MODEL,
    aiMaxTokensPerRequest: process.env.AI_MAX_TOKENS_PER_REQUEST,
    aiMaxTokensPerDebate: process.env.AI_MAX_TOKENS_PER_DEBATE,
    aiRequestTimeoutMs: process.env.AI_REQUEST_TIMEOUT_MS,
    aiMaxRetries: process.env.AI_MAX_RETRIES,
    resendApiKey: process.env.RESEND_API_KEY,
    emailFrom: process.env.EMAIL_FROM,
    debateDefaultRounds: process.env.DEBATE_DEFAULT_ROUNDS,
    debateDefaultTurnMinutes: process.env.DEBATE_DEFAULT_TURN_MINUTES,
    debateDefaultMaxCharacters: process.env.DEBATE_DEFAULT_MAX_CHARACTERS,
    wsPort: process.env.WS_PORT,
  }

  const parsed = configSchema.safeParse(raw)
  if (!parsed.success) {
    console.error("Invalid environment configuration:", parsed.error.flatten())
    throw new Error("Invalid environment configuration. Please check your .env file.")
  }
  return parsed.data
}

export const config = loadConfig()
