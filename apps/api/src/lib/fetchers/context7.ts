/**
 * Context7 Documentation Fetcher
 *
 * Fetches pre-indexed documentation from Context7's API.
 * Context7 provides high-quality, AI-ready documentation with code snippets
 * already chunked and ready for embedding.
 *
 * API Documentation: https://context7.com/docs/api-guide.md
 */

const CONTEXT7_API_URL = "https://context7.com/api/v2";

export interface Context7DocResult {
  title: string;
  content: string;
  sourceFile: string | null;
  url: string | null;
}

interface Context7CodeSnippet {
  codeTitle: string;
  codeDescription: string;
  codeLanguage: string;
  codeTokens: number;
  codeId: string; // URL to the source file
  pageTitle: string;
  codeList: Array<{
    language: string;
    code: string;
  }>;
}

interface Context7InfoSnippet {
  pageId: string; // URL to the source page
  breadcrumb: string;
  content: string;
  contentTokens: number;
}

interface Context7ContextResponse {
  codeSnippets: Context7CodeSnippet[];
  infoSnippets: Context7InfoSnippet[];
}

/**
 * Fetch documentation from Context7 for a given library.
 *
 * Since Context7 is query-based, we use broad queries to fetch comprehensive docs.
 * We make multiple queries to cover different aspects of the library.
 *
 * @param context7LibraryId - The Context7 library ID (e.g., "/websites/react_dev")
 * @param apiKey - Optional Context7 API key for higher rate limits
 * @param queries - Optional array of queries to fetch (defaults to comprehensive list)
 */
export async function fetchContext7Docs(
  context7LibraryId: string,
  apiKey?: string,
  queries: string[] = getDefaultQueries()
): Promise<Array<{ path: string; content: string }>> {
  const allDocs: Map<string, { path: string; content: string }> = new Map();

  console.log(`Fetching docs from Context7 for ${context7LibraryId}`);

  let successfulQueries = 0;
  let failedQueries = 0;

  for (const query of queries) {
    try {
      const results = await queryContext7(context7LibraryId, query, apiKey);
      successfulQueries++;

      for (const result of results) {
        // Use a hash of the content as a unique key to avoid duplicates
        const key = hashContent(result.content);
        if (!allDocs.has(key)) {
          allDocs.set(key, {
            path: result.sourceFile || `context7/${sanitizeFilename(result.title || "doc")}.md`,
            content: formatDocContent(result),
          });
        }
      }

      // Small delay to avoid rate limiting
      await sleep(200);
    } catch (error) {
      failedQueries++;
      console.error(`Failed to query Context7 for "${query}":`, error);
    }
  }

  console.log(
    `Context7 fetch complete: ${successfulQueries} successful, ${failedQueries} failed, ${allDocs.size} unique docs`
  );

  console.log(`Fetched ${allDocs.size} unique docs from Context7`);
  return Array.from(allDocs.values());
}

/**
 * Query Context7 API for documentation.
 * Uses GET /api/v2/context endpoint.
 *
 * The API returns two types of snippets:
 * - codeSnippets: Code examples with descriptions
 * - infoSnippets: Documentation text content
 */
async function queryContext7(
  libraryId: string,
  query: string,
  apiKey?: string
): Promise<Context7DocResult[]> {
  const params = new URLSearchParams({
    libraryId,
    query,
    type: "json",
  });

  const url = `${CONTEXT7_API_URL}/context?${params.toString()}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  // Add API key if provided
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Context7 API error: ${response.status} ${response.statusText} - ${text}`);
  }

  const data = (await response.json()) as Context7ContextResponse;

  const results: Context7DocResult[] = [];

  // Process code snippets
  if (data.codeSnippets && Array.isArray(data.codeSnippets)) {
    for (const snippet of data.codeSnippets) {
      // Format code examples from the codeList
      const codeExamples = snippet.codeList
        .map((c) => `\`\`\`${c.language}\n${c.code}\n\`\`\``)
        .join("\n\n");

      const content = [snippet.codeDescription, "", codeExamples].join("\n");

      results.push({
        title: snippet.codeTitle || snippet.pageTitle,
        content,
        sourceFile: extractSourceFile(snippet.codeId),
        url: snippet.codeId,
      });
    }
  }

  // Process info snippets
  if (data.infoSnippets && Array.isArray(data.infoSnippets)) {
    for (const snippet of data.infoSnippets) {
      results.push({
        title: snippet.breadcrumb,
        content: snippet.content,
        sourceFile: extractSourceFile(snippet.pageId),
        url: snippet.pageId,
      });
    }
  }

  return results;
}

/**
 * Get default queries to comprehensively fetch library documentation.
 * These queries are designed to cover common documentation topics.
 */
function getDefaultQueries(): string[] {
  return [
    // Getting started
    "getting started installation setup quickstart",
    "basic usage example tutorial",

    // Core concepts
    "core concepts fundamentals introduction overview",
    "configuration options settings",
    "API reference methods functions",

    // Common patterns
    "best practices patterns recommendations",
    "error handling debugging troubleshooting",
    "performance optimization",

    // Advanced topics
    "advanced usage features",
    "middleware plugins extensions",
    "testing integration unit",

    // Type safety and TypeScript
    "typescript types type safety",

    // Deployment and production
    "deployment production build",

    // Migration and updates
    "migration upgrade version",
  ];
}

/**
 * Format a doc result into markdown content.
 */
function formatDocContent(result: Context7DocResult): string {
  const parts: string[] = [];

  if (result.title) {
    parts.push(`# ${result.title}`);
    parts.push("");
  }

  if (result.url) {
    parts.push(`Source: ${result.url}`);
    parts.push("");
  }

  parts.push(result.content);

  return parts.join("\n");
}

/**
 * Extract source file path from a URL.
 */
function extractSourceFile(url: string | undefined): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    return parsed.pathname;
  } catch {
    return null;
  }
}

/**
 * Simple hash function for content deduplication.
 */
function hashContent(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

/**
 * Sleep helper.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Sanitize a string to be used as a filename.
 */
function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

/**
 * Get library metadata from Context7.
 * Note: Context7 doesn't have a dedicated metadata endpoint,
 * so we return minimal info based on the library ID.
 */
export function getContext7LibraryMetadata(context7LibraryId: string): {
  description?: string;
  homepage?: string;
} {
  // Extract org/project from the library ID (e.g., "/vercel/next.js" -> "vercel/next.js")
  const parts = context7LibraryId.replace(/^\//, "").split("/");

  if (parts.length >= 2) {
    const [org, project] = parts;

    // If it's a GitHub-style ID, construct the GitHub URL
    if (!org.startsWith("websites") && !org.startsWith("llmstxt")) {
      return {
        homepage: `https://github.com/${org}/${project}`,
      };
    }
  }

  return {};
}
