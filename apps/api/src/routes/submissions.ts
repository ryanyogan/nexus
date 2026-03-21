import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, desc, sql } from "drizzle-orm";
import { submissions } from "@nexus/db";
import type { AppContext } from "../types";

const submissionsRouter = new Hono<AppContext>();

// ============================================================================
// POST /api/submissions - Submit a library for indexing
// ============================================================================

submissionsRouter.post(
  "/",
  zValidator(
    "json",
    z.object({
      libraryName: z.string().min(1).max(100),
      sourceUrl: z
        .string()
        .url()
        .refine((url) => url.includes("github.com"), {
          message: "Currently only GitHub repositories are supported",
        }),
      description: z.string().max(500).optional(),
      email: z.string().email().optional(),
    })
  ),
  async (c) => {
    const data = c.req.valid("json");
    const db = c.get("db");

    // Check for duplicate submission
    const existing = await db
      .select()
      .from(submissions)
      .where(eq(submissions.sourceUrl, data.sourceUrl))
      .limit(1);

    if (existing.length > 0) {
      const existingSubmission = existing[0];
      return c.json(
        {
          message: "This repository has already been submitted",
          id: existingSubmission.id,
          status: existingSubmission.status,
        },
        409
      );
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.insert(submissions).values({
      id,
      libraryName: data.libraryName,
      sourceUrl: data.sourceUrl,
      description: data.description || null,
      submitterEmail: data.email || null,
      status: "pending",
      createdAt: now,
    });

    return c.json(
      {
        message: "Submission received! We'll review it soon.",
        id,
        status: "pending",
      },
      201
    );
  }
);

// ============================================================================
// GET /api/submissions - List recent submissions (public)
// ============================================================================

submissionsRouter.get(
  "/",
  zValidator(
    "query",
    z.object({
      status: z.enum(["pending", "approved", "rejected", "indexed"]).optional(),
      limit: z.coerce.number().min(1).max(50).default(10),
      offset: z.coerce.number().min(0).default(0),
    })
  ),
  async (c) => {
    const { status, limit, offset } = c.req.valid("query");
    const db = c.get("db");

    let query = db
      .select({
        id: submissions.id,
        libraryName: submissions.libraryName,
        sourceUrl: submissions.sourceUrl,
        status: submissions.status,
        createdAt: submissions.createdAt,
      })
      .from(submissions)
      .orderBy(desc(submissions.createdAt))
      .limit(limit)
      .offset(offset);

    if (status) {
      query = query.where(eq(submissions.status, status)) as typeof query;
    }

    const results = await query;

    // Get total count
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(submissions);

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
// GET /api/submissions/:id - Get submission status
// ============================================================================

submissionsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");

  const [submission] = await db
    .select({
      id: submissions.id,
      libraryName: submissions.libraryName,
      sourceUrl: submissions.sourceUrl,
      description: submissions.description,
      status: submissions.status,
      libraryId: submissions.libraryId,
      createdAt: submissions.createdAt,
      processedAt: submissions.processedAt,
    })
    .from(submissions)
    .where(eq(submissions.id, id))
    .limit(1);

  if (!submission) {
    return c.json({ error: "Submission not found" }, 404);
  }

  return c.json({ submission });
});

export { submissionsRouter };
