import { config } from '../config/env.js';
import { logger } from '../observability/logger.js';

export interface AIProvider {
  name: string;
  complete(prompt: string, options?: AIOptions): Promise<AIResponse>;
  structured<T>(prompt: string, schema: object, options?: AIOptions): Promise<T>;
  structuredWithUsage<T>(prompt: string, schema: object, options?: AIOptions): Promise<{ data: T; usage?: AIResponse['usage']; requestId?: string }>;
}

export interface AIOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
  retries?: number;
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
  requestId?: string;
}

export class OpenCodeProvider implements AIProvider {
  name = 'opencode-zen';
  
  private baseUrl: string;
  private apiKey: string;
  
  constructor() {
    this.baseUrl = config.opencodeBaseUrl;
    this.apiKey = config.opencodeApiKey;
  }
  
  async complete(prompt: string, options?: AIOptions): Promise<AIResponse> {
    const model = options?.model || config.aiLawyerModel;
    const maxTokens = options?.maxTokens || config.aiMaxTokensPerRequest;
    const timeoutMs = options?.timeoutMs || config.aiRequestTimeoutMs;
    const retries = options?.retries || config.aiMaxRetries;
    const kind = 'complete';

    let lastError: Error | null = null;
    const started = Date.now();

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        logger.debug('ai.request', { kind, model, attempt, maxTokens });

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: maxTokens,
            temperature: options?.temperature ?? 0.7,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`OpenCode API error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const durationMs = Date.now() - started;
        const usage = {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        };

        logger.info('ai.response', {
          kind, model, attempt, durationMs,
          tokens: usage.totalTokens,
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          requestId: data.id,
        });

        return {
          content: data.choices[0]?.message?.content || '',
          usage,
          model: data.model,
          requestId: data.id,
        };
      } catch (error) {
        lastError = error as Error;

        // Don't retry on abort or validation errors
        if (lastError.name === 'AbortError') {
          logger.error('ai.request.timeout', { kind, model, attempt, timeoutMs, durationMs: Date.now() - started });
          throw new Error(`AI request timeout after ${timeoutMs}ms`);
        }

        logger.warn('ai.request.retry', { kind, model, attempt, error: lastError, willRetry: attempt < retries });
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    logger.error('ai.request.failed', { kind, model, durationMs: Date.now() - started, error: lastError });
    throw lastError || new Error('AI request failed after all retries');
  }
  
  async structured<T>(prompt: string, schema: object, options?: AIOptions): Promise<T> {
    const { data } = await this.structuredWithUsage<T>(prompt, schema, options);
    return data;
  }

  async structuredWithUsage<T>(prompt: string, schema: object, options?: AIOptions): Promise<{ data: T; usage?: AIResponse['usage']; requestId?: string }> {
    const model = options?.model || config.aiJudgeModel;
    const maxTokens = options?.maxTokens || config.aiMaxTokensPerRequest;
    const timeoutMs = options?.timeoutMs || config.aiRequestTimeoutMs;
    const retries = options?.retries || config.aiMaxRetries;
    const kind = 'structured';

    let lastError: Error | null = null;
    const started = Date.now();

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        logger.debug('ai.request', { kind, model, attempt, maxTokens });

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: maxTokens,
            temperature: options?.temperature ?? 0.3, // Lower temperature for structured output
            response_format: { type: 'json_object' },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`OpenCode API error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || '';
        const durationMs = Date.now() - started;
        const usage = {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        };

        try {
          const parsed = JSON.parse(content);
          logger.info('ai.response', {
            kind, model, attempt, durationMs,
            tokens: usage.totalTokens,
            promptTokens: usage.promptTokens,
            completionTokens: usage.completionTokens,
            requestId: data.id,
          });
          return {
            data: parsed as T,
            usage,
            requestId: typeof data.id === 'string' ? data.id : undefined,
          };
        } catch (parseError) {
          logger.warn('ai.response.parse_error', { kind, model, attempt, error: parseError });
          throw new Error(`Failed to parse AI response as JSON: ${parseError}`);
        }
      } catch (error) {
        lastError = error as Error;

        if (lastError.name === 'AbortError') {
          logger.error('ai.request.timeout', { kind, model, attempt, timeoutMs, durationMs: Date.now() - started });
          throw new Error(`AI request timeout after ${timeoutMs}ms`);
        }

        logger.warn('ai.request.retry', { kind, model, attempt, error: lastError, willRetry: attempt < retries });
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    logger.error('ai.request.failed', { kind, model, durationMs: Date.now() - started, error: lastError });
    throw lastError || new Error('AI structured request failed after all retries');
  }
}

// Singleton instance
let providerInstance: OpenCodeProvider | null = null;

export function getProvider(): AIProvider {
  if (!providerInstance) {
    providerInstance = new OpenCodeProvider();
  }
  return providerInstance;
}
