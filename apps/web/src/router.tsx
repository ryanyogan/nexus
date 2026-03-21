import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";
import type { SessionData } from "./server/auth";
import { createQueryClient } from "./lib/query-client";

/**
 * Router context shared across all routes.
 * - Session is populated in __root.tsx via beforeLoad.
 * - QueryClient is created once per request for SSR hydration.
 */
export interface RouterContext {
  session: SessionData | null;
  queryClient: QueryClient;
}

export function getRouter() {
  const queryClient = createQueryClient();

  const router = createTanStackRouter({
    routeTree,
    context: { session: null, queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
