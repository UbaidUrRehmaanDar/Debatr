// src/server/lib/logger.ts

type LogLevel = "debug" | "info" | "warn" | "error"

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "info"

function log(level: LogLevel, msg: string, ctx?: Record<string, unknown>) {
  if (LEVELS[level] < LEVELS[currentLevel]) return

  const entry = {
    level,
    msg,
    time: new Date().toISOString(),
    ...(ctx || {}),
  }

  if (level === "error") {
    console.error(JSON.stringify(entry))
  } else {
    console.log(JSON.stringify(entry))
  }
}

export const logger = {
  debug: (msg: string, ctx?: Record<string, unknown>) => log("debug", msg, ctx),
  info: (msg: string, ctx?: Record<string, unknown>) => log("info", msg, ctx),
  warn: (msg: string, ctx?: Record<string, unknown>) => log("warn", msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => log("error", msg, ctx),
}
