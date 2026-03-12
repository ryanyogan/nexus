import { useSession as useRealSession, signIn, signOut } from "@nexus/auth/client";

/**
 * Build-time dev auth bypass.
 *
 * SAFETY: This can ONLY be true when:
 * 1. VITE_DEV_BYPASS_AUTH=true is set (only in .env.development)
 * 2. Running on localhost (runtime failsafe)
 *
 * In production builds, VITE_DEV_BYPASS_AUTH is undefined,
 * so this evaluates to false and the dev code is tree-shaken out.
 */
const IS_DEV_BYPASS = import.meta.env.VITE_DEV_BYPASS_AUTH === "true";

/**
 * Runtime failsafe - even if env var somehow leaks, only works on localhost.
 * This is a defense-in-depth measure.
 */
function isLocalhost(): boolean {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  return hostname === "localhost" || hostname === "127.0.0.1";
}

/** Mock session for local development */
const DEV_SESSION = {
  user: {
    id: "dev-user-ryan",
    name: "Ryan (Dev)",
    email: "ryan@example.com",
    image: null,
    role: "admin" as const,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  session: {
    id: "dev-session",
    userId: "dev-user-ryan",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    token: "dev-token",
    createdAt: new Date(),
    updatedAt: new Date(),
    ipAddress: "127.0.0.1",
    userAgent: "DevMode",
  },
};

type SessionData = typeof DEV_SESSION;

interface UseSessionResult {
  data: SessionData | null;
  isPending: boolean;
  error: Error | null;
}

/**
 * useSession hook with build-time dev bypass support.
 *
 * In local development with VITE_DEV_BYPASS_AUTH=true:
 * - Returns mock admin session immediately
 * - Never calls the real auth API
 *
 * In production:
 * - Uses real Better Auth session
 * - Dev code is completely removed by Vite's tree-shaking
 */
export function useSession(): UseSessionResult {
  // Build-time check + runtime localhost failsafe
  // In production, IS_DEV_BYPASS is false so this branch is removed
  if (IS_DEV_BYPASS && isLocalhost()) {
    return {
      data: DEV_SESSION,
      isPending: false,
      error: null,
    };
  }

  // Production: use real auth
  return useRealSession() as UseSessionResult;
}

// Re-export for components that need sign in/out
export { signIn, signOut };

/**
 * Export for DevModeBadge to check if dev auth is enabled.
 * This is a build-time constant, so the badge component
 * is completely removed in production builds.
 */
export const isDevAuthEnabled = IS_DEV_BYPASS;
