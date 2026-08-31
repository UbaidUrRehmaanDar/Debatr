/**
 * tRPC client setup for use in React components
 */

import { createTRPCReact } from "@trpc/react-query"
import type { AppRouter } from "@/server/trpc/root"

export const api = createTRPCReact<AppRouter>()
