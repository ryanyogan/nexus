import { Hono } from "hono";
import { eq, like, and, desc, or, sql } from "drizzle-orm";
import { skills, userSkills } from "@nexus/db";
import type { AppContext } from "../types";

const skillsRouter = new Hono<AppContext>();

// ============================================================================
// GET /api/skills - List skills
// ============================================================================

skillsRouter.get("/", async (c) => {
  const db = c.get("db");
  const url = new URL(c.req.url);

  // Query params
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const search = url.searchParams.get("search");
  const type = url.searchParams.get("type");
  const category = url.searchParams.get("category");
  const tag = url.searchParams.get("tag");
  const sourceRepo = url.searchParams.get("sourceRepo");
  const official = url.searchParams.get("official") === "true";
  const featured = url.searchParams.get("featured") === "true";

  // Build conditions
  const conditions = [eq(skills.isActive, true)];

  if (search) {
    const searchTerm = `%${search.toLowerCase()}%`;
    conditions.push(
      or(
        like(sql`lower(${skills.name})`, searchTerm),
        like(sql`lower(${skills.slug})`, searchTerm),
        like(sql`lower(${skills.description})`, searchTerm)
      )!
    );
  }

  if (type) {
    conditions.push(
      eq(
        skills.type,
        type as "analysis" | "generation" | "transformation" | "integration" | "utility"
      )
    );
  }

  if (sourceRepo) {
    conditions.push(eq(skills.sourceRepo, sourceRepo));
  }

  if (official) {
    conditions.push(eq(skills.isOfficial, true));
  }

  if (featured) {
    conditions.push(eq(skills.isFeatured, true));
  }

  // Get skills
  const skillsList = await db
    .select({
      id: skills.id,
      name: skills.name,
      slug: skills.slug,
      description: skills.description,
      sourceUrl: skills.sourceUrl,
      sourceRepo: skills.sourceRepo,
      author: skills.author,
      version: skills.version,
      type: skills.type,
      categories: skills.categories,
      tags: skills.tags,
      format: skills.format,
      contentPreview: skills.contentPreview,
      requiredTools: skills.requiredTools,
      requiredMcpServers: skills.requiredMcpServers,
      installCount: skills.installCount,
      usageCount: skills.usageCount,
      rating: skills.rating,
      isOfficial: skills.isOfficial,
      isFeatured: skills.isFeatured,
      isVerified: skills.isVerified,
      createdAt: skills.createdAt,
      updatedAt: skills.updatedAt,
    })
    .from(skills)
    .where(and(...conditions))
    .orderBy(desc(skills.isOfficial), desc(skills.isFeatured), desc(skills.installCount))
    .limit(limit)
    .offset(offset);

  // Filter by category/tag in JS (since they're JSON arrays)
  let filteredSkills = skillsList;
  if (category) {
    filteredSkills = filteredSkills.filter((s) => s.categories?.includes(category));
  }
  if (tag) {
    filteredSkills = filteredSkills.filter((s) => s.tags?.includes(tag));
  }

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(skills)
    .where(and(...conditions));

  return c.json({
    skills: filteredSkills,
    total: countResult[0]?.count || 0,
    limit,
    offset,
  });
});

// ============================================================================
// GET /api/skills/types - List skill types
// ============================================================================

skillsRouter.get("/types", async (c) => {
  return c.json({
    types: [
      { id: "analysis", label: "Analysis", description: "Analyze code, content, or data" },
      { id: "generation", label: "Generation", description: "Generate code, content, or assets" },
      {
        id: "transformation",
        label: "Transformation",
        description: "Transform or convert data",
      },
      {
        id: "integration",
        label: "Integration",
        description: "Integrate with external services",
      },
      { id: "utility", label: "Utility", description: "General purpose utilities" },
    ],
  });
});

// ============================================================================
// GET /api/skills/categories - List categories with counts
// ============================================================================

skillsRouter.get("/categories", async (c) => {
  const db = c.get("db");

  const allSkills = await db
    .select({ categories: skills.categories })
    .from(skills)
    .where(eq(skills.isActive, true));

  // Collect categories with counts
  const categoryCounts = new Map<string, number>();
  for (const skill of allSkills) {
    for (const cat of skill.categories || []) {
      categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
    }
  }

  const categories = Array.from(categoryCounts.entries())
    .map(([id, count]) => ({
      id,
      label: id
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      count,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return c.json({ categories });
});

// ============================================================================
// GET /api/skills/sources - List source repos
// ============================================================================

skillsRouter.get("/sources", async (c) => {
  const db = c.get("db");

  const result = await db
    .select({ sourceRepo: skills.sourceRepo })
    .from(skills)
    .where(and(eq(skills.isActive, true), sql`${skills.sourceRepo} IS NOT NULL`))
    .groupBy(skills.sourceRepo);

  const sources = result
    .filter((r) => r.sourceRepo)
    .map((r) => ({
      id: r.sourceRepo,
      label: r.sourceRepo!.replace("anthropics/", "").replace("vercel-labs/", ""),
      url: `https://github.com/${r.sourceRepo}`,
    }));

  return c.json({ sources });
});

// ============================================================================
// GET /api/skills/:id - Get skill details
// ============================================================================

skillsRouter.get("/:id", async (c) => {
  const db = c.get("db");
  const skillId = c.req.param("id");

  const [skill] = await db.select().from(skills).where(eq(skills.id, skillId)).limit(1);

  if (!skill) {
    return c.json({ error: "Skill not found" }, 404);
  }

  // Get full content from R2
  const bucket = c.env.DOCS_BUCKET;
  let content: string | null = null;

  try {
    const obj = await bucket.get(skill.r2Key);
    if (obj) {
      content = await obj.text();
    }
  } catch (error) {
    console.warn(`Failed to fetch skill content for ${skillId}:`, error);
  }

  return c.json({
    skill,
    content,
  });
});

// ============================================================================
// GET /api/skills/:id/content - Get raw skill content
// ============================================================================

skillsRouter.get("/:id/content", async (c) => {
  const db = c.get("db");
  const skillId = c.req.param("id");

  const [skill] = await db
    .select({ r2Key: skills.r2Key, format: skills.format, name: skills.name })
    .from(skills)
    .where(eq(skills.id, skillId))
    .limit(1);

  if (!skill) {
    return c.json({ error: "Skill not found" }, 404);
  }

  // Get content from R2
  const bucket = c.env.DOCS_BUCKET;
  const obj = await bucket.get(skill.r2Key);

  if (!obj) {
    return c.json({ error: "Skill content not found" }, 404);
  }

  const content = await obj.text();

  // Return raw content with appropriate content type
  const contentType =
    skill.format === "json"
      ? "application/json"
      : skill.format === "yaml"
        ? "text/yaml"
        : "text/markdown";

  return new Response(content, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${skill.name}.${skill.format === "markdown" ? "md" : skill.format}"`,
    },
  });
});

// ============================================================================
// POST /api/skills/:id/install - Track skill installation
// ============================================================================

skillsRouter.post("/:id/install", async (c) => {
  const db = c.get("db");
  const skillId = c.req.param("id");
  const userId = c.get("user")?.id;

  // Verify skill exists
  const [skill] = await db
    .select({ id: skills.id })
    .from(skills)
    .where(eq(skills.id, skillId))
    .limit(1);

  if (!skill) {
    return c.json({ error: "Skill not found" }, 404);
  }

  // Increment install count
  await db
    .update(skills)
    .set({
      installCount: sql`${skills.installCount} + 1`,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(skills.id, skillId));

  // If user is authenticated, track user installation
  if (userId) {
    const now = new Date().toISOString();

    // Check if already installed
    const [existing] = await db
      .select({ id: userSkills.id })
      .from(userSkills)
      .where(and(eq(userSkills.userId, userId), eq(userSkills.skillId, skillId)))
      .limit(1);

    if (!existing) {
      await db.insert(userSkills).values({
        id: crypto.randomUUID(),
        userId,
        skillId,
        installedAt: now,
      });
    }
  }

  return c.json({ success: true });
});

// ============================================================================
// POST /api/skills/:id/use - Track skill usage
// ============================================================================

skillsRouter.post("/:id/use", async (c) => {
  const db = c.get("db");
  const skillId = c.req.param("id");
  const userId = c.get("user")?.id;

  // Increment usage count
  await db
    .update(skills)
    .set({
      usageCount: sql`${skills.usageCount} + 1`,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(skills.id, skillId));

  // Update user's last used timestamp
  if (userId) {
    await db
      .update(userSkills)
      .set({ lastUsedAt: new Date().toISOString() })
      .where(and(eq(userSkills.userId, userId), eq(userSkills.skillId, skillId)));
  }

  return c.json({ success: true });
});

// ============================================================================
// GET /api/skills/user/installed - Get user's installed skills
// ============================================================================

skillsRouter.get("/user/installed", async (c) => {
  const db = c.get("db");
  const userId = c.get("user")?.id;

  if (!userId) {
    return c.json({ error: "Authentication required" }, 401);
  }

  const installed = await db
    .select({
      skillId: userSkills.skillId,
      installedAt: userSkills.installedAt,
      lastUsedAt: userSkills.lastUsedAt,
      customConfig: userSkills.customConfig,
      skill: {
        id: skills.id,
        name: skills.name,
        slug: skills.slug,
        description: skills.description,
        type: skills.type,
        isOfficial: skills.isOfficial,
      },
    })
    .from(userSkills)
    .innerJoin(skills, eq(userSkills.skillId, skills.id))
    .where(eq(userSkills.userId, userId))
    .orderBy(desc(userSkills.installedAt));

  return c.json({ skills: installed });
});

export { skillsRouter };
