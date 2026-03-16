import { createMiddleware } from "hono/factory";
import type { AppContext } from "../types";
import { trackUsage, checkRateLimit, getRateLimitKey } from "../lib/usage";

/**
 * Usage tracking and rate limiting middleware
 *
 * Tracks API usage via Cloudflare Analytics Engine and enforces rate limits.
 * Applied to public API routes that need monitoring.
 */
export const usageMiddleware = createMiddleware<AppContext>(async (c, next) => {
  const startTime = Date.now();

  // Extract identity for rate limiting
  const apiKeyId = c.req.header("X-API-Key");
  const userId = c.get("user")?.id;
  const ipAddress =
    c.req.header("CF-Connecting-IP") ||
    c.req.header("X-Forwarded-For")?.split(",")[0]?.trim();

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

  // Process the request
  await next();

  // Track usage after response
  const responseTime = Date.now() - startTime;
  const analytics = (c.env as any).USAGE_ANALYTICS as
    | AnalyticsEngineDataset
    | undefined;

  // Extract library ID from path if present
  const path = new URL(c.req.url).pathname;
  const libraryMatch = path.match(/\/api\/libraries\/([^/]+)/);
  const libraryId = libraryMatch?.[1];

  trackUsage(analytics, {
    userId: userId,
    apiKeyId: apiKeyId,
    endpoint: path,
    method: c.req.method,
    statusCode: c.res.status,
    libraryId: libraryId,
    responseTimeMs: responseTime,
  });
});

/**
 * Lightweight rate limit only middleware (no tracking)
 * For high-volume endpoints where we only need rate limiting
 */
export const rateLimitMiddleware = createMiddleware<AppContext>(
  async (c, next) => {
    const apiKeyId = c.req.header("X-API-Key");
    const userId = c.get("user")?.id;
    const ipAddress =
      c.req.header("CF-Connecting-IP") ||
      c.req.header("X-Forwarded-For")?.split(",")[0]?.trim();

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
  }
);

/**
 * Analytics only middleware (no rate limiting)
 * For endpoints where we just want to track usage
 */
export const analyticsMiddleware = createMiddleware<AppContext>(
  async (c, next) => {
    const startTime = Date.now();

    await next();

    const responseTime = Date.now() - startTime;
    const analytics = (c.env as any).USAGE_ANALYTICS as
      | AnalyticsEngineDataset
      | undefined;

    const userId = c.get("user")?.id;
    const apiKeyId = c.req.header("X-API-Key");
    const path = new URL(c.req.url).pathname;
    const libraryMatch = path.match(/\/api\/libraries\/([^/]+)/);
    const libraryId = libraryMatch?.[1];

    trackUsage(analytics, {
      userId: userId,
      apiKeyId: apiKeyId,
      endpoint: path,
      method: c.req.method,
      statusCode: c.res.status,
      libraryId: libraryId,
      responseTimeMs: responseTime,
    });
  }
);

/**
 * MCP-specific rate limiting middleware
 * Uses tiered limits based on authentication:
 * - Anonymous: 20 requests/minute
 * - Authenticated user: 100 requests/minute
 * - API token: 200 requests/minute
 */
export const mcpRateLimitMiddleware = createMiddleware<AppContext>(
  async (c, next) => {
    const authType = c.get("authType") || "anonymous";
    const userId = c.get("user")?.id;
    const tokenId = c.get("tokenId"); // Get token ID from auth middleware
    const ipAddress =
      c.req.header("CF-Connecting-IP") ||
      c.req.header("X-Forwarded-For")?.split(",")[0]?.trim();

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
              hint: authType === "anonymous" 
                ? "Sign in or use an API token for higher rate limits."
                : undefined,
            },
          },
        },
        429
      );
    }

    await next();

    // Track MCP usage
    const analytics = (c.env as any).USAGE_ANALYTICS as
      | AnalyticsEngineDataset
      | undefined;

    trackUsage(analytics, {
      userId: userId,
      apiKeyId: tokenId, // Use token ID from auth context
      endpoint: "/mcp",
      method: c.req.method,
      statusCode: c.res.status,
      responseTimeMs: 0, // MCP requests are fast, we don't track response time
    });
  }
);
