/**
 * Usage Tracking Module
 * 
 * Tracks API usage via Cloudflare Analytics Engine.
 * Used for billing, rate limiting insights, and monitoring.
 */

export interface UsageEvent {
  userId?: string;
  apiKeyId?: string;
  endpoint: string;
  method: string;
  statusCode: number;
  tokensReturned?: number;
  libraryId?: string;
  responseTimeMs: number;
}

/**
 * Write a usage data point to Analytics Engine
 */
export function trackUsage(
  analytics: AnalyticsEngineDataset | undefined,
  event: UsageEvent
): void {
  if (!analytics) {
    // Analytics Engine not available (local dev)
    return;
  }

  try {
    analytics.writeDataPoint({
      // Blobs (strings) - up to 20
      blobs: [
        event.userId || "anonymous",
        event.apiKeyId || "none",
        event.endpoint,
        event.method,
        event.libraryId || "none",
      ],
      // Doubles (numbers) - up to 20
      doubles: [
        event.statusCode,
        event.tokensReturned || 0,
        event.responseTimeMs,
      ],
      // Indexes - for efficient querying
      indexes: [
        event.userId || "anonymous", // Index by user for per-user queries
      ],
    });
  } catch (error) {
    // Non-critical, don't let tracking errors break API
    console.warn("Failed to track usage:", error);
  }
}

/**
 * Rate limiting check result
 */
export interface RateLimitResult {
  success: boolean;
  remaining?: number;
  reset?: number;
}

/**
 * Check rate limit for a given key
 * Returns whether the request should proceed
 */
export async function checkRateLimit(
  rateLimiter: RateLimit | undefined,
  key: string
): Promise<RateLimitResult> {
  if (!rateLimiter) {
    // Rate limiter not available (local dev)
    return { success: true };
  }

  try {
    const result = await rateLimiter.limit({ key });
    return {
      success: result.success,
    };
  } catch (error) {
    console.warn("Rate limit check failed:", error);
    // Fail open - don't block requests if rate limiter fails
    return { success: true };
  }
}

/**
 * Get rate limit key for a request
 * Priority: API Key > User ID > IP Address
 */
export function getRateLimitKey(
  apiKeyId?: string,
  userId?: string,
  ipAddress?: string
): string {
  if (apiKeyId) return `key:${apiKeyId}`;
  if (userId) return `user:${userId}`;
  if (ipAddress) return `ip:${ipAddress}`;
  return "anonymous";
}
