import { eq, like, and, or, desc, sql } from "drizzle-orm";
import {
  stacks,
  STACK_CATEGORIES,
  type Database,
  type TokenBudget,
  type StackCategory,
} from "@nexus/db";

// ============================================================================
// Tool Implementations
// ============================================================================

export async function toolGetStack(
  args: Record<string, unknown>,
  db: Database,
  env: Env
): Promise<object> {
  const stackId = args.stackId as string;
  const tokenBudget = (args.tokenBudget as TokenBudget) || "standard";

  if (!stackId) {
    return {
      success: false,
      error: "stackId is required",
    };
  }

  // Find stack by ID or slug
  const [stack] = await db
    .select()
    .from(stacks)
    .where(
      and(
        or(eq(stacks.id, stackId), eq(stacks.slug, stackId)),
        eq(stacks.isActive, true),
        or(eq(stacks.isPublic, true), eq(stacks.isStarter, true))
      )
    )
    .limit(1);

  if (!stack) {
    return {
      success: false,
      error: `Stack not found: ${stackId}`,
      hint: "Use list-stacks to discover available stacks.",
    };
  }

  // Check if compiled prompt exists
  if (!stack.compiledPrompt && stack.learningStatus !== "complete") {
    return {
      success: false,
      error: "Stack has not been compiled yet",
      stackId: stack.id,
      stackName: stack.name,
      learningStatus: stack.learningStatus,
      hint: "The stack owner needs to compile this stack first.",
    };
  }

  // Get compiled prompt - may be in R2 for large prompts
  let compiledPrompt = stack.compiledPrompt;

  if (stack.r2Key && env.DOCS_BUCKET) {
    try {
      const object = await env.DOCS_BUCKET.get(stack.r2Key);
      if (object) {
        compiledPrompt = await object.text();
      }
    } catch (error) {
      console.warn(`Failed to fetch stack prompt from R2: ${stack.r2Key}`, error);
    }
  }

  // Apply token budget truncation if needed
  const budgetLimits: Record<TokenBudget, number> = {
    minimal: 2000,
    standard: 5000,
    comprehensive: 10000,
  };
  const maxTokens = budgetLimits[tokenBudget];

  // Rough token estimation (4 chars per token)
  const estimatedTokens = Math.ceil((compiledPrompt?.length || 0) / 4);
  let truncatedPrompt = compiledPrompt;

  if (estimatedTokens > maxTokens && compiledPrompt) {
    // Truncate to fit budget
    const maxChars = maxTokens * 4;
    truncatedPrompt =
      compiledPrompt.slice(0, maxChars) + "\n\n[... truncated to fit token budget ...]";
  }

  // Update use count
  await db
    .update(stacks)
    .set({
      useCount: sql`${stacks.useCount} + 1`,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(stacks.id, stack.id));

  return {
    success: true,
    stack: {
      id: stack.id,
      name: stack.name,
      slug: stack.slug,
      description: stack.description,
      category: stack.category,
      layer: stack.layer,
      tokenBudget: tokenBudget,
      estimatedTokens: Math.ceil((truncatedPrompt?.length || 0) / 4),
    },
    prompt: truncatedPrompt,
    preferences: stack.cliPreferences,
    hint:
      estimatedTokens > maxTokens
        ? `Prompt truncated from ~${estimatedTokens} to ~${maxTokens} tokens. Use 'comprehensive' budget for full content.`
        : undefined,
  };
}

export async function toolListStacks(
  args: Record<string, unknown>,
  db: Database,
  _env: Env
): Promise<object> {
  const filter = (args.filter as string) || "featured";
  const category = args.category as string | undefined;
  const query = args.query as string | undefined;
  const limit = Math.min(Math.max(Number(args.limit) || 10, 1), 20);

  // Build conditions based on filter
  const conditions: ReturnType<typeof eq>[] = [eq(stacks.isActive, true)];

  switch (filter) {
    case "featured":
      conditions.push(or(eq(stacks.isFeatured, true), eq(stacks.isStarter, true))!);
      break;
    case "all":
      conditions.push(eq(stacks.isPublic, true));
      break;
    // 'installed' and 'mine' require auth - will return empty for now
    case "installed":
    case "mine":
      return {
        success: true,
        stacks: [],
        count: 0,
        hint: "Authentication required to view installed or owned stacks. Use the web dashboard instead.",
      };
  }

  // Add category filter
  if (category && STACK_CATEGORIES.includes(category as StackCategory)) {
    conditions.push(eq(stacks.category, category as StackCategory));
  }

  // Add search query
  if (query) {
    conditions.push(or(like(stacks.name, `%${query}%`), like(stacks.description, `%${query}%`))!);
  }

  const results = await db
    .select({
      id: stacks.id,
      name: stacks.name,
      slug: stacks.slug,
      description: stacks.description,
      category: stacks.category,
      layer: stacks.layer,
      icon: stacks.icon,
      color: stacks.color,
      isStarter: stacks.isStarter,
      isFeatured: stacks.isFeatured,
      useCount: stacks.useCount,
      forkCount: stacks.forkCount,
      tokenCount: stacks.tokenCount,
      learningStatus: stacks.learningStatus,
    })
    .from(stacks)
    .where(and(...conditions))
    .orderBy(desc(stacks.isFeatured), desc(stacks.isStarter), desc(stacks.useCount))
    .limit(limit);

  return {
    success: true,
    filter,
    category: category || "all",
    query: query || undefined,
    stacks: results.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      description: s.description,
      category: s.category,
      layer: s.layer,
      icon: s.icon,
      isStarter: s.isStarter,
      isFeatured: s.isFeatured,
      stats: {
        uses: s.useCount,
        forks: s.forkCount,
        tokens: s.tokenCount,
      },
      ready: s.learningStatus === "complete",
    })),
    count: results.length,
    hint:
      results.length === 0
        ? "No stacks found. Try different filters or search terms."
        : "Use get-stack with a stack ID or slug to retrieve the compiled prompt.",
  };
}
