/**
 * Centralized query key factory for TanStack Query.
 * Using factory functions ensures type safety and consistent key structure.
 */

import type { ContentFilter, SortMode } from "../types/home";

export const queryKeys = {
  // Home page queries
  home: {
    all: ["home"] as const,
    list: (params: { sort: SortMode; filter: ContentFilter; q?: string }) =>
      ["home", "list", params] as const,
    stats: ["home", "stats"] as const,
  },

  // Dashboard queries
  dashboard: {
    all: ["dashboard"] as const,
    stats: ["dashboard", "stats"] as const,
    keys: ["dashboard", "keys"] as const,
    stacks: (filter: string) => ["dashboard", "stacks", { filter }] as const,
    prompts: (filter: string) => ["dashboard", "prompts", { filter }] as const,
    brain: {
      all: ["dashboard", "brain"] as const,
      score: ["dashboard", "brain", "score"] as const,
      learnings: (filter: string) => ["dashboard", "brain", "learnings", { filter }] as const,
      xpHistory: ["dashboard", "brain", "xp-history"] as const,
    },
    repos: ["dashboard", "repos"] as const,
    skills: ["dashboard", "skills"] as const,
    billing: ["dashboard", "billing"] as const,
  },

  // Library/server/skill detail queries
  libraries: {
    all: ["libraries"] as const,
    detail: (id: string) => ["libraries", id] as const,
    chunks: (id: string, offset: number) => ["libraries", id, "chunks", { offset }] as const,
  },

  servers: {
    all: ["servers"] as const,
    detail: (id: string) => ["servers", id] as const,
    config: (id: string, format: string) => ["servers", id, "config", { format }] as const,
  },

  skills: {
    all: ["skills"] as const,
    detail: (id: string) => ["skills", id] as const,
  },

  stacks: {
    all: ["stacks"] as const,
    detail: (slug: string) => ["stacks", slug] as const,
  },
} as const;
