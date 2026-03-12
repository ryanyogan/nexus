import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import type { SessionData } from "./server/auth";

/**
 * Router context shared across all routes.
 * Session is populated in __root.tsx via beforeLoad.
 */
export interface RouterContext {
  session: SessionData | null;
}

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    context: { session: null },
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
