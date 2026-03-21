import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { AppContext } from "../types";

const analyzeRouter = new Hono<AppContext>();

// Types for GitHub API responses
interface GitHubRepo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  default_branch: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

interface GitHubContent {
  name: string;
  path: string;
  type: "file" | "dir";
  size?: number;
}

interface DocSource {
  type: "llms-txt" | "llms-full-txt" | "readme" | "docs-folder" | "doc-files";
  path: string;
  priority: number;
  description: string;
}

interface AnalysisResult {
  repo: {
    name: string;
    fullName: string;
    description: string | null;
    url: string;
    homepage: string | null;
    stars: number;
    forks: number;
    language: string | null;
    topics: string[];
    owner: {
      name: string;
      avatar: string;
    };
  };
  docSources: DocSource[];
  suggestedCategories: string[];
  hasLlmsTxt: boolean;
}

// ============================================================================
// GET /api/analyze - Analyze a GitHub repository for documentation
// ============================================================================

analyzeRouter.get(
  "/",
  zValidator(
    "query",
    z.object({
      url: z
        .string()
        .url()
        .refine((url) => url.includes("github.com"), { message: "Only GitHub URLs are supported" }),
    })
  ),
  async (c) => {
    const { url } = c.req.valid("query");

    // Parse GitHub URL to extract owner/repo
    const match = url.match(/github\.com\/([^/]+)\/([^/?#]+)/);
    if (!match) {
      return c.json({ error: "Invalid GitHub URL format" }, 400);
    }

    const [, owner, repo] = match;
    const repoName = repo.replace(/\.git$/, "");

    // GitHub API token from env (optional but recommended for rate limits)
    const githubToken = (c.env as any).GITHUB_TOKEN;

    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Nexus-DocOracle/1.0",
    };

    if (githubToken) {
      headers["Authorization"] = `Bearer ${githubToken}`;
    }

    try {
      // Fetch repository info
      const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
        headers,
      });

      if (!repoResponse.ok) {
        if (repoResponse.status === 404) {
          return c.json({ error: "Repository not found" }, 404);
        }
        if (repoResponse.status === 403) {
          return c.json({ error: "GitHub API rate limit exceeded" }, 429);
        }
        return c.json({ error: "Failed to fetch repository info" }, 500);
      }

      const repoData: GitHubRepo = await repoResponse.json();

      // Fetch root directory contents
      const contentsResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/contents`,
        { headers }
      );

      let rootContents: GitHubContent[] = [];
      if (contentsResponse.ok) {
        rootContents = await contentsResponse.json();
      }

      // Analyze for documentation sources
      const docSources: DocSource[] = [];

      // Check for llms.txt (highest priority)
      const llmsTxt = rootContents.find(
        (item) => item.name.toLowerCase() === "llms.txt" && item.type === "file"
      );
      if (llmsTxt) {
        docSources.push({
          type: "llms-txt",
          path: llmsTxt.path,
          priority: 1,
          description: "LLM-optimized documentation file (recommended)",
        });
      }

      // Check for llms-full.txt
      const llmsFullTxt = rootContents.find(
        (item) => item.name.toLowerCase() === "llms-full.txt" && item.type === "file"
      );
      if (llmsFullTxt) {
        docSources.push({
          type: "llms-full-txt",
          path: llmsFullTxt.path,
          priority: 2,
          description: "Full LLM documentation file",
        });
      }

      // Check for docs folder
      const docsFolder = rootContents.find(
        (item) =>
          (item.name.toLowerCase() === "docs" || item.name.toLowerCase() === "documentation") &&
          item.type === "dir"
      );
      if (docsFolder) {
        docSources.push({
          type: "docs-folder",
          path: docsFolder.path,
          priority: 3,
          description: "Documentation folder",
        });
      }

      // Check for README
      const readme = rootContents.find(
        (item) => item.name.toLowerCase().startsWith("readme") && item.type === "file"
      );
      if (readme) {
        docSources.push({
          type: "readme",
          path: readme.path,
          priority: 4,
          description: "Repository README",
        });
      }

      // Check for other doc files
      const docFiles = rootContents.filter(
        (item) =>
          item.type === "file" &&
          (item.name.toLowerCase().endsWith(".md") ||
            item.name.toLowerCase().includes("guide") ||
            item.name.toLowerCase().includes("tutorial"))
      );

      if (docFiles.length > 0 && !readme) {
        docSources.push({
          type: "doc-files",
          path: docFiles.map((f) => f.path).join(", "),
          priority: 5,
          description: `${docFiles.length} documentation file(s)`,
        });
      }

      // Suggest categories based on topics and language
      const suggestedCategories = suggestCategories(
        repoData.topics,
        repoData.language,
        repoData.description
      );

      const result: AnalysisResult = {
        repo: {
          name: repoData.name,
          fullName: repoData.full_name,
          description: repoData.description,
          url: repoData.html_url,
          homepage: repoData.homepage,
          stars: repoData.stargazers_count,
          forks: repoData.forks_count,
          language: repoData.language,
          topics: repoData.topics,
          owner: {
            name: repoData.owner.login,
            avatar: repoData.owner.avatar_url,
          },
        },
        docSources: docSources.sort((a, b) => a.priority - b.priority),
        suggestedCategories,
        hasLlmsTxt: !!llmsTxt || !!llmsFullTxt,
      };

      return c.json(result);
    } catch (error) {
      console.error("Error analyzing repository:", error);
      return c.json({ error: "Failed to analyze repository" }, 500);
    }
  }
);

// Helper function to suggest categories based on repo metadata
function suggestCategories(
  topics: string[],
  language: string | null,
  description: string | null
): string[] {
  const categories: Set<string> = new Set();
  const topicsLower = topics.map((t) => t.toLowerCase());
  const descLower = (description || "").toLowerCase();

  // Frontend frameworks/libraries
  if (
    topicsLower.some((t) =>
      [
        "react",
        "vue",
        "angular",
        "svelte",
        "solid",
        "preact",
        "frontend",
        "ui",
        "component",
      ].includes(t)
    ) ||
    descLower.includes("frontend") ||
    descLower.includes("ui component")
  ) {
    categories.add("frontend");
  }

  // Backend frameworks
  if (
    topicsLower.some((t) =>
      [
        "backend",
        "server",
        "api",
        "express",
        "fastify",
        "hono",
        "nest",
        "koa",
        "django",
        "flask",
        "rails",
      ].includes(t)
    ) ||
    descLower.includes("backend") ||
    descLower.includes("server") ||
    descLower.includes("api framework")
  ) {
    categories.add("backend");
  }

  // Full stack
  if (
    topicsLower.some((t) =>
      ["fullstack", "full-stack", "nextjs", "nuxt", "remix", "sveltekit", "astro"].includes(t)
    ) ||
    descLower.includes("full stack") ||
    descLower.includes("fullstack")
  ) {
    categories.add("fullstack");
  }

  // Database
  if (
    topicsLower.some((t) =>
      [
        "database",
        "db",
        "orm",
        "sql",
        "nosql",
        "postgres",
        "mysql",
        "mongodb",
        "prisma",
        "drizzle",
        "typeorm",
      ].includes(t)
    ) ||
    descLower.includes("database") ||
    descLower.includes("orm")
  ) {
    categories.add("database");
  }

  // Cloud/Infrastructure
  if (
    topicsLower.some((t) =>
      [
        "cloud",
        "aws",
        "gcp",
        "azure",
        "cloudflare",
        "vercel",
        "netlify",
        "docker",
        "kubernetes",
        "serverless",
      ].includes(t)
    ) ||
    descLower.includes("cloud") ||
    descLower.includes("serverless")
  ) {
    categories.add("cloud");
  }

  // AI/ML
  if (
    topicsLower.some((t) =>
      [
        "ai",
        "ml",
        "machine-learning",
        "deep-learning",
        "llm",
        "openai",
        "langchain",
        "embedding",
        "transformer",
      ].includes(t)
    ) ||
    descLower.includes("artificial intelligence") ||
    descLower.includes("machine learning") ||
    descLower.includes("llm")
  ) {
    categories.add("ai");
  }

  // Testing
  if (
    topicsLower.some((t) =>
      ["testing", "test", "jest", "vitest", "playwright", "cypress", "mocha", "e2e"].includes(t)
    ) ||
    descLower.includes("testing") ||
    descLower.includes("test framework")
  ) {
    categories.add("testing");
  }

  // Utilities
  if (
    topicsLower.some((t) =>
      ["utility", "utilities", "helper", "tool", "cli", "lodash", "utils"].includes(t)
    ) ||
    descLower.includes("utility") ||
    descLower.includes("helper")
  ) {
    categories.add("utilities");
  }

  // Language-based suggestions
  if (language) {
    const langLower = language.toLowerCase();
    if (["typescript", "javascript"].includes(langLower)) {
      // Already handled by other checks
    } else if (langLower === "python") {
      categories.add("backend");
    } else if (langLower === "rust" || langLower === "go") {
      categories.add("backend");
    }
  }

  return Array.from(categories);
}

export { analyzeRouter };
