import { Hono } from "hono";
import { eq, and, desc, sql } from "drizzle-orm";
import { connectedRepos, repoFiles, accounts, subscriptions, type Database } from "@nexus/db";
import { createAuth } from "@nexus/auth";
import type { AppContext, AuthUser } from "../types";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const reposRouter = new Hono<AppContext>();

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

reposRouter.use("*", requireAuth);

// Helper to get user from context (with assertion since middleware validates)
function getUser(c: any): AuthUser {
  return c.get("user") as AuthUser;
}

// ============================================================================
// Tier limits
// ============================================================================

const TIER_LIMITS = {
  free: { maxRepos: 1, maxBytesPerRepo: 10 * 1024 * 1024, privateRepos: false },
  pro: { maxRepos: 5, maxBytesPerRepo: 100 * 1024 * 1024, privateRepos: true },
  team: { maxRepos: 20, maxBytesPerRepo: 500 * 1024 * 1024, privateRepos: true },
};

async function getUserTier(db: Database, userId: string): Promise<keyof typeof TIER_LIMITS> {
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
    .limit(1);

  return (subscription?.plan as keyof typeof TIER_LIMITS) || "free";
}

async function getGitHubToken(db: Database, userId: string): Promise<string | null> {
  const [account] = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.providerId, "github")))
    .limit(1);

  return account?.accessToken || null;
}

// ============================================================================
// Smart file filtering for "enough for Claude to program"
// ============================================================================

const SMART_INCLUDE_PATTERNS = [
  // Documentation
  "README.md",
  "README.rst",
  "README.txt",
  "docs/**/*.md",
  "documentation/**/*.md",
  "CONTRIBUTING.md",
  "CHANGELOG.md",

  // Configuration
  "package.json",
  "tsconfig.json",
  "tsconfig.*.json",
  "pyproject.toml",
  "setup.py",
  "Cargo.toml",
  "go.mod",
  "composer.json",
  "Gemfile",
  "pom.xml",
  "build.gradle",
  ".env.example",
  "wrangler.toml",
  "nest-cli.json",
  "angular.json",
  "next.config.*",
  "vite.config.*",
  "webpack.config.*",
  "tailwind.config.*",
  "postcss.config.*",
  "eslint.config.*",
  ".eslintrc*",
  "biome.json",

  // Types and interfaces
  "**/*.d.ts",
  "**/types.ts",
  "**/types/*.ts",
  "**/interfaces.ts",
  "**/interfaces/*.ts",
  "**/*types*.ts",
  "**/*schema*.ts",

  // Entry points
  "src/index.ts",
  "src/main.ts",
  "src/app.ts",
  "src/index.tsx",
  "src/main.tsx",
  "src/App.tsx",
  "lib/index.ts",
  "index.ts",
  "main.py",
  "__init__.py",
  "main.go",
  "lib.rs",

  // API definitions
  "**/routes.ts",
  "**/router.ts",
  "**/api/**/*.ts",
  "**/*controller*.ts",
  "**/*handler*.ts",

  // Database schemas
  "**/schema.ts",
  "**/schema.prisma",
  "**/models/*.ts",
  "**/entities/*.ts",
  "**/migrations/*.sql",
];

const SMART_EXCLUDE_PATTERNS = [
  "node_modules/**",
  ".git/**",
  "dist/**",
  "build/**",
  ".next/**",
  ".nuxt/**",
  "coverage/**",
  "*.test.*",
  "*.spec.*",
  "__tests__/**",
  "test/**",
  "tests/**",
  "*.min.js",
  "*.bundle.js",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  ".env",
  ".env.local",
  "*.log",
];

// ============================================================================
// GET /api/repos - List connected repositories
// ============================================================================

reposRouter.get("/", async (c) => {
  const db = c.get("db");
  const user = getUser(c);

  const repos = await db
    .select()
    .from(connectedRepos)
    .where(eq(connectedRepos.userId, user.id))
    .orderBy(desc(connectedRepos.createdAt));

  const tier = await getUserTier(db, user.id);
  const limits = TIER_LIMITS[tier];

  return c.json({
    repos,
    tier,
    limits: {
      maxRepos: limits.maxRepos,
      maxBytesPerRepo: limits.maxBytesPerRepo,
      privateRepos: limits.privateRepos,
      currentRepoCount: repos.length,
    },
  });
});

// ============================================================================
// GET /api/repos/available - List available GitHub repos to connect
// ============================================================================

reposRouter.get("/available", async (c) => {
  const db = c.get("db");
  const user = getUser(c);
  const url = new URL(c.req.url);

  const page = parseInt(url.searchParams.get("page") || "1");
  const perPage = Math.min(parseInt(url.searchParams.get("per_page") || "30"), 100);

  const token = await getGitHubToken(db, user.id);
  if (!token) {
    return c.json(
      {
        error: "GitHub not connected",
        authUrl: "/api/auth/github?scope=repo",
      },
      400
    );
  }

  try {
    const response = await fetch(
      `https://api.github.com/user/repos?sort=updated&per_page=${perPage}&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Nexus-API",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        return c.json(
          {
            error: "GitHub token expired",
            authUrl: "/api/auth/github?scope=repo",
          },
          401
        );
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repos = (await response.json()) as Array<{
      id: number;
      name: string;
      full_name: string;
      description: string | null;
      html_url: string;
      default_branch: string;
      private: boolean;
      owner: { login: string };
      updated_at: string;
      language: string | null;
    }>;

    // Get already connected repo IDs
    const connectedIds = await db
      .select({ githubId: connectedRepos.githubId })
      .from(connectedRepos)
      .where(eq(connectedRepos.userId, user.id));
    const connectedIdSet = new Set(connectedIds.map((r) => r.githubId));

    // Get user's tier for private repo filtering
    const tier = await getUserTier(db, user.id);
    const limits = TIER_LIMITS[tier];

    const availableRepos = repos
      .filter((repo) => limits.privateRepos || !repo.private)
      .map((repo) => ({
        githubId: repo.id,
        owner: repo.owner.login,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        htmlUrl: repo.html_url,
        defaultBranch: repo.default_branch,
        isPrivate: repo.private,
        language: repo.language,
        updatedAt: repo.updated_at,
        isConnected: connectedIdSet.has(repo.id),
      }));

    return c.json({ repos: availableRepos, page, perPage });
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch repos",
      },
      500
    );
  }
});

// ============================================================================
// POST /api/repos - Connect a repository
// ============================================================================

const connectRepoSchema = z.object({
  githubId: z.number(),
  owner: z.string(),
  name: z.string(),
  fullName: z.string(),
  description: z.string().nullable().optional(),
  htmlUrl: z.string().url(),
  defaultBranch: z.string().default("main"),
  isPrivate: z.boolean().default(false),
});

reposRouter.post("/", zValidator("json", connectRepoSchema), async (c) => {
  const db = c.get("db");
  const user = getUser(c);
  const data = c.req.valid("json");
  const now = new Date().toISOString();

  // Check tier limits
  const tier = await getUserTier(db, user.id);
  const limits = TIER_LIMITS[tier];

  // Check if private repo is allowed
  if (data.isPrivate && !limits.privateRepos) {
    return c.json(
      {
        error: "Private repositories require Pro or Team plan",
        upgrade: true,
      },
      403
    );
  }

  // Check repo count limit
  const existingCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(connectedRepos)
    .where(eq(connectedRepos.userId, user.id));

  if ((existingCount[0]?.count || 0) >= limits.maxRepos) {
    return c.json(
      {
        error: `Maximum ${limits.maxRepos} repositories allowed on ${tier} plan`,
        upgrade: true,
      },
      403
    );
  }

  // Check if already connected
  const [existing] = await db
    .select()
    .from(connectedRepos)
    .where(and(eq(connectedRepos.userId, user.id), eq(connectedRepos.githubId, data.githubId)))
    .limit(1);

  if (existing) {
    return c.json({ error: "Repository already connected" }, 400);
  }

  const id = crypto.randomUUID();
  const r2Prefix = `repos/${user.id}/${data.fullName.replace("/", "_")}`;

  await db.insert(connectedRepos).values({
    id,
    userId: user.id,
    githubId: data.githubId,
    owner: data.owner,
    name: data.name,
    fullName: data.fullName,
    description: data.description,
    htmlUrl: data.htmlUrl,
    defaultBranch: data.defaultBranch,
    isPrivate: data.isPrivate,
    indexStatus: "pending",
    r2Prefix,
    totalFiles: 0,
    totalBytes: 0,
    indexedFiles: 0,
    autoSync: false,
    includePatterns: SMART_INCLUDE_PATTERNS,
    excludePatterns: SMART_EXCLUDE_PATTERNS,
    createdAt: now,
    updatedAt: now,
  });

  return c.json({ success: true, repoId: id }, 201);
});

// ============================================================================
// GET /api/repos/:id - Get repository details
// ============================================================================

reposRouter.get("/:id", async (c) => {
  const db = c.get("db");
  const user = getUser(c);
  const repoId = c.req.param("id");

  const [repo] = await db
    .select()
    .from(connectedRepos)
    .where(and(eq(connectedRepos.id, repoId), eq(connectedRepos.userId, user.id)))
    .limit(1);

  if (!repo) {
    return c.json({ error: "Repository not found" }, 404);
  }

  // Get files
  const files = await db
    .select()
    .from(repoFiles)
    .where(eq(repoFiles.repoId, repoId))
    .orderBy(repoFiles.path);

  return c.json({ repo, files });
});

// ============================================================================
// POST /api/repos/:id/sync - Trigger repository sync/indexing
// ============================================================================

reposRouter.post("/:id/sync", async (c) => {
  const db = c.get("db");
  const user = getUser(c);
  const repoId = c.req.param("id");
  const now = new Date().toISOString();

  const [repo] = await db
    .select()
    .from(connectedRepos)
    .where(and(eq(connectedRepos.id, repoId), eq(connectedRepos.userId, user.id)))
    .limit(1);

  if (!repo) {
    return c.json({ error: "Repository not found" }, 404);
  }

  if (repo.indexStatus === "indexing") {
    return c.json({ error: "Sync already in progress" }, 400);
  }

  // Get GitHub token
  const token = await getGitHubToken(db, user.id);
  if (!token) {
    return c.json({ error: "GitHub not connected" }, 400);
  }

  // Update status to indexing
  await db
    .update(connectedRepos)
    .set({ indexStatus: "indexing", indexError: null, updatedAt: now })
    .where(eq(connectedRepos.id, repoId));

  // Enqueue indexing job (in real impl, this would be a queue)
  // For now, we'll do it inline with a limited scope
  c.executionCtx.waitUntil(indexRepository(c.env, db, repo, token));

  return c.json({ success: true, message: "Sync started" });
});

// ============================================================================
// DELETE /api/repos/:id - Disconnect a repository
// ============================================================================

reposRouter.delete("/:id", async (c) => {
  const db = c.get("db");
  const user = getUser(c);
  const repoId = c.req.param("id");

  const [repo] = await db
    .select()
    .from(connectedRepos)
    .where(and(eq(connectedRepos.id, repoId), eq(connectedRepos.userId, user.id)))
    .limit(1);

  if (!repo) {
    return c.json({ error: "Repository not found" }, 404);
  }

  // Delete files from R2
  if (repo.r2Prefix && c.env.DOCS_BUCKET) {
    try {
      const objects = await c.env.DOCS_BUCKET.list({ prefix: repo.r2Prefix });
      await Promise.all(
        objects.objects.map((obj: { key: string }) => c.env.DOCS_BUCKET.delete(obj.key))
      );
    } catch (error) {
      console.error("Failed to delete R2 objects:", error);
    }
  }

  // Delete from database (cascade will delete files)
  await db.delete(connectedRepos).where(eq(connectedRepos.id, repoId));

  return c.json({ success: true });
});

// ============================================================================
// PUT /api/repos/:id/settings - Update repository settings
// ============================================================================

const updateSettingsSchema = z.object({
  autoSync: z.boolean().optional(),
  includePatterns: z.array(z.string()).optional(),
  excludePatterns: z.array(z.string()).optional(),
});

reposRouter.put("/:id/settings", zValidator("json", updateSettingsSchema), async (c) => {
  const db = c.get("db");
  const user = getUser(c);
  const repoId = c.req.param("id");
  const data = c.req.valid("json");
  const now = new Date().toISOString();

  const [repo] = await db
    .select()
    .from(connectedRepos)
    .where(and(eq(connectedRepos.id, repoId), eq(connectedRepos.userId, user.id)))
    .limit(1);

  if (!repo) {
    return c.json({ error: "Repository not found" }, 404);
  }

  await db
    .update(connectedRepos)
    .set({ ...data, updatedAt: now })
    .where(eq(connectedRepos.id, repoId));

  return c.json({ success: true });
});

// ============================================================================
// GET /api/repos/:id/files/:path - Get file content
// ============================================================================

reposRouter.get("/:id/files/*", async (c) => {
  const db = c.get("db");
  const user = getUser(c);
  const repoId = c.req.param("id");
  const filePath = c.req.path.replace(`/api/repos/${repoId}/files/`, "");

  // Verify ownership
  const [repo] = await db
    .select()
    .from(connectedRepos)
    .where(and(eq(connectedRepos.id, repoId), eq(connectedRepos.userId, user.id)))
    .limit(1);

  if (!repo) {
    return c.json({ error: "Repository not found" }, 404);
  }

  // Get file record
  const [file] = await db
    .select()
    .from(repoFiles)
    .where(and(eq(repoFiles.repoId, repoId), eq(repoFiles.path, filePath)))
    .limit(1);

  if (!file) {
    return c.json({ error: "File not found" }, 404);
  }

  // Get content from R2
  if (!c.env.DOCS_BUCKET) {
    return c.json({ error: "Storage not available" }, 500);
  }

  const object = await c.env.DOCS_BUCKET.get(file.r2Key);
  if (!object) {
    return c.json({ error: "File content not found" }, 404);
  }

  const content = await object.text();

  return c.json({
    file: {
      ...file,
      content,
    },
  });
});

// ============================================================================
// GET /api/repos/:id/structure - Get repository directory structure
// ============================================================================

reposRouter.get("/:id/structure", async (c) => {
  const db = c.get("db");
  const user = getUser(c);
  const repoId = c.req.param("id");

  // Verify ownership
  const [repo] = await db
    .select()
    .from(connectedRepos)
    .where(and(eq(connectedRepos.id, repoId), eq(connectedRepos.userId, user.id)))
    .limit(1);

  if (!repo) {
    return c.json({ error: "Repository not found" }, 404);
  }

  // Get all files
  const files = await db
    .select({
      path: repoFiles.path,
      fileType: repoFiles.fileType,
      sizeBytes: repoFiles.sizeBytes,
      language: repoFiles.language,
    })
    .from(repoFiles)
    .where(eq(repoFiles.repoId, repoId))
    .orderBy(repoFiles.path);

  // Build tree structure
  interface TreeNode {
    name: string;
    type: "file" | "directory";
    path: string;
    fileType?: string;
    language?: string;
    size?: number;
    children?: TreeNode[];
  }

  const root: TreeNode = { name: repo.name, type: "directory", path: "", children: [] };

  for (const file of files) {
    const parts = file.path.split("/");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join("/");

      if (!current.children) current.children = [];

      let child = current.children.find((c) => c.name === part);
      if (!child) {
        child = {
          name: part,
          type: isFile ? "file" : "directory",
          path: currentPath,
          ...(isFile && {
            fileType: file.fileType,
            language: file.language || undefined,
            size: file.sizeBytes,
          }),
        };
        current.children.push(child);
      }
      current = child as TreeNode;
    }
  }

  return c.json({ structure: root });
});

// ============================================================================
// Repository indexing function
// ============================================================================

async function indexRepository(
  env: Env,
  db: Database,
  repo: typeof connectedRepos.$inferSelect,
  token: string
): Promise<void> {
  const now = new Date().toISOString();

  try {
    // Get repo tree from GitHub
    const treeResponse = await fetch(
      `https://api.github.com/repos/${repo.fullName}/git/trees/${repo.defaultBranch}?recursive=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Nexus-API",
        },
      }
    );

    if (!treeResponse.ok) {
      throw new Error(`Failed to get repo tree: ${treeResponse.status}`);
    }

    const tree = (await treeResponse.json()) as {
      tree: Array<{
        path: string;
        type: string;
        sha: string;
        size?: number;
      }>;
    };

    // Filter files based on patterns
    const includePatterns = repo.includePatterns || SMART_INCLUDE_PATTERNS;
    const excludePatterns = repo.excludePatterns || SMART_EXCLUDE_PATTERNS;

    const filesToIndex = tree.tree.filter((item) => {
      if (item.type !== "blob") return false;

      // Check exclude patterns first
      for (const pattern of excludePatterns) {
        if (matchGlob(item.path, pattern)) return false;
      }

      // Check include patterns
      for (const pattern of includePatterns) {
        if (matchGlob(item.path, pattern)) return true;
      }

      return false;
    });

    // Delete existing files
    await db.delete(repoFiles).where(eq(repoFiles.repoId, repo.id));

    let totalBytes = 0;
    let indexedCount = 0;

    // Index each file (limit to prevent timeout)
    const maxFiles = 100;
    const filesToProcess = filesToIndex.slice(0, maxFiles);

    for (const file of filesToProcess) {
      try {
        // Get file content
        const contentResponse = await fetch(
          `https://api.github.com/repos/${repo.fullName}/contents/${encodeURIComponent(file.path)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github.v3.raw",
              "User-Agent": "Nexus-API",
            },
          }
        );

        if (!contentResponse.ok) continue;

        const content = await contentResponse.text();
        const sizeBytes = new TextEncoder().encode(content).length;
        totalBytes += sizeBytes;

        // Determine file type
        const fileType = categorizeFile(file.path);
        const language = getLanguage(file.path);

        // Store in R2
        const r2Key = `${repo.r2Prefix}/${file.path}`;
        if (env.DOCS_BUCKET) {
          await env.DOCS_BUCKET.put(r2Key, content, {
            httpMetadata: { contentType: "text/plain" },
          });
        }

        // Save file record
        await db.insert(repoFiles).values({
          id: crypto.randomUUID(),
          repoId: repo.id,
          path: file.path,
          fileType,
          language,
          r2Key,
          contentHash: file.sha,
          sizeBytes,
          lineCount: content.split("\n").length,
          lastCommitSha: file.sha,
          createdAt: now,
          updatedAt: now,
        });

        indexedCount++;
      } catch (error) {
        console.error(`Failed to index file ${file.path}:`, error);
      }
    }

    // Update repo status
    await db
      .update(connectedRepos)
      .set({
        indexStatus: "indexed",
        lastIndexedAt: now,
        totalFiles: filesToIndex.length,
        totalBytes,
        indexedFiles: indexedCount,
        updatedAt: now,
      })
      .where(eq(connectedRepos.id, repo.id));
  } catch (error) {
    // Update status to failed
    await db
      .update(connectedRepos)
      .set({
        indexStatus: "failed",
        indexError: error instanceof Error ? error.message : "Unknown error",
        updatedAt: now,
      })
      .where(eq(connectedRepos.id, repo.id));
  }
}

// ============================================================================
// Helper functions
// ============================================================================

function matchGlob(path: string, pattern: string): boolean {
  // Simple glob matching
  const regex = pattern
    .replace(/\*\*/g, "___DOUBLESTAR___")
    .replace(/\*/g, "[^/]*")
    .replace(/___DOUBLESTAR___/g, ".*")
    .replace(/\?/g, ".");

  return new RegExp(`^${regex}$`).test(path);
}

function categorizeFile(
  path: string
): "readme" | "docs" | "config" | "types" | "source" | "test" | "other" {
  const lower = path.toLowerCase();
  if (lower.includes("readme")) return "readme";
  if (lower.includes("docs/") || lower.includes("documentation/")) return "docs";
  if (lower.includes(".d.ts") || lower.includes("types") || lower.includes("interfaces"))
    return "types";
  if (lower.includes("test") || lower.includes("spec")) return "test";
  if (
    lower.endsWith(".json") ||
    lower.endsWith(".toml") ||
    lower.endsWith(".yaml") ||
    lower.endsWith(".yml") ||
    lower.includes("config")
  )
    return "config";
  if (
    lower.endsWith(".ts") ||
    lower.endsWith(".tsx") ||
    lower.endsWith(".js") ||
    lower.endsWith(".jsx") ||
    lower.endsWith(".py") ||
    lower.endsWith(".go") ||
    lower.endsWith(".rs")
  )
    return "source";
  return "other";
}

function getLanguage(path: string): string | null {
  const ext = path.split(".").pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    py: "python",
    go: "go",
    rs: "rust",
    rb: "ruby",
    java: "java",
    kt: "kotlin",
    swift: "swift",
    c: "c",
    cpp: "cpp",
    h: "c",
    hpp: "cpp",
    cs: "csharp",
    php: "php",
    md: "markdown",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    toml: "toml",
    sql: "sql",
  };
  return ext ? langMap[ext] || null : null;
}

export default reposRouter;
