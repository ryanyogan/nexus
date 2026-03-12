import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
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
import { userRouter } from "./routes/user";
import { adminAuth } from "./middleware/admin";
import { usageMiddleware, mcpRateLimitMiddleware } from "./middleware/usage";
import { authMiddleware } from "./middleware/auth";
import type { AppContext, IngestionJob } from "./types";

const app = new Hono<AppContext>();

// Middleware
app.use("*", logger());
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
app.route("/api/submissions", submissionsRouter);
app.route("/api/server-submissions", serverSubmissionsRouter);
app.route("/api/stats", statsRouter);
app.route("/api/analyze", analyzeRouter);

// Protected user routes (require auth)
app.route("/api/secrets", secretsRouter);
app.route("/api/user", userRouter);

// Protected admin routes (require X-Admin-Key header)
app.use("/api/admin/*", adminAuth);
app.route("/api/admin", adminRouter);

// MCP Protocol endpoint (Streamable HTTP) - with optional auth and rate limiting
// Auth is optional: anonymous users get lower rate limits
app.use("/mcp/*", authMiddleware);
app.use("/mcp/*", mcpRateLimitMiddleware);
app.route("/mcp", mcpRouter);

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

  // Queue consumer for ingestion jobs
  async queue(
    batch: MessageBatch<IngestionJob>,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<void> {
    const db = createDb(env.DB);

    for (const message of batch.messages) {
      const job = message.body;
      console.log(`Processing ingestion job for library: ${job.libraryId}`);

      try {
        // Import dynamically to avoid circular deps
        const { processIngestionJob } = await import("./lib/ingestion");
        await processIngestionJob(job, env, db);
        message.ack();
      } catch (error) {
        console.error(`Failed to process job for ${job.libraryId}:`, error);
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
          message.ack();
        }
      }
    }
  },
};
