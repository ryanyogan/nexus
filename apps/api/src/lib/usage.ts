/**
 * Usage Tracking Module
 *
 * Simple rate limiting utilities.
 * API call tracking is now done via D1 counter in users table.
 */

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
export function getRateLimitKey(apiKeyId?: string, userId?: string, ipAddress?: string): string {
  if (apiKeyId) return `key:${apiKeyId}`;
  if (userId) return `user:${userId}`;
  if (ipAddress) return `ip:${ipAddress}`;
  return "anonymous";
}
