import { createMiddleware } from "hono/factory";
import { createAuth } from "@nexus/auth";
import type { AppContext } from "../types";

/**
 * Admin authentication middleware
 * Checks if the user is authenticated and has admin role
 * Falls back to X-Admin-Key header for API access
 */
export const adminAuth = createMiddleware<AppContext>(async (c, next) => {
  // First, try session-based auth
  const auth = createAuth({
    DB: c.env.DB,
    GOOGLE_CLIENT_ID: c.env.GOOGLE_CLIENT_ID || "",
    GOOGLE_CLIENT_SECRET: c.env.GOOGLE_CLIENT_SECRET || "",
    GITHUB_CLIENT_ID: c.env.GITHUB_CLIENT_ID || "",
    GITHUB_CLIENT_SECRET: c.env.GITHUB_CLIENT_SECRET || "",
    BETTER_AUTH_SECRET: c.env.BETTER_AUTH_SECRET || "",
    BETTER_AUTH_URL: c.env.BETTER_AUTH_URL || "https://api.nexus.yogan.dev",
  });

  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    console.log("Admin auth - session check:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userRole: (session?.user as any)?.role,
      hasCookie: !!c.req.header("cookie"),
      cookiePreview: c.req.header("cookie")?.substring(0, 50),
    });

    if (session?.user && (session.user as any).role === "admin") {
      // User is authenticated and is an admin
      console.log("Admin auth - access granted via session");
      return next();
    }
  } catch (error) {
    // Session check failed, continue to API key check
    console.warn("Session check failed:", error);
  }

  // Fall back to X-Admin-Key header for programmatic access
  const adminKey = c.req.header("X-Admin-Key");
  const expectedKey = c.env.ADMIN_API_KEY;

  // In development, allow requests if no key is configured
  if (!expectedKey) {
    console.warn("ADMIN_API_KEY not set - admin routes are unprotected!");
    return next();
  }

  if (adminKey && adminKey === expectedKey) {
    return next();
  }

  // Neither session nor API key auth succeeded
  return c.json({ error: "Unauthorized - admin access required" }, 401);
});
