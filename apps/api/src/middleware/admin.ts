import { createMiddleware } from "hono/factory";
import type { AppContext } from "../types";

/**
 * Admin authentication middleware
 * Validates X-Admin-Key header against ADMIN_API_KEY env var
 * 
 * Usage:
 *   app.use("/api/admin/*", adminAuth);
 */
export const adminAuth = createMiddleware<AppContext>(async (c, next) => {
  const adminKey = c.req.header("X-Admin-Key");
  const expectedKey = c.env.ADMIN_API_KEY;

  // In development, allow requests if no key is configured
  if (!expectedKey) {
    console.warn("ADMIN_API_KEY not set - admin routes are unprotected!");
    return next();
  }

  if (!adminKey) {
    return c.json({ error: "Missing X-Admin-Key header" }, 401);
  }

  if (adminKey !== expectedKey) {
    return c.json({ error: "Invalid admin key" }, 403);
  }

  await next();
});
