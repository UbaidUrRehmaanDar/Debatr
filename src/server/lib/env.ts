/**
 * Environment variables validation and loading
 */

import { z } from "zod"

const envSchema = z.object({
  // App
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Database
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),

  // Auth
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL").default("http://localhost:3000"),

  // AI Provider (OpenCode Zen)
  OPENCODE_API_KEY: z.string().min(1, "OPENCODE_API_KEY is required"),
  OPENCODE_BASE_URL: z
    .string()
    .url("OPENCODE_BASE_URL must be a valid URL")
    .default("https://opencode.ai/zen/v1"),

  // AI Models
  AI_LAWYER_MODEL: z.string().default("nemotron-3-ultra-free"),
  AI_JUDGE_MODEL: z.string().default("nemotron-3-ultra-free"),
  AI_FACT_CHECKER_MODEL: z.string().default("ling-3.0-flash-fin-free"),

  // AI Budget and limits
  AI_MAX_TOKENS_PER_REQUEST: z.coerce.number().default(8192),
  AI_MAX_TOKENS_PER_DEBATE: z.coerce.number().default(50000),
  AI_REQUEST_TIMEOUT_MS: z.coerce.number().default(60000),
  AI_MAX_RETRIES: z.coerce.number().default(3),

  // Email (optional, for future use)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("Debatr <noreply@debatr.app>"),

  // Debate defaults
  DEBATE_DEFAULT_ROUNDS: z.coerce.number().default(4),
  DEBATE_DEFAULT_TURN_MINUTES: z.coerce.number().default(5),
  DEBATE_DEFAULT_MAX_CHARACTERS: z.coerce.number().default(2000),
})

export type Env = z.infer<typeof envSchema>

let envCache: Env | null = null

export function getEnv(): Env {
  if (envCache) {
    return envCache
  }

  const raw = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    OPENCODE_API_KEY: process.env.OPENCODE_API_KEY,
    OPENCODE_BASE_URL: process.env.OPENCODE_BASE_URL,
    AI_LAWYER_MODEL: process.env.AI_LAWYER_MODEL,
    AI_JUDGE_MODEL: process.env.AI_JUDGE_MODEL,
    AI_FACT_CHECKER_MODEL: process.env.AI_FACT_CHECKER_MODEL,
    AI_MAX_TOKENS_PER_REQUEST: process.env.AI_MAX_TOKENS_PER_REQUEST,
    AI_MAX_TOKENS_PER_DEBATE: process.env.AI_MAX_TOKENS_PER_DEBATE,
    AI_REQUEST_TIMEOUT_MS: process.env.AI_REQUEST_TIMEOUT_MS,
    AI_MAX_RETRIES: process.env.AI_MAX_RETRIES,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    DEBATE_DEFAULT_ROUNDS: process.env.DEBATE_DEFAULT_ROUNDS,
    DEBATE_DEFAULT_TURN_MINUTES: process.env.DEBATE_DEFAULT_TURN_MINUTES,
    DEBATE_DEFAULT_MAX_CHARACTERS: process.env.DEBATE_DEFAULT_MAX_CHARACTERS,
  }

  const result = envSchema.safeParse(raw)

  if (!result.success) {
    console.error("Invalid environment variables:")
    console.error(result.error.flatten())
    throw new Error("Invalid environment variables")
  }

  envCache = result.data
  return envCache
}
