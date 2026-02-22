import { queryOptions } from "@tanstack/react-query";
import { API_URL } from "./api";

// ============================================================================
// Types
// ============================================================================

export interface Stats {
  libraries: { total: number; indexed: number };
  documentation: { totalChunks: number; totalTokens: number };
  servers?: { total: number };
  usage: { totalQueries: number };
}

export interface McpServer {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  isOfficial: boolean;
  isFeatured: boolean;
  iconUrl: string | null;
  repositoryUrl: string | null;
  npmPackage: string | null;
  installCommand: string | null;
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

export const serverQueryOptions = (serverId: string) =>
  queryOptions({
    queryKey: ["server", serverId],
    queryFn: async (): Promise<McpServer> => {
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
    return res.json();
  },
  staleTime: 1000 * 60 * 10, // 10 minutes
});
