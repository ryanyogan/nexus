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
