/**
 * TanStack Query client factory.
 * Creates a new QueryClient instance with optimized defaults for SSR.
 */

import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is fresh for 1 minute - prevents immediate refetch after SSR hydration
        staleTime: 60 * 1000,
        // Keep unused data in cache for 5 minutes
        gcTime: 5 * 60 * 1000,
        // Don't refetch on window focus by default (can be overridden per-query)
        refetchOnWindowFocus: false,
        // Only retry once on failure
        retry: 1,
      },
    },
  });
}
