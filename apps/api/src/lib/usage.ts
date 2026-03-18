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

// ============================================================================
// Analytics Engine Query Functions
// ============================================================================

/**
 * Usage statistics for a user
 */
export interface UserUsageStats {
  totalCalls: number;
  byApiKey: Record<string, number>;
  byEndpoint: Record<string, number>;
}

/**
 * Environment bindings needed for analytics queries
 */
interface AnalyticsEnv {
  ACCOUNT_ID: string;
  ANALYTICS_API_TOKEN: string;
}

/**
 * Query usage statistics from Analytics Engine for a specific user.
 * Uses the Cloudflare Analytics Engine SQL API.
 * 
 * Data schema (from trackUsage):
 * - blob1: userId
 * - blob2: apiKeyId  
 * - blob3: endpoint
 * - blob4: method
 * - blob5: libraryId
 * - double1: statusCode
 * - double2: tokensReturned
 * - double3: responseTimeMs
 */
export async function queryUserUsageStats(
  env: AnalyticsEnv,
  userId: string,
  options: { days?: number } = {}
): Promise<UserUsageStats> {
  const days = options.days || 30;
  
  // Default response if query fails
  const defaultStats: UserUsageStats = {
    totalCalls: 0,
    byApiKey: {},
    byEndpoint: {},
  };

  if (!env.ACCOUNT_ID || !env.ANALYTICS_API_TOKEN) {
    console.warn("Analytics query skipped: missing ACCOUNT_ID or ANALYTICS_API_TOKEN");
    return defaultStats;
  }

  try {
    // Query aggregated stats grouped by apiKeyId and endpoint
    // Note: Analytics Engine uses count() not COUNT(*)
    const query = `
      SELECT 
        blob2 as api_key_id,
        blob3 as endpoint,
        count() as call_count
      FROM nexus_usage
      WHERE blob1 = '${userId}'
        AND timestamp > NOW() - INTERVAL '${days}' DAY
      GROUP BY blob2, blob3
      FORMAT JSON
    `;

    const API = `https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/analytics_engine/sql`;

    const response = await fetch(API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.ANALYTICS_API_TOKEN}`,
      },
      body: query,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Analytics Engine query failed:", response.status, errorText);
      return defaultStats;
    }

    const result = await response.json() as {
      data: Array<{
        api_key_id: string;
        endpoint: string;
        call_count: number;
      }>;
      rows: number;
    };

    // Aggregate the results
    let totalCalls = 0;
    const byApiKey: Record<string, number> = {};
    const byEndpoint: Record<string, number> = {};

    for (const row of result.data || []) {
      const count = Number(row.call_count) || 0;
      totalCalls += count;

      // Aggregate by API key
      const keyId = row.api_key_id || "none";
      byApiKey[keyId] = (byApiKey[keyId] || 0) + count;

      // Aggregate by endpoint
      const endpoint = row.endpoint || "unknown";
      byEndpoint[endpoint] = (byEndpoint[endpoint] || 0) + count;
    }

    return {
      totalCalls,
      byApiKey,
      byEndpoint,
    };
  } catch (error) {
    console.error("Failed to query usage stats:", error);
    return defaultStats;
  }
}

/**
 * Query total usage count for a specific API token.
 * Useful for per-key usage tracking.
 */
export async function queryTokenUsageCount(
  env: AnalyticsEnv,
  tokenId: string,
  options: { days?: number } = {}
): Promise<number> {
  const days = options.days || 30;

  if (!env.ACCOUNT_ID || !env.ANALYTICS_API_TOKEN) {
    return 0;
  }

  try {
    // Note: Analytics Engine uses count() not COUNT(*)
    const query = `
      SELECT count() as call_count
      FROM nexus_usage
      WHERE blob2 = '${tokenId}'
        AND timestamp > NOW() - INTERVAL '${days}' DAY
      FORMAT JSON
    `;

    const API = `https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/analytics_engine/sql`;

    const response = await fetch(API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.ANALYTICS_API_TOKEN}`,
      },
      body: query,
    });

    if (!response.ok) {
      return 0;
    }

    const result = await response.json() as {
      data: Array<{ call_count: number }>;
    };

    return Number(result.data?.[0]?.call_count) || 0;
  } catch (error) {
    console.error("Failed to query token usage:", error);
    return 0;
  }
}
