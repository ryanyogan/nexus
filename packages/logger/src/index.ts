/**
 * @nexus/logger - Lightweight structured logger for Cloudflare Workers
 * 
 * Outputs JSON that Cloudflare Workers Logs automatically indexes.
 * Use console.error for errors, console.warn for warnings, console.log for info/debug.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  requestId?: string;
  userId?: string;
  path?: string;
  method?: string;
  serverFn?: string;
  durationMs?: number;
  [key: string]: unknown;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  service: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
    cause?: string;
  };
}

// Fields that should be redacted from logs
const SENSITIVE_FIELDS = new Set([
  "password",
  "secret",
  "token",
  "apiKey",
  "api_key",
  "authorization",
  "cookie",
  "session",
  "credential",
  "private",
  "key",
]);

/**
 * Redact sensitive fields from an object for safe logging.
 */
function redactSensitive(obj: unknown, depth = 0): unknown {
  // Prevent infinite recursion
  if (depth > 5) return "[max depth]";
  
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === "string") {
    // Redact if looks like a token/key (long alphanumeric string)
    if (obj.length > 20 && /^[A-Za-z0-9_-]+$/.test(obj)) {
      return "[REDACTED]";
    }
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => redactSensitive(item, depth + 1));
  }
  
  if (typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_FIELDS.has(lowerKey) || 
          Array.from(SENSITIVE_FIELDS).some(f => lowerKey.includes(f))) {
        result[key] = "[REDACTED]";
      } else {
        result[key] = redactSensitive(value, depth + 1);
      }
    }
    return result;
  }
  
  return obj;
}

/**
 * Structured logger for Cloudflare Workers.
 * 
 * @example
 * ```ts
 * import { Logger } from "@nexus/logger";
 * 
 * const logger = new Logger("my-service");
 * logger.info("Request received", { path: "/api/users" });
 * logger.error("Failed to fetch", { userId: "123" }, new Error("Network error"));
 * ```
 */
export class Logger {
  private service: string;
  private defaultContext: LogContext;

  constructor(service: string, defaultContext: LogContext = {}) {
    this.service = service;
    this.defaultContext = defaultContext;
  }

  private formatError(error: Error): LogEntry["error"] {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause instanceof Error 
        ? error.cause.message 
        : error.cause 
          ? String(error.cause) 
          : undefined,
    };
  }

  private log(
    level: LogLevel, 
    message: string, 
    context?: LogContext, 
    error?: Error
  ): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      service: this.service,
    };

    // Merge and redact context
    const mergedContext = { ...this.defaultContext, ...context };
    if (Object.keys(mergedContext).length > 0) {
      entry.context = redactSensitive(mergedContext) as LogContext;
    }

    if (error) {
      entry.error = this.formatError(error);
    }

    // Output as JSON - Cloudflare Workers Logs will parse and index
    const output = JSON.stringify(entry);
    
    switch (level) {
      case "error":
        console.error(output);
        break;
      case "warn":
        console.warn(output);
        break;
      case "debug":
        // Debug uses console.log but with debug level in the JSON
        console.log(output);
        break;
      default:
        console.log(output);
    }
  }

  /**
   * Log at debug level. Use for detailed debugging info.
   */
  debug(message: string, context?: LogContext): void {
    this.log("debug", message, context);
  }

  /**
   * Log at info level. Use for general operational info.
   */
  info(message: string, context?: LogContext): void {
    this.log("info", message, context);
  }

  /**
   * Log at warn level. Use for recoverable issues.
   */
  warn(message: string, context?: LogContext, error?: Error): void {
    this.log("warn", message, context, error);
  }

  /**
   * Log at error level. Use for errors and exceptions.
   */
  error(message: string, context?: LogContext, error?: Error): void {
    this.log("error", message, context, error);
  }

  /**
   * Create a child logger with additional default context.
   * Useful for adding request-specific context.
   * 
   * @example
   * ```ts
   * const requestLogger = logger.child({ requestId: "abc123", path: "/api/users" });
   * requestLogger.info("Processing request"); // includes requestId and path
   * ```
   */
  child(context: LogContext): Logger {
    return new Logger(this.service, { ...this.defaultContext, ...context });
  }

  /**
   * Create a timed operation that logs start, success, or failure.
   * 
   * @example
   * ```ts
   * const result = await logger.timed("fetchUser", { userId }, async () => {
   *   return await db.query.users.findFirst({ where: eq(users.id, userId) });
   * });
   * ```
   */
  async timed<T>(
    operation: string,
    context: LogContext,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    
    this.debug(`${operation} started`, context);
    
    try {
      const result = await fn();
      const durationMs = Date.now() - startTime;
      
      this.info(`${operation} completed`, { ...context, durationMs });
      
      return result;
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const err = error instanceof Error ? error : new Error(String(error));
      
      this.error(`${operation} failed`, { ...context, durationMs }, err);
      
      throw error;
    }
  }
}

/**
 * Create a logger for a specific service.
 * 
 * @example
 * ```ts
 * import { createLogger } from "@nexus/logger";
 * 
 * export const logger = createLogger("nexus-web");
 * ```
 */
export function createLogger(service: string, context?: LogContext): Logger {
  return new Logger(service, context);
}

/**
 * Pre-configured loggers for common services.
 */
export const loggers = {
  web: new Logger("nexus-web"),
  api: new Logger("nexus-api"),
};
