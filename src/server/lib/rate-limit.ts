// src/server/lib/rate-limit.ts

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

export interface RateLimitOptions {
  windowMs: number
  max: number
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + options.windowMs })
    return { allowed: true, remaining: options.max - 1, resetAt: now + options.windowMs }
  }

  if (entry.count >= options.max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: options.max - entry.count, resetAt: entry.resetAt }
}

// Clean up expired entries periodically
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      const now = Date.now()
      for (const [key, entry] of store.entries()) {
        if (entry.resetAt < now) {
          store.delete(key)
        }
      }
    },
    60 * 1000,
  )
}
