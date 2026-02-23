import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, desc, sql } from "drizzle-orm";
import { serverSubmissions } from "@nexus/db";
import type { AppContext } from "../types";

const serverSubmissionsRouter = new Hono<AppContext>();

// ============================================================================
// POST /api/server-submissions - Submit an MCP server for review
// ============================================================================

serverSubmissionsRouter.post(
  "/",
  zValidator(
    "json",
    z.object({
      name: z.string().min(1).max(100),
      displayName: z.string().max(100).optional(),
      description: z.string().max(1000).optional(),
      repositoryUrl: z.string().url().refine(
        (url) => url.includes("github.com") || url.includes("gitlab.com") || url.includes("npmjs.com"),
        { message: "Please provide a GitHub, GitLab, or npm package URL" }
      ),
      packageName: z.string().max(200).optional(),
      packageType: z.enum(["npm", "pypi", "docker", "binary", "remote"]).default("npm"),
      transportType: z.enum(["stdio", "http", "sse"]).default("stdio"),
      email: z.string().email().optional(),
    })
  ),
  async (c) => {
    const data = c.req.valid("json");
    const db = c.get("db");

    // Check for duplicate submission
    const existing = await db
      .select()
      .from(serverSubmissions)
      .where(eq(serverSubmissions.repositoryUrl, data.repositoryUrl))
      .limit(1);

    if (existing.length > 0) {
      const existingSubmission = existing[0];
      return c.json(
        {
          message: "This server has already been submitted",
          id: existingSubmission.id,
          status: existingSubmission.status,
        },
        409
      );
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.insert(serverSubmissions).values({
      id,
      name: data.name,
      displayName: data.displayName || null,
      description: data.description || null,
      repositoryUrl: data.repositoryUrl,
      packageName: data.packageName || null,
      packageType: data.packageType,
      transportType: data.transportType,
      submitterEmail: data.email || null,
      status: "pending",
      createdAt: now,
    });

    return c.json(
      {
        message: "Server submission received! We'll review it soon.",
        id,
        status: "pending",
      },
      201
    );
  }
);

// ============================================================================
// GET /api/server-submissions - List recent submissions (public)
// ============================================================================

serverSubmissionsRouter.get(
  "/",
  zValidator(
    "query",
    z.object({
      status: z.enum(["pending", "approved", "rejected"]).optional(),
      limit: z.coerce.number().min(1).max(50).default(10),
      offset: z.coerce.number().min(0).default(0),
    })
  ),
  async (c) => {
    const { status, limit, offset } = c.req.valid("query");
    const db = c.get("db");

    let query = db
      .select({
        id: serverSubmissions.id,
        name: serverSubmissions.name,
        displayName: serverSubmissions.displayName,
        repositoryUrl: serverSubmissions.repositoryUrl,
        packageType: serverSubmissions.packageType,
        status: serverSubmissions.status,
        createdAt: serverSubmissions.createdAt,
      })
      .from(serverSubmissions)
      .orderBy(desc(serverSubmissions.createdAt))
      .limit(limit)
      .offset(offset);

    if (status) {
      query = query.where(eq(serverSubmissions.status, status)) as typeof query;
    }

    const results = await query;

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(serverSubmissions);

    const total = countResult[0]?.count || 0;

    return c.json({
      submissions: results,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + results.length < total,
      },
    });
  }
);

// ============================================================================
// GET /api/server-submissions/:id - Get submission status
// ============================================================================

serverSubmissionsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");

  const [submission] = await db
    .select({
      id: serverSubmissions.id,
      name: serverSubmissions.name,
      displayName: serverSubmissions.displayName,
      description: serverSubmissions.description,
      repositoryUrl: serverSubmissions.repositoryUrl,
      packageName: serverSubmissions.packageName,
      packageType: serverSubmissions.packageType,
      transportType: serverSubmissions.transportType,
      status: serverSubmissions.status,
      rejectionReason: serverSubmissions.rejectionReason,
      serverId: serverSubmissions.serverId,
      createdAt: serverSubmissions.createdAt,
      processedAt: serverSubmissions.processedAt,
    })
    .from(serverSubmissions)
    .where(eq(serverSubmissions.id, id))
    .limit(1);

  if (!submission) {
    return c.json({ error: "Submission not found" }, 404);
  }

  return c.json({ submission });
});

export { serverSubmissionsRouter };
