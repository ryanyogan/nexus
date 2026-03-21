/**
 * Home page server functions for data fetching.
 * Uses TanStack Start's createServerFn for type-safe server/client communication.
 */

import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import { sql, eq, desc, like, or, and } from "drizzle-orm";
import * as schema from "@nexus/db";
import { withLoggingInput } from "../lib/server-fn";
import type {
  HomePageData,
  HomePageInput,
  ContentItem,
  LibraryItem,
  ServerItem,
  SkillItem,
  StackItem,
  PromptItem,
  SortMode,
} from "../types/home";

// ============================================================================
// Constants
// ============================================================================

export const PAGE_SIZE = 10;

// ============================================================================
// Score Calculation Functions
// ============================================================================

function getDocScore(doc: LibraryItem, sort: SortMode): number {
  switch (sort) {
    case "popular":
      return doc.totalChunks;
    case "trending":
      return doc.totalQueries + (doc.lastQueriedAt ? 1000 : 0);
    case "recent":
      return doc.lastIndexedAt ? new Date(doc.lastIndexedAt).getTime() : 0;
  }
}

function getServerScore(server: ServerItem, sort: SortMode): number {
  switch (sort) {
    case "popular":
      return server.weeklyDownloads + server.githubStars;
    case "trending":
      return server.totalDiscoveries + (server.lastDiscoveredAt ? 1000 : 0);
    case "recent":
      return new Date(server.updatedAt).getTime();
  }
}

function getSkillScore(skill: SkillItem, sort: SortMode): number {
  switch (sort) {
    case "popular":
      return skill.installCount + skill.usageCount;
    case "trending":
      return skill.usageCount + (skill.lastQueriedAt ? 1000 : 0);
    case "recent":
      return new Date(skill.updatedAt).getTime();
  }
}

function getStackScore(stack: StackItem, sort: SortMode): number {
  const starterBoost = stack.isStarter ? 10000 : 0;
  const featuredBoost = stack.isFeatured ? 5000 : 0;

  switch (sort) {
    case "popular":
      return stack.useCount + stack.forkCount + starterBoost + featuredBoost;
    case "trending":
      return stack.useCount + starterBoost + featuredBoost;
    case "recent":
      return new Date(stack.updatedAt).getTime();
  }
}

function getPromptScore(prompt: PromptItem, sort: SortMode): number {
  switch (sort) {
    case "popular":
      return prompt.usageCount;
    case "trending":
      return prompt.usageCount;
    case "recent":
      return new Date(prompt.updatedAt).getTime();
  }
}

// ============================================================================
// Normalize and Sort
// ============================================================================

export function normalizeAndSort(items: ContentItem[], sort: SortMode): ContentItem[] {
  const docs = items.filter((i): i is LibraryItem => i.type === "doc");
  const servers = items.filter((i): i is ServerItem => i.type === "server");
  const skills = items.filter((i): i is SkillItem => i.type === "skill");
  const stacks = items.filter((i): i is StackItem => i.type === "stack");
  const prompts = items.filter((i): i is PromptItem => i.type === "prompt");

  const maxDocScore = Math.max(...docs.map((d) => getDocScore(d, sort)), 1);
  const maxServerScore = Math.max(...servers.map((s) => getServerScore(s, sort)), 1);
  const maxSkillScore = Math.max(...skills.map((s) => getSkillScore(s, sort)), 1);
  const maxStackScore = Math.max(...stacks.map((s) => getStackScore(s, sort)), 1);
  const maxPromptScore = Math.max(...prompts.map((p) => getPromptScore(p, sort)), 1);

  const scored = items.map((item) => {
    let normalizedScore = 0;
    switch (item.type) {
      case "doc":
        normalizedScore = getDocScore(item, sort) / maxDocScore;
        break;
      case "server":
        normalizedScore = getServerScore(item, sort) / maxServerScore;
        break;
      case "skill":
        normalizedScore = getSkillScore(item, sort) / maxSkillScore;
        break;
      case "stack":
        normalizedScore = getStackScore(item, sort) / maxStackScore;
        break;
      case "prompt":
        normalizedScore = getPromptScore(item, sort) / maxPromptScore;
        break;
    }
    return { item, score: normalizedScore };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.item);
}

// ============================================================================
// Main Server Function
// ============================================================================

export const getHomePageData = createServerFn({ method: "GET" })
  .inputValidator((data: HomePageInput) => data)
  .handler(
    withLoggingInput("getHomePageData", async ({ data }): Promise<HomePageData> => {
      const db = drizzle(env.DB, { schema });
      const { sort, filter = "all", q, cursor = 0 } = data;

      // ========================================
      // Fetch Stats
      // ========================================

      const [libraryStats] = await db
        .select({
          total: sql<number>`count(*)`,
          indexed: sql<number>`sum(case when index_status = 'indexed' then 1 else 0 end)`,
        })
        .from(schema.libraries)
        .where(eq(schema.libraries.isActive, true));

      const [serverStats] = await db
        .select({ total: sql<number>`count(*)` })
        .from(schema.mcpServers)
        .where(eq(schema.mcpServers.isActive, true));

      const [skillStats] = await db
        .select({ total: sql<number>`count(*)` })
        .from(schema.skills)
        .where(eq(schema.skills.isActive, true));

      const [stackStats] = await db
        .select({ total: sql<number>`count(*)` })
        .from(schema.stacks)
        .where(
          and(
            eq(schema.stacks.isActive, true),
            or(eq(schema.stacks.isPublic, true), eq(schema.stacks.isStarter, true))
          )
        );

      const [promptStats] = await db
        .select({ total: sql<number>`count(*)` })
        .from(schema.prompts)
        .where(and(eq(schema.prompts.isActive, true), eq(schema.prompts.isPublic, true)));

      const stats = {
        libraries: Number(libraryStats?.indexed ?? 0),
        servers: Number(serverStats?.total ?? 0),
        skills: Number(skillStats?.total ?? 0),
        stacks: Number(stackStats?.total ?? 0),
        prompts: Number(promptStats?.total ?? 0),
      };

      // ========================================
      // Build Items Array Based on Filter
      // ========================================

      const items: ContentItem[] = [];
      const shouldFetch = (type: string) => filter === "all" || filter === type;

      // Fetch Libraries
      if (shouldFetch("docs")) {
        const libraryConditions = [eq(schema.libraries.indexStatus, "indexed")];
        if (q) {
          libraryConditions.push(
            or(like(schema.libraries.name, `%${q}%`), like(schema.libraries.description, `%${q}%`))!
          );
        }

        const getLibraryOrder = () => {
          switch (sort) {
            case "popular":
              return [desc(schema.libraries.totalChunks)];
            case "trending":
              return [
                desc(schema.libraryStats.lastQueriedAt),
                desc(schema.libraryStats.totalQueries),
              ];
            case "recent":
              return [desc(schema.libraries.lastIndexedAt)];
          }
        };

        const libraryResults = await db
          .select({
            id: schema.libraries.id,
            name: schema.libraries.name,
            description: schema.libraries.description,
            sourceUrl: schema.libraries.sourceUrl,
            totalTokens: schema.libraries.totalTokens,
            totalChunks: schema.libraries.totalChunks,
            lastIndexedAt: schema.libraries.lastIndexedAt,
            isFeatured: schema.libraries.isFeatured,
            lastQueriedAt: schema.libraryStats.lastQueriedAt,
            totalQueries: schema.libraryStats.totalQueries,
          })
          .from(schema.libraries)
          .leftJoin(schema.libraryStats, eq(schema.libraries.id, schema.libraryStats.libraryId))
          .where(and(...libraryConditions))
          .orderBy(...getLibraryOrder())
          .limit(PAGE_SIZE);

        for (const lib of libraryResults) {
          items.push({
            type: "doc",
            id: lib.id,
            name: lib.name,
            description: lib.description,
            sourceUrl: lib.sourceUrl,
            totalTokens: lib.totalTokens,
            totalChunks: lib.totalChunks,
            lastIndexedAt: lib.lastIndexedAt,
            isFeatured: lib.isFeatured,
            lastQueriedAt: lib.lastQueriedAt,
            totalQueries: lib.totalQueries ?? 0,
          });
        }
      }

      // Fetch Servers
      if (shouldFetch("servers")) {
        const serverConditions = [eq(schema.mcpServers.isActive, true)];
        if (q) {
          serverConditions.push(
            sql`(${schema.mcpServers.name} LIKE ${"%" + q + "%"} OR ${schema.mcpServers.displayName} LIKE ${"%" + q + "%"} OR ${schema.mcpServers.description} LIKE ${"%" + q + "%"})`
          );
        }

        const getServerOrder = () => {
          switch (sort) {
            case "popular":
              return [desc(schema.mcpServers.weeklyDownloads), desc(schema.mcpServers.githubStars)];
            case "trending":
              return [
                desc(schema.mcpServerStats.lastDiscoveredAt),
                desc(schema.mcpServerStats.totalDiscoveries),
              ];
            case "recent":
              return [desc(schema.mcpServers.updatedAt)];
          }
        };

        const serverResults = await db
          .select({
            id: schema.mcpServers.id,
            name: schema.mcpServers.name,
            displayName: schema.mcpServers.displayName,
            description: schema.mcpServers.description,
            repositoryUrl: schema.mcpServers.repositoryUrl,
            weeklyDownloads: schema.mcpServers.weeklyDownloads,
            githubStars: schema.mcpServers.githubStars,
            updatedAt: schema.mcpServers.updatedAt,
            isOfficial: schema.mcpServers.isOfficial,
            lastDiscoveredAt: schema.mcpServerStats.lastDiscoveredAt,
            totalDiscoveries: schema.mcpServerStats.totalDiscoveries,
          })
          .from(schema.mcpServers)
          .leftJoin(schema.mcpServerStats, eq(schema.mcpServers.id, schema.mcpServerStats.serverId))
          .where(and(...serverConditions))
          .orderBy(...getServerOrder())
          .limit(PAGE_SIZE);

        for (const server of serverResults) {
          items.push({
            type: "server",
            id: server.id,
            name: server.name,
            displayName: server.displayName,
            description: server.description,
            repositoryUrl: server.repositoryUrl,
            weeklyDownloads: server.weeklyDownloads,
            githubStars: server.githubStars,
            updatedAt: server.updatedAt,
            isOfficial: server.isOfficial,
            lastDiscoveredAt: server.lastDiscoveredAt,
            totalDiscoveries: server.totalDiscoveries ?? 0,
          });
        }
      }

      // Fetch Skills
      if (shouldFetch("skills")) {
        const skillConditions = [eq(schema.skills.isActive, true)];
        if (q) {
          skillConditions.push(
            sql`(${schema.skills.name} LIKE ${"%" + q + "%"} OR ${schema.skills.description} LIKE ${"%" + q + "%"})`
          );
        }

        const getSkillOrder = () => {
          switch (sort) {
            case "popular":
              return [desc(schema.skills.installCount), desc(schema.skills.usageCount)];
            case "trending":
              return [desc(schema.skills.lastQueriedAt), desc(schema.skills.usageCount)];
            case "recent":
              return [desc(schema.skills.updatedAt)];
          }
        };

        const skillResults = await db
          .select({
            id: schema.skills.id,
            name: schema.skills.name,
            description: schema.skills.description,
            sourceUrl: schema.skills.sourceUrl,
            installCount: schema.skills.installCount,
            usageCount: schema.skills.usageCount,
            updatedAt: schema.skills.updatedAt,
            type: schema.skills.type,
            lastQueriedAt: schema.skills.lastQueriedAt,
          })
          .from(schema.skills)
          .where(and(...skillConditions))
          .orderBy(...getSkillOrder())
          .limit(PAGE_SIZE);

        for (const skill of skillResults) {
          items.push({
            type: "skill",
            id: skill.id,
            name: skill.name,
            description: skill.description,
            sourceUrl: skill.sourceUrl,
            installCount: skill.installCount,
            usageCount: skill.usageCount,
            updatedAt: skill.updatedAt,
            skillType: skill.type,
            lastQueriedAt: skill.lastQueriedAt,
          });
        }
      }

      // Fetch Stacks
      if (shouldFetch("stacks")) {
        const stackConditions = [
          eq(schema.stacks.isActive, true),
          or(eq(schema.stacks.isPublic, true), eq(schema.stacks.isStarter, true))!,
        ];
        if (q) {
          stackConditions.push(
            sql`(${schema.stacks.name} LIKE ${"%" + q + "%"} OR ${schema.stacks.description} LIKE ${"%" + q + "%"})`
          );
        }

        const getStackOrder = () => {
          switch (sort) {
            case "popular":
              return [desc(schema.stacks.useCount), desc(schema.stacks.forkCount)];
            case "trending":
              return [desc(schema.stacks.useCount), desc(schema.stacks.updatedAt)];
            case "recent":
              return [desc(schema.stacks.updatedAt)];
          }
        };

        const stackResults = await db
          .select({
            id: schema.stacks.id,
            name: schema.stacks.name,
            slug: schema.stacks.slug,
            description: schema.stacks.description,
            category: schema.stacks.category,
            layer: schema.stacks.layer,
            icon: schema.stacks.icon,
            color: schema.stacks.color,
            useCount: schema.stacks.useCount,
            forkCount: schema.stacks.forkCount,
            isStarter: schema.stacks.isStarter,
            isFeatured: schema.stacks.isFeatured,
            updatedAt: schema.stacks.updatedAt,
          })
          .from(schema.stacks)
          .where(and(...stackConditions))
          .orderBy(...getStackOrder())
          .limit(PAGE_SIZE);

        for (const stack of stackResults) {
          items.push({
            type: "stack",
            id: stack.id,
            name: stack.name,
            slug: stack.slug,
            description: stack.description,
            category: stack.category,
            layer: stack.layer,
            icon: stack.icon,
            color: stack.color,
            useCount: stack.useCount,
            forkCount: stack.forkCount,
            isStarter: stack.isStarter,
            isFeatured: stack.isFeatured,
            updatedAt: stack.updatedAt,
          });
        }
      }

      // Fetch Prompts (Public only)
      if (shouldFetch("prompts")) {
        const promptConditions = [
          eq(schema.prompts.isActive, true),
          eq(schema.prompts.isPublic, true),
        ];
        if (q) {
          promptConditions.push(
            sql`(${schema.prompts.name} LIKE ${"%" + q + "%"} OR ${schema.prompts.description} LIKE ${"%" + q + "%"})`
          );
        }

        const getPromptOrder = () => {
          switch (sort) {
            case "popular":
              return [desc(schema.prompts.usageCount)];
            case "trending":
              return [desc(schema.prompts.usageCount)];
            case "recent":
              return [desc(schema.prompts.updatedAt)];
          }
        };

        const promptResults = await db
          .select({
            id: schema.prompts.id,
            name: schema.prompts.name,
            description: schema.prompts.description,
            category: schema.prompts.category,
            usageCount: schema.prompts.usageCount,
            updatedAt: schema.prompts.updatedAt,
            userId: schema.prompts.userId,
            authorName: schema.users.name,
          })
          .from(schema.prompts)
          .leftJoin(schema.users, eq(schema.prompts.userId, schema.users.id))
          .where(and(...promptConditions))
          .orderBy(...getPromptOrder())
          .limit(PAGE_SIZE);

        for (const prompt of promptResults) {
          items.push({
            type: "prompt",
            id: prompt.id,
            name: prompt.name,
            description: prompt.description,
            category: prompt.category,
            usageCount: prompt.usageCount,
            updatedAt: prompt.updatedAt,
            authorName: prompt.authorName,
          });
        }
      }

      // ========================================
      // Sort and Paginate
      // ========================================

      const sortedItems = normalizeAndSort(items, sort);
      const total = stats.libraries + stats.servers + stats.skills + stats.stacks + stats.prompts;

      return {
        stats,
        items: sortedItems.slice(cursor, cursor + PAGE_SIZE),
        hasMore: sortedItems.length > cursor + PAGE_SIZE,
        nextCursor: cursor + PAGE_SIZE,
        total,
      };
    })
  );
