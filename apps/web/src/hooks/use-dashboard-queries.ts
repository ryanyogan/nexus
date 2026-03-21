/**
 * TanStack Query hooks for dashboard pages.
 * Provides reusable query and mutation hooks with proper caching and invalidation.
 */

import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import { authFetch } from "../lib/api";
import { queryKeys } from "../lib/query-keys";

// ============================================================================
// Types
// ============================================================================

export interface ApiKey {
  id: string;
  name: string;
  tokenPrefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Stack {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  category: string;
  layer: number;
  tags: string[];
  tokenBudget: string;
  learningStatus: string;
  isPublic: boolean;
  isFeatured: boolean;
  isStarter: boolean;
  forkCount: number;
  useCount: number;
  installCount: number;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  isInstalled?: boolean;
  isOwned?: boolean;
}

export interface PromptPreferences {
  verbosity?: "concise" | "balanced" | "detailed";
  codeStyle?: "minimal" | "documented" | "verbose";
  responseFormat?: "full" | "compact" | "code-only" | "summary";
  useEmojis?: boolean;
  preferredLanguage?: string;
}

export interface Prompt {
  id: string;
  userId: string | null;
  name: string;
  slug: string;
  description: string | null;
  systemPrompt: string;
  parentPromptId: string | null;
  skills: string[];
  libraries: string[];
  mcpServers: string[];
  preferences: PromptPreferences;
  category: string;
  tags: string[];
  isPublic: boolean;
  isStarterPack: boolean;
  isFeatured: boolean;
  installCount: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  isInstalled?: boolean;
  isActive?: boolean;
  isOwned?: boolean;
}

export interface DashboardStats {
  plan: "free" | "pro" | "team";
  mcpQueries: {
    used: number;
    limit: number | null;
    percentUsed: number;
  };
  apiKeys: {
    count: number;
    limit: number;
    keys: Array<{
      id: string;
      name: string;
      prefix: string;
      lastUsed: string | null;
    }>;
  };
  skills: {
    installed: number;
  };
  stacks: {
    count: number;
    recent: Array<{
      id: string;
      name: string;
      slug: string;
      icon: string | null;
      color: string | null;
    }>;
  };
  prompts: {
    count: number;
    recent: Array<{
      id: string;
      name: string;
      isActive: boolean;
    }>;
  };
}

export interface Learning {
  id: string;
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
  isActive: boolean;
  createdAt: string;
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
  eventType: string;
  xpAmount: number;
  category: string;
  description: string | null;
  createdAt: string;
}

// ============================================================================
// API Keys Queries
// ============================================================================

export function useApiKeys() {
  return useQuery({
    queryKey: queryKeys.dashboard.keys,
    queryFn: async () => {
      const res = await authFetch("/api/user/tokens");
      if (!res.ok) throw new Error("Failed to fetch API keys");
      return res.json() as Promise<{ tokens: ApiKey[] }>;
    },
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; scopes: string[] }) => {
      const res = await authFetch("/api/user/tokens", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = (await res.json()) as { error?: string };
        throw new Error(error.error || "Failed to create API key");
      }
      return res.json() as Promise<{ token: string }>;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.keys });
    },
  });
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await authFetch(`/api/user/tokens/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete API key");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.keys });
    },
  });
}

// ============================================================================
// Stacks Queries
// ============================================================================

export function useStacks(filter: "all" | "starter" | "my" | "installed") {
  return useQuery({
    queryKey: queryKeys.dashboard.stacks(filter),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter === "starter") params.set("filter", "starter");
      if (filter === "my") params.set("filter", "my");
      if (filter === "installed") params.set("filter", "installed");

      const res = await authFetch(`/api/stacks?${params}`);
      if (!res.ok) throw new Error("Failed to fetch stacks");
      return res.json() as Promise<{ stacks: Stack[] }>;
    },
  });
}

export function useInstallStack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (stackId: string) => {
      const res = await authFetch(`/api/stacks/${stackId}/install`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to install stack");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "stacks"] });
    },
  });
}

export function useUninstallStack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (stackId: string) => {
      const res = await authFetch(`/api/stacks/${stackId}/install`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to uninstall stack");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "stacks"] });
    },
  });
}

export function useDeleteStack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (stackId: string) => {
      const res = await authFetch(`/api/stacks/${stackId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete stack");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "stacks"] });
    },
  });
}

// ============================================================================
// Prompts Queries
// ============================================================================

export function usePrompts(filter: "all" | "starter" | "my") {
  return useQuery({
    queryKey: queryKeys.dashboard.prompts(filter),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter === "starter") params.set("starter", "true");
      if (filter === "my") params.set("my", "true");

      const res = await authFetch(`/api/prompts?${params}`);
      if (!res.ok) throw new Error("Failed to fetch prompts");
      return res.json() as Promise<{ prompts: Prompt[] }>;
    },
  });
}

export function useActivatePrompt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (promptId: string) => {
      const res = await authFetch(`/api/prompts/${promptId}/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to activate prompt");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "prompts"] });
    },
  });
}

export function useDeactivatePrompt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (promptId: string) => {
      const res = await authFetch(`/api/prompts/${promptId}/deactivate`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to deactivate prompt");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "prompts"] });
    },
  });
}

export function useInstallPrompt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (promptId: string) => {
      const res = await authFetch(`/api/prompts/${promptId}/install`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to install prompt");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "prompts"] });
    },
  });
}

export function useUninstallPrompt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (promptId: string) => {
      const res = await authFetch(`/api/prompts/${promptId}/install`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to uninstall prompt");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "prompts"] });
    },
  });
}

export function useDeletePrompt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (promptId: string) => {
      const res = await authFetch(`/api/prompts/${promptId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete prompt");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "prompts"] });
    },
  });
}

export function useDeactivateAllPrompts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await authFetch("/api/prompts/deactivate-all", { method: "POST" });
      if (!res.ok) throw new Error("Failed to deactivate all prompts");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "prompts"] });
    },
  });
}

export function useDownloadPrompt() {
  return useMutation({
    mutationFn: async (promptId: string) => {
      const res = await authFetch(`/api/prompts/${promptId}/download`);
      if (!res.ok) throw new Error("Failed to download prompt");
      return res.json() as Promise<{ filename: string; content: string }>;
    },
  });
}

// ============================================================================
// Dashboard Stats Query
// ============================================================================

export function useDashboardStats() {
  return useQueries({
    queries: [
      {
        queryKey: queryKeys.dashboard.stats,
        queryFn: async () => {
          const res = await authFetch("/api/user/stats");
          if (!res.ok) return {};
          return res.json();
        },
      },
      {
        queryKey: queryKeys.dashboard.keys,
        queryFn: async () => {
          const res = await authFetch("/api/user/tokens");
          if (!res.ok) return { tokens: [] };
          return res.json() as Promise<{ tokens: ApiKey[] }>;
        },
      },
      {
        queryKey: queryKeys.dashboard.stacks("my"),
        queryFn: async () => {
          const res = await authFetch("/api/stacks?filter=my&limit=3");
          if (!res.ok) return { stacks: [], total: 0 };
          return res.json() as Promise<{ stacks: Stack[]; total: number }>;
        },
      },
      {
        queryKey: queryKeys.dashboard.prompts("my"),
        queryFn: async () => {
          const res = await authFetch("/api/prompts?filter=my&limit=3");
          if (!res.ok) return { prompts: [], total: 0 };
          return res.json() as Promise<{ prompts: Prompt[]; total: number }>;
        },
      },
    ],
    combine: (results) => {
      const [statsResult, tokensResult, stacksResult, promptsResult] = results;
      const statsData = (statsResult.data ?? {}) as Record<string, unknown>;
      const tokensData = tokensResult.data ?? { tokens: [] };
      const stacksData = stacksResult.data ?? { stacks: [], total: 0 };
      const promptsData = promptsResult.data ?? { prompts: [], total: 0 };

      const stats: DashboardStats = {
        plan: (statsData.plan as DashboardStats["plan"]) || "free",
        mcpQueries: {
          used: (statsData.mcpQueries as { used?: number })?.used || 0,
          limit: (statsData.mcpQueries as { limit?: number })?.limit || 2000,
          percentUsed: (statsData.mcpQueries as { percentUsed?: number })?.percentUsed || 0,
        },
        apiKeys: {
          count: (statsData.apiKeys as { count?: number })?.count || 0,
          limit: (statsData.apiKeys as { limit?: number })?.limit || 1,
          keys: (tokensData.tokens || []).slice(0, 3).map((t) => ({
            id: t.id,
            name: t.name,
            prefix: t.tokenPrefix,
            lastUsed: t.lastUsedAt,
          })),
        },
        skills: {
          installed: (statsData.skills as { installed?: number })?.installed || 0,
        },
        stacks: {
          count: stacksData.total || stacksData.stacks?.length || 0,
          recent: (stacksData.stacks || []).slice(0, 3).map((s) => ({
            id: s.id,
            name: s.name,
            slug: s.slug,
            icon: s.icon,
            color: s.color,
          })),
        },
        prompts: {
          count: promptsData.total || promptsData.prompts?.length || 0,
          recent: (promptsData.prompts || []).slice(0, 3).map((p) => ({
            id: p.id,
            name: p.name,
            isActive: p.isActive ?? false,
          })),
        },
      };

      return {
        data: stats,
        isPending: results.some((r) => r.isPending),
        isError: results.some((r) => r.isError),
        error: results.find((r) => r.error)?.error,
      };
    },
  });
}

// ============================================================================
// Brain Queries
// ============================================================================

export function useBrainScore() {
  return useQuery({
    queryKey: queryKeys.dashboard.brain.score,
    queryFn: async () => {
      const res = await authFetch("/api/brain/score");
      if (!res.ok) throw new Error("Failed to fetch intelligence score");
      return res.json() as Promise<{ score: IntelligenceScore }>;
    },
  });
}

export function useLearnings(filter: string, limit = 50) {
  return useQuery({
    queryKey: queryKeys.dashboard.brain.learnings(filter),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      if (filter !== "all") params.set("type", filter);

      const res = await authFetch(`/api/brain/learnings?${params}`);
      if (!res.ok) throw new Error("Failed to fetch learnings");
      return res.json() as Promise<{ learnings: Learning[] }>;
    },
  });
}

export function useXpHistory(limit = 20) {
  return useQuery({
    queryKey: queryKeys.dashboard.brain.xpHistory,
    queryFn: async () => {
      const res = await authFetch(`/api/brain/xp-history?limit=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch XP history");
      return res.json() as Promise<{ events: XpEvent[] }>;
    },
  });
}

export function useCreateLearning() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      trigger: string;
      response: string;
      type: "correction" | "pattern" | "preference" | "skill";
      scope: "global" | "project" | "library" | "flow";
    }) => {
      const res = await authFetch("/api/brain/learnings", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create learning");
      return res.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.brain.all });
    },
  });
}

export function useToggleLearning() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await authFetch(`/api/brain/learnings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error("Failed to update learning");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.brain.all });
    },
  });
}

export function useDeleteLearning() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await authFetch(`/api/brain/learnings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete learning");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.brain.all });
    },
  });
}

// ============================================================================
// Repos Queries
// ============================================================================

export interface ConnectedRepo {
  id: string;
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
  createdAt: string;
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

export interface TierLimits {
  maxRepos: number;
  maxBytesPerRepo: number;
  privateRepos: boolean;
  currentRepoCount: number;
}

export function useRepos() {
  return useQuery({
    queryKey: queryKeys.dashboard.repos,
    queryFn: async () => {
      const res = await authFetch("/api/repos");
      if (!res.ok) throw new Error("Failed to fetch repos");
      return res.json() as Promise<{
        repos: ConnectedRepo[];
        tier: string;
        limits: TierLimits;
      }>;
    },
  });
}

export function useAvailableRepos() {
  return useQuery({
    queryKey: ["dashboard", "repos", "available"],
    queryFn: async () => {
      const res = await authFetch("/api/repos/available");
      if (!res.ok) throw new Error("Failed to fetch available repos");
      return res.json() as Promise<{ repos: AvailableRepo[] }>;
    },
    enabled: false, // Only fetch when explicitly requested
  });
}

export function useConnectRepo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (repo: {
      githubId: number;
      owner: string;
      name: string;
      fullName: string;
      description: string | null;
      htmlUrl: string;
      defaultBranch: string;
      isPrivate: boolean;
    }) => {
      const res = await authFetch("/api/repos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(repo),
      });
      if (!res.ok) throw new Error("Failed to connect repo");
      return res.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.repos });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "repos", "available"] });
    },
  });
}

export function useSyncRepo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await authFetch(`/api/repos/${id}/sync`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to sync repo");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.repos });
    },
  });
}

export function useDisconnectRepo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await authFetch(`/api/repos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to disconnect repo");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.repos });
    },
  });
}

// ============================================================================
// Skills Queries
// ============================================================================

export interface InstalledSkill {
  id: string;
  skill: {
    id: string;
    name: string;
    description: string;
    type: string;
    category: string;
  };
  installedAt: string;
  usageCount: number;
  lastUsedAt: string | null;
}

export function useInstalledSkills() {
  return useQuery({
    queryKey: queryKeys.dashboard.skills,
    queryFn: async () => {
      const res = await authFetch("/api/user/skills");
      if (!res.ok) {
        // API endpoint may not exist yet, return empty
        return { skills: [] as InstalledSkill[] };
      }
      return res.json() as Promise<{ skills: InstalledSkill[] }>;
    },
  });
}

export function useUninstallSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (skillId: string) => {
      const res = await authFetch(`/api/skills/${skillId}/uninstall`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to uninstall skill");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.skills });
    },
  });
}

// ============================================================================
// Billing Queries
// ============================================================================

export interface Subscription {
  plan: "free" | "pro" | "team";
  status: "active" | "canceled" | "past_due" | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export function useSubscription() {
  return useQuery({
    queryKey: queryKeys.dashboard.billing,
    queryFn: async () => {
      // TODO: Implement actual billing API
      // For now return mock data
      return {
        plan: "free" as const,
        status: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      } satisfies Subscription;
    },
  });
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: async (_planId: string) => {
      // TODO: Implement Stripe checkout
      // const res = await authFetch("/api/billing/checkout", {
      //   method: "POST",
      //   body: JSON.stringify({ planId }),
      // });
      // if (!res.ok) throw new Error("Failed to create checkout");
      // return res.json() as Promise<{ url: string }>;
      throw new Error("Stripe integration coming soon! Pro plan will be $5/month.");
    },
  });
}

export function useOpenBillingPortal() {
  return useMutation({
    mutationFn: async () => {
      // TODO: Implement Stripe portal
      // const res = await authFetch("/api/billing/portal", { method: "POST" });
      // if (!res.ok) throw new Error("Failed to open billing portal");
      // return res.json() as Promise<{ url: string }>;
      throw new Error("Billing portal coming soon!");
    },
  });
}

// ============================================================================
// Secrets Queries
// ============================================================================

export type SecretProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "azure"
  | "aws"
  | "github"
  | "cloudflare"
  | "custom";

export interface UserSecret {
  id: string;
  name: string;
  provider: SecretProvider;
  description?: string;
  keyPrefix?: string;
  lastUsedAt?: string;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
}

export function useSecrets() {
  return useQuery({
    queryKey: ["settings", "secrets"],
    queryFn: async () => {
      const res = await authFetch("/api/secrets");
      if (!res.ok) throw new Error("Failed to fetch secrets");
      return res.json() as Promise<{ secrets: UserSecret[] }>;
    },
  });
}

export function useRevealSecret() {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await authFetch(`/api/secrets/${id}?decrypt=true`);
      if (!res.ok) throw new Error("Failed to reveal secret");
      return res.json() as Promise<{ secret: { value: string } }>;
    },
  });
}

export function useCreateSecret() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      provider: SecretProvider;
      value: string;
      description?: string;
    }) => {
      const res = await authFetch("/api/secrets", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = (await res.json()) as { error?: string };
        throw new Error(errorData.error || "Failed to add secret");
      }
      return res.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["settings", "secrets"] });
    },
  });
}

export function useDeleteSecret() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await authFetch(`/api/secrets/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete secret");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["settings", "secrets"] });
    },
  });
}

// ============================================================================
// User Preferences Queries
// ============================================================================

export type ResponseFormat = "full" | "compact" | "code-only" | "summary";

export interface UserPreferences {
  defaultResponseFormat: ResponseFormat;
  defaultTokenBudget: number | null;
  showCodeLineNumbers: boolean;
  preferredCodeLanguage: string;
  emailNotifications: boolean;
  emailWeeklyDigest: boolean;
}

export function usePreferences() {
  return useQuery({
    queryKey: ["settings", "preferences"],
    queryFn: async () => {
      const res = await authFetch("/user/preferences");
      if (!res.ok) {
        // Return defaults if preferences don't exist
        return {
          defaultResponseFormat: "full" as ResponseFormat,
          defaultTokenBudget: null,
          showCodeLineNumbers: true,
          preferredCodeLanguage: "",
          emailNotifications: true,
          emailWeeklyDigest: false,
        } satisfies UserPreferences;
      }
      const data = (await res.json()) as Partial<UserPreferences>;
      return {
        defaultResponseFormat: data.defaultResponseFormat || "full",
        defaultTokenBudget: data.defaultTokenBudget ?? null,
        showCodeLineNumbers: data.showCodeLineNumbers ?? true,
        preferredCodeLanguage: data.preferredCodeLanguage || "",
        emailNotifications: data.emailNotifications ?? true,
        emailWeeklyDigest: data.emailWeeklyDigest ?? false,
      } satisfies UserPreferences;
    },
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (preferences: UserPreferences) => {
      const res = await authFetch("/user/preferences", {
        method: "PUT",
        body: JSON.stringify(preferences),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || "Failed to save preferences");
      }
      return res.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["settings", "preferences"] });
    },
  });
}
