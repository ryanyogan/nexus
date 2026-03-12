/**
 * Logging utilities for TanStack Start server functions.
 * 
 * Provides:
 * - Structured JSON logging for Cloudflare Workers Logs
 * - Request context extraction (path, method)
 * - Duration tracking
 * - Sensitive data redaction
 * 
 * For server functions with input, use inline logging pattern:
 * @example
 * ```ts
 * const getServers = createServerFn({ method: "GET" })
 *   .inputValidator((data: { search?: string }) => data)
 *   .handler(async ({ data }) => {
 *     const startTime = Date.now();
 *     try {
 *       logger.debug("getServers started", { input: data });
 *       const result = await doWork(data);
 *       logger.info("getServers completed", { durationMs: Date.now() - startTime });
 *       return result;
 *     } catch (error) {
 *       const err = error instanceof Error ? error : new Error(String(error));
 *       logger.error("getServers failed", { durationMs: Date.now() - startTime }, err);
 *       throw error;
 *     }
 *   });
 * ```
 */

import { getRequest } from "@tanstack/react-start/server";
import { createLogger } from "@nexus/logger";

// Create the web app logger
export const logger = createLogger("nexus-web");

/**
 * Get request context for logging.
 * Safe to call even if not in a request context.
 */
export function getRequestContext(): { path: string; method: string } | undefined {
  try {
    const request = getRequest();
    const url = new URL(request.url);
    return {
      path: url.pathname,
      method: request.method,
    };
  } catch {
    // Not in request context (e.g., during SSR build)
    return undefined;
  }
}

/**
 * Wrap an existing handler function with logging.
 * Best for simple server functions without input validation.
 * 
 * @example
 * ```ts
 * const getHomePageData = createServerFn({ method: "GET" }).handler(
 *   withLogging("getHomePageData", async () => {
 *     // existing handler code
 *   })
 * );
 * ```
 */
export function withLogging<TOutput>(
  name: string,
  handler: () => Promise<TOutput>
): () => Promise<TOutput> {
  return async (): Promise<TOutput> => {
    const startTime = Date.now();
    const requestContext = getRequestContext();
    
    const fnLogger = logger.child({
      serverFn: name,
      ...requestContext,
    });

    try {
      fnLogger.debug(`${name} started`);
      
      const result = await handler();
      
      const durationMs = Date.now() - startTime;
      fnLogger.info(`${name} completed`, { durationMs });
      
      return result;
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const err = error instanceof Error ? error : new Error(String(error));
      
      fnLogger.error(`${name} failed`, { durationMs }, err);
      
      throw error;
    }
  };
}

/**
 * Wrap an existing handler with input with logging.
 * Use this when your handler receives a `{ data }` parameter.
 * 
 * @example
 * ```ts
 * const getUser = createServerFn({ method: "GET" })
 *   .inputValidator((data: { userId: string }) => data)
 *   .handler(withLoggingInput("getUser", async ({ data }) => {
 *     return db.query.users.findFirst({ where: eq(users.id, data.userId) });
 *   }));
 * ```
 */
export function withLoggingInput<TInput, TOutput>(
  name: string,
  handler: (ctx: { data: TInput }) => Promise<TOutput>
): (ctx: { data: TInput }) => Promise<TOutput> {
  return async (ctx: { data: TInput }): Promise<TOutput> => {
    const startTime = Date.now();
    const requestContext = getRequestContext();
    
    const fnLogger = logger.child({
      serverFn: name,
      ...requestContext,
    });

    try {
      fnLogger.debug(`${name} started`, { input: ctx.data });
      
      const result = await handler(ctx);
      
      const durationMs = Date.now() - startTime;
      fnLogger.info(`${name} completed`, { durationMs });
      
      return result;
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const err = error instanceof Error ? error : new Error(String(error));
      
      fnLogger.error(`${name} failed`, { durationMs, input: ctx.data }, err);
      
      throw error;
    }
  };
}
