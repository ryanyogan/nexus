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

// Flow types
export interface FlowPreferences {
  verbosity?: "concise" | "balanced" | "detailed";
  codeStyle?: "minimal" | "documented" | "verbose";
  responseFormat?: "full" | "compact" | "code-only" | "summary";
  useEmojis?: boolean;
  preferredLanguage?: string;
  customRules?: string[];
}

export interface Flow {
  id: string;
  userId: string | null;
  name: string;
  slug: string;
  description: string | null;
  systemPrompt: string;
  parentFlowId: string | null;
  skills: string[];
  libraries: string[];
  mcpServers: string[];
  preferences: FlowPreferences;
  category: string;
  tags: string[];
  isPublic: boolean;
  isStarterPack: boolean;
  isFeatured: boolean;
  installCount: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  // Annotated fields
  isInstalled?: boolean;
  isActive?: boolean;
  isOwned?: boolean;
  inheritanceChain?: string[];
  customPrompt?: string | null;
  customPreferences?: FlowPreferences | null;
}

export interface CreateFlowOptions {
  name: string;
  description?: string;
  systemPrompt: string;
  parentFlowId?: string;
  skills?: string[];
  libraries?: string[];
  mcpServers?: string[];
  preferences?: FlowPreferences;
  category?: string;
  tags?: string[];
}

export interface UpdateFlowOptions {
  name?: string;
  description?: string;
  systemPrompt?: string;
  parentFlowId?: string | null;
  skills?: string[];
  libraries?: string[];
  mcpServers?: string[];
  preferences?: FlowPreferences;
  category?: string;
  tags?: string[];
}

export interface FlowDownload {
  filename: string;
  content: string;
}

// Brain types
export interface Learning {
  id: string;
  userId: string;
  type: "correction" | "pattern" | "preference" | "skill";
  category: string | null;
  trigger: string;
  response: string;
  context: string | null;
  source: "explicit" | "implicit" | "community";
  scope: "global" | "project" | "library" | "flow";
  project: string | null;
  libraryId: string | null;
  flowId: string | null;
  confidence: number;
  usageCount: number;
  successRate: number | null;
  lastUsedAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLearningOptions {
  type?: "correction" | "pattern" | "preference" | "skill";
  category?: string;
  trigger: string;
  response: string;
  context?: string;
  source?: "explicit" | "implicit";
  scope?: "global" | "project" | "library" | "flow";
  project?: string;
  libraryId?: string;
  flowId?: string;
  confidence?: number;
}

export interface IntelligenceScore {
  totalXp: number;
  level: number;
  currentLevelXp: number;
  xpToNextLevel: number;
  categoryXp: Record<string, number>;
  currentStreak: number;
  longestStreak: number;
  achievements: string[];
  stats: {
    totalQueries: number;
    totalMemories: number;
    totalLearnings: number;
    totalFlowsCreated: number;
    totalReposIndexed: number;
  };
}

export interface XpEvent {
  id: string;
  userId: string;
  eventType: string;
  xpAmount: number;
  category: string;
  description: string | null;
  referenceId: string | null;
  referenceType: string | null;
  baseXp: number;
  multiplier: string;
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  path: string | null;
  description: string | null;
  stack: Record<string, string>;
  dependencies: string[];
  devDependencies: string[];
  patterns: Record<string, unknown>;
  repoId: string | null;
  flowId: string | null;
  suggestedFlows: string[];
  sessionCount: number;
  lastSessionAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityLearning {
  id: string;
  type: "correction" | "pattern" | "preference" | "skill";
  category: string | null;
  trigger: string;
  response: string;
  context: string | null;
  scope: "global" | "library" | "framework";
  libraryId: string | null;
  framework: string | null;
  upvotes: number;
  downvotes: number;
  adoptionCount: number;
  confidence: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Repos types
export interface ConnectedRepo {
  id: string;
  userId: string;
  githubId: number;
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  defaultBranch: string;
  isPrivate: boolean;
  indexStatus: "pending" | "indexing" | "indexed" | "failed";
  lastIndexedAt: string | null;
  indexError: string | null;
  totalFiles: number;
  totalBytes: number;
  indexedFiles: number;
  lastCommitSha: string | null;
  lastCommitAt: string | null;
  autoSync: boolean;
  includePatterns: string[];
  excludePatterns: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RepoFile {
  id: string;
  repoId: string;
  path: string;
  fileType: "readme" | "docs" | "config" | "types" | "source" | "test" | "other";
  language: string | null;
  sizeBytes: number;
  lineCount: number | null;
  title: string | null;
  summary: string | null;
  content?: string;
}

export interface AvailableRepo {
  githubId: number;
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  defaultBranch: string;
  isPrivate: boolean;
  language: string | null;
  updatedAt: string;
  isConnected: boolean;
}

export interface RepoTierLimits {
  maxRepos: number;
  maxBytesPerRepo: number;
  privateRepos: boolean;
  currentRepoCount: number;
}

export interface RepoTreeNode {
  name: string;
  type: "file" | "directory";
  path: string;
  fileType?: string;
  language?: string;
  size?: number;
  children?: RepoTreeNode[];
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

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
          (error as { error?: string }).error || `Request failed with status ${response.status}`,
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
  async searchLibrary(query: string, options?: { limit?: number }): Promise<LibrarySearchResult[]> {
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
    return this.request<Library>(`/api/libraries/${encodeURIComponent(libraryId)}`);
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

    const result = await this.request<{ memories: Memory[] }>(`/mcp/memory/recall?${params}`);
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
      Pick<SaveMemoryOptions, "title" | "content" | "summary" | "tags" | "importance">
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

    const result = await this.request<{ servers: McpServer[] }>(`/mcp/servers?${params}`);
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
  // Flow Methods
  // ==========================================================================

  /**
   * List flows (starter packs + user's own flows)
   *
   * @example
   * ```typescript
   * const { flows } = await nexus.listFlows();
   * flows.forEach(flow => console.log(flow.name, flow.isStarterPack));
   * ```
   */
  async listFlows(options?: {
    limit?: number;
    offset?: number;
    search?: string;
    category?: string;
    starter?: boolean;
    my?: boolean;
  }): Promise<{ flows: Flow[]; total: number }> {
    const params = new URLSearchParams();
    if (options?.limit) params.set("limit", String(options.limit));
    if (options?.offset) params.set("offset", String(options.offset));
    if (options?.search) params.set("search", options.search);
    if (options?.category) params.set("category", options.category);
    if (options?.starter) params.set("starter", "true");
    if (options?.my) params.set("my", "true");

    return this.request(`/api/flows?${params}`);
  }

  /**
   * Get a flow by ID with resolved inheritance
   */
  async getFlow(flowId: string): Promise<{ flow: Flow }> {
    return this.request(`/api/flows/${encodeURIComponent(flowId)}`);
  }

  /**
   * Get currently active flows
   */
  async getActiveFlows(): Promise<{ flows: Flow[] }> {
    return this.request("/api/flows/active");
  }

  /**
   * Create a new flow
   *
   * @example
   * ```typescript
   * const result = await nexus.createFlow({
   *   name: "My Custom Flow",
   *   systemPrompt: "You are an expert in...",
   *   skills: ["typescript-strict"],
   *   libraries: ["react", "nextjs"],
   * });
   * console.log(result.flowId);
   * ```
   */
  async createFlow(
    options: CreateFlowOptions
  ): Promise<{ success: boolean; flowId: string; slug: string }> {
    return this.request("/api/flows", {
      method: "POST",
      body: JSON.stringify(options),
    });
  }

  /**
   * Update a flow
   */
  async updateFlow(flowId: string, options: UpdateFlowOptions): Promise<{ success: boolean }> {
    return this.request(`/api/flows/${encodeURIComponent(flowId)}`, {
      method: "PUT",
      body: JSON.stringify(options),
    });
  }

  /**
   * Delete a flow
   */
  async deleteFlow(flowId: string): Promise<{ success: boolean }> {
    return this.request(`/api/flows/${encodeURIComponent(flowId)}`, {
      method: "DELETE",
    });
  }

  /**
   * Install a flow
   */
  async installFlow(flowId: string): Promise<{ success: boolean }> {
    return this.request(`/api/flows/${encodeURIComponent(flowId)}/install`, {
      method: "POST",
    });
  }

  /**
   * Uninstall a flow
   */
  async uninstallFlow(flowId: string): Promise<{ success: boolean }> {
    return this.request(`/api/flows/${encodeURIComponent(flowId)}/install`, {
      method: "DELETE",
    });
  }

  /**
   * Activate a flow
   *
   * @example
   * ```typescript
   * const result = await nexus.activateFlow("flow-react-typescript", {
   *   project: "my-app"
   * });
   * console.log(result.flow.systemPrompt);
   * ```
   */
  async activateFlow(
    flowId: string,
    options?: { project?: string }
  ): Promise<{
    success: boolean;
    sessionId: string;
    flow: Flow;
  }> {
    return this.request(`/api/flows/${encodeURIComponent(flowId)}/activate`, {
      method: "POST",
      body: JSON.stringify(options || {}),
    });
  }

  /**
   * Deactivate a specific flow
   */
  async deactivateFlow(flowId: string): Promise<{ success: boolean }> {
    return this.request(`/api/flows/${encodeURIComponent(flowId)}/deactivate`, {
      method: "POST",
    });
  }

  /**
   * Deactivate all active flows
   */
  async deactivateAllFlows(): Promise<{ success: boolean }> {
    return this.request("/api/flows/deactivate-all", {
      method: "POST",
    });
  }

  /**
   * Download a flow as FLOW.md content
   *
   * @example
   * ```typescript
   * const { content } = await nexus.downloadFlow("flow-react-typescript");
   * fs.writeFileSync("FLOW.md", content);
   * ```
   */
  async downloadFlow(flowId: string): Promise<FlowDownload> {
    return this.request(`/api/flows/${encodeURIComponent(flowId)}/download`);
  }

  /**
   * Customize a flow (add custom prompt or preferences)
   */
  async customizeFlow(
    flowId: string,
    options: {
      customPrompt?: string | null;
      customPreferences?: FlowPreferences | null;
    }
  ): Promise<{ success: boolean }> {
    return this.request(`/api/flows/${encodeURIComponent(flowId)}/customize`, {
      method: "PUT",
      body: JSON.stringify(options),
    });
  }

  /**
   * Reorder active flows
   */
  async reorderFlows(flowIds: string[]): Promise<{ success: boolean }> {
    return this.request("/api/flows/reorder", {
      method: "PUT",
      body: JSON.stringify({ flowIds }),
    });
  }

  /**
   * Suggest flows based on project context
   * (Client-side analysis, returns matching flows)
   */
  async suggestFlows(options: {
    dependencies?: string[];
    filePatterns?: string[];
    projectName?: string;
  }): Promise<{ flows: Flow[] }> {
    // Get all flows and filter based on matches
    const { flows } = await this.listFlows({ starter: true, limit: 50 });

    const matches = flows.filter((flow) => {
      // Check if any libraries match dependencies
      if (options.dependencies?.length) {
        const hasMatch = flow.libraries.some((lib) =>
          options.dependencies!.some(
            (dep) =>
              dep.toLowerCase().includes(lib.toLowerCase()) ||
              lib.toLowerCase().includes(dep.toLowerCase())
          )
        );
        if (hasMatch) return true;
      }

      // Check tags against dependencies
      if (options.dependencies?.length) {
        const hasTagMatch = flow.tags.some((tag) =>
          options.dependencies!.some((dep) => dep.toLowerCase().includes(tag.toLowerCase()))
        );
        if (hasTagMatch) return true;
      }

      return false;
    });

    return { flows: matches };
  }

  // ==========================================================================
  // Brain Methods - Learning, Intelligence Score, Projects
  // ==========================================================================

  /**
   * Get user's intelligence score and stats
   */
  async getIntelligenceScore(): Promise<{ score: IntelligenceScore }> {
    return this.request("/api/brain/score");
  }

  /**
   * Get XP event history
   */
  async getXpHistory(options?: {
    limit?: number;
    offset?: number;
  }): Promise<{ events: XpEvent[] }> {
    const params = new URLSearchParams();
    if (options?.limit) params.set("limit", String(options.limit));
    if (options?.offset) params.set("offset", String(options.offset));
    return this.request(`/api/brain/xp-history?${params}`);
  }

  /**
   * List user's learnings
   */
  async listLearnings(options?: {
    type?: "correction" | "pattern" | "preference" | "skill";
    scope?: "global" | "project" | "library" | "flow";
    project?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ learnings: Learning[]; total: number }> {
    const params = new URLSearchParams();
    if (options?.type) params.set("type", options.type);
    if (options?.scope) params.set("scope", options.scope);
    if (options?.project) params.set("project", options.project);
    if (options?.search) params.set("search", options.search);
    if (options?.limit) params.set("limit", String(options.limit));
    if (options?.offset) params.set("offset", String(options.offset));
    return this.request(`/api/brain/learnings?${params}`);
  }

  /**
   * Create a new learning
   *
   * @example
   * ```typescript
   * await nexus.createLearning({
   *   trigger: "When I ask for React components",
   *   response: "Always use TypeScript with proper type annotations",
   *   type: "preference",
   *   scope: "library",
   *   libraryId: "react"
   * });
   * ```
   */
  async createLearning(options: CreateLearningOptions): Promise<{
    success: boolean;
    learningId: string;
    xp: { xpAwarded: number; newLevel: number; leveledUp: boolean };
  }> {
    return this.request("/api/brain/learnings", {
      method: "POST",
      body: JSON.stringify(options),
    });
  }

  /**
   * Update a learning
   */
  async updateLearning(
    learningId: string,
    options: Partial<CreateLearningOptions>
  ): Promise<{ success: boolean }> {
    return this.request(`/api/brain/learnings/${learningId}`, {
      method: "PUT",
      body: JSON.stringify(options),
    });
  }

  /**
   * Delete a learning
   */
  async deleteLearning(learningId: string): Promise<{ success: boolean }> {
    return this.request(`/api/brain/learnings/${learningId}`, {
      method: "DELETE",
    });
  }

  /**
   * Get learnings applicable to current context
   */
  async getActiveLearnings(options?: {
    project?: string;
    library?: string;
    flow?: string;
  }): Promise<{ learnings: Learning[] }> {
    const params = new URLSearchParams();
    if (options?.project) params.set("project", options.project);
    if (options?.library) params.set("library", options.library);
    if (options?.flow) params.set("flow", options.flow);
    return this.request(`/api/brain/learnings/active?${params}`);
  }

  /**
   * Record that a learning was used (for tracking usage)
   */
  async recordLearningUsage(learningId: string): Promise<{ success: boolean }> {
    return this.request(`/api/brain/learnings/${learningId}/use`, {
      method: "POST",
    });
  }

  /**
   * List user's projects
   */
  async listProjects(): Promise<{ projects: Project[] }> {
    return this.request("/api/brain/projects");
  }

  /**
   * Create or update a project fingerprint
   */
  async upsertProject(options: {
    name: string;
    path?: string;
    description?: string;
    stack?: Record<string, string>;
    dependencies?: string[];
    devDependencies?: string[];
    patterns?: Record<string, unknown>;
    repoId?: string;
    flowId?: string;
  }): Promise<{ success: boolean; projectId: string; created?: boolean; updated?: boolean }> {
    return this.request("/api/brain/projects", {
      method: "POST",
      body: JSON.stringify(options),
    });
  }

  /**
   * Browse community learnings
   */
  async listCommunityLearnings(options?: {
    library?: string;
    type?: "correction" | "pattern" | "preference" | "skill";
    limit?: number;
    offset?: number;
  }): Promise<{ learnings: CommunityLearning[] }> {
    const params = new URLSearchParams();
    if (options?.library) params.set("library", options.library);
    if (options?.type) params.set("type", options.type);
    if (options?.limit) params.set("limit", String(options.limit));
    if (options?.offset) params.set("offset", String(options.offset));
    return this.request(`/api/brain/community?${params}`);
  }

  /**
   * Adopt a community learning
   */
  async adoptCommunityLearning(
    communityLearningId: string
  ): Promise<{ success: boolean; learningId: string }> {
    return this.request(`/api/brain/community/${communityLearningId}/adopt`, {
      method: "POST",
    });
  }

  /**
   * Vote on a community learning
   */
  async voteCommunityLearning(
    communityLearningId: string,
    vote: "up" | "down"
  ): Promise<{ success: boolean }> {
    return this.request(`/api/brain/community/${communityLearningId}/vote`, {
      method: "POST",
      body: JSON.stringify({ vote }),
    });
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(options?: { limit?: number }): Promise<{
    leaderboard: Array<{
      userId: string;
      totalXp: number;
      level: number;
      currentStreak: number;
    }>;
  }> {
    const params = new URLSearchParams();
    if (options?.limit) params.set("limit", String(options.limit));
    return this.request(`/api/brain/leaderboard?${params}`);
  }

  // ==========================================================================
  // Repos Methods - GitHub Repository Integration
  // ==========================================================================

  /**
   * List connected repositories
   */
  async listConnectedRepos(): Promise<{
    repos: ConnectedRepo[];
    tier: "free" | "pro" | "team";
    limits: RepoTierLimits;
  }> {
    return this.request("/api/repos");
  }

  /**
   * List available GitHub repos to connect
   */
  async listAvailableRepos(options?: {
    page?: number;
    perPage?: number;
  }): Promise<{ repos: AvailableRepo[]; page: number; perPage: number }> {
    const params = new URLSearchParams();
    if (options?.page) params.set("page", String(options.page));
    if (options?.perPage) params.set("per_page", String(options.perPage));
    return this.request(`/api/repos/available?${params}`);
  }

  /**
   * Connect a repository
   */
  async connectRepo(options: {
    githubId: number;
    owner: string;
    name: string;
    fullName: string;
    description?: string | null;
    htmlUrl: string;
    defaultBranch?: string;
    isPrivate?: boolean;
  }): Promise<{ success: boolean; repoId: string }> {
    return this.request("/api/repos", {
      method: "POST",
      body: JSON.stringify(options),
    });
  }

  /**
   * Get repository details with files
   */
  async getConnectedRepo(repoId: string): Promise<{ repo: ConnectedRepo; files: RepoFile[] }> {
    return this.request(`/api/repos/${repoId}`);
  }

  /**
   * Trigger repository sync/indexing
   */
  async syncRepo(repoId: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/api/repos/${repoId}/sync`, {
      method: "POST",
    });
  }

  /**
   * Disconnect a repository
   */
  async disconnectRepo(repoId: string): Promise<{ success: boolean }> {
    return this.request(`/api/repos/${repoId}`, {
      method: "DELETE",
    });
  }

  /**
   * Update repository settings
   */
  async updateRepoSettings(
    repoId: string,
    options: {
      autoSync?: boolean;
      includePatterns?: string[];
      excludePatterns?: string[];
    }
  ): Promise<{ success: boolean }> {
    return this.request(`/api/repos/${repoId}/settings`, {
      method: "PUT",
      body: JSON.stringify(options),
    });
  }

  /**
   * Get file content from a connected repo
   */
  async getRepoFile(
    repoId: string,
    filePath: string
  ): Promise<{ file: RepoFile & { content: string } }> {
    return this.request(`/api/repos/${repoId}/files/${encodeURIComponent(filePath)}`);
  }

  /**
   * Get repository directory structure
   */
  async getRepoStructure(repoId: string): Promise<{ structure: RepoTreeNode }> {
    return this.request(`/api/repos/${repoId}/structure`);
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
