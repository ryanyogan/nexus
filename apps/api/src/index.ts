import { Hono } from "hono";
import { cors } from "hono/cors";
import { createDb } from "@nexus/db";
import { createAuth } from "@nexus/auth";
import { mcpRouter } from "./routes/mcp";
import { librariesRouter } from "./routes/libraries";
import { submissionsRouter } from "./routes/submissions";
import { serverSubmissionsRouter } from "./routes/server-submissions";
import { adminRouter } from "./routes/admin";
import { statsRouter } from "./routes/stats";
import { analyzeRouter } from "./routes/analyze";
import { serversRouter } from "./routes/servers";
import { secretsRouter } from "./routes/secrets";
import { skillsRouter } from "./routes/skills";
import flowsRouter from "./routes/flows";
import brainRouter from "./routes/brain";
import reposRouter from "./routes/repos";
import stacksRouter from "./routes/stacks";
import { userRouter } from "./routes/user";
import { cliAuthRouter } from "./routes/cli-auth";
import { adminAuth } from "./middleware/admin";
import { usageMiddleware, mcpRateLimitMiddleware } from "./middleware/usage";
import { authMiddleware } from "./middleware/auth";
import { structuredLogger, logger } from "./middleware/logger";
import type { AppContext, IngestionJob, StackLearningJob } from "./types";

const app = new Hono<AppContext>();

// Middleware - structured JSON logging for Cloudflare Workers Logs
app.use("*", structuredLogger);
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:3000",
      "https://nexus.yogan.dev",
      "https://code.nexus.yogan.dev",
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Admin-Key"],
    credentials: true,
  })
);

// Initialize Drizzle DB instance from env binding
app.use("*", async (c, next) => {
  const db = createDb(c.env.DB);
  c.set("db", db);
  await next();
});

// Health check
app.get("/", (c) => {
  return c.json({
    name: "Nexus API",
    version: "1.0.0",
    description: "The Documentation Oracle for AI",
  });
});

app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Public API routes (with usage tracking and rate limiting)
app.use("/api/libraries/*", usageMiddleware);
app.use("/api/servers/*", usageMiddleware);
app.use("/api/skills/*", usageMiddleware);
app.route("/api/libraries", librariesRouter);
app.route("/api/servers", serversRouter);
app.route("/api/skills", skillsRouter);
app.route("/api/flows", flowsRouter);
app.route("/api/stacks", stacksRouter);
app.route("/api/submissions", submissionsRouter);
app.route("/api/server-submissions", serverSubmissionsRouter);
app.route("/api/stats", statsRouter);
app.route("/api/analyze", analyzeRouter);

// Protected user routes (require auth)
app.route("/api/secrets", secretsRouter);
app.route("/api/user", userRouter);
app.route("/api/brain", brainRouter);
app.route("/api/repos", reposRouter);

// CLI authentication routes
app.route("/api/cli/auth", cliAuthRouter);

// Protected admin routes (require X-Admin-Key header)
app.use("/api/admin/*", adminAuth);
app.route("/api/admin", adminRouter);

// MCP Protocol endpoint (Streamable HTTP) - with optional auth and rate limiting
// Auth is optional: anonymous users get lower rate limits
app.use("/mcp/*", authMiddleware);
app.use("/mcp/*", mcpRateLimitMiddleware);
app.route("/mcp", mcpRouter);

// SSE endpoint for MCP - supports both StreamableHTTP (POST) and SSE (GET) transports
// This enables native remote mode for clients like OpenCode
app.use("/sse", authMiddleware);
app.use("/sse", mcpRateLimitMiddleware);

// POST /sse - StreamableHTTP transport (OpenCode tries this first)
// Forwards to /mcp and wraps response in SSE format
app.post("/sse", async (c) => {
  const body = await c.req.json();
  
  // Forward the request to /mcp endpoint internally
  const mcpResponse = await app.request("/mcp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": c.req.header("Authorization") || "",
      "NEXUS_API_KEY": c.req.header("NEXUS_API_KEY") || "",
    },
    body: JSON.stringify(body),
  }, c.env);
  
  const responseData = await mcpResponse.json();
  const sessionId = mcpResponse.headers.get("Mcp-Session-Id");
  
  // Return as SSE-formatted response
  const sseResponse = `event: message\ndata: ${JSON.stringify(responseData)}\n\n`;
  
  const headers: Record<string, string> = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, NEXUS_API_KEY, Mcp-Session-Id",
    "Access-Control-Expose-Headers": "Mcp-Session-Id",
  };
  
  if (sessionId) {
    headers["Mcp-Session-Id"] = sessionId;
  }
  
  return new Response(sseResponse, { headers });
});

// GET /sse - SSE transport (fallback, keeps connection open)
app.get("/sse", async (c) => {
  // Generate a unique session ID for this SSE connection
  const sessionId = crypto.randomUUID();
  
  // Create SSE response with MCP endpoint event
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send the endpoint event - tells client where to POST requests
      const endpointEvent = `event: endpoint\ndata: /mcp?sessionId=${sessionId}\n\n`;
      controller.enqueue(encoder.encode(endpointEvent));
      
      // Send initial message event
      const messageEvent = `event: message\ndata: ${JSON.stringify({
        jsonrpc: "2.0",
        method: "notifications/initialized",
        params: {}
      })}\n\n`;
      controller.enqueue(encoder.encode(messageEvent));
      
      // Keep connection alive with periodic pings
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          clearInterval(pingInterval);
        }
      }, 30000);
      
      // Clean up on close - but we can't easily detect close in Cloudflare Workers
      // The client will reconnect if needed
    }
  });
  
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, NEXUS_API_KEY",
    },
  });
});

// Better Auth routes
app.on(["POST", "GET"], "/api/auth/*", (c) => {
  const auth = createAuth({
    DB: c.env.DB,
    GOOGLE_CLIENT_ID: c.env.GOOGLE_CLIENT_ID || "",
    GOOGLE_CLIENT_SECRET: c.env.GOOGLE_CLIENT_SECRET || "",
    GITHUB_CLIENT_ID: c.env.GITHUB_CLIENT_ID || "",
    GITHUB_CLIENT_SECRET: c.env.GITHUB_CLIENT_SECRET || "",
    BETTER_AUTH_SECRET: c.env.BETTER_AUTH_SECRET || "",
    BETTER_AUTH_URL: c.env.BETTER_AUTH_URL || "https://api.nexus.yogan.dev",
  });
  return auth.handler(c.req.raw);
});

// Export for Cloudflare Workers
export default {
  fetch: app.fetch,

  // Scheduled handler for cron triggers
  async scheduled(
    event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    switch (event.cron) {
      case "0 2 * * 0": {
        // Weekly Context7 sync - runs every Sunday at 2am UTC
        logger.info("Starting weekly Context7 sync", {
          cron: event.cron,
          scheduledTime: new Date(event.scheduledTime).toISOString(),
        });

        try {
          const { syncAllLibraries } = await import("./services/context7-sync");
          
          // Use waitUntil to ensure the sync completes even after response
          ctx.waitUntil(
            syncAllLibraries(env, "cron").then((result) => {
              logger.info("Weekly Context7 sync completed", {
                jobId: result.jobId,
                status: result.status,
                successful: result.successfulItems,
                failed: result.failedItems,
                durationMs: result.durationMs,
              });
            }).catch((error) => {
              logger.error("Weekly Context7 sync failed", {}, error as Error);
            })
          );
        } catch (error) {
          logger.error("Failed to start Context7 sync", {}, error as Error);
        }
        break;
      }
      default:
        logger.warn("Unknown cron trigger", { cron: event.cron });
    }
  },

  // Queue consumer for ingestion and stack learning jobs
  async queue(
    batch: MessageBatch<IngestionJob | StackLearningJob>,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<void> {
    const db = createDb(env.DB);

    // Route based on queue name
    if (batch.queue === "nexus-ingestion") {
      await processIngestionBatch(batch as MessageBatch<IngestionJob>, env, db);
    } else if (batch.queue === "nexus-stack-learning") {
      await processStackLearningBatch(batch as MessageBatch<StackLearningJob>, env, db);
    } else {
      logger.warn("Unknown queue", { queue: batch.queue });
    }
  },
};

// Process ingestion jobs batch
async function processIngestionBatch(
  batch: MessageBatch<IngestionJob>,
  env: Env,
  db: ReturnType<typeof createDb>
): Promise<void> {
  for (const message of batch.messages) {
    const job = message.body;
    logger.info("Processing ingestion job", { libraryId: job.libraryId, attempt: message.attempts });

    try {
      // Import dynamically to avoid circular deps
      const { processIngestionJob } = await import("./lib/ingestion");
      await processIngestionJob(job, env, db);
      logger.info("Ingestion job completed", { libraryId: job.libraryId });
      message.ack();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Ingestion job failed", { libraryId: job.libraryId, attempt: message.attempts }, err);
      
      // Retry up to 3 times
      if (message.attempts < 3) {
        message.retry();
      } else {
        // Mark as failed in DB
        const { libraries } = await import("@nexus/db");
        const { eq } = await import("drizzle-orm");
        await db
          .update(libraries)
          .set({
            indexStatus: "failed",
            indexError: error instanceof Error ? error.message : String(error),
            updatedAt: new Date().toISOString(),
          })
          .where(eq(libraries.id, job.libraryId));
        logger.error("Ingestion job permanently failed", { libraryId: job.libraryId, maxAttemptsReached: true }, err);
        message.ack();
      }
    }
  }
}

// Process stack learning jobs batch
async function processStackLearningBatch(
  batch: MessageBatch<StackLearningJob>,
  env: Env,
  db: ReturnType<typeof createDb>
): Promise<void> {
  for (const message of batch.messages) {
    const job = message.body;
    logger.info("Processing stack learning job", { 
      stackId: job.stackId, 
      taskType: job.taskType,
      attempt: message.attempts 
    });

    try {
      // Import dynamically to avoid circular deps
      const { processStackLearningJob } = await import("./lib/stack-learning");
      await processStackLearningJob(job, env, db);
      logger.info("Stack learning job completed", { stackId: job.stackId, taskType: job.taskType });
      message.ack();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Stack learning job failed", { 
        stackId: job.stackId, 
        taskType: job.taskType,
        attempt: message.attempts 
      }, err);
      
      // Retry up to 3 times
      if (message.attempts < 3) {
        message.retry();
      } else {
        // Mark stack as failed in DB
        const { stacks } = await import("@nexus/db");
        const { eq } = await import("drizzle-orm");
        await db
          .update(stacks)
          .set({
            learningStatus: "failed",
            learningError: error instanceof Error ? error.message : String(error),
            updatedAt: new Date().toISOString(),
          })
          .where(eq(stacks.id, job.stackId));
        logger.error("Stack learning job permanently failed", { 
          stackId: job.stackId, 
          taskType: job.taskType,
          maxAttemptsReached: true 
        }, err);
        message.ack();
      }
    }
  }
}
