/**
 * Response format helpers for MCP tool responses.
 * Transforms responses based on token efficiency requirements.
 */
import type { ResponseFormat } from "../../types";

/**
 * Format tool response based on requested format for token efficiency.
 */
export function formatToolResponse(
  result: unknown,
  toolName: string,
  format: ResponseFormat = "full"
): unknown {
  if (format === "full" || typeof result !== "object" || result === null) {
    return result;
  }

  const obj = result as Record<string, unknown>;

  switch (format) {
    case "compact":
      return formatCompact(obj, toolName);
    case "code-only":
      return formatCodeOnly(obj, toolName);
    case "summary":
      return formatSummary(obj, toolName);
    default:
      return result;
  }
}

/**
 * Compact format - essential data only, no metadata.
 */
function formatCompact(obj: Record<string, unknown>, toolName: string): unknown {
  // Remove verbose fields while keeping essential data
  const {
    success: _success,
    message: _message,
    recommendation: _recommendation,
    hints: _hints,
    suggestions: _suggestions,
    availableCategories: _availableCategories,
    ...rest
  } = obj;

  // For query-docs, only keep essential result fields
  if (toolName === "query-docs" && Array.isArray(rest.results)) {
    return {
      library: rest.libraryName,
      results: (rest.results as Array<Record<string, unknown>>).map((r) => ({
        title: r.title,
        content: r.content,
        source: r.sourceFile,
      })),
    };
  }

  // For resolve-library, simplify results
  if (toolName === "resolve-library" && Array.isArray(rest.results)) {
    return {
      results: (rest.results as Array<Record<string, unknown>>).map((r) => ({
        id: r.libraryId,
        name: r.name,
        chunks: (r.documentationCoverage as Record<string, unknown>)?.chunks,
      })),
    };
  }

  // For recall-memories, keep just memories
  if (toolName === "recall-memories" && Array.isArray(rest.memories)) {
    return {
      memories: (rest.memories as Array<Record<string, unknown>>).map((m) => ({
        id: m.memoryId,
        title: m.title,
        content: m.content,
        project: m.project,
      })),
    };
  }

  return rest;
}

/**
 * Code-only format - extract code blocks and minimal context.
 */
function formatCodeOnly(obj: Record<string, unknown>, toolName: string): unknown {
  // For query-docs, extract only code content
  if (toolName === "query-docs" && Array.isArray(obj.results)) {
    const codeResults = (obj.results as Array<Record<string, unknown>>)
      .filter((r) => r.contentType === "code" || (r.content as string)?.includes("```"))
      .map((r) => {
        const content = r.content as string;
        // Extract code blocks if mixed content
        const codeBlocks = content.match(/```[\s\S]*?```/g);
        return {
          title: r.title,
          code: codeBlocks ? codeBlocks.join("\n\n") : content,
          source: r.sourceFile,
        };
      });

    return {
      library: obj.libraryName,
      codeExamples: codeResults,
    };
  }

  // For other tools, return compact format
  return formatCompact(obj, toolName);
}

/**
 * Summary format - brief overview with key points.
 */
function formatSummary(obj: Record<string, unknown>, toolName: string): unknown {
  // For query-docs, provide a brief summary
  if (toolName === "query-docs" && Array.isArray(obj.results)) {
    const results = obj.results as Array<Record<string, unknown>>;
    return {
      library: obj.libraryName,
      query: obj.query,
      found: results.length,
      topics: results
        .slice(0, 3)
        .map((r) => r.title)
        .filter(Boolean),
      hint:
        results.length > 0
          ? "Use 'compact' or 'full' format for complete content."
          : "No results found. Try different search terms.",
    };
  }

  // For resolve-library, summarize matches
  if (toolName === "resolve-library" && Array.isArray(obj.results)) {
    const results = obj.results as Array<Record<string, unknown>>;
    const best = results[0];
    return {
      found: results.length,
      bestMatch: best ? { id: best.libraryId, name: best.name } : null,
      otherMatches: results.slice(1, 4).map((r) => r.name),
    };
  }

  // For list-libraries, just show count and categories
  if (toolName === "list-libraries" && Array.isArray(obj.libraries)) {
    const libs = obj.libraries as Array<Record<string, unknown>>;
    return {
      total: libs.length,
      featured: libs.filter((l) => l.isFeatured).map((l) => l.name),
      categories: obj.availableCategories,
    };
  }

  // Default: return key fields only
  const { success, results, libraries, memories, ...rest } = obj;
  return {
    status: success ? "ok" : "error",
    count: Array.isArray(results)
      ? results.length
      : Array.isArray(libraries)
        ? libraries.length
        : Array.isArray(memories)
          ? memories.length
          : undefined,
    ...rest,
  };
}
