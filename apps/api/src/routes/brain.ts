import { Hono } from "hono";
import { eq, and, desc, sql, like, or } from "drizzle-orm";
import {
  learnings,
  intelligenceScores,
  xpEvents,
  projects,
  communityLearnings,
  learningAdoptions,
  type Database,
  LEARNING_TYPES,
  LEARNING_SCOPES,
  XP_CATEGORIES,
} from "@nexus/db";
import { createAuth } from "@nexus/auth";
import type { AppContext, AuthUser } from "../types";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const brainRouter = new Hono<AppContext>();

// ============================================================================
// Auth middleware
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

brainRouter.use("*", requireAuth);

// Helper to get user from context (with assertion since middleware validates)
function getUser(c: any): AuthUser {
  return c.get("user") as AuthUser;
}

// ============================================================================
// XP Constants & Helpers
// ============================================================================

const XP_VALUES = {
  query_docs: 5,
  save_memory: 10,
  create_learning: 15,
  create_flow: 25,
  index_repo: 50,
  streak_bonus: 10,
  achievement: 100,
  first_action: 25,
} as const;

// Level thresholds (XP required to reach each level)
function getXpForLevel(level: number): number {
  // Exponential curve: 100, 250, 500, 850, 1300, 1850, 2500, ...
  return Math.floor(100 * Math.pow(level, 1.5));
}

function getLevelFromXp(totalXp: number): { level: number; currentLevelXp: number } {
  let level = 1;
  let xpForNextLevel = getXpForLevel(1);
  let accumulatedXp = 0;

  while (totalXp >= accumulatedXp + xpForNextLevel) {
    accumulatedXp += xpForNextLevel;
    level++;
    xpForNextLevel = getXpForLevel(level);
  }

  return {
    level,
    currentLevelXp: totalXp - accumulatedXp,
  };
}

async function awardXp(
  db: Database,
  userId: string,
  eventType: keyof typeof XP_VALUES,
  category: (typeof XP_CATEGORIES)[number],
  options?: {
    description?: string;
    referenceId?: string;
    referenceType?: string;
    multiplier?: number;
  }
): Promise<{ xpAwarded: number; newLevel: number; leveledUp: boolean }> {
  const now = new Date().toISOString();
  const today = now.split("T")[0];

  const baseXp = XP_VALUES[eventType];
  const multiplier = options?.multiplier || 1;
  const xpAmount = Math.floor(baseXp * multiplier);

  // Get or create intelligence score
  let [score] = await db
    .select()
    .from(intelligenceScores)
    .where(eq(intelligenceScores.userId, userId))
    .limit(1);

  const previousLevel = score?.level || 1;

  if (!score) {
    // Create new score
    score = {
      id: crypto.randomUUID(),
      userId,
      totalXp: 0,
      level: 1,
      currentLevelXp: 0,
      categoryXp: {},
      currentStreak: 1,
      longestStreak: 1,
      lastActivityDate: today,
      achievements: [],
      totalQueries: 0,
      totalMemories: 0,
      totalLearnings: 0,
      totalFlowsCreated: 0,
      totalReposIndexed: 0,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(intelligenceScores).values(score);
  }

  // Calculate streak
  let newStreak = score.currentStreak;
  if (score.lastActivityDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (score.lastActivityDate === yesterdayStr) {
      newStreak = score.currentStreak + 1;
    } else {
      newStreak = 1;
    }
  }

  // Update category XP
  const categoryXp = (score.categoryXp || {}) as Record<string, number>;
  categoryXp[category] = (categoryXp[category] || 0) + xpAmount;

  // Calculate new totals
  const newTotalXp = score.totalXp + xpAmount;
  const { level: newLevel, currentLevelXp } = getLevelFromXp(newTotalXp);
  const leveledUp = newLevel > previousLevel;

  // Update stats based on event type
  const statUpdates: Record<string, number> = {};
  if (eventType === "query_docs") statUpdates.totalQueries = score.totalQueries + 1;
  if (eventType === "save_memory") statUpdates.totalMemories = score.totalMemories + 1;
  if (eventType === "create_learning") statUpdates.totalLearnings = score.totalLearnings + 1;
  if (eventType === "create_flow") statUpdates.totalFlowsCreated = score.totalFlowsCreated + 1;
  if (eventType === "index_repo") statUpdates.totalReposIndexed = score.totalReposIndexed + 1;

  // Update score
  await db
    .update(intelligenceScores)
    .set({
      totalXp: newTotalXp,
      level: newLevel,
      currentLevelXp,
      categoryXp,
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, score.longestStreak),
      lastActivityDate: today,
      ...statUpdates,
      updatedAt: now,
    })
    .where(eq(intelligenceScores.userId, userId));

  // Record XP event
  await db.insert(xpEvents).values({
    id: crypto.randomUUID(),
    userId,
    eventType,
    xpAmount,
    category,
    description: options?.description,
    referenceId: options?.referenceId,
    referenceType: options?.referenceType,
    baseXp,
    multiplier: String(multiplier),
    createdAt: now,
  });

  return { xpAwarded: xpAmount, newLevel, leveledUp };
}

// ============================================================================
// GET /api/brain/score - Get user's intelligence score
// ============================================================================

brainRouter.get("/score", async (c) => {
  const db = c.get("db");
  const user = getUser(c);

  const [score] = await db
    .select()
    .from(intelligenceScores)
    .where(eq(intelligenceScores.userId, user.id))
    .limit(1);

  if (!score) {
    // Return default score
    return c.json({
      score: {
        totalXp: 0,
        level: 1,
        currentLevelXp: 0,
        xpToNextLevel: getXpForLevel(1),
        categoryXp: {},
        currentStreak: 0,
        longestStreak: 0,
        achievements: [],
        stats: {
          totalQueries: 0,
          totalMemories: 0,
          totalLearnings: 0,
          totalFlowsCreated: 0,
          totalReposIndexed: 0,
        },
      },
    });
  }

  return c.json({
    score: {
      totalXp: score.totalXp,
      level: score.level,
      currentLevelXp: score.currentLevelXp,
      xpToNextLevel: getXpForLevel(score.level),
      categoryXp: score.categoryXp || {},
      currentStreak: score.currentStreak,
      longestStreak: score.longestStreak,
      achievements: score.achievements || [],
      stats: {
        totalQueries: score.totalQueries,
        totalMemories: score.totalMemories,
        totalLearnings: score.totalLearnings,
        totalFlowsCreated: score.totalFlowsCreated,
        totalReposIndexed: score.totalReposIndexed,
      },
    },
  });
});

// ============================================================================
// GET /api/brain/xp-history - Get XP event history
// ============================================================================

brainRouter.get("/xp-history", async (c) => {
  const db = c.get("db");
  const user = getUser(c);
  const url = new URL(c.req.url);

  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  const offset = parseInt(url.searchParams.get("offset") || "0");

  const events = await db
    .select()
    .from(xpEvents)
    .where(eq(xpEvents.userId, user.id))
    .orderBy(desc(xpEvents.createdAt))
    .limit(limit)
    .offset(offset);

  return c.json({ events });
});

// ============================================================================
// GET /api/brain/learnings - List user's learnings
// ============================================================================

brainRouter.get("/learnings", async (c) => {
  const db = c.get("db");
  const user = getUser(c);
  const url = new URL(c.req.url);

  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const type = url.searchParams.get("type");
  const scope = url.searchParams.get("scope");
  const project = url.searchParams.get("project");
  const search = url.searchParams.get("search");

  const conditions = [eq(learnings.userId, user.id), eq(learnings.isActive, true)];

  if (type) {
    conditions.push(eq(learnings.type, type as (typeof LEARNING_TYPES)[number]));
  }
  if (scope) {
    conditions.push(eq(learnings.scope, scope as (typeof LEARNING_SCOPES)[number]));
  }
  if (project) {
    conditions.push(eq(learnings.project, project));
  }
  if (search) {
    const searchTerm = `%${search.toLowerCase()}%`;
    conditions.push(
      or(
        like(sql`lower(${learnings.trigger})`, searchTerm),
        like(sql`lower(${learnings.response})`, searchTerm)
      )!
    );
  }

  const userLearnings = await db
    .select()
    .from(learnings)
    .where(and(...conditions))
    .orderBy(desc(learnings.updatedAt))
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(learnings)
    .where(and(...conditions));

  return c.json({
    learnings: userLearnings,
    total: countResult[0]?.count || 0,
  });
});

// ============================================================================
// POST /api/brain/learnings - Create a new learning
// ============================================================================

const createLearningSchema = z.object({
  type: z.enum(LEARNING_TYPES).default("correction"),
  category: z.string().optional(),
  trigger: z.string().min(1).max(500),
  response: z.string().min(1).max(2000),
  context: z.string().max(2000).optional(),
  source: z.enum(["explicit", "implicit"]).default("explicit"),
  scope: z.enum(LEARNING_SCOPES).default("global"),
  project: z.string().optional(),
  libraryId: z.string().optional(),
  flowId: z.string().optional(),
  confidence: z.number().min(0).max(100).default(80),
});

brainRouter.post("/learnings", zValidator("json", createLearningSchema), async (c) => {
  const db = c.get("db");
  const user = getUser(c);
  const data = c.req.valid("json");
  const now = new Date().toISOString();

  const id = crypto.randomUUID();

  await db.insert(learnings).values({
    id,
    userId: user.id,
    ...data,
    usageCount: 0,
    successRate: 100,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  // Award XP
  const xpResult = await awardXp(db, user.id, "create_learning", "learning", {
    description: `Created learning: ${data.trigger.slice(0, 50)}...`,
    referenceId: id,
    referenceType: "learning",
  });

  return c.json(
    {
      success: true,
      learningId: id,
      xp: xpResult,
    },
    201
  );
});

// ============================================================================
// PUT /api/brain/learnings/:id - Update a learning
// ============================================================================

const updateLearningSchema = z.object({
  trigger: z.string().min(1).max(500).optional(),
  response: z.string().min(1).max(2000).optional(),
  context: z.string().max(2000).optional(),
  category: z.string().optional(),
  scope: z.enum(LEARNING_SCOPES).optional(),
  project: z.string().nullable().optional(),
  confidence: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
});

brainRouter.put("/learnings/:id", zValidator("json", updateLearningSchema), async (c) => {
  const db = c.get("db");
  const user = getUser(c);
  const learningId = c.req.param("id");
  const data = c.req.valid("json");
  const now = new Date().toISOString();

  // Verify ownership
  const [existing] = await db
    .select()
    .from(learnings)
    .where(and(eq(learnings.id, learningId), eq(learnings.userId, user.id)))
    .limit(1);

  if (!existing) {
    return c.json({ error: "Learning not found" }, 404);
  }

  await db
    .update(learnings)
    .set({ ...data, updatedAt: now })
    .where(eq(learnings.id, learningId));

  return c.json({ success: true });
});

// ============================================================================
// DELETE /api/brain/learnings/:id - Delete a learning
// ============================================================================

brainRouter.delete("/learnings/:id", async (c) => {
  const db = c.get("db");
  const user = getUser(c);
  const learningId = c.req.param("id");

  // Verify ownership
  const [existing] = await db
    .select()
    .from(learnings)
    .where(and(eq(learnings.id, learningId), eq(learnings.userId, user.id)))
    .limit(1);

  if (!existing) {
    return c.json({ error: "Learning not found" }, 404);
  }

  await db.delete(learnings).where(eq(learnings.id, learningId));

  return c.json({ success: true });
});

// ============================================================================
// POST /api/brain/learnings/:id/use - Record learning usage (for AI to call)
// ============================================================================

brainRouter.post("/learnings/:id/use", async (c) => {
  const db = c.get("db");
  const user = getUser(c);
  const learningId = c.req.param("id");
  const now = new Date().toISOString();

  // Verify ownership
  const [existing] = await db
    .select()
    .from(learnings)
    .where(and(eq(learnings.id, learningId), eq(learnings.userId, user.id)))
    .limit(1);

  if (!existing) {
    return c.json({ error: "Learning not found" }, 404);
  }

  await db
    .update(learnings)
    .set({
      usageCount: sql`${learnings.usageCount} + 1`,
      lastUsedAt: now,
      updatedAt: now,
    })
    .where(eq(learnings.id, learningId));

  return c.json({ success: true });
});

// ============================================================================
// GET /api/brain/learnings/active - Get learnings applicable to current context
// ============================================================================

brainRouter.get("/learnings/active", async (c) => {
  const db = c.get("db");
  const user = getUser(c);
  const url = new URL(c.req.url);

  const project = url.searchParams.get("project");
  const libraryId = url.searchParams.get("library");
  const flowId = url.searchParams.get("flow");

  // Build conditions: global + scoped learnings
  const conditions = [eq(learnings.userId, user.id), eq(learnings.isActive, true)];

  const scopeConditions = [eq(learnings.scope, "global")];
  if (project) {
    scopeConditions.push(and(eq(learnings.scope, "project"), eq(learnings.project, project))!);
  }
  if (libraryId) {
    scopeConditions.push(and(eq(learnings.scope, "library"), eq(learnings.libraryId, libraryId))!);
  }
  if (flowId) {
    scopeConditions.push(and(eq(learnings.scope, "flow"), eq(learnings.flowId, flowId))!);
  }

  conditions.push(or(...scopeConditions)!);

  const activeLearnings = await db
    .select()
    .from(learnings)
    .where(and(...conditions))
    .orderBy(desc(learnings.confidence), desc(learnings.usageCount))
    .limit(50);

  return c.json({ learnings: activeLearnings });
});

// ============================================================================
// GET /api/brain/projects - List user's projects
// ============================================================================

brainRouter.get("/projects", async (c) => {
  const db = c.get("db");
  const user = getUser(c);

  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, user.id))
    .orderBy(desc(projects.lastSessionAt));

  return c.json({ projects: userProjects });
});

// ============================================================================
// POST /api/brain/projects - Create/update a project fingerprint
// ============================================================================

const upsertProjectSchema = z.object({
  name: z.string().min(1).max(100),
  path: z.string().optional(),
  description: z.string().optional(),
  stack: z.record(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
  devDependencies: z.array(z.string()).optional(),
  patterns: z.record(z.unknown()).optional(),
  repoId: z.string().optional(),
  flowId: z.string().optional(),
});

brainRouter.post("/projects", zValidator("json", upsertProjectSchema), async (c) => {
  const db = c.get("db");
  const user = getUser(c);
  const data = c.req.valid("json");
  const now = new Date().toISOString();

  // Check if project already exists (by name + user)
  const [existing] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.userId, user.id), eq(projects.name, data.name)))
    .limit(1);

  if (existing) {
    // Update existing project
    await db
      .update(projects)
      .set({
        ...data,
        sessionCount: sql`${projects.sessionCount} + 1`,
        lastSessionAt: now,
        updatedAt: now,
      })
      .where(eq(projects.id, existing.id));

    return c.json({ success: true, projectId: existing.id, updated: true });
  }

  // Create new project
  const id = crypto.randomUUID();
  await db.insert(projects).values({
    id,
    userId: user.id,
    ...data,
    sessionCount: 1,
    lastSessionAt: now,
    createdAt: now,
    updatedAt: now,
  });

  return c.json({ success: true, projectId: id, created: true }, 201);
});

// ============================================================================
// GET /api/brain/community - Browse community learnings
// ============================================================================

brainRouter.get("/community", async (c) => {
  const db = c.get("db");
  const url = new URL(c.req.url);

  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const libraryId = url.searchParams.get("library");
  const type = url.searchParams.get("type");

  const conditions = [eq(communityLearnings.isActive, true)];

  if (libraryId) {
    conditions.push(eq(communityLearnings.libraryId, libraryId));
  }
  if (type) {
    conditions.push(eq(communityLearnings.type, type as (typeof LEARNING_TYPES)[number]));
  }

  const community = await db
    .select()
    .from(communityLearnings)
    .where(and(...conditions))
    .orderBy(desc(communityLearnings.upvotes), desc(communityLearnings.adoptionCount))
    .limit(limit)
    .offset(offset);

  return c.json({ learnings: community });
});

// ============================================================================
// POST /api/brain/community/:id/adopt - Adopt a community learning
// ============================================================================

brainRouter.post("/community/:id/adopt", async (c) => {
  const db = c.get("db");
  const user = getUser(c);
  const communityLearningId = c.req.param("id");
  const now = new Date().toISOString();

  // Get the community learning
  const [communityLearning] = await db
    .select()
    .from(communityLearnings)
    .where(eq(communityLearnings.id, communityLearningId))
    .limit(1);

  if (!communityLearning) {
    return c.json({ error: "Community learning not found" }, 404);
  }

  // Check if already adopted
  const [existingAdoption] = await db
    .select()
    .from(learningAdoptions)
    .where(
      and(
        eq(learningAdoptions.userId, user.id),
        eq(learningAdoptions.communityLearningId, communityLearningId)
      )
    )
    .limit(1);

  if (existingAdoption) {
    return c.json({ error: "Already adopted" }, 400);
  }

  // Create local learning
  const learningId = crypto.randomUUID();
  await db.insert(learnings).values({
    id: learningId,
    userId: user.id,
    type: communityLearning.type,
    category: communityLearning.category,
    trigger: communityLearning.trigger,
    response: communityLearning.response,
    context: communityLearning.context,
    source: "community",
    scope: communityLearning.scope,
    libraryId: communityLearning.libraryId,
    confidence: communityLearning.confidence,
    usageCount: 0,
    successRate: 100,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  // Record adoption
  await db.insert(learningAdoptions).values({
    id: crypto.randomUUID(),
    userId: user.id,
    communityLearningId,
    learningId,
    adoptedAt: now,
  });

  // Increment adoption count
  await db
    .update(communityLearnings)
    .set({ adoptionCount: sql`${communityLearnings.adoptionCount} + 1` })
    .where(eq(communityLearnings.id, communityLearningId));

  return c.json({ success: true, learningId });
});

// ============================================================================
// POST /api/brain/community/:id/vote - Vote on a community learning
// ============================================================================

const voteSchema = z.object({
  vote: z.enum(["up", "down"]),
});

brainRouter.post("/community/:id/vote", zValidator("json", voteSchema), async (c) => {
  const db = c.get("db");
  const user = getUser(c);
  const communityLearningId = c.req.param("id");
  const { vote } = c.req.valid("json");

  // Get or create adoption record
  let [adoption] = await db
    .select()
    .from(learningAdoptions)
    .where(
      and(
        eq(learningAdoptions.userId, user.id),
        eq(learningAdoptions.communityLearningId, communityLearningId)
      )
    )
    .limit(1);

  const voteValue = vote === "up" ? 1 : -1;

  if (adoption) {
    const previousVote = adoption.vote || 0;

    // Update vote
    await db
      .update(learningAdoptions)
      .set({ vote: voteValue })
      .where(eq(learningAdoptions.id, adoption.id));

    // Update community learning counts
    const upvoteDelta = voteValue === 1 ? 1 : 0;
    const downvoteDelta = voteValue === -1 ? 1 : 0;
    const prevUpvoteDelta = previousVote === 1 ? -1 : 0;
    const prevDownvoteDelta = previousVote === -1 ? -1 : 0;

    await db
      .update(communityLearnings)
      .set({
        upvotes: sql`${communityLearnings.upvotes} + ${upvoteDelta + prevUpvoteDelta}`,
        downvotes: sql`${communityLearnings.downvotes} + ${downvoteDelta + prevDownvoteDelta}`,
      })
      .where(eq(communityLearnings.id, communityLearningId));
  } else {
    // Create adoption with vote
    await db.insert(learningAdoptions).values({
      id: crypto.randomUUID(),
      userId: user.id,
      communityLearningId,
      vote: voteValue,
      adoptedAt: new Date().toISOString(),
    });

    // Update counts
    if (voteValue === 1) {
      await db
        .update(communityLearnings)
        .set({ upvotes: sql`${communityLearnings.upvotes} + 1` })
        .where(eq(communityLearnings.id, communityLearningId));
    } else {
      await db
        .update(communityLearnings)
        .set({ downvotes: sql`${communityLearnings.downvotes} + 1` })
        .where(eq(communityLearnings.id, communityLearningId));
    }
  }

  return c.json({ success: true });
});

// ============================================================================
// GET /api/brain/leaderboard - Get top users by XP
// ============================================================================

brainRouter.get("/leaderboard", async (c) => {
  const db = c.get("db");
  const url = new URL(c.req.url);

  const limit = Math.min(parseInt(url.searchParams.get("limit") || "10"), 50);

  const leaderboard = await db
    .select({
      userId: intelligenceScores.userId,
      totalXp: intelligenceScores.totalXp,
      level: intelligenceScores.level,
      currentStreak: intelligenceScores.currentStreak,
    })
    .from(intelligenceScores)
    .orderBy(desc(intelligenceScores.totalXp))
    .limit(limit);

  return c.json({ leaderboard });
});

export default brainRouter;
