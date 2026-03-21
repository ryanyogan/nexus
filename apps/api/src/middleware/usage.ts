import { createMiddleware } from "hono/factory";
import { sql } from "drizzle-orm";
import { users } from "@nexus/db";
import type { AppContext } from "../types";
import { checkRateLimit, getRateLimitKey } from "../lib/usage";

/**
 * Rate limiting middleware for general API routes.
 * Does NOT count towards API usage (only MCP queries are counted).
 */
export const usageMiddleware = createMiddleware<AppContext>(async (c, next) => {
  // Extract identity for rate limiting
  const apiKeyId = c.req.header("X-API-Key");
  const userId = c.get("user")?.id;
  const ipAddress =
    c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For")?.split(",")[0]?.trim();

  // Check rate limit
  const rateLimitKey = getRateLimitKey(apiKeyId, userId, ipAddress);
  const rateLimiter = (c.env as any).RATE_LIMITER;
  const rateResult = await checkRateLimit(rateLimiter, rateLimitKey);

  if (!rateResult.success) {
    return c.json(
      {
        error: "Rate limit exceeded",
        message: "Too many requests. Please slow down.",
        retryAfter: 60, // seconds
      },
      429
    );
  }

  await next();
});

/**
 * Lightweight rate limit only middleware (no tracking)
 * For high-volume endpoints where we only need rate limiting
 */
export const rateLimitMiddleware = createMiddleware<AppContext>(async (c, next) => {
  const apiKeyId = c.req.header("X-API-Key");
  const userId = c.get("user")?.id;
  const ipAddress =
    c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For")?.split(",")[0]?.trim();

  const rateLimitKey = getRateLimitKey(apiKeyId, userId, ipAddress);
  const rateLimiter = (c.env as any).RATE_LIMITER;
  const rateResult = await checkRateLimit(rateLimiter, rateLimitKey);

  if (!rateResult.success) {
    return c.json(
      {
        error: "Rate limit exceeded",
        message: "Too many requests. Please slow down.",
        retryAfter: 60,
      },
      429
    );
  }

  await next();
});

/**
 * Passthrough middleware (no rate limiting, no counting)
 * Kept for backwards compatibility - can be removed if unused.
 */
export const analyticsMiddleware = createMiddleware<AppContext>(async (c, next) => {
  await next();
});

/**
 * MCP-specific rate limiting middleware
 * Uses tiered limits based on authentication:
 * - Anonymous: 20 requests/minute
 * - Authenticated user: 100 requests/minute
 * - API token: 200 requests/minute
 */
export const mcpRateLimitMiddleware = createMiddleware<AppContext>(async (c, next) => {
  const authType = c.get("authType") || "anonymous";
  const userId = c.get("user")?.id;
  const tokenId = c.get("tokenId"); // Get token ID from auth middleware
  const ipAddress =
    c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For")?.split(",")[0]?.trim();

  // Build rate limit key with MCP prefix
  const rateLimitKey = `mcp:${getRateLimitKey(tokenId, userId, ipAddress)}`;
  const rateLimiter = (c.env as any).RATE_LIMITER;

  // Check rate limit
  const rateResult = await checkRateLimit(rateLimiter, rateLimitKey);

  if (!rateResult.success) {
    // Return MCP-formatted error response
    return c.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32000,
          message: "Rate limit exceeded. Please slow down.",
          data: {
            retryAfter: 60,
            authType,
            hint:
              authType === "anonymous"
                ? "Sign in or use an API token for higher rate limits."
                : undefined,
          },
        },
      },
      429
    );
  }

  await next();

  // Track MCP usage via D1 counter increment (non-blocking)
  if (userId) {
    const db = c.get("db");
    db.update(users)
      .set({ mcpQueryCount: sql`${users.mcpQueryCount} + 1` })
      .where(sql`${users.id} = ${userId}`)
      .execute()
      .catch((err) => console.warn("Failed to increment MCP query count:", err));
  }
});
