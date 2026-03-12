/**
 * Structured JSON logger middleware for Hono.
 * 
 * Outputs JSON that Cloudflare Workers Logs automatically indexes.
 * Includes request/response timing, status codes, and error information.
 */

import type { MiddlewareHandler } from "hono";
import { createLogger } from "@nexus/logger";

const logger = createLogger("nexus-api");

/**
 * Structured logging middleware.
 * Logs request start, completion, and any errors.
 */
export const structuredLogger: MiddlewareHandler = async (c, next) => {
  const startTime = Date.now();
  const requestId = crypto.randomUUID().slice(0, 8);
  
  const requestContext = {
    requestId,
    method: c.req.method,
    path: c.req.path,
    userAgent: c.req.header("user-agent")?.slice(0, 100), // Truncate long UAs
  };

  // Log request start at debug level
  logger.debug("Request started", requestContext);

  try {
    await next();
    
    const durationMs = Date.now() - startTime;
    const status = c.res.status;
    
    // Choose log level based on status
    if (status >= 500) {
      logger.error("Request completed with server error", {
        ...requestContext,
        status,
        durationMs,
      });
    } else if (status >= 400) {
      logger.warn("Request completed with client error", {
        ...requestContext,
        status,
        durationMs,
      });
    } else {
      logger.info("Request completed", {
        ...requestContext,
        status,
        durationMs,
      });
    }
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const err = error instanceof Error ? error : new Error(String(error));
    
    logger.error("Request failed with exception", {
      ...requestContext,
      durationMs,
    }, err);
    
    throw error;
  }
};

/**
 * Error logging helper for use in route handlers.
 */
export function logError(
  operation: string,
  error: unknown,
  context?: Record<string, unknown>
): void {
  const err = error instanceof Error ? error : new Error(String(error));
  logger.error(`${operation} failed`, context, err);
}

/**
 * Info logging helper for use in route handlers.
 */
export function logInfo(
  message: string,
  context?: Record<string, unknown>
): void {
  logger.info(message, context);
}

export { logger };
