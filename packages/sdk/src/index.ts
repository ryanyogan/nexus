/**
 * @nexus/sdk - Official Nexus SDK
 *
 * Documentation search, memory management, MCP server discovery,
 * and OpenCode remote tunnel capabilities.
 *
 * @example
 * ```typescript
 * import { Nexus } from "@nexus/sdk";
 *
 * const nexus = new Nexus({ apiKey: "your-api-key" });
 *
 * // Search for libraries
 * const libraries = await nexus.searchLibrary("react hooks");
 *
 * // Query documentation
 * const docs = await nexus.queryDocs("/facebook/react", "how to use useState");
 *
 * // Save a memory
 * await nexus.saveMemory({
 *   title: "Project architecture decision",
 *   content: "We decided to use...",
 *   type: "decision",
 *   project: "my-app"
 * });
 *
 * // Recall memories
 * const memories = await nexus.recallMemories("authentication flow");
 * ```
 */

// ============================================================================
// Types
// ============================================================================

export interface NexusConfig {
  /** API key from https://nexus.yogan.dev/dashboard/keys */
  apiKey: string;
  /** Base URL (defaults to https://api.nexus.yogan.dev) */
  baseUrl?: string;
  /** Request timeout in ms (defaults to 30000) */
  timeout?: number;
}

export interface Library {
  id: string;
  name: string;
  description: string | null;
  categories: string[];
  version: string | null;
  iconUrl: string | null;
  homepageUrl: string | null;
  repositoryUrl: string | null;
  totalChunks: number;
  totalTokens: number;
  indexStatus: "pending" | "indexing" | "indexed" | "failed";
  isFeatured: boolean;
  lastIndexedAt: string | null;
}

export interface LibrarySearchResult {
  id: string;
  name: string;
  description: string | null;
  categories: string[];
  totalSnippets: number;
  trustScore: number;
}

export interface DocChunk {
  id: string;
  title: string | null;
  content: string;
  contentType: "text" | "code" | "mixed";
  sourceFile: string | null;
  sourceUrl: string | null;
  score: number;
}

export interface QueryDocsResult {
  libraryId: string;
  libraryName: string;
  query: string;
  chunks: DocChunk[];
  totalTokens: number;
}

export interface Memory {
  id: string;
  title: string;
  summary: string | null;
  content?: string;
  type: "project_context" | "session_summary" | "decision" | "correction";
  tags: string[];
  project: string | null;
  importance: number;
  createdAt: string;
  updatedAt: string;
}

export interface SaveMemoryOptions {
  title: string;
  content: string;
  type: "project_context" | "session_summary" | "decision" | "correction";
  summary?: string;
  tags?: string[];
  project?: string;
  importance?: number;
}

export interface RecallMemoriesOptions {
  query: string;
  project?: string;
  type?: "project_context" | "session_summary" | "decision" | "correction";
  tags?: string[];
  limit?: number;
}

export interface McpServer {
  id: string;
  name: string;
  displayName: string | null;
  description: string | null;
  namespace: string;
  version: string | null;
  transportType: "stdio" | "http" | "sse";
  packageType: "npm" | "pypi" | "docker" | "binary" | "remote";
  packageName: string | null;
  isOfficial: boolean;
  isFeatured: boolean;
  categories: string[];
}

export interface ServerConfig {
  claudeDesktop: object;
  vscode: object;
  opencode: object;
  generic: object;
}

// ============================================================================
// Nexus Client
// ============================================================================

export class Nexus {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(config: NexusConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://api.nexus.yogan.dev";
    this.timeout = config.timeout || 30000;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new NexusError(
          (error as { error?: string }).error ||
            `Request failed with status ${response.status}`,
          response.status
        );
      }

      return response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // ==========================================================================
  // Documentation Methods
  // ==========================================================================

  /**
   * Search for libraries by name or description
   *
   * @example
   * ```typescript
   * const libraries = await nexus.searchLibrary("react state management");
   * console.log(libraries[0].id); // "zustand"
   * ```
   */
  async searchLibrary(
    query: string,
    options?: { limit?: number }
  ): Promise<LibrarySearchResult[]> {
    const params = new URLSearchParams({
      query,
      ...(options?.limit && { limit: String(options.limit) }),
    });

    const result = await this.request<{ libraries: LibrarySearchResult[] }>(
      `/api/libraries/search?${params}`
    );
    return result.libraries;
  }

  /**
   * Resolve a library name to its Nexus library ID
   *
   * @example
   * ```typescript
   * const id = await nexus.resolveLibraryId("nextjs");
   * console.log(id); // "nextjs" or "/vercel/next.js"
   * ```
   */
  async resolveLibraryId(libraryName: string): Promise<string | null> {
    const results = await this.searchLibrary(libraryName, { limit: 1 });
    return results[0]?.id || null;
  }

  /**
   * Query documentation for a specific library
   *
   * @example
   * ```typescript
   * const docs = await nexus.queryDocs("react", "how to use useEffect");
   * docs.chunks.forEach(chunk => {
   *   console.log(chunk.title, chunk.content);
   * });
   * ```
   */
  async queryDocs(
    libraryId: string,
    query: string,
    options?: { limit?: number }
  ): Promise<QueryDocsResult> {
    const params = new URLSearchParams({
      query,
      ...(options?.limit && { limit: String(options.limit) }),
    });

    return this.request<QueryDocsResult>(
      `/api/libraries/${encodeURIComponent(libraryId)}/query?${params}`
    );
  }

  /**
   * Get library information by ID
   */
  async getLibrary(libraryId: string): Promise<Library> {
    return this.request<Library>(
      `/api/libraries/${encodeURIComponent(libraryId)}`
    );
  }

  /**
   * List all indexed libraries
   */
  async listLibraries(options?: {
    limit?: number;
    offset?: number;
    category?: string;
    featured?: boolean;
  }): Promise<{ libraries: Library[]; total: number }> {
    const params = new URLSearchParams();
    if (options?.limit) params.set("limit", String(options.limit));
    if (options?.offset) params.set("offset", String(options.offset));
    if (options?.category) params.set("category", options.category);
    if (options?.featured) params.set("featured", "true");

    return this.request(`/api/libraries?${params}`);
  }

  // ==========================================================================
  // Memory Methods
  // ==========================================================================

  /**
   * Save a memory for later retrieval
   *
   * @example
   * ```typescript
   * const memory = await nexus.saveMemory({
   *   title: "Authentication decision",
   *   content: "We chose to use JWT tokens stored in httpOnly cookies...",
   *   type: "decision",
   *   project: "my-app",
   *   tags: ["auth", "security"]
   * });
   * ```
   */
  async saveMemory(options: SaveMemoryOptions): Promise<Memory> {
    return this.request<Memory>("/mcp/memory", {
      method: "POST",
      body: JSON.stringify(options),
    });
  }

  /**
   * Recall memories using semantic search
   *
   * @example
   * ```typescript
   * const memories = await nexus.recallMemories({
   *   query: "authentication flow",
   *   project: "my-app",
   *   limit: 5
   * });
   * ```
   */
  async recallMemories(options: RecallMemoriesOptions): Promise<Memory[]> {
    const params = new URLSearchParams({ query: options.query });
    if (options.project) params.set("project", options.project);
    if (options.type) params.set("type", options.type);
    if (options.tags) params.set("tags", options.tags.join(","));
    if (options.limit) params.set("limit", String(options.limit));

    const result = await this.request<{ memories: Memory[] }>(
      `/mcp/memory/recall?${params}`
    );
    return result.memories;
  }

  /**
   * Get project context (all memories for a project)
   */
  async getProjectContext(
    project: string,
    options?: { limit?: number }
  ): Promise<{
    projectContext: Memory[];
    decisions: Memory[];
    corrections: Memory[];
    sessionSummaries: Memory[];
  }> {
    const params = new URLSearchParams({ project });
    if (options?.limit) params.set("limit", String(options.limit));

    return this.request(`/mcp/memory/project?${params}`);
  }

  /**
   * List memories with optional filters
   */
  async listMemories(options?: {
    project?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ memories: Memory[]; total: number }> {
    const params = new URLSearchParams();
    if (options?.project) params.set("project", options.project);
    if (options?.type) params.set("type", options.type);
    if (options?.limit) params.set("limit", String(options.limit));
    if (options?.offset) params.set("offset", String(options.offset));

    return this.request(`/mcp/memory?${params}`);
  }

  /**
   * Update an existing memory
   */
  async updateMemory(
    memoryId: string,
    updates: Partial<
      Pick<
        SaveMemoryOptions,
        "title" | "content" | "summary" | "tags" | "importance"
      >
    >
  ): Promise<Memory> {
    return this.request<Memory>(`/mcp/memory/${memoryId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete a memory
   */
  async deleteMemory(memoryId: string): Promise<void> {
    await this.request(`/mcp/memory/${memoryId}`, {
      method: "DELETE",
    });
  }

  // ==========================================================================
  // MCP Server Methods
  // ==========================================================================

  /**
   * Discover MCP servers
   *
   * @example
   * ```typescript
   * const servers = await nexus.discoverServers({
   *   query: "database",
   *   category: "database"
   * });
   * ```
   */
  async discoverServers(options?: {
    query?: string;
    category?: string;
    official?: boolean;
    limit?: number;
  }): Promise<McpServer[]> {
    const params = new URLSearchParams();
    if (options?.query) params.set("query", options.query);
    if (options?.category) params.set("category", options.category);
    if (options?.official) params.set("official", "true");
    if (options?.limit) params.set("limit", String(options.limit));

    const result = await this.request<{ servers: McpServer[] }>(
      `/mcp/servers?${params}`
    );
    return result.servers;
  }

  /**
   * Get MCP server details
   */
  async getServer(serverId: string): Promise<McpServer> {
    return this.request<McpServer>(`/mcp/servers/${serverId}`);
  }

  /**
   * Get installation config for an MCP server
   *
   * @example
   * ```typescript
   * const config = await nexus.getServerConfig("filesystem");
   * console.log(JSON.stringify(config.claudeDesktop, null, 2));
   * ```
   */
  async getServerConfig(
    serverId: string,
    format?: "claude-desktop" | "vscode" | "opencode" | "generic"
  ): Promise<ServerConfig> {
    const params = format ? `?format=${format}` : "";
    return this.request<ServerConfig>(`/mcp/servers/${serverId}/config${params}`);
  }

  // ==========================================================================
  // Statistics
  // ==========================================================================

  /**
   * Get platform statistics
   */
  async getStats(): Promise<{
    libraries: { indexed: number; pending: number; total: number };
    documentation: { totalChunks: number; totalTokens: number };
    servers: { total: number; official: number };
    usage: { totalQueries: number };
  }> {
    return this.request("/api/stats");
  }
}

// ============================================================================
// Error Class
// ============================================================================

export class NexusError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "NexusError";
  }
}

// ============================================================================
// Convenience Exports
// ============================================================================

/**
 * Create a Nexus client instance
 */
export function createNexus(config: NexusConfig): Nexus {
  return new Nexus(config);
}

export default Nexus;
