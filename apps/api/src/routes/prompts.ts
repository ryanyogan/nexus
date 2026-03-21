import { Hono } from "hono";
import { eq, like, and, desc, or, sql, isNull } from "drizzle-orm";
import {
  prompts,
  userPrompts,
  promptSessions,
  type Database,
  type Prompt,
  type PromptPreferences,
  PROMPT_CATEGORIES,
} from "@nexus/db";
import { createAuth } from "@nexus/auth";
import type { AppContext } from "../types";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const promptsRouter = new Hono<AppContext>();

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

// Apply auth middleware to all routes
promptsRouter.use("*", requireAuth);

// ============================================================================
// Helper: Resolve prompt inheritance chain (max 3 levels)
// ============================================================================

interface ResolvedPrompt extends Omit<
  Prompt,
  "skills" | "libraries" | "mcpServers" | "preferences"
> {
  skills: string[];
  libraries: string[];
  mcpServers: string[];
  preferences: PromptPreferences;
  inheritanceChain: string[];
}

async function resolvePromptInheritance(
  db: Database,
  prompt: Prompt,
  depth = 0
): Promise<ResolvedPrompt> {
  const maxDepth = 3;

  // Base case: no parent or max depth reached
  if (!prompt.parentPromptId || depth >= maxDepth) {
    return {
      ...prompt,
      skills: prompt.skills || [],
      libraries: prompt.libraries || [],
      mcpServers: prompt.mcpServers || [],
      preferences: prompt.preferences || {},
      inheritanceChain: [prompt.id],
    };
  }

  // Get parent prompt
  const [parentPrompt] = await db
    .select()
    .from(prompts)
    .where(eq(prompts.id, prompt.parentPromptId))
    .limit(1);

  if (!parentPrompt) {
    return {
      ...prompt,
      skills: prompt.skills || [],
      libraries: prompt.libraries || [],
      mcpServers: prompt.mcpServers || [],
      preferences: prompt.preferences || {},
      inheritanceChain: [prompt.id],
    };
  }

  // Recursively resolve parent
  const resolvedParent = await resolvePromptInheritance(db, parentPrompt, depth + 1);

  // Merge: child extends parent
  const mergedSkills = [...new Set([...resolvedParent.skills, ...(prompt.skills || [])])];
  const mergedLibraries = [...new Set([...resolvedParent.libraries, ...(prompt.libraries || [])])];
  const mergedServers = [...new Set([...resolvedParent.mcpServers, ...(prompt.mcpServers || [])])];
  const mergedPreferences = { ...resolvedParent.preferences, ...prompt.preferences };

  // System prompt: parent first, then child additions
  const mergedSystemPrompt = prompt.systemPrompt.startsWith(resolvedParent.systemPrompt)
    ? prompt.systemPrompt
    : `${resolvedParent.systemPrompt}\n\n---\n\n${prompt.systemPrompt}`;

  return {
    ...prompt,
    systemPrompt: mergedSystemPrompt,
    skills: mergedSkills,
    libraries: mergedLibraries,
    mcpServers: mergedServers,
    preferences: mergedPreferences,
    inheritanceChain: [...resolvedParent.inheritanceChain, prompt.id],
  };
}

// ============================================================================
// Helper: Generate PROMPT.md content
// ============================================================================

function generatePromptMarkdown(prompt: ResolvedPrompt, customPrompt?: string): string {
  const lines: string[] = [];

  lines.push(`# Prompt: ${prompt.name}`);
  lines.push("");
  if (prompt.description) {
    lines.push(`> ${prompt.description}`);
    lines.push("");
  }

  lines.push("## System Prompt");
  lines.push("");
  lines.push(prompt.systemPrompt);
  lines.push("");

  if (customPrompt) {
    lines.push("## Custom Instructions");
    lines.push("");
    lines.push(customPrompt);
    lines.push("");
  }

  if (prompt.skills.length > 0) {
    lines.push("## Skills");
    lines.push("");
    prompt.skills.forEach((skill) => lines.push(`- ${skill}`));
    lines.push("");
  }

  if (prompt.libraries.length > 0) {
    lines.push("## Libraries");
    lines.push("");
    prompt.libraries.forEach((lib) => lines.push(`- ${lib}`));
    lines.push("");
  }

  if (prompt.mcpServers.length > 0) {
    lines.push("## MCP Servers");
    lines.push("");
    prompt.mcpServers.forEach((server) => lines.push(`- ${server}`));
    lines.push("");
  }

  if (Object.keys(prompt.preferences).length > 0) {
    lines.push("## Preferences");
    lines.push("");
    Object.entries(prompt.preferences).forEach(([key, value]) => {
      lines.push(`- ${key}: ${JSON.stringify(value)}`);
    });
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push("**To use this prompt, add to your CLAUDE.md or project instructions:**");
  lines.push("");
  lines.push("```");
  lines.push("Read PROMPT.md first and follow its instructions for this project.");
  lines.push("```");

  return lines.join("\n");
}

// ============================================================================
// GET /api/prompts - List prompts (user's + starter packs)
// ============================================================================

promptsRouter.get("/", async (c) => {
  const db = c.get("db");
  const user = c.get("user");
  const url = new URL(c.req.url);

  // Query params
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const search = url.searchParams.get("search");
  const category = url.searchParams.get("category");
  const starterOnly = url.searchParams.get("starter") === "true";
  const myPrompts = url.searchParams.get("my") === "true";

  // Build conditions
  const conditions = [eq(prompts.isActive, true)];

  if (search) {
    const searchTerm = `%${search.toLowerCase()}%`;
    conditions.push(
      or(
        like(sql`lower(${prompts.name})`, searchTerm),
        like(sql`lower(${prompts.slug})`, searchTerm),
        like(sql`lower(${prompts.description})`, searchTerm)
      )!
    );
  }

  if (category) {
    conditions.push(eq(prompts.category, category as (typeof PROMPT_CATEGORIES)[number]));
  }

  if (starterOnly) {
    conditions.push(eq(prompts.isStarterPack, true));
  }

  if (myPrompts && user) {
    conditions.push(eq(prompts.userId, user.id));
  } else if (!myPrompts) {
    // Show starter packs + user's own prompts
    if (user) {
      conditions.push(or(eq(prompts.isStarterPack, true), eq(prompts.userId, user.id))!);
    } else {
      conditions.push(eq(prompts.isStarterPack, true));
    }
  }

  // Get prompts
  const promptsList = await db
    .select({
      id: prompts.id,
      userId: prompts.userId,
      name: prompts.name,
      slug: prompts.slug,
      description: prompts.description,
      systemPrompt: prompts.systemPrompt,
      parentPromptId: prompts.parentPromptId,
      skills: prompts.skills,
      libraries: prompts.libraries,
      mcpServers: prompts.mcpServers,
      preferences: prompts.preferences,
      category: prompts.category,
      tags: prompts.tags,
      isPublic: prompts.isPublic,
      isStarterPack: prompts.isStarterPack,
      isFeatured: prompts.isFeatured,
      installCount: prompts.installCount,
      usageCount: prompts.usageCount,
      createdAt: prompts.createdAt,
      updatedAt: prompts.updatedAt,
    })
    .from(prompts)
    .where(and(...conditions))
    .orderBy(desc(prompts.isStarterPack), desc(prompts.isFeatured), desc(prompts.installCount))
    .limit(limit)
    .offset(offset);

  // Get user's installed prompts if authenticated
  let installedPromptIds: string[] = [];
  let activePromptIds: string[] = [];

  if (user) {
    const userPromptsList = await db
      .select({
        promptId: userPrompts.promptId,
        isActive: userPrompts.isActive,
      })
      .from(userPrompts)
      .where(eq(userPrompts.userId, user.id));

    installedPromptIds = userPromptsList.map((up) => up.promptId);
    activePromptIds = userPromptsList.filter((up) => up.isActive).map((up) => up.promptId);
  }

  // Annotate prompts with installed/active status
  const annotatedPrompts = promptsList.map((prompt) => ({
    ...prompt,
    isInstalled: installedPromptIds.includes(prompt.id),
    isActive: activePromptIds.includes(prompt.id),
    isOwned: prompt.userId === user?.id,
  }));

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(prompts)
    .where(and(...conditions));

  return c.json({
    prompts: annotatedPrompts,
    total: countResult[0]?.count || 0,
    limit,
    offset,
  });
});

// ============================================================================
// GET /api/prompts/categories - List categories
// ============================================================================

promptsRouter.get("/categories", async (c) => {
  return c.json({
    categories: PROMPT_CATEGORIES.map((cat) => ({
      id: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
    })),
  });
});

// ============================================================================
// GET /api/prompts/active - Get user's active prompts
// ============================================================================

promptsRouter.get("/active", async (c) => {
  const db = c.get("db");
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Authentication required" }, 401);
  }

  const activePromptsList = await db
    .select({
      userPrompt: userPrompts,
      prompt: prompts,
    })
    .from(userPrompts)
    .innerJoin(prompts, eq(userPrompts.promptId, prompts.id))
    .where(and(eq(userPrompts.userId, user.id), eq(userPrompts.isActive, true)))
    .orderBy(userPrompts.displayOrder);

  // Resolve each prompt's inheritance
  const resolvedPrompts = await Promise.all(
    activePromptsList.map(async ({ userPrompt, prompt }) => {
      const resolved = await resolvePromptInheritance(db, prompt);
      return {
        ...resolved,
        userPromptId: userPrompt.id,
        customPromptText: userPrompt.customPromptText,
        customPreferences: userPrompt.customPreferences,
        displayOrder: userPrompt.displayOrder,
        lastUsedAt: userPrompt.lastUsedAt,
      };
    })
  );

  return c.json({ prompts: resolvedPrompts });
});

// ============================================================================
// GET /api/prompts/:id - Get prompt details (resolved if inherited)
// ============================================================================

promptsRouter.get("/:id", async (c) => {
  const db = c.get("db");
  const user = c.get("user");
  const promptId = c.req.param("id");

  const [prompt] = await db.select().from(prompts).where(eq(prompts.id, promptId)).limit(1);

  if (!prompt) {
    return c.json({ error: "Prompt not found" }, 404);
  }

  // Check access: must be starter pack, public, or owned by user
  if (!prompt.isStarterPack && !prompt.isPublic && prompt.userId !== user?.id) {
    return c.json({ error: "Access denied" }, 403);
  }

  // Resolve inheritance
  const resolved = await resolvePromptInheritance(db, prompt);

  // Check if user has installed/activated this prompt
  let userPromptData = null;
  if (user) {
    const [up] = await db
      .select()
      .from(userPrompts)
      .where(and(eq(userPrompts.userId, user.id), eq(userPrompts.promptId, promptId)))
      .limit(1);
    userPromptData = up;
  }

  return c.json({
    prompt: {
      ...resolved,
      isInstalled: !!userPromptData,
      isActive: userPromptData?.isActive || false,
      isOwned: prompt.userId === user?.id,
      customPromptText: userPromptData?.customPromptText,
      customPreferences: userPromptData?.customPreferences,
    },
  });
});

// ============================================================================
// GET /api/prompts/:id/download - Get PROMPT.md content
// ============================================================================

promptsRouter.get("/:id/download", async (c) => {
  const db = c.get("db");
  const user = c.get("user");
  const promptId = c.req.param("id");

  const [prompt] = await db.select().from(prompts).where(eq(prompts.id, promptId)).limit(1);

  if (!prompt) {
    return c.json({ error: "Prompt not found" }, 404);
  }

  // Check access
  if (!prompt.isStarterPack && !prompt.isPublic && prompt.userId !== user?.id) {
    return c.json({ error: "Access denied" }, 403);
  }

  // Resolve inheritance
  const resolved = await resolvePromptInheritance(db, prompt);

  // Get user's custom prompt text if installed
  let customPromptText: string | undefined;
  if (user) {
    const [uf] = await db
      .select()
      .from(userPrompts)
      .where(and(eq(userPrompts.userId, user.id), eq(userPrompts.promptId, promptId)))
      .limit(1);
    customPromptText = uf?.customPromptText || undefined;
  }

  const markdown = generatePromptMarkdown(resolved, customPromptText);

  return c.json({
    filename: `PROMPT.md`,
    content: markdown,
  });
});

// ============================================================================
// POST /api/prompts - Create a new prompt
// ============================================================================

const createPromptSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  systemPrompt: z.string().min(10),
  parentPromptId: z.string().optional(),
  skills: z.array(z.string()).default([]),
  libraries: z.array(z.string()).default([]),
  mcpServers: z.array(z.string()).default([]),
  preferences: z
    .object({
      verbosity: z.enum(["concise", "balanced", "detailed"]).optional(),
      codeStyle: z.enum(["minimal", "documented", "verbose"]).optional(),
      responseFormat: z.enum(["full", "compact", "code-only", "summary"]).optional(),
      useEmojis: z.boolean().optional(),
      preferredLanguage: z.string().optional(),
      customRules: z.array(z.string()).optional(),
    })
    .optional(),
  category: z.enum(PROMPT_CATEGORIES).default("general"),
  tags: z.array(z.string()).default([]),
});

promptsRouter.post("/", zValidator("json", createPromptSchema), async (c) => {
  const db = c.get("db");
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Authentication required" }, 401);
  }

  const data = c.req.valid("json");
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const slug =
    data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    id.slice(0, 8);

  // Validate parent prompt exists and check inheritance depth
  if (data.parentPromptId) {
    const [parentPrompt] = await db
      .select()
      .from(prompts)
      .where(eq(prompts.id, data.parentPromptId))
      .limit(1);

    if (!parentPrompt) {
      return c.json({ error: "Parent prompt not found" }, 400);
    }

    // Check inheritance depth (max 3 levels)
    let depth = 1;
    let currentParentId = parentPrompt.parentPromptId;
    while (currentParentId && depth < 3) {
      const [grandparent] = await db
        .select()
        .from(prompts)
        .where(eq(prompts.id, currentParentId))
        .limit(1);
      if (grandparent?.parentPromptId) {
        depth++;
        currentParentId = grandparent.parentPromptId;
      } else {
        break;
      }
    }
    if (depth >= 3) {
      return c.json({ error: "Maximum inheritance depth (3 levels) exceeded" }, 400);
    }
  }

  await db.insert(prompts).values({
    id,
    userId: user.id,
    name: data.name,
    slug,
    description: data.description,
    systemPrompt: data.systemPrompt,
    parentPromptId: data.parentPromptId,
    skills: data.skills,
    libraries: data.libraries,
    mcpServers: data.mcpServers,
    preferences: data.preferences || {},
    category: data.category,
    tags: data.tags,
    isPublic: false,
    isStarterPack: false,
    isFeatured: false,
    isActive: true,
    installCount: 0,
    usageCount: 0,
    createdAt: now,
    updatedAt: now,
  });

  // Auto-install the flow for the creator
  await db.insert(userPrompts).values({
    id: crypto.randomUUID(),
    userId: user.id,
    promptId: id,
    isActive: false,
    displayOrder: 0,
    installedAt: now,
  });

  return c.json(
    {
      success: true,
      promptId: id,
      slug,
    },
    201
  );
});

// ============================================================================
// PUT /api/prompts/:id - Update a prompt
// ============================================================================

const updatePromptSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  systemPrompt: z.string().min(10).optional(),
  parentPromptId: z.string().nullable().optional(),
  skills: z.array(z.string()).optional(),
  libraries: z.array(z.string()).optional(),
  mcpServers: z.array(z.string()).optional(),
  preferences: z
    .object({
      verbosity: z.enum(["concise", "balanced", "detailed"]).optional(),
      codeStyle: z.enum(["minimal", "documented", "verbose"]).optional(),
      responseFormat: z.enum(["full", "compact", "code-only", "summary"]).optional(),
      useEmojis: z.boolean().optional(),
      preferredLanguage: z.string().optional(),
      customRules: z.array(z.string()).optional(),
    })
    .optional(),
  category: z.enum(PROMPT_CATEGORIES).optional(),
  tags: z.array(z.string()).optional(),
});

promptsRouter.put("/:id", zValidator("json", updatePromptSchema), async (c) => {
  const db = c.get("db");
  const user = c.get("user");
  const promptId = c.req.param("id");

  if (!user) {
    return c.json({ error: "Authentication required" }, 401);
  }

  const [prompt] = await db.select().from(prompts).where(eq(prompts.id, promptId)).limit(1);

  if (!prompt) {
    return c.json({ error: "Prompt not found" }, 404);
  }

  // Only owner can update
  if (prompt.userId !== user.id) {
    return c.json({ error: "Access denied" }, 403);
  }

  const data = c.req.valid("json");
  const now = new Date().toISOString();

  await db
    .update(prompts)
    .set({
      ...data,
      updatedAt: now,
    })
    .where(eq(prompts.id, promptId));

  return c.json({ success: true });
});

// ============================================================================
// DELETE /api/prompts/:id - Delete a prompt
// ============================================================================

promptsRouter.delete("/:id", async (c) => {
  const db = c.get("db");
  const user = c.get("user");
  const promptId = c.req.param("id");

  if (!user) {
    return c.json({ error: "Authentication required" }, 401);
  }

  const [prompt] = await db.select().from(prompts).where(eq(prompts.id, promptId)).limit(1);

  if (!prompt) {
    return c.json({ error: "Prompt not found" }, 404);
  }

  // Only owner can delete (and not starter packs)
  if (prompt.userId !== user.id || prompt.isStarterPack) {
    return c.json({ error: "Access denied" }, 403);
  }

  await db.delete(prompts).where(eq(prompts.id, promptId));

  return c.json({ success: true });
});

// ============================================================================
// POST /api/prompts/:id/install - Install a prompt
// ============================================================================

promptsRouter.post("/:id/install", async (c) => {
  const db = c.get("db");
  const user = c.get("user");
  const promptId = c.req.param("id");

  if (!user) {
    return c.json({ error: "Authentication required" }, 401);
  }

  const [prompt] = await db.select().from(prompts).where(eq(prompts.id, promptId)).limit(1);

  if (!prompt) {
    return c.json({ error: "Prompt not found" }, 404);
  }

  // Check access
  if (!prompt.isStarterPack && !prompt.isPublic && prompt.userId !== user.id) {
    return c.json({ error: "Access denied" }, 403);
  }

  // Check if already installed
  const [existing] = await db
    .select()
    .from(userPrompts)
    .where(and(eq(userPrompts.userId, user.id), eq(userPrompts.promptId, promptId)))
    .limit(1);

  if (existing) {
    return c.json({ error: "Prompt already installed" }, 400);
  }

  const now = new Date().toISOString();

  await db.insert(userPrompts).values({
    id: crypto.randomUUID(),
    userId: user.id,
    promptId: promptId,
    isActive: false,
    displayOrder: 0,
    installedAt: now,
  });

  // Increment install count
  await db
    .update(prompts)
    .set({ installCount: sql`${prompts.installCount} + 1` })
    .where(eq(prompts.id, promptId));

  return c.json({ success: true });
});

// ============================================================================
// DELETE /api/prompts/:id/install - Uninstall a prompt
// ============================================================================

promptsRouter.delete("/:id/install", async (c) => {
  const db = c.get("db");
  const user = c.get("user");
  const promptId = c.req.param("id");

  if (!user) {
    return c.json({ error: "Authentication required" }, 401);
  }

  // Can't uninstall your own prompts
  const [prompt] = await db.select().from(prompts).where(eq(prompts.id, promptId)).limit(1);

  if (prompt?.userId === user.id) {
    return c.json({ error: "Cannot uninstall your own prompt" }, 400);
  }

  await db
    .delete(userPrompts)
    .where(and(eq(userPrompts.userId, user.id), eq(userPrompts.promptId, promptId)));

  return c.json({ success: true });
});

// ============================================================================
// POST /api/prompts/:id/activate - Activate a prompt
// ============================================================================

const activatePromptSchema = z.object({
  project: z.string().optional(),
});

promptsRouter.post(
  "/:id/activate",
  zValidator("json", activatePromptSchema.optional()),
  async (c) => {
    const db = c.get("db");
    const user = c.get("user");
    const promptId = c.req.param("id");

    if (!user) {
      return c.json({ error: "Authentication required" }, 401);
    }

    // Get the user prompt
    const [userPrompt] = await db
      .select()
      .from(userPrompts)
      .where(and(eq(userPrompts.userId, user.id), eq(userPrompts.promptId, promptId)))
      .limit(1);

    if (!userPrompt) {
      return c.json({ error: "Prompt not installed. Install it first." }, 400);
    }

    const now = new Date().toISOString();
    const body = c.req.valid("json");

    // Get current max display order
    const [maxOrder] = await db
      .select({ max: sql<number>`max(${userPrompts.displayOrder})` })
      .from(userPrompts)
      .where(and(eq(userPrompts.userId, user.id), eq(userPrompts.isActive, true)));

    const newOrder = (maxOrder?.max || 0) + 1;

    // Activate the prompt
    await db
      .update(userPrompts)
      .set({
        isActive: true,
        displayOrder: newOrder,
        lastUsedAt: now,
      })
      .where(eq(userPrompts.id, userPrompt.id));

    // Create a prompt session
    const sessionId = crypto.randomUUID();
    await db.insert(promptSessions).values({
      id: sessionId,
      userId: user.id,
      promptId: promptId,
      project: body?.project,
      startedAt: now,
    });

    // Increment usage count
    await db
      .update(prompts)
      .set({ usageCount: sql`${prompts.usageCount} + 1` })
      .where(eq(prompts.id, promptId));

    // Get the resolved prompt to return
    const [prompt] = await db.select().from(prompts).where(eq(prompts.id, promptId)).limit(1);

    const resolved = await resolvePromptInheritance(db, prompt!);

    return c.json({
      success: true,
      sessionId,
      prompt: resolved,
    });
  }
);

// ============================================================================
// POST /api/prompts/:id/deactivate - Deactivate a specific prompt
// ============================================================================

promptsRouter.post("/:id/deactivate", async (c) => {
  const db = c.get("db");
  const user = c.get("user");
  const promptId = c.req.param("id");

  if (!user) {
    return c.json({ error: "Authentication required" }, 401);
  }

  const now = new Date().toISOString();

  // Deactivate the prompt
  await db
    .update(userPrompts)
    .set({ isActive: false })
    .where(and(eq(userPrompts.userId, user.id), eq(userPrompts.promptId, promptId)));

  // End any active sessions
  await db
    .update(promptSessions)
    .set({ endedAt: now })
    .where(
      and(
        eq(promptSessions.userId, user.id),
        eq(promptSessions.promptId, promptId),
        isNull(promptSessions.endedAt)
      )
    );

  return c.json({ success: true });
});

// ============================================================================
// POST /api/prompts/deactivate-all - Deactivate all prompts
// ============================================================================

promptsRouter.post("/deactivate-all", async (c) => {
  const db = c.get("db");
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Authentication required" }, 401);
  }

  const now = new Date().toISOString();

  // Deactivate all prompts
  await db.update(userPrompts).set({ isActive: false }).where(eq(userPrompts.userId, user.id));

  // End all active sessions
  await db
    .update(promptSessions)
    .set({ endedAt: now })
    .where(and(eq(promptSessions.userId, user.id), isNull(promptSessions.endedAt)));

  return c.json({ success: true });
});

// ============================================================================
// PUT /api/prompts/reorder - Reorder active prompts
// ============================================================================

const reorderSchema = z.object({
  promptIds: z.array(z.string()),
});

promptsRouter.put("/reorder", zValidator("json", reorderSchema), async (c) => {
  const db = c.get("db");
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Authentication required" }, 401);
  }

  const { promptIds } = c.req.valid("json");

  // Update display order for each prompt
  await Promise.all(
    promptIds.map((promptId, index) =>
      db
        .update(userPrompts)
        .set({ displayOrder: index })
        .where(and(eq(userPrompts.userId, user.id), eq(userPrompts.promptId, promptId)))
    )
  );

  return c.json({ success: true });
});

// ============================================================================
// PUT /api/prompts/:id/customize - Update custom prompt/preferences
// ============================================================================

const customizeSchema = z.object({
  customPrompt: z.string().nullable().optional(),
  customPreferences: z
    .object({
      verbosity: z.enum(["concise", "balanced", "detailed"]).optional(),
      codeStyle: z.enum(["minimal", "documented", "verbose"]).optional(),
      responseFormat: z.enum(["full", "compact", "code-only", "summary"]).optional(),
      useEmojis: z.boolean().optional(),
      preferredLanguage: z.string().optional(),
      customRules: z.array(z.string()).optional(),
    })
    .nullable()
    .optional(),
});

promptsRouter.put("/:id/customize", zValidator("json", customizeSchema), async (c) => {
  const db = c.get("db");
  const user = c.get("user");
  const promptId = c.req.param("id");

  if (!user) {
    return c.json({ error: "Authentication required" }, 401);
  }

  const [userPromptData] = await db
    .select()
    .from(userPrompts)
    .where(and(eq(userPrompts.userId, user.id), eq(userPrompts.promptId, promptId)))
    .limit(1);

  if (!userPromptData) {
    return c.json({ error: "Prompt not installed" }, 400);
  }

  const data = c.req.valid("json");

  await db
    .update(userPrompts)
    .set({
      customPromptText: data.customPrompt,
      customPreferences: data.customPreferences,
    })
    .where(eq(userPrompts.id, userPromptData.id));

  return c.json({ success: true });
});

export default promptsRouter;
