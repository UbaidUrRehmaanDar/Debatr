/**
 * Structured logger.
 *
 * Emits one JSON object per line with a `level`, `msg`, ISO `time`, and an
 * optional `ctx` object of structured fields (request id, debate id, model,
 * tokens, durationMs, …). JSON output keeps the stream machine-parseable for
 * log aggregation (the Fastify `pino` instance already does this for request
 * logs; this logger is for application-level events).
 *
 * `serializeError` flattens an Error into `{ message, name, stack }` so the
 * stack survives JSON serialization instead of becoming `{}`.
 */

type Level = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<Level, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const currentLevel = (): Level => {
  const raw = process.env.LOG_LEVEL?.toLowerCase();
  if (raw === 'debug' || raw === 'info' || raw === 'warn' || raw === 'error') {
    return raw;
  }
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
};

function serializeError(err: unknown): unknown {
  if (err instanceof Error) {
    return { message: err.message, name: err.name, stack: err.stack };
  }
  return err;
}

function write(level: Level, msg: string, ctx?: Record<string, unknown>) {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[currentLevel()]) return;
  const entry: Record<string, unknown> = {
    level,
    msg,
    time: new Date().toISOString(),
  };
  if (ctx && Object.keys(ctx).length) {
    const flat: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(ctx)) {
      flat[k] = v instanceof Error ? serializeError(v) : v;
    }
    entry.ctx = flat;
  }
  // Single-line JSON; safe for log shippers.
  process.stdout.write(JSON.stringify(entry) + '\n');
}

export const logger = {
  debug(msg: string, ctx?: Record<string, unknown>) {
    write('debug', msg, ctx);
  },
  info(msg: string, ctx?: Record<string, unknown>) {
    write('info', msg, ctx);
  },
  warn(msg: string, ctx?: Record<string, unknown>) {
    write('warn', msg, ctx);
  },
  error(msg: string, ctx?: Record<string, unknown>) {
    write('error', msg, ctx);
  },
};
