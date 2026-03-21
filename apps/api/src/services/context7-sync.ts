/**
 * Context7 Sync Service
 *
 * Syncs library documentation and metadata from Context7 API.
 * Runs weekly to keep our library metadata and documentation up to date.
 *
 * API Reference:
 * - Search: GET https://context7.com/api/v2/libs/search?libraryName={name}&query={query}
 * - Context: GET https://context7.com/api/v2/context?libraryId={id}&query={query}&type=json
 */

import { TOP_LIBRARIES, type LibraryEntry } from "../data/top-libraries";

// ============================================================================
// Types
// ============================================================================

const CONTEXT7_API_URL = "https://context7.com/api/v2";

interface Context7SearchResult {
  libraryId: string; // e.g., "/vercel/next.js"
  name: string;
  description?: string;
  codeSnippets: number;
  sourceReputation: "High" | "Medium" | "Low" | "Unknown";
  benchmarkScore: number; // 0-100
  versions?: string[];
}

interface Context7SearchResponse {
  results: Context7SearchResult[];
}

interface Context7CodeSnippet {
  codeTitle: string;
  codeDescription: string;
  codeLanguage: string;
  codeTokens: number;
  codeId: string;
  pageTitle: string;
  codeList: Array<{
    language: string;
    code: string;
  }>;
}

interface Context7InfoSnippet {
  pageId: string;
  breadcrumb: string;
  content: string;
  contentTokens: number;
}

interface Context7ContextResponse {
  codeSnippets: Context7CodeSnippet[];
  infoSnippets: Context7InfoSnippet[];
}

interface Context7LibraryMetadata {
  libraryId: string;
  name: string;
  description?: string;
  totalSnippets: number;
  trustScore: number; // 0-10 based on sourceReputation
  benchmarkScore: number; // 0-100
  versions: string[];
}

interface Context7DocumentContent {
  codeSnippets: Array<{
    title: string;
    description: string;
    language: string;
    tokens: number;
    sourceUrl: string;
    code: string;
  }>;
  infoSnippets: Array<{
    pageUrl: string;
    breadcrumb: string;
    content: string;
    tokens: number;
  }>;
}

export interface SyncResult {
  jobId: string;
  status: "completed" | "failed";
  totalItems: number;
  processedItems: number;
  successfulItems: number;
  failedItems: number;
  errors: Array<{ item: string; error: string }>;
  startedAt: string;
  completedAt: string;
  durationMs: number;
}

export interface SyncJob {
  id: string;
  type: "context7_libraries";
  status: "pending" | "running" | "completed" | "failed";
  totalItems: number;
  processedItems: number;
  successfulItems: number;
  failedItems: number;
  errors: Array<{ item: string; error: string }>;
  triggeredBy: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

// Environment interface for Cloudflare Workers
interface SyncEnv {
  DB: D1Database;
  DOCS_BUCKET: R2Bucket;
  CONTEXT7_API_KEY?: string;
}

// ============================================================================
// Comprehensive Queries for Full Documentation Coverage
// ============================================================================

const COMPREHENSIVE_QUERIES = [
  "getting started installation setup",
  "API reference methods functions",
  "examples tutorials guides",
  "configuration options",
  "best practices patterns",
  "error handling debugging",
  "typescript types",
  "hooks components",
  "middleware plugins",
  "testing integration",
];

// ============================================================================
// Rate Limiting & Retry Logic
// ============================================================================

const BATCH_SIZE = 15; // Libraries to process in parallel
const DELAY_BETWEEN_BATCHES_MS = 2000; // 2 seconds between batches
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = INITIAL_RETRY_DELAY_MS
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;

    // Check for rate limit error
    const isRateLimit =
      error instanceof Error &&
      (error.message.includes("429") || error.message.includes("rate limit"));

    const waitTime = isRateLimit ? delay * 2 : delay;
    await sleep(waitTime);

    return withRetry(fn, retries - 1, delay * 2);
  }
}

// ============================================================================
// Context7 API Functions
// ============================================================================

/**
 * Search for a library in Context7.
 */
async function searchLibrary(
  libraryName: string,
  searchQuery: string,
  apiKey?: string
): Promise<Context7SearchResult | null> {
  const params = new URLSearchParams({
    libraryName,
    query: searchQuery,
  });

  const url = `${CONTEXT7_API_URL}/libs/search?${params.toString()}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Context7 search error: ${response.status} ${response.statusText} - ${text}`);
  }

  const data = (await response.json()) as Context7SearchResponse;

  // Return the first/best matching result
  if (data.results && data.results.length > 0) {
    return data.results[0];
  }

  return null;
}

/**
 * Fetch documentation content from Context7.
 */
async function fetchDocumentation(
  libraryId: string,
  query: string,
  apiKey?: string
): Promise<Context7ContextResponse> {
  const params = new URLSearchParams({
    libraryId,
    query,
    type: "json",
  });

  const url = `${CONTEXT7_API_URL}/context?${params.toString()}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Context7 context error: ${response.status} ${response.statusText} - ${text}`);
  }

  return (await response.json()) as Context7ContextResponse;
}

/**
 * Convert source reputation to numeric trust score (0-10).
 */
function reputationToTrustScore(reputation: "High" | "Medium" | "Low" | "Unknown"): number {
  switch (reputation) {
    case "High":
      return 9;
    case "Medium":
      return 6;
    case "Low":
      return 3;
    case "Unknown":
    default:
      return 1;
  }
}

// ============================================================================
// Sync Functions
// ============================================================================

/**
 * Create a new sync job in the database.
 */
async function createSyncJob(
  env: SyncEnv,
  totalItems: number,
  triggeredBy: string
): Promise<string> {
  const jobId = crypto.randomUUID();
  const now = new Date().toISOString();

  await env.DB.prepare(
    `INSERT INTO sync_jobs (id, type, status, total_items, processed_items, successful_items, failed_items, errors, triggered_by, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(jobId, "context7_libraries", "pending", totalItems, 0, 0, 0, "[]", triggeredBy, now)
    .run();

  return jobId;
}

/**
 * Update sync job progress.
 */
async function updateSyncJobProgress(
  env: SyncEnv,
  jobId: string,
  updates: {
    status?: "pending" | "running" | "completed" | "failed";
    processedItems?: number;
    successfulItems?: number;
    failedItems?: number;
    errors?: Array<{ item: string; error: string }>;
    startedAt?: string;
    completedAt?: string;
  }
): Promise<void> {
  const setClauses: string[] = [];
  const values: (string | number)[] = [];

  if (updates.status !== undefined) {
    setClauses.push("status = ?");
    values.push(updates.status);
  }
  if (updates.processedItems !== undefined) {
    setClauses.push("processed_items = ?");
    values.push(updates.processedItems);
  }
  if (updates.successfulItems !== undefined) {
    setClauses.push("successful_items = ?");
    values.push(updates.successfulItems);
  }
  if (updates.failedItems !== undefined) {
    setClauses.push("failed_items = ?");
    values.push(updates.failedItems);
  }
  if (updates.errors !== undefined) {
    setClauses.push("errors = ?");
    values.push(JSON.stringify(updates.errors));
  }
  if (updates.startedAt !== undefined) {
    setClauses.push("started_at = ?");
    values.push(updates.startedAt);
  }
  if (updates.completedAt !== undefined) {
    setClauses.push("completed_at = ?");
    values.push(updates.completedAt);
  }

  if (setClauses.length === 0) return;

  values.push(jobId);

  await env.DB.prepare(`UPDATE sync_jobs SET ${setClauses.join(", ")} WHERE id = ?`)
    .bind(...values)
    .run();
}

/**
 * Sync a single library from Context7.
 */
async function syncSingleLibrary(
  env: SyncEnv,
  library: LibraryEntry,
  apiKey?: string
): Promise<void> {
  // Step 1: Search for the library in Context7
  const searchResult = await withRetry(() =>
    searchLibrary(library.name, library.searchQuery, apiKey)
  );

  if (!searchResult) {
    throw new Error(`Library not found in Context7: ${library.name}`);
  }

  const metadata: Context7LibraryMetadata = {
    libraryId: searchResult.libraryId,
    name: searchResult.name,
    description: searchResult.description,
    totalSnippets: searchResult.codeSnippets,
    trustScore: reputationToTrustScore(searchResult.sourceReputation),
    benchmarkScore: searchResult.benchmarkScore,
    versions: searchResult.versions || [],
  };

  // Step 2: Fetch full documentation content with comprehensive queries
  const allContent: Context7DocumentContent = {
    codeSnippets: [],
    infoSnippets: [],
  };

  const seenCodeIds = new Set<string>();
  const seenPageIds = new Set<string>();

  for (const query of COMPREHENSIVE_QUERIES) {
    try {
      await sleep(100); // Small delay between queries to respect rate limits

      const response = await withRetry(() =>
        fetchDocumentation(searchResult.libraryId, query, apiKey)
      );

      // Process code snippets (deduplicate by codeId)
      for (const snippet of response.codeSnippets || []) {
        if (!seenCodeIds.has(snippet.codeId)) {
          seenCodeIds.add(snippet.codeId);

          // Combine all code from codeList
          const combinedCode = snippet.codeList
            .map((c) => `// ${c.language}\n${c.code}`)
            .join("\n\n");

          allContent.codeSnippets.push({
            title: snippet.codeTitle || snippet.pageTitle,
            description: snippet.codeDescription,
            language: snippet.codeLanguage,
            tokens: snippet.codeTokens,
            sourceUrl: snippet.codeId,
            code: combinedCode,
          });
        }
      }

      // Process info snippets (deduplicate by pageId)
      for (const snippet of response.infoSnippets || []) {
        if (!seenPageIds.has(snippet.pageId)) {
          seenPageIds.add(snippet.pageId);

          allContent.infoSnippets.push({
            pageUrl: snippet.pageId,
            breadcrumb: snippet.breadcrumb,
            content: snippet.content,
            tokens: snippet.contentTokens,
          });
        }
      }
    } catch (error) {
      // Log but continue with other queries
      console.warn(`Failed to fetch docs for ${library.name} with query "${query}":`, error);
    }
  }

  // Step 3: Store documentation content in R2
  const r2Key = `context7/${library.name}/documentation.json`;
  const documentContent = JSON.stringify(
    {
      metadata,
      content: allContent,
      syncedAt: new Date().toISOString(),
    },
    null,
    2
  );

  await env.DOCS_BUCKET.put(r2Key, documentContent, {
    httpMetadata: {
      contentType: "application/json",
    },
    customMetadata: {
      library: library.name,
      context7Id: searchResult.libraryId,
      totalCodeSnippets: String(allContent.codeSnippets.length),
      totalInfoSnippets: String(allContent.infoSnippets.length),
    },
  });

  // Step 4: Update library record in D1 database
  const now = new Date().toISOString();

  // Check if library exists
  const existingLibrary = await env.DB.prepare(`SELECT id FROM libraries WHERE id = ?`)
    .bind(library.name)
    .first();

  if (existingLibrary) {
    // Update existing library with Context7 metadata
    await env.DB.prepare(
      `UPDATE libraries SET
        context7_id = ?,
        context7_trust_score = ?,
        context7_benchmark_score = ?,
        context7_total_snippets = ?,
        context7_state = ?,
        context7_synced_at = ?,
        versions = ?,
        description = COALESCE(description, ?),
        updated_at = ?
       WHERE id = ?`
    )
      .bind(
        metadata.libraryId,
        metadata.trustScore,
        Math.round(metadata.benchmarkScore * 100), // Store as integer * 100
        metadata.totalSnippets,
        "finalized",
        now,
        JSON.stringify(metadata.versions),
        metadata.description || null,
        now,
        library.name
      )
      .run();
  } else {
    // Insert new library record
    await env.DB.prepare(
      `INSERT INTO libraries (
        id, name, description, source_type, source_url, context7_id,
        context7_trust_score, context7_benchmark_score, context7_total_snippets,
        context7_state, context7_synced_at, versions, categories,
        is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        library.name,
        library.name,
        metadata.description || null,
        "context7",
        `https://context7.com${metadata.libraryId}`,
        metadata.libraryId,
        metadata.trustScore,
        Math.round(metadata.benchmarkScore * 100),
        metadata.totalSnippets,
        "finalized",
        now,
        JSON.stringify(metadata.versions),
        JSON.stringify(library.categories),
        1, // is_active = true
        now,
        now
      )
      .run();
  }
}

/**
 * Process a batch of libraries in parallel.
 */
async function processBatch(
  env: SyncEnv,
  libraries: LibraryEntry[],
  apiKey?: string
): Promise<Array<{ library: string; success: boolean; error?: string }>> {
  const results = await Promise.allSettled(
    libraries.map(async (lib) => {
      try {
        await syncSingleLibrary(env, lib, apiKey);
        return { library: lib.name, success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { library: lib.name, success: false, error: errorMessage };
      }
    })
  );

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    }
    return {
      library: libraries[index].name,
      success: false,
      error: result.reason?.message || "Unknown error",
    };
  });
}

// ============================================================================
// Exported Functions
// ============================================================================

/**
 * Sync all libraries from Context7.
 * Processes in batches to respect rate limits.
 */
export async function syncAllLibraries(env: SyncEnv, triggeredBy: string): Promise<SyncResult> {
  const startTime = Date.now();
  const startedAt = new Date().toISOString();

  const libraries = TOP_LIBRARIES;
  const totalItems = libraries.length;

  // Create sync job
  const jobId = await createSyncJob(env, totalItems, triggeredBy);

  // Mark as running
  await updateSyncJobProgress(env, jobId, {
    status: "running",
    startedAt,
  });

  const apiKey = env.CONTEXT7_API_KEY;

  let processedItems = 0;
  let successfulItems = 0;
  let failedItems = 0;
  const errors: Array<{ item: string; error: string }> = [];

  // Process in batches
  for (let i = 0; i < libraries.length; i += BATCH_SIZE) {
    const batch = libraries.slice(i, i + BATCH_SIZE);
    const batchResults = await processBatch(env, batch, apiKey);

    for (const result of batchResults) {
      processedItems++;
      if (result.success) {
        successfulItems++;
      } else {
        failedItems++;
        errors.push({
          item: result.library,
          error: result.error || "Unknown error",
        });
      }
    }

    // Update progress
    await updateSyncJobProgress(env, jobId, {
      processedItems,
      successfulItems,
      failedItems,
      errors,
    });

    // Log progress every 50 libraries
    if (processedItems % 50 === 0 || processedItems === totalItems) {
      console.log(
        `Sync progress: ${processedItems}/${totalItems} (${successfulItems} success, ${failedItems} failed)`
      );
    }

    // Delay between batches (unless this is the last batch)
    if (i + BATCH_SIZE < libraries.length) {
      await sleep(DELAY_BETWEEN_BATCHES_MS);
    }
  }

  const completedAt = new Date().toISOString();
  const durationMs = Date.now() - startTime;

  // Mark as completed
  await updateSyncJobProgress(env, jobId, {
    status: failedItems === totalItems ? "failed" : "completed",
    completedAt,
  });

  console.log(`Sync completed in ${durationMs}ms: ${successfulItems}/${totalItems} successful`);

  return {
    jobId,
    status: failedItems === totalItems ? "failed" : "completed",
    totalItems,
    processedItems,
    successfulItems,
    failedItems,
    errors,
    startedAt,
    completedAt,
    durationMs,
  };
}

/**
 * Sync a single library by name.
 */
export async function syncLibrary(env: SyncEnv, libraryName: string): Promise<void> {
  // Find library in our list
  const library = TOP_LIBRARIES.find((lib) => lib.name.toLowerCase() === libraryName.toLowerCase());

  if (!library) {
    // Create a default entry if not in our curated list
    const defaultEntry: LibraryEntry = {
      name: libraryName,
      searchQuery: `${libraryName} documentation`,
      categories: ["utilities"],
      priority: 1,
    };
    await syncSingleLibrary(env, defaultEntry, env.CONTEXT7_API_KEY);
    return;
  }

  await syncSingleLibrary(env, library, env.CONTEXT7_API_KEY);
}

/**
 * Get the status of a sync job.
 */
export async function getSyncStatus(env: SyncEnv, jobId: string): Promise<SyncJob | null> {
  const result = await env.DB.prepare(
    `SELECT id, type, status, total_items, processed_items, successful_items,
            failed_items, errors, triggered_by, started_at, completed_at, created_at
     FROM sync_jobs WHERE id = ?`
  )
    .bind(jobId)
    .first<{
      id: string;
      type: string;
      status: string;
      total_items: number;
      processed_items: number;
      successful_items: number;
      failed_items: number;
      errors: string;
      triggered_by: string | null;
      started_at: string | null;
      completed_at: string | null;
      created_at: string;
    }>();

  if (!result) return null;

  return {
    id: result.id,
    type: result.type as "context7_libraries",
    status: result.status as SyncJob["status"],
    totalItems: result.total_items,
    processedItems: result.processed_items,
    successfulItems: result.successful_items,
    failedItems: result.failed_items,
    errors: JSON.parse(result.errors || "[]"),
    triggeredBy: result.triggered_by,
    startedAt: result.started_at,
    completedAt: result.completed_at,
    createdAt: result.created_at,
  };
}

/**
 * Get the latest sync job for monitoring.
 */
export async function getLatestSyncJob(env: SyncEnv): Promise<SyncJob | null> {
  const result = await env.DB.prepare(
    `SELECT id, type, status, total_items, processed_items, successful_items,
            failed_items, errors, triggered_by, started_at, completed_at, created_at
     FROM sync_jobs
     WHERE type = 'context7_libraries'
     ORDER BY created_at DESC
     LIMIT 1`
  ).first<{
    id: string;
    type: string;
    status: string;
    total_items: number;
    processed_items: number;
    successful_items: number;
    failed_items: number;
    errors: string;
    triggered_by: string | null;
    started_at: string | null;
    completed_at: string | null;
    created_at: string;
  }>();

  if (!result) return null;

  return {
    id: result.id,
    type: result.type as "context7_libraries",
    status: result.status as SyncJob["status"],
    totalItems: result.total_items,
    processedItems: result.processed_items,
    successfulItems: result.successful_items,
    failedItems: result.failed_items,
    errors: JSON.parse(result.errors || "[]"),
    triggeredBy: result.triggered_by,
    startedAt: result.started_at,
    completedAt: result.completed_at,
    createdAt: result.created_at,
  };
}

/**
 * List all sync jobs with pagination.
 */
export async function listSyncJobs(
  env: SyncEnv,
  options: { limit?: number; offset?: number } = {}
): Promise<{ jobs: SyncJob[]; total: number }> {
  const limit = options.limit || 20;
  const offset = options.offset || 0;

  const [jobsResult, countResult] = await Promise.all([
    env.DB.prepare(
      `SELECT id, type, status, total_items, processed_items, successful_items,
              failed_items, errors, triggered_by, started_at, completed_at, created_at
       FROM sync_jobs
       WHERE type = 'context7_libraries'
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`
    )
      .bind(limit, offset)
      .all<{
        id: string;
        type: string;
        status: string;
        total_items: number;
        processed_items: number;
        successful_items: number;
        failed_items: number;
        errors: string;
        triggered_by: string | null;
        started_at: string | null;
        completed_at: string | null;
        created_at: string;
      }>(),
    env.DB.prepare(
      `SELECT COUNT(*) as count FROM sync_jobs WHERE type = 'context7_libraries'`
    ).first<{ count: number }>(),
  ]);

  const jobs: SyncJob[] = (jobsResult.results || []).map((row) => ({
    id: row.id,
    type: row.type as "context7_libraries",
    status: row.status as SyncJob["status"],
    totalItems: row.total_items,
    processedItems: row.processed_items,
    successfulItems: row.successful_items,
    failedItems: row.failed_items,
    errors: JSON.parse(row.errors || "[]"),
    triggeredBy: row.triggered_by,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
  }));

  return {
    jobs,
    total: countResult?.count || 0,
  };
}
