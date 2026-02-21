// ============================================================================
// Shared Types for Libraries and Chunks
// ============================================================================

export interface LibraryListParams {
  category?: string;
  search?: string;
  status?: "pending" | "indexing" | "indexed" | "failed";
  featured?: boolean;
  limit?: number;
  offset?: number;
}

export interface LibraryListResult {
  libraries: Array<{
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
  }>;
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface LibraryDetailResult {
  library: {
    id: string;
    name: string;
    description: string | null;
    categories: string[];
    version: string | null;
    iconUrl: string | null;
    homepageUrl: string | null;
    repositoryUrl: string | null;
    sourceUrl: string;
    totalChunks: number;
    totalTokens: number;
    indexStatus: "pending" | "indexing" | "indexed" | "failed";
    isFeatured: boolean;
    lastIndexedAt: string | null;
    createdAt: string;
  };
  stats: {
    totalQueries: number;
    totalChunkHits: number;
  };
}

export interface ChunkListResult {
  chunks: Array<{
    id: string;
    title: string | null;
    contentType: string;
    tokenCount: number;
    sourceFile: string | null;
    createdAt: string;
  }>;
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}
