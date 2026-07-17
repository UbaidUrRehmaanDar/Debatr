import type { FastifyReply, FastifyRequest } from 'fastify';

// In-memory sliding-window rate limiter. Free, dependency-free, and sufficient
// for a single-instance deployment (per docs/ARCHITECTURE.md). For multi-instance
// or durable limits, swap the store for Redis — the interface is intentionally
// tiny so that change is local.

interface Bucket {
  count: number;
  windowStart: number;
}

const store = new Map<string, Bucket>();

export interface RateLimitOptions {
  max: number;
  windowMs: number;
  key?: (req: FastifyRequest) => string;
}

function defaultKey(req: FastifyRequest): string {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
    || req.socket.remoteAddress
    || 'unknown';
  return `${req.routeOptions.url ?? req.url}:${ip}`;
}

/**
 * Check the rate limit for a request. If the limit is exceeded, this sends a
 * 429 response and returns `false`; otherwise it records the hit and returns
 * `true`. Call it at the top of a handler:
 *
 *   if (!(await checkRateLimit(request, reply, { max: 20, windowMs: 60_000 }))) return;
 */
export async function checkRateLimit(
  req: FastifyRequest,
  reply: FastifyReply,
  opts: RateLimitOptions,
): Promise<boolean> {
  const key = (opts.key ?? defaultKey)(req);
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || now - bucket.windowStart >= opts.windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return true;
  }

  bucket.count += 1;
  if (bucket.count > opts.max) {
    const retryAfter = Math.ceil((bucket.windowStart + opts.windowMs - now) / 1000);
    reply.header('Retry-After', String(retryAfter));
    reply.code(429);
    reply.send({ error: 'Too many requests. Please slow down.', retryAfterSeconds: retryAfter });
    return false;
  }
  return true;
}

// Periodic cleanup so the in-memory map doesn't grow unbounded.
setInterval(() => {
  const now = Date.now();
  for (const [k, b] of store) {
    if (now - b.windowStart >= 0) store.delete(k);
  }
}, 5 * 60 * 1000).unref();
