/**
 * Stack Prompt Compiler
 *
 * Compiles knowledge from repos, packages, and child stacks
 * into a token-efficient context prompt for AI coding assistants.
 */

import type { Stack, StackPackage } from "@nexus/db";
import type { RepoAnalysis } from "./repo-analyzer";

export interface CompileOptions {
  stack: Stack;
  repos: RepoAnalysis[];
  packages: StackPackage[];
  childStacks: Stack[];
  tokenBudget: "minimal" | "standard" | "comprehensive";
  ai: Ai;
}

export interface CompiledPrompt {
  prompt: string;
  tokenCount: number;
  sections: PromptSection[];
}

export interface PromptSection {
  name: string;
  tokenCount: number;
  truncated: boolean;
}

// Approximate token limits for each budget
const TOKEN_LIMITS = {
  minimal: 2000,
  standard: 5000,
  comprehensive: 10000,
} as const;

// Section weights for budget allocation
const SECTION_WEIGHTS = {
  header: 0.05,
  instructions: 0.25,
  paradigms: 0.15,
  packages: 0.2,
  structure: 0.15,
  childStacks: 0.2,
} as const;

/**
 * Compile a stack's knowledge into an optimized prompt.
 */
export async function compileStackPrompt(options: CompileOptions): Promise<CompiledPrompt> {
  const { stack, repos, packages, childStacks, tokenBudget } = options;
  const maxTokens = TOKEN_LIMITS[tokenBudget];

  const sections: PromptSection[] = [];
  const parts: string[] = [];

  // 1. Header section
  const header = compileHeader(stack);
  parts.push(header);
  sections.push({
    name: "header",
    tokenCount: estimateTokens(header),
    truncated: false,
  });

  // 2. Instructions section (from stack.instructions)
  if (stack.instructions) {
    const instructionsBudget = Math.floor(maxTokens * SECTION_WEIGHTS.instructions);
    const { text, truncated } = truncateToTokens(stack.instructions, instructionsBudget);
    const instructionsSection = `## Instructions\n\n${text}`;
    parts.push(instructionsSection);
    sections.push({
      name: "instructions",
      tokenCount: estimateTokens(instructionsSection),
      truncated,
    });
  }

  // 3. Paradigms and patterns from repos
  if (repos.length > 0) {
    const paradigmsBudget = Math.floor(maxTokens * SECTION_WEIGHTS.paradigms);
    const paradigmsSection = compileParadigms(repos, paradigmsBudget);
    parts.push(paradigmsSection.text);
    sections.push({
      name: "paradigms",
      tokenCount: paradigmsSection.tokens,
      truncated: paradigmsSection.truncated,
    });
  }

  // 4. Package documentation
  if (packages.length > 0) {
    const packagesBudget = Math.floor(maxTokens * SECTION_WEIGHTS.packages);
    const packagesSection = compilePackages(packages, packagesBudget);
    parts.push(packagesSection.text);
    sections.push({
      name: "packages",
      tokenCount: packagesSection.tokens,
      truncated: packagesSection.truncated,
    });
  }

  // 5. Directory structure from repos
  if (repos.length > 0) {
    const structureBudget = Math.floor(maxTokens * SECTION_WEIGHTS.structure);
    const structureSection = compileStructure(repos, structureBudget);
    parts.push(structureSection.text);
    sections.push({
      name: "structure",
      tokenCount: structureSection.tokens,
      truncated: structureSection.truncated,
    });
  }

  // 6. Child stacks (compositions)
  if (childStacks.length > 0) {
    const childStacksBudget = Math.floor(maxTokens * SECTION_WEIGHTS.childStacks);
    const childSection = compileChildStacks(childStacks, childStacksBudget);
    parts.push(childSection.text);
    sections.push({
      name: "childStacks",
      tokenCount: childSection.tokens,
      truncated: childSection.truncated,
    });
  }

  const prompt = parts.join("\n\n");
  const tokenCount = estimateTokens(prompt);

  return {
    prompt,
    tokenCount,
    sections,
  };
}

/**
 * Compile the header section with stack metadata.
 */
function compileHeader(stack: Stack): string {
  const lines = [`# ${stack.name}`, ""];

  if (stack.description) {
    lines.push(stack.description, "");
  }

  if (stack.category) {
    lines.push(`**Category:** ${stack.category}`);
  }

  if (stack.tags && stack.tags.length > 0) {
    lines.push(`**Tags:** ${stack.tags.join(", ")}`);
  }

  return lines.join("\n");
}

/**
 * Compile paradigms section from repo analyses.
 */
function compileParadigms(
  repos: RepoAnalysis[],
  budget: number
): { text: string; tokens: number; truncated: boolean } {
  const allParadigms = new Set<string>();
  const techStacks: string[] = [];

  for (const repo of repos) {
    if (repo.paradigms) {
      repo.paradigms.forEach((p) => allParadigms.add(p));
    }
    if (repo.techStack) {
      const stack = repo.techStack;
      const stackParts = [stack.language];
      if (stack.framework) stackParts.push(stack.framework);
      if (stack.buildTool) stackParts.push(stack.buildTool);
      techStacks.push(stackParts.join(" + "));
    }
  }

  const lines = ["## Architecture & Patterns", ""];

  if (allParadigms.size > 0) {
    lines.push("**Paradigms:**");
    for (const paradigm of allParadigms) {
      lines.push(`- ${formatParadigm(paradigm)}`);
    }
    lines.push("");
  }

  if (techStacks.length > 0) {
    lines.push("**Tech Stack:**");
    const uniqueStacks = [...new Set(techStacks)];
    for (const stack of uniqueStacks) {
      lines.push(`- ${stack}`);
    }
  }

  let text = lines.join("\n");
  let truncated = false;

  if (estimateTokens(text) > budget) {
    const result = truncateToTokens(text, budget);
    text = result.text;
    truncated = result.truncated;
  }

  return { text, tokens: estimateTokens(text), truncated };
}

/**
 * Compile packages section with documentation summaries.
 */
function compilePackages(
  packages: StackPackage[],
  budget: number
): { text: string; tokens: number; truncated: boolean } {
  const lines = ["## Key Packages", ""];
  let truncated = false;

  // Sort by whether they have documentation
  const sorted = [...packages].sort((a, b) => {
    if (a.documentationSummary && !b.documentationSummary) return -1;
    if (!a.documentationSummary && b.documentationSummary) return 1;
    return 0;
  });

  const tokensPerPackage = Math.floor(budget / Math.max(packages.length, 1));
  let currentTokens = estimateTokens(lines.join("\n"));

  for (const pkg of sorted) {
    const pkgLines = [`### ${pkg.name}`];

    if (pkg.documentationSummary) {
      pkgLines.push(pkg.documentationSummary);
    }

    if (pkg.keyApis && pkg.keyApis.length > 0) {
      pkgLines.push("");
      pkgLines.push("**Key APIs:**");
      for (const api of pkg.keyApis.slice(0, 5)) {
        pkgLines.push(`- \`${api}\``);
      }
    }

    const pkgText = pkgLines.join("\n");
    const pkgTokens = estimateTokens(pkgText);

    if (currentTokens + pkgTokens > budget) {
      truncated = true;
      break;
    }

    lines.push(pkgText, "");
    currentTokens += pkgTokens;
  }

  const text = lines.join("\n").trim();
  return { text, tokens: estimateTokens(text), truncated };
}

/**
 * Compile directory structure section.
 */
function compileStructure(
  repos: RepoAnalysis[],
  budget: number
): { text: string; tokens: number; truncated: boolean } {
  const lines = ["## Project Structure", ""];
  let truncated = false;

  for (const repo of repos) {
    if (repo.directoryStructure) {
      lines.push("```");
      lines.push(formatDirectoryTree(repo.directoryStructure, "", budget / 2));
      lines.push("```");
      lines.push("");
    }

    if (repo.keyFiles && repo.keyFiles.length > 0) {
      lines.push("**Key Files:**");
      for (const file of repo.keyFiles.slice(0, 10)) {
        lines.push(`- \`${file.path}\` - ${file.purpose}`);
      }
    }
  }

  let text = lines.join("\n");

  if (estimateTokens(text) > budget) {
    const result = truncateToTokens(text, budget);
    text = result.text;
    truncated = result.truncated;
  }

  return { text, tokens: estimateTokens(text), truncated };
}

/**
 * Compile child stacks section.
 */
function compileChildStacks(
  childStacks: Stack[],
  budget: number
): { text: string; tokens: number; truncated: boolean } {
  const lines = ["## Included Stacks", ""];
  let truncated = false;
  let currentTokens = estimateTokens(lines.join("\n"));

  for (const child of childStacks) {
    const childLines = [`### ${child.name}`];

    if (child.description) {
      childLines.push(child.description);
    }

    // Include a condensed version of child's compiled prompt if available
    if (child.compiledPrompt) {
      // Extract just the key sections (first 500 chars)
      const condensed = child.compiledPrompt.slice(0, 500);
      if (condensed.length < child.compiledPrompt.length) {
        childLines.push("", condensed + "...");
      } else {
        childLines.push("", condensed);
      }
    }

    const childText = childLines.join("\n");
    const childTokens = estimateTokens(childText);

    if (currentTokens + childTokens > budget) {
      truncated = true;
      break;
    }

    lines.push(childText, "");
    currentTokens += childTokens;
  }

  const text = lines.join("\n").trim();
  return { text, tokens: estimateTokens(text), truncated };
}

/**
 * Format a directory tree node.
 */
function formatDirectoryTree(
  node: { name: string; type: string; children?: any[]; purpose?: string },
  prefix: string,
  maxChars: number
): string {
  const lines: string[] = [];
  const isDir = node.type === "directory";

  lines.push(`${prefix}${node.name}${isDir ? "/" : ""}`);

  if (node.children && node.children.length > 0) {
    const childPrefix = prefix + "  ";
    for (let i = 0; i < node.children.length && lines.join("\n").length < maxChars; i++) {
      const child = node.children[i];
      lines.push(formatDirectoryTree(child, childPrefix, maxChars - lines.join("\n").length));
    }
  }

  return lines.join("\n");
}

/**
 * Format a paradigm name for display.
 */
function formatParadigm(paradigm: string): string {
  const mapping: Record<string, string> = {
    monorepo: "Monorepo architecture",
    "api-routes": "API routes pattern",
    "component-based": "Component-based architecture",
    ssr: "Server-side rendering",
    "edge-first": "Edge-first/serverless deployment",
    "type-safe-db": "Type-safe database (ORM)",
    "test-driven": "Test-driven development",
  };
  return mapping[paradigm] || paradigm;
}

/**
 * Estimate token count for text.
 * Rough approximation: ~4 chars per token for English text.
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Truncate text to fit within a token budget.
 */
function truncateToTokens(text: string, maxTokens: number): { text: string; truncated: boolean } {
  const currentTokens = estimateTokens(text);

  if (currentTokens <= maxTokens) {
    return { text, truncated: false };
  }

  // Approximate character limit
  const maxChars = maxTokens * 4;

  // Try to truncate at a paragraph boundary
  let truncated = text.slice(0, maxChars);
  const lastParagraph = truncated.lastIndexOf("\n\n");

  if (lastParagraph > maxChars * 0.7) {
    truncated = truncated.slice(0, lastParagraph);
  }

  return {
    text: truncated.trim() + "\n\n*[Content truncated to fit token budget]*",
    truncated: true,
  };
}

/**
 * Use AI to summarize/optimize a prompt if needed.
 * This can be called when the prompt exceeds budget significantly.
 */
export async function aiOptimizePrompt(
  prompt: string,
  targetTokens: number,
  ai: Ai
): Promise<string> {
  const currentTokens = estimateTokens(prompt);

  // Only optimize if we're more than 20% over budget
  if (currentTokens <= targetTokens * 1.2) {
    return prompt;
  }

  const ratio = targetTokens / currentTokens;

  const response = (await ai.run("@cf/meta/llama-3-8b-instruct", {
    messages: [
      {
        role: "system",
        content: `You are a technical documentation optimizer. Your task is to condense the following context prompt while preserving the most important information for AI coding assistants. Target approximately ${ratio * 100}% of the original length. Maintain markdown formatting and code blocks.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: Math.min(targetTokens * 1.1, 8000),
  })) as { response: string };

  return response.response || prompt;
}
