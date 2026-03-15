import { createMiddleware } from "hono/factory";
import { createAuth } from "@nexus/auth";
import type { AppContext } from "../types";
import { validateToken } from "../lib/auth";
import type { ApiTokenScope } from "@nexus/db";

/**
 * Unified auth middleware that accepts both:
 * 1. Session cookies (from Better Auth for browser apps)
 * 2. API tokens (nxs_xxx Bearer tokens for MCP/CLI clients)
 *
 * Sets c.user, c.authType, and c.tokenScopes on context.
 * Does NOT reject unauthenticated requests - use requireAuth for that.
 */
export const authMiddleware = createMiddleware<AppContext>(async (c, next) => {
  const db = c.get("db");
  const authHeader = c.req.header("Authorization");
  const nexusApiKey = c.req.header("NEXUS_API_KEY");

  // Try NEXUS_API_KEY header first (for native remote MCP clients like OpenCode)
  // Then fall back to Authorization: Bearer nxs_xxx
  const apiKey = nexusApiKey?.startsWith("nxs_")
    ? nexusApiKey
    : authHeader?.startsWith("Bearer nxs_")
      ? authHeader.replace("Bearer ", "")
      : null;

  if (apiKey) {
    const result = await validateToken(`Bearer ${apiKey}`, db);

    if (result.valid && result.userId) {
      // Look up the user from the database
      const { users } = await import("@nexus/db");
      const { eq } = await import("drizzle-orm");

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, result.userId))
        .limit(1);

      if (user) {
        c.set("user", {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role ?? undefined,
        });
        c.set("authType", "token");
        c.set("tokenScopes", result.scopes);
        return next();
      }
    }

    // API key was provided but invalid - mark as anonymous
    c.set("authType", "anonymous");
    return next();
  }

  // Try session cookie (Better Auth)
  try {
    const auth = createAuth({
      DB: c.env.DB,
      GOOGLE_CLIENT_ID: c.env.GOOGLE_CLIENT_ID || "",
      GOOGLE_CLIENT_SECRET: c.env.GOOGLE_CLIENT_SECRET || "",
      GITHUB_CLIENT_ID: c.env.GITHUB_CLIENT_ID || "",
      GITHUB_CLIENT_SECRET: c.env.GITHUB_CLIENT_SECRET || "",
      BETTER_AUTH_SECRET: c.env.BETTER_AUTH_SECRET || "",
      BETTER_AUTH_URL: c.env.BETTER_AUTH_URL || "https://api.nexus.yogan.dev",
    });

    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (session?.user) {
      c.set("user", {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: (session.user as any).role,
      });
      c.set("session", {
        id: session.session.id,
        userId: session.session.userId,
        expiresAt: session.session.expiresAt,
      });
      c.set("authType", "session");
    }
  } catch (error) {
    // Session validation failed, continue as anonymous
    console.error("Session validation error:", error);
  }

  // If no auth, mark as anonymous
  if (!c.get("user")) {
    c.set("authType", "anonymous");
  }

  return next();
});

/**
 * Middleware that requires authentication.
 * Returns 401 if not authenticated.
 */
export const requireAuth = createMiddleware<AppContext>(async (c, next) => {
  const user = c.get("user");

  if (!user) {
    return c.json(
      {
        error: "Unauthorized",
        message: "Authentication required. Provide a valid session cookie or API token.",
      },
      401
    );
  }

  return next();
});

/**
 * Middleware that requires a specific token scope.
 * Only applies to API token auth - session auth has full access.
 */
export function requireScope(scope: ApiTokenScope) {
  return createMiddleware<AppContext>(async (c, next) => {
    const authType = c.get("authType");
    const scopes = c.get("tokenScopes");

    // Session auth has full access
    if (authType === "session") {
      return next();
    }

    // Token auth must have the required scope
    if (authType === "token" && scopes) {
      if (!scopes.includes(scope)) {
        return c.json(
          {
            error: "Forbidden",
            message: `This action requires the '${scope}' scope.`,
          },
          403
        );
      }
    }

    return next();
  });
}
