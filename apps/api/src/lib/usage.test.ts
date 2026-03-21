/**
 * Tests for usage tracking utilities
 */
import { describe, it, expect, vi } from "vite-plus/test";
import { checkRateLimit, getRateLimitKey } from "./usage";

describe("getRateLimitKey", () => {
  it("should prioritize API key over user ID", () => {
    const key = getRateLimitKey("api-key-123", "user-456", "192.168.1.1");
    expect(key).toBe("key:api-key-123");
  });

  it("should use user ID when no API key", () => {
    const key = getRateLimitKey(undefined, "user-456", "192.168.1.1");
    expect(key).toBe("user:user-456");
  });

  it("should use IP when no API key or user ID", () => {
    const key = getRateLimitKey(undefined, undefined, "192.168.1.1");
    expect(key).toBe("ip:192.168.1.1");
  });

  it("should return anonymous when no identity", () => {
    const key = getRateLimitKey(undefined, undefined, undefined);
    expect(key).toBe("anonymous");
  });
});

describe("checkRateLimit", () => {
  it("should return success when rate limiter is undefined", async () => {
    const result = await checkRateLimit(undefined, "test-key");
    expect(result.success).toBe(true);
  });

  it("should return rate limiter result when available", async () => {
    const mockRateLimiter = {
      limit: vi.fn().mockResolvedValue({ success: true }),
    } as unknown as RateLimit;

    const result = await checkRateLimit(mockRateLimiter, "test-key");
    expect(result.success).toBe(true);
    expect(mockRateLimiter.limit).toHaveBeenCalledWith({ key: "test-key" });
  });

  it("should return success: false when rate limited", async () => {
    const mockRateLimiter = {
      limit: vi.fn().mockResolvedValue({ success: false }),
    } as unknown as RateLimit;

    const result = await checkRateLimit(mockRateLimiter, "test-key");
    expect(result.success).toBe(false);
  });

  it("should fail open when rate limiter throws", async () => {
    const mockRateLimiter = {
      limit: vi.fn().mockRejectedValue(new Error("Rate limiter error")),
    } as unknown as RateLimit;

    const result = await checkRateLimit(mockRateLimiter, "test-key");
    expect(result.success).toBe(true); // Fail open
  });
});
