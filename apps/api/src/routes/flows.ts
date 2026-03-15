import { Hono } from "hono";
import { eq, like, and, desc, or, sql, isNull } from "drizzle-orm";
import { 
  flows, 
  userFlows, 
  flowSessions,
  type Database,
  type Flow,
  type FlowPreferences,
  FLOW_CATEGORIES,
} from "@nexus/db";
import { createAuth } from "@nexus/auth";
import type { AppContext } from "../types";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const flowsRouter = new Hono<AppContext>();

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
flowsRouter.use("*", requireAuth);

// ============================================================================
// Helper: Resolve flow inheritance chain (max 3 levels)
// ============================================================================

interface ResolvedFlow extends Omit<Flow, 'skills' | 'libraries' | 'mcpServers' | 'preferences'> {
  skills: string[];
  libraries: string[];
  mcpServers: string[];
  preferences: FlowPreferences;
  inheritanceChain: string[];
}

async function resolveFlowInheritance(
  db: Database,
  flow: Flow,
  depth = 0
): Promise<ResolvedFlow> {
  const maxDepth = 3;
  
  // Base case: no parent or max depth reached
  if (!flow.parentFlowId || depth >= maxDepth) {
    return {
      ...flow,
      skills: flow.skills || [],
      libraries: flow.libraries || [],
      mcpServers: flow.mcpServers || [],
      preferences: flow.preferences || {},
      inheritanceChain: [flow.id],
    };
  }

  // Get parent flow
  const [parentFlow] = await db
    .select()
    .from(flows)
    .where(eq(flows.id, flow.parentFlowId))
    .limit(1);

  if (!parentFlow) {
    return {
      ...flow,
      skills: flow.skills || [],
      libraries: flow.libraries || [],
      mcpServers: flow.mcpServers || [],
      preferences: flow.preferences || {},
      inheritanceChain: [flow.id],
    };
  }

  // Recursively resolve parent
  const resolvedParent = await resolveFlowInheritance(db, parentFlow, depth + 1);

  // Merge: child extends parent
  const mergedSkills = [...new Set([...resolvedParent.skills, ...(flow.skills || [])])];
  const mergedLibraries = [...new Set([...resolvedParent.libraries, ...(flow.libraries || [])])];
  const mergedServers = [...new Set([...resolvedParent.mcpServers, ...(flow.mcpServers || [])])];
  const mergedPreferences = { ...resolvedParent.preferences, ...(flow.preferences || {}) };
  
  // System prompt: parent first, then child additions
  const mergedSystemPrompt = flow.systemPrompt.startsWith(resolvedParent.systemPrompt)
    ? flow.systemPrompt
    : `${resolvedParent.systemPrompt}\n\n---\n\n${flow.systemPrompt}`;

  return {
    ...flow,
    systemPrompt: mergedSystemPrompt,
    skills: mergedSkills,
    libraries: mergedLibraries,
    mcpServers: mergedServers,
    preferences: mergedPreferences,
    inheritanceChain: [...resolvedParent.inheritanceChain, flow.id],
  };
}

// ============================================================================
// Helper: Generate FLOW.md content
// ============================================================================

function generateFlowMarkdown(flow: ResolvedFlow, customPrompt?: string): string {
  const lines: string[] = [];
  
  lines.push(`# Flow: ${flow.name}`);
  lines.push('');
  if (flow.description) {
    lines.push(`> ${flow.description}`);
    lines.push('');
  }
  
  lines.push('## System Prompt');
  lines.push('');
  lines.push(flow.systemPrompt);
  lines.push('');
  
  if (customPrompt) {
    lines.push('## Custom Instructions');
    lines.push('');
    lines.push(customPrompt);
    lines.push('');
  }
  
  if (flow.skills.length > 0) {
    lines.push('## Skills');
    lines.push('');
    flow.skills.forEach(skill => lines.push(`- ${skill}`));
    lines.push('');
  }
  
  if (flow.libraries.length > 0) {
    lines.push('## Libraries');
    lines.push('');
    flow.libraries.forEach(lib => lines.push(`- ${lib}`));
    lines.push('');
  }
  
  if (flow.mcpServers.length > 0) {
    lines.push('## MCP Servers');
    lines.push('');
    flow.mcpServers.forEach(server => lines.push(`- ${server}`));
    lines.push('');
  }
  
  if (Object.keys(flow.preferences).length > 0) {
    lines.push('## Preferences');
    lines.push('');
    Object.entries(flow.preferences).forEach(([key, value]) => {
      lines.push(`- ${key}: ${JSON.stringify(value)}`);
    });
    lines.push('');
  }
  
  lines.push('---');
  lines.push('');
  lines.push('**To use this flow, add to your CLAUDE.md or project instructions:**');
  lines.push('');
  lines.push('```');
  lines.push('Read FLOW.md first and follow its instructions for this project.');
  lines.push('```');
  
  return lines.join('\n');
}

// ============================================================================
// GET /api/flows - List flows (user's + starter packs)
// ============================================================================

flowsRouter.get("/", async (c) => {
  const db = c.get("db");
  const user = c.get("user");
  const url = new URL(c.req.url);

  // Query params
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const search = url.searchParams.get("search");
  const category = url.searchParams.get("category");
  const starterOnly = url.searchParams.get("starter") === "true";
  const myFlows = url.searchParams.get("my") === "true";

  // Build conditions
  const conditions = [eq(flows.isActive, true)];

  if (search) {
    const searchTerm = `%${search.toLowerCase()}%`;
    conditions.push(
      or(
        like(sql`lower(${flows.name})`, searchTerm),
        like(sql`lower(${flows.slug})`, searchTerm),
        like(sql`lower(${flows.description})`, searchTerm)
      )!
    );
  }

  if (category) {
    conditions.push(eq(flows.category, category as typeof FLOW_CATEGORIES[number]));
  }

  if (starterOnly) {
    conditions.push(eq(flows.isStarterPack, true));
  }

  if (myFlows && user) {
    conditions.push(eq(flows.userId, user.id));
  } else if (!myFlows) {
    // Show starter packs + user's own flows
    if (user) {
      conditions.push(
        or(
          eq(flows.isStarterPack, true),
          eq(flows.userId, user.id)
        )!
      );
    } else {
      conditions.push(eq(flows.isStarterPack, true));
    }
  }

  // Get flows
  const flowsList = await db
    .select({
      id: flows.id,
      userId: flows.userId,
      name: flows.name,
      slug: flows.slug,
      description: flows.description,
      systemPrompt: flows.systemPrompt,
      parentFlowId: flows.parentFlowId,
      skills: flows.skills,
      libraries: flows.libraries,
      mcpServers: flows.mcpServers,
      preferences: flows.preferences,
      category: flows.category,
      tags: flows.tags,
      isPublic: flows.isPublic,
      isStarterPack: flows.isStarterPack,
      isFeatured: flows.isFeatured,
      installCount: flows.installCount,
      usageCount: flows.usageCount,
      createdAt: flows.createdAt,
      updatedAt: flows.updatedAt,
    })
    .from(flows)
    .where(and(...conditions))
    .orderBy(desc(flows.isStarterPack), desc(flows.isFeatured), desc(flows.installCount))
    .limit(limit)
    .offset(offset);

  // Get user's installed flows if authenticated
  let installedFlowIds: string[] = [];
  let activeFlowIds: string[] = [];
  
  if (user) {
    const userFlowsList = await db
      .select({
        flowId: userFlows.flowId,
        isActive: userFlows.isActive,
      })
      .from(userFlows)
      .where(eq(userFlows.userId, user.id));
    
    installedFlowIds = userFlowsList.map(uf => uf.flowId);
    activeFlowIds = userFlowsList.filter(uf => uf.isActive).map(uf => uf.flowId);
  }

  // Annotate flows with installed/active status
  const annotatedFlows = flowsList.map(flow => ({
    ...flow,
    isInstalled: installedFlowIds.includes(flow.id),
    isActive: activeFlowIds.includes(flow.id),
    isOwned: flow.userId === user?.id,
  }));

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(flows)
    .where(and(...conditions));

  return c.json({
    flows: annotatedFlows,
    total: countResult[0]?.count || 0,
    limit,
    offset,
  });
});

// ============================================================================
// GET /api/flows/categories - List categories
// ============================================================================

flowsRouter.get("/categories", async (c) => {
  return c.json({
    categories: FLOW_CATEGORIES.map(cat => ({
      id: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
    })),
  });
});

// ============================================================================
// GET /api/flows/active - Get user's active flows
// ============================================================================

flowsRouter.get("/active", async (c) => {
  const db = c.get("db");
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Authentication required" }, 401);
  }

  const activeFlows = await db
    .select({
      userFlow: userFlows,
      flow: flows,
    })
    .from(userFlows)
    .innerJoin(flows, eq(userFlows.flowId, flows.id))
    .where(and(
      eq(userFlows.userId, user.id),
      eq(userFlows.isActive, true)
    ))
    .orderBy(userFlows.displayOrder);

  // Resolve each flow's inheritance
  const resolvedFlows = await Promise.all(
    activeFlows.map(async ({ userFlow, flow }) => {
      const resolved = await resolveFlowInheritance(db, flow);
      return {
        ...resolved,
        userFlowId: userFlow.id,
        customPrompt: userFlow.customPrompt,
        customPreferences: userFlow.customPreferences,
        displayOrder: userFlow.displayOrder,
        lastUsedAt: userFlow.lastUsedAt,
      };
    })
  );

  return c.json({ flows: resolvedFlows });
});

// ============================================================================
// GET /api/flows/:id - Get flow details (resolved if inherited)
// ============================================================================

flowsRouter.get("/:id", async (c) => {
  const db = c.get("db");
  const user = c.get("user");
  const flowId = c.req.param("id");

  const [flow] = await db
    .select()
    .from(flows)
    .where(eq(flows.id, flowId))
    .limit(1);

  if (!flow) {
    return c.json({ error: "Flow not found" }, 404);
  }

  // Check access: must be starter pack, public, or owned by user
  if (!flow.isStarterPack && !flow.isPublic && flow.userId !== user?.id) {
    return c.json({ error: "Access denied" }, 403);
  }

  // Resolve inheritance
  const resolved = await resolveFlowInheritance(db, flow);

  // Check if user has installed/activated this flow
  let userFlowData = null;
  if (user) {
    const [uf] = await db
      .select()
      .from(userFlows)
      .where(and(
        eq(userFlows.userId, user.id),
        eq(userFlows.flowId, flowId)
      ))
      .limit(1);
    userFlowData = uf;
  }

  return c.json({
    flow: {
      ...resolved,
      isInstalled: !!userFlowData,
      isActive: userFlowData?.isActive || false,
      isOwned: flow.userId === user?.id,
      customPrompt: userFlowData?.customPrompt,
      customPreferences: userFlowData?.customPreferences,
    },
  });
});

// ============================================================================
// GET /api/flows/:id/download - Get FLOW.md content
// ============================================================================

flowsRouter.get("/:id/download", async (c) => {
  const db = c.get("db");
  const user = c.get("user");
  const flowId = c.req.param("id");

  const [flow] = await db
    .select()
    .from(flows)
    .where(eq(flows.id, flowId))
    .limit(1);

  if (!flow) {
    return c.json({ error: "Flow not found" }, 404);
  }

  // Check access
  if (!flow.isStarterPack && !flow.isPublic && flow.userId !== user?.id) {
    return c.json({ error: "Access denied" }, 403);
  }

  // Resolve inheritance
  const resolved = await resolveFlowInheritance(db, flow);

  // Get user's custom prompt if installed
  let customPrompt: string | undefined;
  if (user) {
    const [uf] = await db
      .select()
      .from(userFlows)
      .where(and(
        eq(userFlows.userId, user.id),
        eq(userFlows.flowId, flowId)
      ))
      .limit(1);
    customPrompt = uf?.customPrompt || undefined;
  }

  const markdown = generateFlowMarkdown(resolved, customPrompt);

  return c.json({
    filename: `FLOW.md`,
    content: markdown,
  });
});

// ============================================================================
// POST /api/flows - Create a new flow
// ============================================================================

const createFlowSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  systemPrompt: z.string().min(10),
  parentFlowId: z.string().optional(),
  skills: z.array(z.string()).default([]),
  libraries: z.array(z.string()).default([]),
  mcpServers: z.array(z.string()).default([]),
  preferences: z.object({
    verbosity: z.enum(["concise", "balanced", "detailed"]).optional(),
    codeStyle: z.enum(["minimal", "documented", "verbose"]).optional(),
    responseFormat: z.enum(["full", "compact", "code-only", "summary"]).optional(),
    useEmojis: z.boolean().optional(),
    preferredLanguage: z.string().optional(),
    customRules: z.array(z.string()).optional(),
  }).optional(),
  category: z.enum(FLOW_CATEGORIES).default("general"),
  tags: z.array(z.string()).default([]),
});

flowsRouter.post("/", zValidator("json", createFlowSchema), async (c) => {
  const db = c.get("db");
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Authentication required" }, 401);
  }

  const data = c.req.valid("json");
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const slug = data.name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + id.slice(0, 8);

  // Validate parent flow exists and check inheritance depth
  if (data.parentFlowId) {
    const [parentFlow] = await db
      .select()
      .from(flows)
      .where(eq(flows.id, data.parentFlowId))
      .limit(1);

    if (!parentFlow) {
      return c.json({ error: "Parent flow not found" }, 400);
    }

    // Check inheritance depth (max 3 levels)
    let depth = 1;
    let currentParentId = parentFlow.parentFlowId;
    while (currentParentId && depth < 3) {
      const [grandparent] = await db
        .select()
        .from(flows)
        .where(eq(flows.id, currentParentId))
        .limit(1);
      if (grandparent?.parentFlowId) {
        depth++;
        currentParentId = grandparent.parentFlowId;
      } else {
        break;
      }
    }
    if (depth >= 3) {
      return c.json({ error: "Maximum inheritance depth (3 levels) exceeded" }, 400);
    }
  }

  await db.insert(flows).values({
    id,
    userId: user.id,
    name: data.name,
    slug,
    description: data.description,
    systemPrompt: data.systemPrompt,
    parentFlowId: data.parentFlowId,
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
  await db.insert(userFlows).values({
    id: crypto.randomUUID(),
    userId: user.id,
    flowId: id,
    isActive: false,
    displayOrder: 0,
    installedAt: now,
  });

  return c.json({ 
    success: true, 
    flowId: id,
    slug,
  }, 201);
});

// ============================================================================
// PUT /api/flows/:id - Update a flow
// ============================================================================

const updateFlowSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  systemPrompt: z.string().min(10).optional(),
  parentFlowId: z.string().nullable().optional(),
  skills: z.array(z.string()).optional(),
  libraries: z.array(z.string()).optional(),
  mcpServers: z.array(z.string()).optional(),
  preferences: z.object({
    verbosity: z.enum(["concise", "balanced", "detailed"]).optional(),
    codeStyle: z.enum(["minimal", "documented", "verbose"]).optional(),
    responseFormat: z.enum(["full", "compact", "code-only", "summary"]).optional(),
    useEmojis: z.boolean().optional(),
    preferredLanguage: z.string().optional(),
    customRules: z.array(z.string()).optional(),
  }).optional(),
  category: z.enum(FLOW_CATEGORIES).optional(),
  tags: z.array(z.string()).optional(),
});

flowsRouter.put("/:id", zValidator("json", updateFlowSchema), async (c) => {
  const db = c.get("db");
  const user = c.get("user");
  const flowId = c.req.param("id");

  if (!user) {
    return c.json({ error: "Authentication required" }, 401);
  }

  const [flow] = await db
    .select()
    .from(flows)
    .where(eq(flows.id, flowId))
    .limit(1);

  if (!flow) {
    return c.json({ error: "Flow not found" }, 404);
  }

  // Only owner can update
  if (flow.userId !== user.id) {
    return c.json({ error: "Access denied" }, 403);
  }

  const data = c.req.valid("json");
  const now = new Date().toISOString();

  await db
    .update(flows)
    .set({
      ...data,
      updatedAt: now,
    })
    .where(eq(flows.id, flowId));

  return c.json({ success: true });
});

// ============================================================================
// DELETE /api/flows/:id - Delete a flow
// ============================================================================

flowsRouter.delete("/:id", async (c) => {
  const db = c.get("db");
  const user = c.get("user");
  const flowId = c.req.param("id");

  if (!user) {
    return c.json({ error: "Authentication required" }, 401);
  }

  const [flow] = await db
    .select()
    .from(flows)
    .where(eq(flows.id, flowId))
    .limit(1);

  if (!flow) {
    return c.json({ error: "Flow not found" }, 404);
  }

  // Only owner can delete (and not starter packs)
  if (flow.userId !== user.id || flow.isStarterPack) {
    return c.json({ error: "Access denied" }, 403);
  }

  await db.delete(flows).where(eq(flows.id, flowId));

  return c.json({ success: true });
});

// ============================================================================
// POST /api/flows/:id/install - Install a flow
// ============================================================================

flowsRouter.post("/:id/install", async (c) => {
  const db = c.get("db");
  const user = c.get("user");
  const flowId = c.req.param("id");

  if (!user) {
    return c.json({ error: "Authentication required" }, 401);
  }

  const [flow] = await db
    .select()
    .from(flows)
    .where(eq(flows.id, flowId))
    .limit(1);

  if (!flow) {
    return c.json({ error: "Flow not found" }, 404);
  }

  // Check access
  if (!flow.isStarterPack && !flow.isPublic && flow.userId !== user.id) {
    return c.json({ error: "Access denied" }, 403);
  }

  // Check if already installed
  const [existing] = await db
    .select()
    .from(userFlows)
    .where(and(
      eq(userFlows.userId, user.id),
      eq(userFlows.flowId, flowId)
    ))
    .limit(1);

  if (existing) {
    return c.json({ error: "Flow already installed" }, 400);
  }

  const now = new Date().toISOString();

  await db.insert(userFlows).values({
    id: crypto.randomUUID(),
    userId: user.id,
    flowId,
    isActive: false,
    displayOrder: 0,
    installedAt: now,
  });

  // Increment install count
  await db
    .update(flows)
    .set({ installCount: sql`${flows.installCount} + 1` })
    .where(eq(flows.id, flowId));

  return c.json({ success: true });
});

// ============================================================================
// DELETE /api/flows/:id/install - Uninstall a flow
// ============================================================================

flowsRouter.delete("/:id/install", async (c) => {
  const db = c.get("db");
  const user = c.get("user");
  const flowId = c.req.param("id");

  if (!user) {
    return c.json({ error: "Authentication required" }, 401);
  }

  // Can't uninstall your own flows
  const [flow] = await db
    .select()
    .from(flows)
    .where(eq(flows.id, flowId))
    .limit(1);

  if (flow?.userId === user.id) {
    return c.json({ error: "Cannot uninstall your own flow" }, 400);
  }

  await db
    .delete(userFlows)
    .where(and(
      eq(userFlows.userId, user.id),
      eq(userFlows.flowId, flowId)
    ));

  return c.json({ success: true });
});

// ============================================================================
// POST /api/flows/:id/activate - Activate a flow
// ============================================================================

const activateFlowSchema = z.object({
  project: z.string().optional(),
});

flowsRouter.post("/:id/activate", zValidator("json", activateFlowSchema.optional()), async (c) => {
  const db = c.get("db");
  const user = c.get("user");
  const flowId = c.req.param("id");

  if (!user) {
    return c.json({ error: "Authentication required" }, 401);
  }

  // Get the user flow
  const [userFlow] = await db
    .select()
    .from(userFlows)
    .where(and(
      eq(userFlows.userId, user.id),
      eq(userFlows.flowId, flowId)
    ))
    .limit(1);

  if (!userFlow) {
    return c.json({ error: "Flow not installed. Install it first." }, 400);
  }

  const now = new Date().toISOString();
  const body = c.req.valid("json");

  // Get current max display order
  const [maxOrder] = await db
    .select({ max: sql<number>`max(${userFlows.displayOrder})` })
    .from(userFlows)
    .where(and(
      eq(userFlows.userId, user.id),
      eq(userFlows.isActive, true)
    ));

  const newOrder = (maxOrder?.max || 0) + 1;

  // Activate the flow
  await db
    .update(userFlows)
    .set({
      isActive: true,
      displayOrder: newOrder,
      lastUsedAt: now,
    })
    .where(eq(userFlows.id, userFlow.id));

  // Create a flow session
  const sessionId = crypto.randomUUID();
  await db.insert(flowSessions).values({
    id: sessionId,
    userId: user.id,
    flowId,
    project: body?.project,
    startedAt: now,
  });

  // Increment usage count
  await db
    .update(flows)
    .set({ usageCount: sql`${flows.usageCount} + 1` })
    .where(eq(flows.id, flowId));

  // Get the resolved flow to return
  const [flow] = await db
    .select()
    .from(flows)
    .where(eq(flows.id, flowId))
    .limit(1);

  const resolved = await resolveFlowInheritance(db, flow!);

  return c.json({
    success: true,
    sessionId,
    flow: resolved,
  });
});

// ============================================================================
// POST /api/flows/:id/deactivate - Deactivate a specific flow
// ============================================================================

flowsRouter.post("/:id/deactivate", async (c) => {
  const db = c.get("db");
  const user = c.get("user");
  const flowId = c.req.param("id");

  if (!user) {
    return c.json({ error: "Authentication required" }, 401);
  }

  const now = new Date().toISOString();

  // Deactivate the flow
  await db
    .update(userFlows)
    .set({ isActive: false })
    .where(and(
      eq(userFlows.userId, user.id),
      eq(userFlows.flowId, flowId)
    ));

  // End any active sessions
  await db
    .update(flowSessions)
    .set({ endedAt: now })
    .where(and(
      eq(flowSessions.userId, user.id),
      eq(flowSessions.flowId, flowId),
      isNull(flowSessions.endedAt)
    ));

  return c.json({ success: true });
});

// ============================================================================
// POST /api/flows/deactivate-all - Deactivate all flows
// ============================================================================

flowsRouter.post("/deactivate-all", async (c) => {
  const db = c.get("db");
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Authentication required" }, 401);
  }

  const now = new Date().toISOString();

  // Deactivate all flows
  await db
    .update(userFlows)
    .set({ isActive: false })
    .where(eq(userFlows.userId, user.id));

  // End all active sessions
  await db
    .update(flowSessions)
    .set({ endedAt: now })
    .where(and(
      eq(flowSessions.userId, user.id),
      isNull(flowSessions.endedAt)
    ));

  return c.json({ success: true });
});

// ============================================================================
// PUT /api/flows/reorder - Reorder active flows
// ============================================================================

const reorderSchema = z.object({
  flowIds: z.array(z.string()),
});

flowsRouter.put("/reorder", zValidator("json", reorderSchema), async (c) => {
  const db = c.get("db");
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Authentication required" }, 401);
  }

  const { flowIds } = c.req.valid("json");

  // Update display order for each flow
  await Promise.all(
    flowIds.map((flowId, index) =>
      db
        .update(userFlows)
        .set({ displayOrder: index })
        .where(and(
          eq(userFlows.userId, user.id),
          eq(userFlows.flowId, flowId)
        ))
    )
  );

  return c.json({ success: true });
});

// ============================================================================
// PUT /api/flows/:id/customize - Update custom prompt/preferences
// ============================================================================

const customizeSchema = z.object({
  customPrompt: z.string().nullable().optional(),
  customPreferences: z.object({
    verbosity: z.enum(["concise", "balanced", "detailed"]).optional(),
    codeStyle: z.enum(["minimal", "documented", "verbose"]).optional(),
    responseFormat: z.enum(["full", "compact", "code-only", "summary"]).optional(),
    useEmojis: z.boolean().optional(),
    preferredLanguage: z.string().optional(),
    customRules: z.array(z.string()).optional(),
  }).nullable().optional(),
});

flowsRouter.put("/:id/customize", zValidator("json", customizeSchema), async (c) => {
  const db = c.get("db");
  const user = c.get("user");
  const flowId = c.req.param("id");

  if (!user) {
    return c.json({ error: "Authentication required" }, 401);
  }

  const [userFlow] = await db
    .select()
    .from(userFlows)
    .where(and(
      eq(userFlows.userId, user.id),
      eq(userFlows.flowId, flowId)
    ))
    .limit(1);

  if (!userFlow) {
    return c.json({ error: "Flow not installed" }, 400);
  }

  const data = c.req.valid("json");

  await db
    .update(userFlows)
    .set({
      customPrompt: data.customPrompt,
      customPreferences: data.customPreferences,
    })
    .where(eq(userFlows.id, userFlow.id));

  return c.json({ success: true });
});

export default flowsRouter;
