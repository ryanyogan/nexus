import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { servers } from "@nexus/db/schema";
import type { AppContext } from "../types";

const serversRouter = new Hono<AppContext>();

// List all servers
serversRouter.get("/", async (c) => {
  const { category, search, verified } = c.req.query();
  const db = c.get("db");

  const conditions = [eq(servers.isActive, true)];

  if (verified === "true") {
    conditions.push(eq(servers.isVerified, true));
  }

  const result = await db
    .select()
    .from(servers)
    .where(and(...conditions))
    .orderBy(servers.name);

  // Filter by category and search in memory (JSON column filtering)
  let filtered = result;

  if (category) {
    filtered = filtered.filter((s) => s.categories.includes(category));
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.name.toLowerCase().includes(searchLower) ||
        s.description.toLowerCase().includes(searchLower)
    );
  }

  return c.json({
    servers: filtered,
    total: filtered.length,
  });
});

// Get single server with tools and stats
serversRouter.get("/:id", async (c) => {
  const { id } = c.req.param();
  const db = c.get("db");

  const server = await db.query.servers.findFirst({
    where: eq(servers.id, id),
    with: {
      tools: true,
      stats: true,
    },
  });

  if (!server) {
    return c.json({ error: "Server not found" }, 404);
  }

  return c.json({ server });
});

// Create server (submission)
const createServerSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  endpoint: z.string().url(),
  transport: z.enum(["stdio", "sse", "streamable-http"]),
  authType: z.enum(["none", "api_key", "oauth"]),
  categories: z.array(z.string()),
  iconUrl: z.string().url().optional(),
  homepageUrl: z.string().url().optional(),
  repositoryUrl: z.string().url().optional(),
});

serversRouter.post("/", zValidator("json", createServerSchema), async (c) => {
  const data = c.req.valid("json");
  const db = c.get("db");
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.insert(servers).values({
    id,
    name: data.name,
    description: data.description,
    endpoint: data.endpoint,
    transport: data.transport,
    authType: data.authType,
    categories: data.categories,
    iconUrl: data.iconUrl,
    homepageUrl: data.homepageUrl,
    repositoryUrl: data.repositoryUrl,
    isActive: false,
    isVerified: false,
    createdAt: now,
    updatedAt: now,
  });

  return c.json({ id, message: "Server submitted for review" }, 201);
});

export { serversRouter };
