import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createDb } from "@nexus/db";
import { authRouter } from "./routes/auth";
import { mcpRouter } from "./routes/mcp";
import { serversRouter } from "./routes/servers";
import { toolsRouter } from "./routes/tools";
import { adminRouter } from "./routes/admin";
import type { AppContext } from "./types";

const app = new Hono<AppContext>();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://nexus.yogan.dev"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
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
    version: "0.1.0",
    description: "One MCP server to rule them all",
  });
});

app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Auth routes (Better Auth)
app.route("/api/auth", authRouter);

// API routes
app.route("/api/servers", serversRouter);
app.route("/api/tools", toolsRouter);
app.route("/api/admin", adminRouter);

// MCP Protocol endpoint (Streamable HTTP)
app.route("/mcp", mcpRouter);

export default app;
