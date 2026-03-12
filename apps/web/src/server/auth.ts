import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { createAuth } from "@nexus/auth";
import { createLogger } from "@nexus/logger";

const logger = createLogger("nexus-web");

// Session type matching Better Auth with admin plugin
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface SessionData {
  user: SessionUser;
  session: Session;
}

/**
 * Check if we're in dev bypass mode.
 * This is only enabled when:
 * 1. VITE_DEV_BYPASS_AUTH=true in environment
 * 2. Running on localhost (checked at request time)
 */
function isDevBypassEnabled(): boolean {
  // Check env var - in production this won't be set
  const bypassEnabled = process.env.VITE_DEV_BYPASS_AUTH === "true";
  if (!bypassEnabled) return false;

  // Additional safety: only allow on localhost
  try {
    const request = getRequest();
    const url = new URL(request.url);
    return url.hostname === "localhost" || url.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

/** Mock session for local development */
const DEV_SESSION: SessionData = {
  user: {
    id: "dev-user-ryan",
    name: "Ryan (Dev)",
    email: "ryan@example.com",
    image: null,
    role: "admin",
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

/**
 * Get the current session from Better Auth.
 * This is a server function that reads cookies from the request.
 *
 * In dev bypass mode (localhost with VITE_DEV_BYPASS_AUTH=true),
 * returns a mock admin session.
 */
export const getSessionFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<SessionData | null> => {
    const startTime = Date.now();
    const fnLogger = logger.child({ serverFn: "getSessionFn" });

    // Dev bypass for local development
    if (isDevBypassEnabled()) {
      fnLogger.debug("Using dev bypass session");
      return DEV_SESSION;
    }

    try {
      fnLogger.debug("getSessionFn started");
      
      const request = getRequest();
      const url = new URL(request.url);
      
      fnLogger.debug("Creating auth instance", { path: url.pathname });
      
      const auth = createAuth({
        DB: env.DB,
        GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
        GITHUB_CLIENT_ID: env.GITHUB_CLIENT_ID,
        GITHUB_CLIENT_SECRET: env.GITHUB_CLIENT_SECRET,
        BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET,
        BETTER_AUTH_URL: env.BETTER_AUTH_URL,
      });

      const session = await auth.api.getSession({
        headers: request.headers,
      });

      const durationMs = Date.now() - startTime;

      if (!session) {
        fnLogger.debug("No session found", { durationMs });
        return null;
      }

      fnLogger.info("Session retrieved", { 
        durationMs, 
        userId: session.user?.id,
        hasSession: true 
      });
      
      return session as SessionData;
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const err = error instanceof Error ? error : new Error(String(error));
      
      fnLogger.error("Failed to get session", { durationMs }, err);
      
      // Return null instead of throwing to avoid breaking the app
      return null;
    }
  }
);

/**
 * Check if dev auth bypass is enabled.
 * Used by DevModeBadge component.
 */
export const isDevAuthEnabledFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<boolean> => {
    try {
      return isDevBypassEnabled();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("isDevAuthEnabledFn failed", {}, err);
      return false;
    }
  }
);
