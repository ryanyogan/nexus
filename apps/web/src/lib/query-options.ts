import { queryOptions } from "@tanstack/react-query";
import { API_URL } from "./api";

// ============================================================================
// Types
// ============================================================================

export interface Stats {
  libraries: { total: number; indexed: number; pending?: number; indexing?: number };
  documentation: { totalChunks: number; totalTokens: number };
  servers?: { total: number };
  usage: { totalQueries: number; totalChunkHits?: number };
}

export interface McpServer {
  id: string;
  name: string;
  displayName: string | null;
  description: string | null;
  categories: string[];
  isOfficial: boolean;
  isFeatured: boolean;
  iconUrl: string | null;
  repositoryUrl: string | null;
  packageName: string | null;
  version: string | null;
  transportType: string | null;
  packageType: string | null;
  hasTools: boolean;
  hasResources: boolean;
  hasPrompts: boolean;
  homepageUrl: string | null;
  author: string | null;
  keywords: string[] | null;
  weeklyDownloads: number | null;
  githubStars: number | null;
  isVerified: boolean;
  createdAt: string;
}

// ============================================================================
// Query Options
// ============================================================================

export const statsQueryOptions = queryOptions({
  queryKey: ["stats"],
  queryFn: async (): Promise<Stats> => {
    const res = await fetch(`${API_URL}/api/stats`);
    if (!res.ok) {
      throw new Error("Failed to fetch stats");
    }
    return res.json();
  },
  staleTime: 1000 * 60 * 5, // 5 minutes
});

export const featuredServersQueryOptions = queryOptions({
  queryKey: ["servers", "featured"],
  queryFn: async (): Promise<McpServer[]> => {
    const res = await fetch(`${API_URL}/api/servers?featured=true&limit=4`);
    if (!res.ok) {
      throw new Error("Failed to fetch featured servers");
    }
    const data = (await res.json()) as { servers: McpServer[] };
    return data.servers;
  },
  staleTime: 1000 * 60 * 5, // 5 minutes
});

export const serversQueryOptions = (params?: {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) =>
  queryOptions({
    queryKey: ["servers", params],
    queryFn: async (): Promise<{ servers: McpServer[]; total: number }> => {
      const searchParams = new URLSearchParams();
      if (params?.category) searchParams.set("category", params.category);
      if (params?.search) searchParams.set("q", params.search);
      if (params?.limit) searchParams.set("limit", String(params.limit));
      if (params?.offset) searchParams.set("offset", String(params.offset));

      const res = await fetch(
        `${API_URL}/api/servers?${searchParams.toString()}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch servers");
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

export interface ServerDetail {
  server: McpServer & {
    installCommand: string | null;
    installArgs: string[] | null;
    envVars: Record<string, string> | null;
  };
  stats: {
    totalDiscoveries: number;
    totalConfigCopies: number;
  };
  linkedDocs: string[];
}

export const serverQueryOptions = (serverId: string) =>
  queryOptions({
    queryKey: ["server", serverId],
    queryFn: async (): Promise<ServerDetail> => {
      const res = await fetch(`${API_URL}/api/servers/${serverId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch server");
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

export const serverCategoriesQueryOptions = queryOptions({
  queryKey: ["server-categories"],
  queryFn: async (): Promise<{ id: string; label: string; count: number }[]> => {
    const res = await fetch(`${API_URL}/api/servers/categories`);
    if (!res.ok) {
      throw new Error("Failed to fetch server categories");
    }
    const data = (await res.json()) as { categories: { id: string; label: string; count: number }[] };
    return data.categories;
  },
  staleTime: 1000 * 60 * 10, // 10 minutes
});

// ============================================================================
// Library Types & Query Options
// ============================================================================

export interface Library {
  id: string;
  name: string;
  description: string | null;
  categories: string[];
  iconUrl: string | null;
  repositoryUrl: string | null;
  documentationUrl: string | null;
  homepageUrl?: string | null;
  version?: string | null;
  sourceType?: string;
  indexStatus: "pending" | "indexing" | "indexed" | "failed";
  indexError: string | null;
  totalChunks: number;
  totalTokens: number;
  isFeatured: boolean;
  lastIndexedAt: string | null;
  createdAt?: string;
}

export const librariesQueryOptions = (params?: {
  category?: string;
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) =>
  queryOptions({
    queryKey: ["libraries", params],
    queryFn: async (): Promise<{ libraries: Library[]; pagination: { total: number } }> => {
      const searchParams = new URLSearchParams();
      if (params?.category && params.category !== "all") {
        searchParams.set("category", params.category);
      }
      if (params?.search) searchParams.set("search", params.search);
      if (params?.status && params.status !== "all") {
        searchParams.set("status", params.status);
      }
      if (params?.limit) searchParams.set("limit", String(params.limit));
      if (params?.offset) searchParams.set("offset", String(params.offset));

      const res = await fetch(
        `${API_URL}/api/libraries?${searchParams.toString()}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch libraries");
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

// ============================================================================
// Skill Types & Query Options
// ============================================================================

export interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sourceUrl: string | null;
  sourceRepo: string | null;
  author: string | null;
  version: string | null;
  type: "analysis" | "generation" | "transformation" | "integration" | "utility";
  categories: string[];
  tags: string[];
  format: "markdown" | "yaml" | "json";
  contentPreview: string | null;
  requiredTools: string[] | null;
  requiredMcpServers: string[] | null;
  installCount: number;
  usageCount: number;
  rating: number | null;
  isOfficial: boolean;
  isFeatured: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export const skillsQueryOptions = (params?: {
  type?: string;
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
  featured?: boolean;
}) =>
  queryOptions({
    queryKey: ["skills", params],
    queryFn: async (): Promise<{ skills: Skill[]; total: number }> => {
      const searchParams = new URLSearchParams();
      if (params?.type) searchParams.set("type", params.type);
      if (params?.category) searchParams.set("category", params.category);
      if (params?.search) searchParams.set("search", params.search);
      if (params?.limit) searchParams.set("limit", String(params.limit));
      if (params?.offset) searchParams.set("offset", String(params.offset));
      if (params?.featured) searchParams.set("featured", "true");

      const res = await fetch(
        `${API_URL}/api/skills?${searchParams.toString()}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch skills");
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

export const skillQueryOptions = (skillId: string) =>
  queryOptions({
    queryKey: ["skill", skillId],
    queryFn: async (): Promise<{ skill: Skill; content: string | null }> => {
      const res = await fetch(`${API_URL}/api/skills/${skillId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch skill");
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

export const skillCategoriesQueryOptions = queryOptions({
  queryKey: ["skill-categories"],
  queryFn: async (): Promise<{ id: string; label: string; count: number }[]> => {
    const res = await fetch(`${API_URL}/api/skills/categories`);
    if (!res.ok) {
      throw new Error("Failed to fetch skill categories");
    }
    const data = (await res.json()) as { categories: { id: string; label: string; count: number }[] };
    return data.categories;
  },
  staleTime: 1000 * 60 * 10, // 10 minutes
});

export const skillTypesQueryOptions = queryOptions({
  queryKey: ["skill-types"],
  queryFn: async (): Promise<{ id: string; label: string; description: string }[]> => {
    const res = await fetch(`${API_URL}/api/skills/types`);
    if (!res.ok) {
      throw new Error("Failed to fetch skill types");
    }
    const data = (await res.json()) as { types: { id: string; label: string; description: string }[] };
    return data.types;
  },
  staleTime: 1000 * 60 * 60, // 1 hour (rarely changes)
});

// ============================================================================
// Admin Query Options
// ============================================================================

export const adminStatsQueryOptions = queryOptions({
  queryKey: ["admin", "stats"],
  queryFn: async (): Promise<Stats> => {
    const res = await fetch(`${API_URL}/api/stats`);
    if (!res.ok) {
      throw new Error("Failed to fetch stats");
    }
    return res.json();
  },
  staleTime: 1000 * 10, // 10 seconds for admin (fresher data)
});

export const adminLibrariesQueryOptions = (params: {
  status?: string;
  search?: string;
}) =>
  queryOptions({
    queryKey: ["admin", "libraries", params],
    queryFn: async (): Promise<{ libraries: Library[] }> => {
      const searchParams = new URLSearchParams({ limit: "200" });
      if (params.status && params.status !== "all") {
        searchParams.set("status", params.status);
      }
      if (params.search) searchParams.set("search", params.search);

      const res = await fetch(
        `${API_URL}/api/libraries?${searchParams.toString()}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch libraries");
      }
      return res.json();
    },
    staleTime: 1000 * 10, // 10 seconds for admin
  });
