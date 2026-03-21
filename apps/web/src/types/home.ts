// ============================================================================
// Home Page Types
// ============================================================================

/**
 * Library/documentation item displayed on home page
 */
export interface LibraryItem {
  type: "doc";
  id: string;
  name: string;
  description: string | null;
  sourceUrl: string | null;
  totalTokens: number;
  totalChunks: number;
  lastIndexedAt: string | null;
  isFeatured: boolean;
  lastQueriedAt: string | null;
  totalQueries: number;
}

/**
 * MCP server item displayed on home page
 */
export interface ServerItem {
  type: "server";
  id: string;
  name: string;
  displayName: string | null;
  description: string | null;
  repositoryUrl: string | null;
  weeklyDownloads: number;
  githubStars: number;
  updatedAt: string;
  isOfficial: boolean;
  lastDiscoveredAt: string | null;
  totalDiscoveries: number;
}

/**
 * Skill item displayed on home page
 */
export interface SkillItem {
  type: "skill";
  id: string;
  name: string;
  description: string | null;
  sourceUrl: string | null;
  installCount: number;
  usageCount: number;
  updatedAt: string;
  skillType: string;
  lastQueriedAt: string | null;
}

/**
 * Stack item displayed on home page
 */
export interface StackItem {
  type: "stack";
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  layer: number;
  icon: string | null;
  color: string | null;
  useCount: number;
  forkCount: number;
  isStarter: boolean;
  isFeatured: boolean;
  updatedAt: string;
}

/**
 * Public prompt item displayed on home page
 */
export interface PromptItem {
  type: "prompt";
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  usageCount: number;
  updatedAt: string;
  authorName: string | null;
}

/**
 * Union of all content types that can appear on home page
 */
export type ContentItem = LibraryItem | ServerItem | SkillItem | StackItem | PromptItem;

/**
 * Sort modes for content list
 */
export type SortMode = "popular" | "trending" | "recent";

/**
 * Content type filters
 */
export type ContentFilter = "all" | "docs" | "servers" | "skills" | "stacks" | "prompts";

/**
 * Home page statistics
 */
export interface HomeStats {
  libraries: number;
  servers: number;
  skills: number;
  stacks: number;
  prompts: number;
}

/**
 * Home page data returned from server function
 */
export interface HomePageData {
  stats: HomeStats;
  items: ContentItem[];
  hasMore: boolean;
  nextCursor: number;
  total: number;
}

/**
 * Server function input parameters
 */
export interface HomePageInput {
  sort: SortMode;
  filter?: ContentFilter;
  q?: string;
  cursor?: number;
}

/**
 * Search params schema for URL
 */
export interface HomeSearchParams {
  sort?: SortMode;
  filter?: ContentFilter;
  q?: string;
}
