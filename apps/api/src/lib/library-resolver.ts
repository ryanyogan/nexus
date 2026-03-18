/**
 * Library Resolver Module
 *
 * Resolves library names to GitHub repos and queues for indexing.
 * Flow: npm registry → GitHub search → star check → queue job
 */

import { eq, or, like, sql } from "drizzle-orm";
import { libraries, type Database } from "@nexus/db";
import type { IngestionJob } from "../types";
import { resolvePackageFromNpm } from "./fetchers/npm";

// ============================================================================
// Constants
// ============================================================================

const GITHUB_API = "https://api.github.com";
const GITHUB_TIMEOUT = 5000;
const DEFAULT_MIN_STARS = 100;

// ============================================================================
// Types
// ============================================================================

export type ResolveStatus = "queued" | "indexing" | "indexed" | "rejected";

export interface ResolveResult {
  found: boolean;
  status: ResolveStatus;
  libraryId?: string;
  libraryName?: string;
  repositoryUrl?: string;
  description?: string;
  reason?: string;
  estimatedReadyIn?: number;
}

interface GitHubRepoInfo {
  owner: string;
  repo: string;
  fullName: string;
  description: string | null;
  homepage: string | null;
  stars: number;
  defaultBranch: string;
}

// ============================================================================
// Main Function
// ============================================================================

/**
 * Resolve a library name and queue it for indexing if not already present.
 *
 * Steps:
 * 1. Check if library already exists in database
 * 2. Try npm registry to get GitHub URL
 * 3. Fall back to GitHub search if npm fails
 * 4. Verify minimum star count
 * 5. Create library record and queue ingestion job
 */
export async function resolveAndQueueLibrary(
  libraryName: string,
  db: Database,
  env: Env
): Promise<ResolveResult> {
  const normalizedName = libraryName.toLowerCase().trim();

  // 1. Check if already exists (any status including failed)
  const existing = await findExistingLibrary(normalizedName, db);
  if (existing) {
    if (existing.indexStatus === "indexed") {
      return {
        found: true,
        status: "indexed",
        libraryId: existing.id,
        libraryName: existing.name,
      };
    }
    if (existing.indexStatus === "indexing" || existing.indexStatus === "pending") {
      return {
        found: true,
        status: "indexing",
        libraryId: existing.id,
        libraryName: existing.name,
        estimatedReadyIn: 30,
      };
    }
    // Failed status - could retry, but for now just report it
    if (existing.indexStatus === "failed") {
      return {
        found: false,
        status: "rejected",
        reason: `Library "${normalizedName}" previously failed to index. Contact support to retry.`,
      };
    }
  }

  // 2. Check auto-index rate limit
  if (env.AUTO_INDEX_LIMITER) {
    const autoIndexLimiter = env.AUTO_INDEX_LIMITER;
    // Use a generic key for now - could be enhanced with user ID from auth
    const rateLimitKey = `autoindex:global`;
    try {
      const { success } = await autoIndexLimiter.limit({ key: rateLimitKey });
      if (!success) {
        return {
          found: false,
          status: "rejected",
          reason: "Auto-indexing rate limit exceeded. Try again in a few minutes.",
        };
      }
    } catch (error) {
      // Fail open if rate limiter errors
      console.warn("Auto-index rate limit check failed:", error);
    }
  }

  // 3. Try npm registry first
  const npmInfo = await resolvePackageFromNpm(normalizedName);
  let githubUrl = npmInfo?.repositoryUrl;

  // 4. If no npm result, try GitHub search
  if (!githubUrl) {
    githubUrl = await searchGitHubForRepo(normalizedName, env);
  }

  if (!githubUrl) {
    return {
      found: false,
      status: "rejected",
      reason: `Could not find a GitHub repository for "${libraryName}". Submit it manually at nexus.yogan.dev/submit`,
    };
  }

  // 5. Check if library with this repo URL already exists
  const existingByUrl = await findLibraryByRepoUrl(githubUrl, db);
  if (existingByUrl) {
    if (existingByUrl.indexStatus === "indexed") {
      return {
        found: true,
        status: "indexed",
        libraryId: existingByUrl.id,
        libraryName: existingByUrl.name,
      };
    }
    if (existingByUrl.indexStatus === "indexing" || existingByUrl.indexStatus === "pending") {
      return {
        found: true,
        status: "indexing",
        libraryId: existingByUrl.id,
        libraryName: existingByUrl.name,
        estimatedReadyIn: 30,
      };
    }
  }

  // 6. Fetch GitHub repo info to verify and check stars
  const repoInfo = await getGitHubRepoInfo(githubUrl, env);
  if (!repoInfo) {
    return {
      found: false,
      status: "rejected",
      reason: "Could not fetch repository information from GitHub. It may be private or rate limited.",
    };
  }

  // 6. Check minimum stars
  const minStars = env.MIN_GITHUB_STARS
    ? parseInt(env.MIN_GITHUB_STARS, 10)
    : DEFAULT_MIN_STARS;

  if (repoInfo.stars < minStars) {
    return {
      found: false,
      status: "rejected",
      reason: `Library has ${repoInfo.stars} GitHub stars (minimum: ${minStars}). Submit for manual review at nexus.yogan.dev/submit`,
    };
  }

  // 7. Create library record and queue job
  const libraryId = generateLibraryId(normalizedName, repoInfo);

  try {
    await createLibraryRecord(
      {
        id: libraryId,
        name: repoInfo.repo,
        description: npmInfo?.description || repoInfo.description,
        repositoryUrl: githubUrl,
        homepageUrl: npmInfo?.homepageUrl || repoInfo.homepage,
        owner: repoInfo.owner,
        repo: repoInfo.repo,
        branch: repoInfo.defaultBranch,
        stars: repoInfo.stars,
      },
      db
    );

    await queueIngestionJob(libraryId, githubUrl, env);

    return {
      found: true,
      status: "queued",
      libraryId,
      libraryName: repoInfo.repo,
      repositoryUrl: githubUrl,
      description: npmInfo?.description || repoInfo.description || undefined,
      estimatedReadyIn: 30,
    };
  } catch (error) {
    // Handle race condition - library may have been created by another request
    if (error instanceof Error && error.message.includes("UNIQUE constraint")) {
      const created = await findExistingLibrary(normalizedName, db);
      if (created) {
        return {
          found: true,
          status: created.indexStatus === "indexed" ? "indexed" : "indexing",
          libraryId: created.id,
          libraryName: created.name,
          estimatedReadyIn: created.indexStatus === "indexing" ? 30 : undefined,
        };
      }
    }
    throw error;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Find an existing library by name (case-insensitive).
 */
async function findExistingLibrary(
  name: string,
  db: Database
): Promise<{ id: string; name: string; indexStatus: string } | null> {
  const [library] = await db
    .select({
      id: libraries.id,
      name: libraries.name,
      indexStatus: libraries.indexStatus,
    })
    .from(libraries)
    .where(or(eq(libraries.id, name), like(sql`lower(${libraries.name})`, name)))
    .limit(1);

  return library || null;
}

/**
 * Find an existing library by repository URL.
 */
async function findLibraryByRepoUrl(
  repoUrl: string,
  db: Database
): Promise<{ id: string; name: string; indexStatus: string } | null> {
  const [library] = await db
    .select({
      id: libraries.id,
      name: libraries.name,
      indexStatus: libraries.indexStatus,
    })
    .from(libraries)
    .where(eq(libraries.repositoryUrl, repoUrl))
    .limit(1);

  return library || null;
}

/**
 * Search GitHub for a repository by name.
 * Returns the URL of the top result by stars.
 */
async function searchGitHubForRepo(
  query: string,
  env: Env
): Promise<string | null> {
  const searchUrl = `${GITHUB_API}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&per_page=1`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GITHUB_TIMEOUT);

  try {
    const token = (env as { GITHUB_TOKEN?: string }).GITHUB_TOKEN;

    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Nexus-Docs-Indexer/1.0",
        Accept: "application/vnd.github+json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      console.warn(`GitHub search failed: ${res.status}`);
      return null;
    }

    const data = (await res.json()) as {
      items?: Array<{ html_url: string; full_name: string }>;
    };

    return data.items?.[0]?.html_url || null;
  } catch (error) {
    console.warn("GitHub search error:", error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fetch repository info from GitHub API.
 */
async function getGitHubRepoInfo(
  url: string,
  env: Env
): Promise<GitHubRepoInfo | null> {
  // Extract owner/repo from URL
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;

  const [, owner, repo] = match;
  const apiUrl = `${GITHUB_API}/repos/${owner}/${repo}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GITHUB_TIMEOUT);

  try {
    const token = (env as { GITHUB_TOKEN?: string }).GITHUB_TOKEN;

    const res = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Nexus-Docs-Indexer/1.0",
        Accept: "application/vnd.github+json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      console.warn(`GitHub repo info failed: ${res.status}`);
      return null;
    }

    const data = (await res.json()) as {
      full_name: string;
      description: string | null;
      homepage: string | null;
      stargazers_count: number;
      default_branch: string;
    };

    return {
      owner,
      repo,
      fullName: data.full_name,
      description: data.description,
      homepage: data.homepage,
      stars: data.stargazers_count,
      defaultBranch: data.default_branch,
    };
  } catch (error) {
    console.warn("GitHub repo info error:", error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Generate a library ID from the package name and repo info.
 */
function generateLibraryId(name: string, repoInfo: GitHubRepoInfo): string {
  // Use repo name as ID, lowercase, only alphanumeric and hyphens
  return repoInfo.repo.toLowerCase().replace(/[^a-z0-9-]/g, "-");
}

/**
 * Create a library record in the database.
 */
async function createLibraryRecord(
  data: {
    id: string;
    name: string;
    description: string | null;
    repositoryUrl: string;
    homepageUrl: string | null;
    owner: string;
    repo: string;
    branch: string;
    stars: number;
  },
  db: Database
): Promise<void> {
  const now = new Date().toISOString();

  await db.insert(libraries).values({
    id: data.id,
    name: data.name,
    description: data.description,
    sourceType: "github",
    sourceUrl: data.repositoryUrl,
    repositoryUrl: data.repositoryUrl,
    homepageUrl: data.homepageUrl,
    githubOwner: data.owner,
    githubRepo: data.repo,
    githubBranch: data.branch,
    githubStars: data.stars,
    indexStatus: "pending",
    categories: [],
    isActive: true,
    isFeatured: false,
    createdAt: now,
    updatedAt: now,
  });
}

/**
 * Queue an ingestion job for the library.
 */
async function queueIngestionJob(
  libraryId: string,
  sourceUrl: string,
  env: Env
): Promise<void> {
  const job: IngestionJob = {
    libraryId,
    sourceUrl,
    sourceType: "github",
  };

  await env.INGESTION_QUEUE.send(job);

  console.log(`Queued ingestion job for ${libraryId}`);
}
