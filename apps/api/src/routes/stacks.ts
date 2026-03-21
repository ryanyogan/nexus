import { Hono } from "hono";
import { eq, like, and, desc, or, sql, isNull, asc, inArray } from "drizzle-orm";
import {
  stacks,
  stackRepos,
  stackCompositions,
  stackPackages,
  userStacks,
  users,
  libraries,
  type Database,
  type Stack,
  type StackPreferences,
  type NewStack,
  type NewStackRepo,
  type NewStackComposition,
  type NewStackPackage,
  type NewUserStack,
  STACK_CATEGORIES,
  STACK_LAYERS,
  TOKEN_BUDGETS,
} from "@nexus/db";
import { createAuth } from "@nexus/auth";
import type { AppContext } from "../types";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const stacksRouter = new Hono<AppContext>();

// ============================================================================
// Auth middleware - require authenticated user
// ============================================================================

async function requireAuth(c: any, next: () => Promise<void>) {
  const auth = createAuth({
    DB: c.env.DB,
    GOOGLE_CLIENT_ID: c.env.GOOGLE_CLIENT_ID || "",
    GOOGLE_CLIENT_SECRET: c.env.GOOGLE_CLIENT_SECRET || "",
    GITHUB_CLIENT_ID: c.env.GITHUB_CLIENT_ID || "",
    GITHUB_CLIENT_SECRET: c.env.GITHUB_CLIENT_SECRET || "",
    BETTER_AUTH_SECRET: c.env.BETTER_AUTH_SECRET || "",
    BETTER_AUTH_URL: c.env.BETTER_AUTH_URL || "",
  });

  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session?.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("user", session.user);
  c.set("session", session.session);
  await next();
}

// Optional auth - sets user if present but doesn't require it
async function optionalAuth(c: any, next: () => Promise<void>) {
  const auth = createAuth({
    DB: c.env.DB,
    GOOGLE_CLIENT_ID: c.env.GOOGLE_CLIENT_ID || "",
    GOOGLE_CLIENT_SECRET: c.env.GOOGLE_CLIENT_SECRET || "",
    GITHUB_CLIENT_ID: c.env.GITHUB_CLIENT_ID || "",
    GITHUB_CLIENT_SECRET: c.env.GITHUB_CLIENT_SECRET || "",
    BETTER_AUTH_SECRET: c.env.BETTER_AUTH_SECRET || "",
    BETTER_AUTH_URL: c.env.BETTER_AUTH_URL || "",
  });

  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (session?.user) {
    c.set("user", session.user);
    c.set("session", session.session);
  }

  await next();
}

// ============================================================================
// Validation Schemas
// ============================================================================

const createStackSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  category: z.enum(STACK_CATEGORIES).optional(),
  layer: z.number().min(0).max(3).optional(),
  tags: z.array(z.string()).optional(),
  instructions: z.string().optional(),
  cliPreferences: z.record(z.unknown()).optional(),
  manifestType: z.string().optional(),
  manifestContent: z.string().optional(),
  canvasData: z
    .object({
      nodes: z.array(
        z.object({
          id: z.string(),
          type: z.string(),
          position: z.object({ x: z.number(), y: z.number() }),
          data: z.record(z.unknown()),
        })
      ),
      edges: z.array(
        z.object({
          id: z.string(),
          source: z.string(),
          target: z.string(),
          type: z.string().optional(),
        })
      ),
      viewport: z
        .object({
          x: z.number(),
          y: z.number(),
          zoom: z.number(),
        })
        .optional(),
    })
    .optional(),
  tokenBudget: z.enum(TOKEN_BUDGETS).optional(),
  isPublic: z.boolean().optional(),
});

const updateStackSchema = createStackSchema.partial();

const addRepoSchema = z.object({
  githubUrl: z.string().url(),
  isPrivate: z.boolean().optional(),
  branch: z.string().optional(),
  paths: z.array(z.string()).optional(),
});

const composeStackSchema = z.object({
  childStackId: z.string(),
  position: z.number().optional(),
});

// ============================================================================
// Helpers
// ============================================================================

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
}

function generateId(): string {
  return `stk_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

// ============================================================================
// Routes
// ============================================================================

// GET /api/stacks - List stacks
stacksRouter.get("/", optionalAuth, async (c) => {
  const db = c.get("db");
  const user = c.get("user");

  const filter = c.req.query("filter") || "all"; // all, my, installed, featured, starter
  const category = c.req.query("category");
  const search = c.req.query("search");
  const limit = Math.min(parseInt(c.req.query("limit") || "20"), 50);
  const offset = parseInt(c.req.query("offset") || "0");

  const conditions: any[] = [eq(stacks.isActive, true)];

  // Filter logic
  if (filter === "my" && user) {
    conditions.push(eq(stacks.userId, user.id));
  } else if (filter === "installed" && user) {
    // Get installed stack IDs
    const installedStacks = await db
      .select({ stackId: userStacks.stackId })
      .from(userStacks)
      .where(eq(userStacks.userId, user.id));

    if (installedStacks.length === 0) {
      return c.json({ stacks: [], total: 0, hasMore: false });
    }

    conditions.push(
      inArray(
        stacks.id,
        installedStacks.map((s) => s.stackId)
      )
    );
  } else if (filter === "featured") {
    conditions.push(eq(stacks.isFeatured, true));
    conditions.push(eq(stacks.isPublic, true));
  } else if (filter === "starter") {
    conditions.push(eq(stacks.isStarter, true));
  } else {
    // "all" - show public stacks + user's own
    if (user) {
      conditions.push(or(eq(stacks.isPublic, true), eq(stacks.userId, user.id)));
    } else {
      conditions.push(eq(stacks.isPublic, true));
    }
  }

  // Category filter
  if (category && STACK_CATEGORIES.includes(category as any)) {
    conditions.push(eq(stacks.category, category as any));
  }

  // Search filter
  if (search) {
    conditions.push(or(like(stacks.name, `%${search}%`), like(stacks.description, `%${search}%`)));
  }

  // Query with count
  const [results, countResult] = await Promise.all([
    db
      .select({
        id: stacks.id,
        name: stacks.name,
        slug: stacks.slug,
        description: stacks.description,
        icon: stacks.icon,
        color: stacks.color,
        category: stacks.category,
        layer: stacks.layer,
        tags: stacks.tags,
        tokenBudget: stacks.tokenBudget,
        learningStatus: stacks.learningStatus,
        isPublic: stacks.isPublic,
        isFeatured: stacks.isFeatured,
        isStarter: stacks.isStarter,
        forkCount: stacks.forkCount,
        useCount: stacks.useCount,
        installCount: stacks.installCount,
        userId: stacks.userId,
        createdAt: stacks.createdAt,
        updatedAt: stacks.updatedAt,
      })
      .from(stacks)
      .where(and(...conditions))
      .orderBy(desc(stacks.useCount), desc(stacks.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(stacks)
      .where(and(...conditions)),
  ]);

  const total = countResult[0]?.count || 0;

  return c.json({
    stacks: results,
    total,
    hasMore: offset + results.length < total,
  });
});

// GET /api/stacks/categories - List categories with counts
stacksRouter.get("/categories", async (c) => {
  const db = c.get("db");

  const categoryCounts = await db
    .select({
      category: stacks.category,
      count: sql<number>`count(*)`,
    })
    .from(stacks)
    .where(and(eq(stacks.isActive, true), eq(stacks.isPublic, true)))
    .groupBy(stacks.category);

  const categories = STACK_CATEGORIES.map((cat) => ({
    id: cat,
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    count: categoryCounts.find((c) => c.category === cat)?.count || 0,
  }));

  return c.json({ categories });
});

// GET /api/stacks/starters - Get starter stacks
stacksRouter.get("/starters", async (c) => {
  const db = c.get("db");

  const starterStacks = await db
    .select()
    .from(stacks)
    .where(and(eq(stacks.isStarter, true), eq(stacks.isActive, true)))
    .orderBy(asc(stacks.layer), asc(stacks.name));

  return c.json({ stacks: starterStacks });
});

// GET /api/stacks/:id - Get stack details
stacksRouter.get("/:id", optionalAuth, async (c) => {
  const db = c.get("db");
  const user = c.get("user");
  const stackId = c.req.param("id");

  // Find by ID or slug
  const [stack] = await db
    .select()
    .from(stacks)
    .where(and(or(eq(stacks.id, stackId), eq(stacks.slug, stackId)), eq(stacks.isActive, true)))
    .limit(1);

  if (!stack) {
    return c.json({ error: "Stack not found" }, 404);
  }

  // Check access - must be public, starter, or owned by user
  if (!stack.isPublic && !stack.isStarter && stack.userId !== user?.id) {
    return c.json({ error: "Stack not found" }, 404);
  }

  // Get repos
  const repos = await db.select().from(stackRepos).where(eq(stackRepos.stackId, stack.id));

  // Get packages
  const packages = await db
    .select({
      id: stackPackages.id,
      name: stackPackages.name,
      registry: stackPackages.registry,
      version: stackPackages.version,
      status: stackPackages.status,
      documentationSummary: stackPackages.documentationSummary,
      libraryId: stackPackages.libraryId,
    })
    .from(stackPackages)
    .where(eq(stackPackages.stackId, stack.id));

  // Get child stacks (compositions)
  const compositions = await db
    .select({
      id: stackCompositions.id,
      position: stackCompositions.position,
      childStack: {
        id: stacks.id,
        name: stacks.name,
        slug: stacks.slug,
        description: stacks.description,
        icon: stacks.icon,
        color: stacks.color,
        category: stacks.category,
        layer: stacks.layer,
      },
    })
    .from(stackCompositions)
    .innerJoin(stacks, eq(stackCompositions.childStackId, stacks.id))
    .where(eq(stackCompositions.parentStackId, stack.id))
    .orderBy(asc(stackCompositions.position));

  // Check if user has installed this stack
  let isInstalled = false;
  if (user) {
    const [installation] = await db
      .select()
      .from(userStacks)
      .where(and(eq(userStacks.userId, user.id), eq(userStacks.stackId, stack.id)))
      .limit(1);
    isInstalled = !!installation;
  }

  return c.json({
    stack: {
      ...stack,
      repos,
      packages,
      compositions: compositions.map((c) => c.childStack),
      isInstalled,
    },
  });
});

// GET /api/stacks/:id/prompt - Get compiled prompt for MCP
stacksRouter.get("/:id/prompt", optionalAuth, async (c) => {
  const db = c.get("db");
  const user = c.get("user");
  const stackId = c.req.param("id");

  const [stack] = await db
    .select()
    .from(stacks)
    .where(and(or(eq(stacks.id, stackId), eq(stacks.slug, stackId)), eq(stacks.isActive, true)))
    .limit(1);

  if (!stack) {
    return c.json({ error: "Stack not found" }, 404);
  }

  // Check access
  if (!stack.isPublic && !stack.isStarter && stack.userId !== user?.id) {
    return c.json({ error: "Stack not found" }, 404);
  }

  if (!stack.compiledPrompt) {
    return c.json({ error: "Stack prompt not yet compiled" }, 400);
  }

  // Increment use count
  await db
    .update(stacks)
    .set({ useCount: sql`${stacks.useCount} + 1` })
    .where(eq(stacks.id, stack.id));

  return c.json({
    prompt: stack.compiledPrompt,
    tokenCount: stack.tokenCount,
    compiledAt: stack.compiledAt,
  });
});

// Protected routes - require authentication
stacksRouter.use("/*", requireAuth);

// POST /api/stacks - Create new stack
stacksRouter.post("/", zValidator("json", createStackSchema), async (c) => {
  const db = c.get("db");
  const user = c.get("user")!;
  const data = c.req.valid("json");

  const now = new Date().toISOString();
  const id = generateId();
  const slug = generateSlug(data.name);

  // Check for slug uniqueness
  const [existing] = await db.select().from(stacks).where(eq(stacks.slug, slug)).limit(1);

  const finalSlug = existing ? `${slug}-${id.slice(-6)}` : slug;

  const newStack: NewStack = {
    id,
    userId: user.id,
    name: data.name,
    slug: finalSlug,
    description: data.description || null,
    icon: data.icon || null,
    color: data.color || null,
    category: data.category || "general",
    layer: data.layer || 0,
    tags: data.tags || [],
    instructions: data.instructions || null,
    cliPreferences: (data.cliPreferences as StackPreferences) || {},
    manifestType: data.manifestType || null,
    manifestContent: data.manifestContent || null,
    canvasData: data.canvasData || null,
    tokenBudget: data.tokenBudget || "standard",
    isPublic: data.isPublic || false,
    learningStatus: "pending",
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(stacks).values(newStack);

  return c.json({ stack: newStack }, 201);
});

// PUT /api/stacks/:id - Update stack
stacksRouter.put("/:id", zValidator("json", updateStackSchema), async (c) => {
  const db = c.get("db");
  const user = c.get("user")!;
  const stackId = c.req.param("id");
  const data = c.req.valid("json");

  // Check ownership
  const [stack] = await db
    .select()
    .from(stacks)
    .where(and(eq(stacks.id, stackId), eq(stacks.userId, user.id)))
    .limit(1);

  if (!stack) {
    return c.json({ error: "Stack not found or not owned by you" }, 404);
  }

  const updates: Partial<Stack> = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  // If name changed, update slug
  if (data.name && data.name !== stack.name) {
    const newSlug = generateSlug(data.name);
    const [existing] = await db
      .select()
      .from(stacks)
      .where(and(eq(stacks.slug, newSlug), sql`${stacks.id} != ${stackId}`))
      .limit(1);
    updates.slug = existing ? `${newSlug}-${stack.id.slice(-6)}` : newSlug;
  }

  await db.update(stacks).set(updates).where(eq(stacks.id, stackId));

  const [updated] = await db.select().from(stacks).where(eq(stacks.id, stackId));

  return c.json({ stack: updated });
});

// DELETE /api/stacks/:id - Delete stack
stacksRouter.delete("/:id", async (c) => {
  const db = c.get("db");
  const user = c.get("user")!;
  const stackId = c.req.param("id");

  // Check ownership
  const [stack] = await db
    .select()
    .from(stacks)
    .where(and(eq(stacks.id, stackId), eq(stacks.userId, user.id)))
    .limit(1);

  if (!stack) {
    return c.json({ error: "Stack not found or not owned by you" }, 404);
  }

  // Soft delete
  await db
    .update(stacks)
    .set({ isActive: false, updatedAt: new Date().toISOString() })
    .where(eq(stacks.id, stackId));

  return c.json({ success: true });
});

// POST /api/stacks/:id/fork - Fork a public stack
stacksRouter.post("/:id/fork", async (c) => {
  const db = c.get("db");
  const user = c.get("user")!;
  const stackId = c.req.param("id");

  // Get original stack
  const [original] = await db
    .select()
    .from(stacks)
    .where(
      and(
        eq(stacks.id, stackId),
        eq(stacks.isActive, true),
        or(eq(stacks.isPublic, true), eq(stacks.isStarter, true))
      )
    )
    .limit(1);

  if (!original) {
    return c.json({ error: "Stack not found or not public" }, 404);
  }

  const now = new Date().toISOString();
  const id = generateId();
  const slug = `${original.slug}-fork-${id.slice(-6)}`;

  const forkedStack: NewStack = {
    id,
    userId: user.id,
    name: `${original.name} (Fork)`,
    slug,
    description: original.description,
    icon: original.icon,
    color: original.color,
    category: original.category,
    layer: original.layer,
    tags: original.tags,
    instructions: original.instructions,
    cliPreferences: original.cliPreferences as StackPreferences,
    manifestType: original.manifestType,
    manifestContent: original.manifestContent,
    canvasData: original.canvasData as any,
    tokenBudget: original.tokenBudget,
    forkedFromId: original.id,
    isPublic: false, // Forked stacks start as private
    learningStatus: original.learningStatus,
    compiledPrompt: original.compiledPrompt,
    compiledAt: original.compiledAt,
    tokenCount: original.tokenCount,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(stacks).values(forkedStack);

  // Increment fork count on original
  await db
    .update(stacks)
    .set({ forkCount: sql`${stacks.forkCount} + 1` })
    .where(eq(stacks.id, original.id));

  // Copy repos
  const originalRepos = await db
    .select()
    .from(stackRepos)
    .where(eq(stackRepos.stackId, original.id));

  if (originalRepos.length > 0) {
    await db.insert(stackRepos).values(
      originalRepos.map((repo) => ({
        id: `repo_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`,
        stackId: id,
        githubUrl: repo.githubUrl,
        isPrivate: repo.isPrivate,
        branch: repo.branch,
        paths: repo.paths,
        summary: repo.summary,
        paradigms: repo.paradigms,
        packages: repo.packages,
        status: repo.status,
        createdAt: now,
      }))
    );
  }

  // Copy compositions
  const originalCompositions = await db
    .select()
    .from(stackCompositions)
    .where(eq(stackCompositions.parentStackId, original.id));

  if (originalCompositions.length > 0) {
    await db.insert(stackCompositions).values(
      originalCompositions.map((comp) => ({
        id: `comp_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`,
        parentStackId: id,
        childStackId: comp.childStackId,
        position: comp.position,
        createdAt: now,
      }))
    );
  }

  return c.json({ stack: forkedStack }, 201);
});

// POST /api/stacks/:id/compile - Trigger AI compilation
stacksRouter.post("/:id/compile", async (c) => {
  const db = c.get("db");
  const user = c.get("user")!;
  const stackId = c.req.param("id");

  // Check ownership
  const [stack] = await db
    .select()
    .from(stacks)
    .where(and(eq(stacks.id, stackId), eq(stacks.userId, user.id)))
    .limit(1);

  if (!stack) {
    return c.json({ error: "Stack not found or not owned by you" }, 404);
  }

  // Check if already compiling
  if (stack.learningStatus === "researching" || stack.learningStatus === "compiling") {
    return c.json({
      message: "Compilation already in progress",
      stackId,
      status: stack.learningStatus,
      progress: stack.learningProgress,
    });
  }

  // Import and queue the learning jobs
  const { queueStackLearning } = await import("../lib/stack-learning");
  await queueStackLearning(stackId, user.id, c.env, db);

  return c.json({
    message: "Compilation started",
    stackId,
    status: "researching",
  });
});

// POST /api/stacks/:id/install - Install stack for user
stacksRouter.post("/:id/install", async (c) => {
  const db = c.get("db");
  const user = c.get("user")!;
  const stackId = c.req.param("id");

  // Check stack exists and is accessible
  const [stack] = await db
    .select()
    .from(stacks)
    .where(
      and(
        eq(stacks.id, stackId),
        eq(stacks.isActive, true),
        or(eq(stacks.isPublic, true), eq(stacks.isStarter, true), eq(stacks.userId, user.id))
      )
    )
    .limit(1);

  if (!stack) {
    return c.json({ error: "Stack not found" }, 404);
  }

  // Check if already installed
  const [existing] = await db
    .select()
    .from(userStacks)
    .where(and(eq(userStacks.userId, user.id), eq(userStacks.stackId, stackId)))
    .limit(1);

  if (existing) {
    return c.json({ error: "Stack already installed" }, 400);
  }

  const now = new Date().toISOString();

  await db.insert(userStacks).values({
    id: `us_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`,
    userId: user.id,
    stackId,
    installedAt: now,
  });

  // Increment install count
  await db
    .update(stacks)
    .set({ installCount: sql`${stacks.installCount} + 1` })
    .where(eq(stacks.id, stackId));

  return c.json({ success: true });
});

// DELETE /api/stacks/:id/install - Uninstall stack
stacksRouter.delete("/:id/install", async (c) => {
  const db = c.get("db");
  const user = c.get("user")!;
  const stackId = c.req.param("id");

  await db
    .delete(userStacks)
    .where(and(eq(userStacks.userId, user.id), eq(userStacks.stackId, stackId)));

  return c.json({ success: true });
});

// POST /api/stacks/:id/repos - Add repository
stacksRouter.post("/:id/repos", zValidator("json", addRepoSchema), async (c) => {
  const db = c.get("db");
  const user = c.get("user")!;
  const stackId = c.req.param("id");
  const data = c.req.valid("json");

  // Check ownership
  const [stack] = await db
    .select()
    .from(stacks)
    .where(and(eq(stacks.id, stackId), eq(stacks.userId, user.id)))
    .limit(1);

  if (!stack) {
    return c.json({ error: "Stack not found or not owned by you" }, 404);
  }

  const now = new Date().toISOString();
  const id = `repo_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;

  const newRepo: NewStackRepo = {
    id,
    stackId,
    githubUrl: data.githubUrl,
    isPrivate: data.isPrivate || false,
    branch: data.branch || "main",
    paths: data.paths || null,
    status: "pending",
    createdAt: now,
  };

  await db.insert(stackRepos).values(newRepo);

  // Update stack learning status
  await db
    .update(stacks)
    .set({
      learningStatus: "pending",
      updatedAt: now,
    })
    .where(eq(stacks.id, stackId));

  return c.json({ repo: newRepo }, 201);
});

// DELETE /api/stacks/:id/repos/:repoId - Remove repository
stacksRouter.delete("/:id/repos/:repoId", async (c) => {
  const db = c.get("db");
  const user = c.get("user")!;
  const stackId = c.req.param("id");
  const repoId = c.req.param("repoId");

  // Check ownership
  const [stack] = await db
    .select()
    .from(stacks)
    .where(and(eq(stacks.id, stackId), eq(stacks.userId, user.id)))
    .limit(1);

  if (!stack) {
    return c.json({ error: "Stack not found or not owned by you" }, 404);
  }

  await db
    .delete(stackRepos)
    .where(and(eq(stackRepos.id, repoId), eq(stackRepos.stackId, stackId)));

  return c.json({ success: true });
});

// POST /api/stacks/:id/compose - Add child stack
stacksRouter.post("/:id/compose", zValidator("json", composeStackSchema), async (c) => {
  const db = c.get("db");
  const user = c.get("user")!;
  const stackId = c.req.param("id");
  const data = c.req.valid("json");

  // Check ownership of parent stack
  const [parentStack] = await db
    .select()
    .from(stacks)
    .where(and(eq(stacks.id, stackId), eq(stacks.userId, user.id)))
    .limit(1);

  if (!parentStack) {
    return c.json({ error: "Stack not found or not owned by you" }, 404);
  }

  // Check child stack exists and is accessible
  const [childStack] = await db
    .select()
    .from(stacks)
    .where(
      and(
        eq(stacks.id, data.childStackId),
        eq(stacks.isActive, true),
        or(eq(stacks.isPublic, true), eq(stacks.isStarter, true), eq(stacks.userId, user.id))
      )
    )
    .limit(1);

  if (!childStack) {
    return c.json({ error: "Child stack not found" }, 404);
  }

  // Prevent circular composition
  if (data.childStackId === stackId) {
    return c.json({ error: "Cannot compose a stack with itself" }, 400);
  }

  // Check if already composed
  const [existing] = await db
    .select()
    .from(stackCompositions)
    .where(
      and(
        eq(stackCompositions.parentStackId, stackId),
        eq(stackCompositions.childStackId, data.childStackId)
      )
    )
    .limit(1);

  if (existing) {
    return c.json({ error: "Stack already composed" }, 400);
  }

  const now = new Date().toISOString();

  // Get max position
  const [maxPos] = await db
    .select({ maxPosition: sql<number>`max(${stackCompositions.position})` })
    .from(stackCompositions)
    .where(eq(stackCompositions.parentStackId, stackId));

  const position = data.position ?? (maxPos?.maxPosition || 0) + 1;

  const newComposition: NewStackComposition = {
    id: `comp_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`,
    parentStackId: stackId,
    childStackId: data.childStackId,
    position,
    createdAt: now,
  };

  await db.insert(stackCompositions).values(newComposition);

  return c.json(
    {
      composition: {
        id: newComposition.id,
        position: newComposition.position,
        childStack: {
          id: childStack.id,
          name: childStack.name,
          slug: childStack.slug,
          category: childStack.category,
          layer: childStack.layer,
        },
      },
    },
    201
  );
});

// DELETE /api/stacks/:id/compose/:childStackId - Remove composition
stacksRouter.delete("/:id/compose/:childStackId", async (c) => {
  const db = c.get("db");
  const user = c.get("user")!;
  const stackId = c.req.param("id");
  const childStackId = c.req.param("childStackId");

  // Check ownership
  const [stack] = await db
    .select()
    .from(stacks)
    .where(and(eq(stacks.id, stackId), eq(stacks.userId, user.id)))
    .limit(1);

  if (!stack) {
    return c.json({ error: "Stack not found or not owned by you" }, 404);
  }

  await db
    .delete(stackCompositions)
    .where(
      and(
        eq(stackCompositions.parentStackId, stackId),
        eq(stackCompositions.childStackId, childStackId)
      )
    );

  return c.json({ success: true });
});

// GET /api/stacks/user/installed - Get user's installed stacks
stacksRouter.get("/user/installed", async (c) => {
  const db = c.get("db");
  const user = c.get("user")!;

  const installed = await db
    .select({
      installId: userStacks.id,
      installedAt: userStacks.installedAt,
      lastUsedAt: userStacks.lastUsedAt,
      customInstructions: userStacks.customInstructions,
      stack: {
        id: stacks.id,
        name: stacks.name,
        slug: stacks.slug,
        description: stacks.description,
        icon: stacks.icon,
        color: stacks.color,
        category: stacks.category,
        layer: stacks.layer,
        learningStatus: stacks.learningStatus,
      },
    })
    .from(userStacks)
    .innerJoin(stacks, eq(userStacks.stackId, stacks.id))
    .where(eq(userStacks.userId, user.id))
    .orderBy(desc(userStacks.lastUsedAt));

  return c.json({ installed });
});

export default stacksRouter;
