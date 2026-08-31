/**
 * tRPC provider component for wrapping the app with React Query and tRPC
 */

"use client"

import React, { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { httpBatchLink } from "@trpc/client"
import { api } from "@/lib/trpc-client"

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10 * 60 * 1000, // 10 minutes - more aggressive caching
        gcTime: 15 * 60 * 1000, // 15 minutes garbage collection
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: 1,
      },
      mutations: {
        retry: 1,
      },
    },
  }))

  const [trpcClient] = useState(() => api.createClient({
    links: [
      httpBatchLink({
        url: "/api/trpc",
      }),
    ],
  }))

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  )
}

