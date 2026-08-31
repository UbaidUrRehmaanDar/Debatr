/**
 * OpenCode Zen API adapter
 * Provides a simple interface to the OpenCode Zen v1 API
 */

import { getEnv } from "@/server/lib/env"

interface OpenCodeMessage {
  role: "system" | "user" | "assistant"
  content: string
}

interface OpenCodeResponse {
  id: string
  choices: Array<{
    message: {
      role: "assistant"
      content: string
    }
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class OpenCodeProvider {
  private apiKey: string
  private baseUrl: string
  private model: string
  private timeout: number
  private maxRetries: number

  constructor(model?: string) {
    const env = getEnv()
    this.apiKey = env.OPENCODE_API_KEY
    this.baseUrl = env.OPENCODE_BASE_URL
    this.model = model || env.AI_LAWYER_MODEL
    this.timeout = env.AI_REQUEST_TIMEOUT_MS
    this.maxRetries = env.AI_MAX_RETRIES
  }

  async chat(messages: OpenCodeMessage[], temperature = 0.7): Promise<OpenCodeResponse> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: this.model,
            messages,
            temperature,
            max_tokens: getEnv().AI_MAX_TOKENS_PER_REQUEST,
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const error = await response.text()
          if (response.status === 429 || response.status === 503) {
            // Retry on rate limit or service unavailable
            if (attempt < this.maxRetries - 1) {
              const backoff = Math.pow(2, attempt) * 1000
              await new Promise((resolve) => setTimeout(resolve, backoff))
              continue
            }
          }
          throw new Error(`OpenCode API error: ${response.status} ${error}`)
        }

        const data = (await response.json()) as OpenCodeResponse
        return data
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          throw new Error("OpenCode API request timeout")
        }

        // Retry on network error
        if (attempt < this.maxRetries - 1 && (error as Error).message.includes("fetch")) {
          const backoff = Math.pow(2, attempt) * 1000
          await new Promise((resolve) => setTimeout(resolve, backoff))
          continue
        }

        throw error
      }
    }

    throw new Error("OpenCode API max retries exceeded")
  }

  /**
   * Extract structured JSON from model response
   */
  static extractJSON<T>(text: string): T | null {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null
    try {
      return JSON.parse(jsonMatch[0]) as T
    } catch {
      return null
    }
  }
}

export function createLawyerProvider() {
  const env = getEnv()
  const provider = new OpenCodeProvider(env.AI_LAWYER_MODEL)
  return provider
}

export function createJudgeProvider() {
  const env = getEnv()
  const provider = new OpenCodeProvider(env.AI_JUDGE_MODEL)
  return provider
}

export function createFactCheckerProvider() {
  const env = getEnv()
  const provider = new OpenCodeProvider(env.AI_FACT_CHECKER_MODEL)
  return provider
}
