import { Hono } from "hono";
import { eq, and, desc, sql, count } from "drizzle-orm";
import { 
  apiTokens, 
  subscriptions, 
  userSkills, 
  skills, 
  userSecrets,
  memories,
  userPreferences,
} from "@nexus/db";
import { createAuth } from "@nexus/auth";
import type { AppContext, AuthUser, ResponseFormat } from "../types";

const userRouter = new Hono<AppContext>();

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
userRouter.use("*", requireAuth);

// ============================================================================
// Dashboard Stats
// ============================================================================

userRouter.get("/stats", async (c) => {
  const db = c.get("db");
  const user = c.get("user") as AuthUser;

  // Get subscription
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id))
    .limit(1);

  const plan = subscription?.plan || "free";
  const cancelAtPeriodEnd = subscription?.canceledAt != null;

  // Get API keys count
  const [keysResult] = await db
    .select({ count: count() })
    .from(apiTokens)
    .where(and(eq(apiTokens.userId, user.id), eq(apiTokens.isActive, true)));

  // Get installed skills count
  const [skillsResult] = await db
    .select({ count: count() })
    .from(userSkills)
    .where(eq(userSkills.userId, user.id));

  // Get memories count
  const [memoriesResult] = await db
    .select({ count: count() })
    .from(memories)
    .where(eq(memories.userId, user.id));

  // Get secrets count
  const [secretsResult] = await db
    .select({ count: count() })
    .from(userSecrets)
    .where(and(eq(userSecrets.userId, user.id), eq(userSecrets.isActive, true)));

  // Plan limits
  const limits = {
    free: { apiCalls: 2000, apiKeys: 1, memories: 5 },
    pro: { apiCalls: null, apiKeys: 10, memories: null },
    team: { apiCalls: null, apiKeys: 100, memories: null },
  };

  const planLimits = limits[plan as keyof typeof limits] || limits.free;

  // TODO: Get actual API call usage from Analytics Engine
  // For now, return mock data
  const apiCallsUsed = 0;

  return c.json({
    plan,
    subscription: subscription ? {
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd,
    } : null,
    apiCalls: {
      used: apiCallsUsed,
      limit: planLimits.apiCalls,
      percentUsed: planLimits.apiCalls 
        ? Math.round((apiCallsUsed / planLimits.apiCalls) * 100) 
        : 0,
    },
    apiKeys: {
      count: keysResult?.count || 0,
      limit: planLimits.apiKeys,
    },
    skills: {
      installed: skillsResult?.count || 0,
    },
    memories: {
      count: memoriesResult?.count || 0,
      limit: planLimits.memories,
    },
    secrets: {
      count: secretsResult?.count || 0,
    },
    recentActivity: [], // TODO: Implement activity tracking
  });
});

// ============================================================================
// API Tokens
// ============================================================================

userRouter.get("/tokens", async (c) => {
  const db = c.get("db");
  const user = c.get("user") as AuthUser;

  const tokens = await db
    .select({
      id: apiTokens.id,
      name: apiTokens.name,
      tokenPrefix: apiTokens.tokenPrefix,
      scopes: apiTokens.scopes,
      lastUsedAt: apiTokens.lastUsedAt,
      expiresAt: apiTokens.expiresAt,
      isActive: apiTokens.isActive,
      createdAt: apiTokens.createdAt,
    })
    .from(apiTokens)
    .where(eq(apiTokens.userId, user.id))
    .orderBy(desc(apiTokens.createdAt));

  return c.json({ tokens });
});

userRouter.post("/tokens", async (c) => {
  const db = c.get("db");
  const user = c.get("user") as AuthUser;

  const body = await c.req.json();
  const { name, scopes = ["read:docs"] } = body;

  if (!name || typeof name !== "string") {
    return c.json({ error: "Name is required" }, 400);
  }

  // Check limits
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id))
    .limit(1);

  const plan = subscription?.plan || "free";
  const limits = { free: 1, pro: 10, team: 100 };
  const keyLimit = limits[plan as keyof typeof limits] || 1;

  const [existingCount] = await db
    .select({ count: count() })
    .from(apiTokens)
    .where(and(eq(apiTokens.userId, user.id), eq(apiTokens.isActive, true)));

  if ((existingCount?.count || 0) >= keyLimit) {
    return c.json({ 
      error: `API key limit reached. ${plan === "free" ? "Upgrade to Pro for more keys." : ""}`
    }, 403);
  }

  // Generate token
  const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
  const token = `nxs_${Array.from(tokenBytes).map(b => b.toString(16).padStart(2, '0')).join('')}`;
  const tokenPrefix = token.slice(0, 12);

  // Hash the token for storage
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(token));
  const tokenHash = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.insert(apiTokens).values({
    id,
    userId: user.id,
    name,
    tokenHash,
    tokenPrefix,
    scopes,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  // Return the full token ONCE - it cannot be retrieved again
  return c.json({ 
    token,
    tokenInfo: {
      id,
      name,
      tokenPrefix,
      scopes,
      createdAt: now,
    }
  }, 201);
});

userRouter.delete("/tokens/:id", async (c) => {
  const db = c.get("db");
  const user = c.get("user") as AuthUser;
  const { id } = c.req.param();

  const [existing] = await db
    .select()
    .from(apiTokens)
    .where(and(eq(apiTokens.id, id), eq(apiTokens.userId, user.id)));

  if (!existing) {
    return c.json({ error: "Token not found" }, 404);
  }

  await db.delete(apiTokens).where(eq(apiTokens.id, id));

  return c.json({ success: true });
});

// ============================================================================
// Installed Skills
// ============================================================================

userRouter.get("/skills", async (c) => {
  const db = c.get("db");
  const user = c.get("user") as AuthUser;

  const installedSkills = await db
    .select({
      id: userSkills.id,
      installedAt: userSkills.installedAt,
      lastUsedAt: userSkills.lastUsedAt,
      skill: {
        id: skills.id,
        name: skills.name,
        description: skills.description,
        type: skills.type,
        categories: skills.categories,
      },
    })
    .from(userSkills)
    .innerJoin(skills, eq(userSkills.skillId, skills.id))
    .where(eq(userSkills.userId, user.id))
    .orderBy(desc(userSkills.installedAt));

  // Calculate usage count (we'll track this differently in a real implementation)
  const skillsWithUsage = installedSkills.map(s => ({
    ...s,
    usageCount: 0, // TODO: Track actual usage
  }));

  return c.json({ skills: skillsWithUsage });
});

userRouter.post("/skills/:skillId/install", async (c) => {
  const db = c.get("db");
  const user = c.get("user") as AuthUser;
  const { skillId } = c.req.param();

  // Check if skill exists
  const [skill] = await db
    .select()
    .from(skills)
    .where(eq(skills.id, skillId));

  if (!skill) {
    return c.json({ error: "Skill not found" }, 404);
  }

  // Check if already installed
  const [existing] = await db
    .select()
    .from(userSkills)
    .where(and(eq(userSkills.userId, user.id), eq(userSkills.skillId, skillId)));

  if (existing) {
    return c.json({ error: "Skill already installed" }, 409);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.insert(userSkills).values({
    id,
    userId: user.id,
    skillId,
    installedAt: now,
  });

  // Increment install count
  await db
    .update(skills)
    .set({ installCount: sql`${skills.installCount} + 1` })
    .where(eq(skills.id, skillId));

  return c.json({ success: true, id }, 201);
});

userRouter.post("/skills/:skillId/uninstall", async (c) => {
  const db = c.get("db");
  const user = c.get("user") as AuthUser;
  const { skillId } = c.req.param();

  const [existing] = await db
    .select()
    .from(userSkills)
    .where(and(eq(userSkills.userId, user.id), eq(userSkills.skillId, skillId)));

  if (!existing) {
    return c.json({ error: "Skill not installed" }, 404);
  }

  await db.delete(userSkills).where(eq(userSkills.id, existing.id));

  // Decrement install count
  await db
    .update(skills)
    .set({ installCount: sql`CASE WHEN ${skills.installCount} > 0 THEN ${skills.installCount} - 1 ELSE 0 END` })
    .where(eq(skills.id, skillId));

  return c.json({ success: true });
});

// ============================================================================
// Subscription info
// ============================================================================

userRouter.get("/subscription", async (c) => {
  const db = c.get("db");
  const user = c.get("user") as AuthUser;

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id))
    .limit(1);

  if (!subscription) {
    return c.json({
      plan: "free",
      status: null,
      limits: {
        apiCalls: 2000,
        apiKeys: 1,
        memories: 5,
      },
    });
  }

  const limits = {
    free: { apiCalls: 2000, apiKeys: 1, memories: 5 },
    pro: { apiCalls: null, apiKeys: 10, memories: null },
    team: { apiCalls: null, apiKeys: 100, memories: null },
  };

  return c.json({
    plan: subscription.plan,
    status: subscription.status,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.canceledAt != null,
    limits: limits[subscription.plan as keyof typeof limits] || limits.free,
  });
});

// ============================================================================
// User Preferences
// ============================================================================

const VALID_RESPONSE_FORMATS: ResponseFormat[] = ["full", "compact", "code-only", "summary"];

userRouter.get("/preferences", async (c) => {
  const db = c.get("db");
  const user = c.get("user") as AuthUser;

  const [prefs] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, user.id))
    .limit(1);

  // Return defaults if no preferences exist
  if (!prefs) {
    return c.json({
      defaultResponseFormat: "full" as ResponseFormat,
      defaultTokenBudget: null,
      showCodeLineNumbers: true,
      preferredCodeLanguage: null,
      emailNotifications: true,
      emailWeeklyDigest: false,
    });
  }

  return c.json({
    defaultResponseFormat: prefs.defaultResponseFormat,
    defaultTokenBudget: prefs.defaultTokenBudget,
    showCodeLineNumbers: prefs.showCodeLineNumbers,
    preferredCodeLanguage: prefs.preferredCodeLanguage,
    emailNotifications: prefs.emailNotifications,
    emailWeeklyDigest: prefs.emailWeeklyDigest,
  });
});

userRouter.put("/preferences", async (c) => {
  const db = c.get("db");
  const user = c.get("user") as AuthUser;

  const body = await c.req.json();
  
  // Validate response format
  if (body.defaultResponseFormat && !VALID_RESPONSE_FORMATS.includes(body.defaultResponseFormat)) {
    return c.json({ error: "Invalid response format" }, 400);
  }

  // Validate token budget
  if (body.defaultTokenBudget !== undefined && body.defaultTokenBudget !== null) {
    const budget = Number(body.defaultTokenBudget);
    if (isNaN(budget) || budget < 0 || budget > 100000) {
      return c.json({ error: "Token budget must be between 0 and 100000" }, 400);
    }
  }

  const now = new Date().toISOString();

  // Check if preferences exist
  const [existing] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, user.id))
    .limit(1);

  const prefsData = {
    defaultResponseFormat: body.defaultResponseFormat || "full",
    defaultTokenBudget: body.defaultTokenBudget ?? null,
    showCodeLineNumbers: body.showCodeLineNumbers ?? true,
    preferredCodeLanguage: body.preferredCodeLanguage || null,
    emailNotifications: body.emailNotifications ?? true,
    emailWeeklyDigest: body.emailWeeklyDigest ?? false,
    updatedAt: now,
  };

  if (existing) {
    // Update existing preferences
    await db
      .update(userPreferences)
      .set(prefsData)
      .where(eq(userPreferences.userId, user.id));
  } else {
    // Create new preferences
    await db.insert(userPreferences).values({
      id: crypto.randomUUID(),
      userId: user.id,
      ...prefsData,
      createdAt: now,
    });
  }

  return c.json({ success: true, ...prefsData });
});

export { userRouter };
