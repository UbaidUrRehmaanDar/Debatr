// src/server/lib/errors.ts
import { TRPCError } from "@trpc/server"

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
  ) {
    super(message)
    this.name = "AppError"
  }
}

export function toTRPCError(error: unknown): TRPCError {
  if (error instanceof TRPCError) return error

  if (error instanceof AppError) {
    const codeMap: Record<string, TRPCError["code"]> = {
      NOT_FOUND: "NOT_FOUND",
      UNAUTHORIZED: "UNAUTHORIZED",
      FORBIDDEN: "FORBIDDEN",
      BAD_REQUEST: "BAD_REQUEST",
    }
    return new TRPCError({
      code: codeMap[error.code] ?? "INTERNAL_SERVER_ERROR",
      message: error.message,
    })
  }

  if (error instanceof Error) {
    return new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message,
    })
  }

  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
  })
}
