/**
 * Prompt MCP Tool Implementations
 */
import { eq, like, and, or, desc, sql } from "drizzle-orm";
import {
  prompts,
  PROMPT_CATEGORIES,
  type Database,
  type Prompt,
  type PromptPreferences,
} from "@nexus/db";

/**
 * Resolve prompt inheritance chain (max 3 levels).
 */
export async function resolvePromptInheritance(
  db: Database,
  prompt: Prompt,
  depth = 0
): Promise<Prompt & { inheritanceChain: string[] }> {
  const maxDepth = 3;

  // Base case: no parent or max depth reached
  if (!prompt.parentPromptId || depth >= maxDepth) {
    return {
      ...prompt,
      skills: prompt.skills || [],
      libraries: prompt.libraries || [],
      mcpServers: prompt.mcpServers || [],
      preferences: prompt.preferences || {},
      inheritanceChain: [prompt.id],
    };
  }

  // Get parent prompt
  const [parentPrompt] = await db
    .select()
    .from(prompts)
    .where(eq(prompts.id, prompt.parentPromptId))
    .limit(1);

  if (!parentPrompt) {
    return {
      ...prompt,
      skills: prompt.skills || [],
      libraries: prompt.libraries || [],
      mcpServers: prompt.mcpServers || [],
      preferences: prompt.preferences || {},
      inheritanceChain: [prompt.id],
    };
  }

  // Recursively resolve parent
  const resolvedParent = await resolvePromptInheritance(db, parentPrompt, depth + 1);

  // Merge: child extends parent
  const mergedSkills = [...new Set([...(resolvedParent.skills || []), ...(prompt.skills || [])])];
  const mergedLibraries = [
    ...new Set([...(resolvedParent.libraries || []), ...(prompt.libraries || [])]),
  ];
  const mergedServers = [
    ...new Set([...(resolvedParent.mcpServers || []), ...(prompt.mcpServers || [])]),
  ];
  const mergedPreferences = {
    ...resolvedParent.preferences,
    ...prompt.preferences,
  };

  // System prompt: parent first, then child additions
  const mergedSystemPrompt = prompt.systemPrompt.startsWith(resolvedParent.systemPrompt)
    ? prompt.systemPrompt
    : `${resolvedParent.systemPrompt}\n\n---\n\n${prompt.systemPrompt}`;

  return {
    ...prompt,
    systemPrompt: mergedSystemPrompt,
    skills: mergedSkills,
    libraries: mergedLibraries,
    mcpServers: mergedServers,
    preferences: mergedPreferences as PromptPreferences,
    inheritanceChain: [...resolvedParent.inheritanceChain, prompt.id],
  };
}

/**
 * List available prompts.
 */
export async function toolListPrompts(
  args: Record<string, unknown>,
  db: Database
): Promise<object> {
  const category = args.category as string | undefined;
  const starterOnly = args.starterOnly !== false; // default true
  const search = args.search as string | undefined;
  const limit = Math.min(Math.max(Number(args.limit) || 10, 1), 20);

  // Build conditions
  const conditions: ReturnType<typeof eq>[] = [eq(prompts.isActive, true)];

  if (starterOnly) {
    conditions.push(eq(prompts.isStarterPack, true));
  } else {
    // Show public prompts
    conditions.push(eq(prompts.isPublic, true));
  }

  if (category && PROMPT_CATEGORIES.includes(category as (typeof PROMPT_CATEGORIES)[number])) {
    conditions.push(eq(prompts.category, category as (typeof PROMPT_CATEGORIES)[number]));
  }

  if (search) {
    const searchTerm = `%${search.toLowerCase()}%`;
    conditions.push(
      or(
        like(sql`lower(${prompts.name})`, searchTerm),
        like(sql`lower(${prompts.description})`, searchTerm)
      )!
    );
  }

  const results = await db
    .select({
      id: prompts.id,
      name: prompts.name,
      slug: prompts.slug,
      description: prompts.description,
      category: prompts.category,
      tags: prompts.tags,
      skills: prompts.skills,
      libraries: prompts.libraries,
      mcpServers: prompts.mcpServers,
      isStarterPack: prompts.isStarterPack,
      isFeatured: prompts.isFeatured,
      installCount: prompts.installCount,
      usageCount: prompts.usageCount,
    })
    .from(prompts)
    .where(and(...conditions))
    .orderBy(desc(prompts.isFeatured), desc(prompts.isStarterPack), desc(prompts.installCount))
    .limit(limit);

  return {
    success: true,
    prompts: results.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      category: p.category,
      tags: p.tags || [],
      skills: p.skills || [],
      libraries: p.libraries || [],
      mcpServers: p.mcpServers || [],
      isStarterPack: p.isStarterPack,
      isFeatured: p.isFeatured,
      stats: {
        installs: p.installCount,
        uses: p.usageCount,
      },
    })),
    count: results.length,
    availableCategories: PROMPT_CATEGORIES,
    hint:
      results.length === 0
        ? "No prompts found. Try different filters or search terms."
        : "Use get-prompt with a prompt ID or slug to retrieve the full system prompt.",
  };
}

/**
 * Get a specific prompt by ID or slug.
 */
export async function toolGetPrompt(args: Record<string, unknown>, db: Database): Promise<object> {
  const promptId = args.promptId as string;
  const resolve = args.resolve !== false; // default true

  if (!promptId) {
    return {
      success: false,
      error: "promptId is required",
    };
  }

  // Try to find by ID first, then by slug
  const [result] = await db
    .select()
    .from(prompts)
    .where(
      and(eq(prompts.isActive, true), or(eq(prompts.id, promptId), eq(prompts.slug, promptId)))
    )
    .limit(1);

  if (!result) {
    return {
      success: false,
      error: `Prompt not found: ${promptId}`,
      hint: "Use list-prompts to discover available prompts.",
    };
  }

  // Optionally resolve inheritance
  const finalPrompt = resolve
    ? await resolvePromptInheritance(db, result)
    : { ...result, inheritanceChain: [result.id] };

  return {
    success: true,
    prompt: {
      id: finalPrompt.id,
      name: finalPrompt.name,
      slug: finalPrompt.slug,
      description: finalPrompt.description,
      systemPrompt: finalPrompt.systemPrompt,
      category: finalPrompt.category,
      tags: finalPrompt.tags || [],
      skills: finalPrompt.skills || [],
      libraries: finalPrompt.libraries || [],
      mcpServers: finalPrompt.mcpServers || [],
      preferences: finalPrompt.preferences || {},
      parentPromptId: finalPrompt.parentPromptId,
      inheritanceChain: finalPrompt.inheritanceChain,
      isStarterPack: finalPrompt.isStarterPack,
      isFeatured: finalPrompt.isFeatured,
    },
    hint: "Apply this prompt's systemPrompt as your system instructions, and use the listed skills/libraries/mcpServers to configure your environment.",
  };
}

/**
 * Search prompts by keywords.
 */
export async function toolSearchPrompts(
  args: Record<string, unknown>,
  db: Database
): Promise<object> {
  const query = args.query as string;
  const category = args.category as string | undefined;
  const limit = Math.min(Math.max(Number(args.limit) || 5, 1), 10);

  if (!query) {
    return {
      success: false,
      error: "query is required",
    };
  }

  // Build conditions - search in name, description, and system prompt
  const searchTerm = `%${query.toLowerCase()}%`;
  const conditions: ReturnType<typeof eq>[] = [
    eq(prompts.isActive, true),
    or(eq(prompts.isPublic, true), eq(prompts.isStarterPack, true))!,
    or(
      like(sql`lower(${prompts.name})`, searchTerm),
      like(sql`lower(${prompts.description})`, searchTerm),
      like(sql`lower(${prompts.systemPrompt})`, searchTerm)
    )!,
  ];

  if (category && PROMPT_CATEGORIES.includes(category as (typeof PROMPT_CATEGORIES)[number])) {
    conditions.push(eq(prompts.category, category as (typeof PROMPT_CATEGORIES)[number]));
  }

  const results = await db
    .select({
      id: prompts.id,
      name: prompts.name,
      slug: prompts.slug,
      description: prompts.description,
      category: prompts.category,
      tags: prompts.tags,
      systemPrompt: prompts.systemPrompt,
      skills: prompts.skills,
      libraries: prompts.libraries,
      mcpServers: prompts.mcpServers,
      isStarterPack: prompts.isStarterPack,
      isFeatured: prompts.isFeatured,
    })
    .from(prompts)
    .where(and(...conditions))
    .orderBy(desc(prompts.isFeatured), desc(prompts.isStarterPack))
    .limit(limit);

  return {
    success: true,
    query,
    results: results.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      category: p.category,
      tags: p.tags || [],
      // Include a preview of the system prompt (first 200 chars)
      systemPromptPreview:
        p.systemPrompt.length > 200 ? p.systemPrompt.substring(0, 200) + "..." : p.systemPrompt,
      skills: p.skills || [],
      libraries: p.libraries || [],
      mcpServers: p.mcpServers || [],
      isStarterPack: p.isStarterPack,
      isFeatured: p.isFeatured,
    })),
    count: results.length,
    hint:
      results.length === 0
        ? "No matching prompts found. Try different keywords."
        : "Use get-prompt with a prompt ID to retrieve the full system prompt.",
  };
}

/**
 * Create or update a user prompt.
 * Note: This requires authentication which is not available in the MCP context.
 * Returns instructions for using the web dashboard instead.
 */
export async function toolSavePrompt(
  args: Record<string, unknown>,
  _db: Database
): Promise<object> {
  // MCP tools don't have access to user session, so we can't create prompts directly
  // Instead, return instructions for using the dashboard
  const name = args.name as string;
  const promptId = args.promptId as string | undefined;

  if (!name) {
    return {
      success: false,
      error: "name is required",
    };
  }

  return {
    success: false,
    error: "Authentication required",
    message:
      "Creating or updating prompts requires authentication. " +
      "Please use the Nexus web dashboard to manage your prompts.",
    hint: "Visit https://nexus.yogan.dev/dashboard/prompts to create and manage prompts.",
    providedData: {
      name,
      promptId: promptId || "(new prompt)",
      // Echo back what they provided so they can copy to the dashboard
      description: args.description,
      systemPrompt: args.systemPrompt ? "(provided)" : undefined,
      category: args.category,
      tags: args.tags,
      skills: args.skills,
      libraries: args.libraries,
      mcpServers: args.mcpServers,
    },
  };
}
