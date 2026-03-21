/**
 * GitHub Repository Analyzer
 *
 * Analyzes a GitHub repository to extract:
 * - Directory structure
 * - Detected patterns and paradigms
 * - Package dependencies
 * - Key files and their purposes
 */

export interface RepoAnalysis {
  summary: string;
  paradigms: string[];
  packages: string[];
  registry: string;
  directoryStructure: DirectoryNode;
  keyFiles: KeyFile[];
  techStack: TechStackInfo;
}

export interface DirectoryNode {
  name: string;
  type: "file" | "directory";
  children?: DirectoryNode[];
  purpose?: string;
}

export interface KeyFile {
  path: string;
  purpose: string;
  highlights?: string[];
}

export interface TechStackInfo {
  language: string;
  framework?: string;
  buildTool?: string;
  testFramework?: string;
  linter?: string;
  formatter?: string;
}

export interface AnalyzeOptions {
  token?: string;
  branch?: string;
  paths?: string[];
}

/**
 * Analyze a GitHub repository.
 */
export async function analyzeGitHubRepo(
  githubUrl: string,
  options: AnalyzeOptions = {}
): Promise<RepoAnalysis> {
  const { token, branch = "main", paths: _paths = [] } = options;

  // Parse GitHub URL
  const parsed = parseGitHubUrl(githubUrl);
  if (!parsed) {
    throw new Error(`Invalid GitHub URL: ${githubUrl}`);
  }

  const { owner, repo } = parsed;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Nexus-Stack-Analyzer",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Fetch repository tree
  const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
  const treeResponse = await fetch(treeUrl, { headers });

  if (!treeResponse.ok) {
    throw new Error(`Failed to fetch repo tree: ${treeResponse.status}`);
  }

  const treeData = (await treeResponse.json()) as { tree: Array<{ path: string; type: string }> };

  // Build directory structure
  const directoryStructure = buildDirectoryTree(treeData.tree);

  // Detect key files
  const keyFiles = detectKeyFiles(treeData.tree);

  // Fetch and analyze package manifest
  const { packages, registry, techStack } = await analyzePackageManifest(
    owner,
    repo,
    branch,
    headers,
    treeData.tree
  );

  // Detect paradigms from structure and files
  const paradigms = detectParadigms(treeData.tree, techStack);

  // Generate summary
  const summary = generateSummary(techStack, paradigms, keyFiles);

  return {
    summary,
    paradigms,
    packages,
    registry,
    directoryStructure,
    keyFiles,
    techStack,
  };
}

/**
 * Parse a GitHub URL to extract owner and repo.
 */
function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  // Handle various GitHub URL formats
  const patterns = [/github\.com\/([^/]+)\/([^/]+)/, /github\.com:([^/]+)\/([^/]+)/];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, ""),
      };
    }
  }

  return null;
}

/**
 * Build a tree structure from flat file list.
 */
function buildDirectoryTree(files: Array<{ path: string; type: string }>): DirectoryNode {
  const root: DirectoryNode = { name: "/", type: "directory", children: [] };

  for (const file of files) {
    const parts = file.path.split("/");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      if (!current.children) {
        current.children = [];
      }

      let child = current.children.find((c) => c.name === part);

      if (!child) {
        child = {
          name: part,
          type: isLast && file.type === "blob" ? "file" : "directory",
          children: isLast && file.type === "blob" ? undefined : [],
        };
        current.children.push(child);
      }

      current = child;
    }
  }

  // Prune deep trees - only keep top 3 levels
  pruneTree(root, 0, 3);

  return root;
}

function pruneTree(node: DirectoryNode, depth: number, maxDepth: number): void {
  if (depth >= maxDepth && node.children) {
    const fileCount = node.children.filter((c) => c.type === "file").length;
    const dirCount = node.children.filter((c) => c.type === "directory").length;
    node.children = [];
    node.purpose = `${fileCount} files, ${dirCount} directories`;
    return;
  }

  if (node.children) {
    for (const child of node.children) {
      pruneTree(child, depth + 1, maxDepth);
    }
  }
}

/**
 * Detect key files in the repository.
 */
function detectKeyFiles(files: Array<{ path: string; type: string }>): KeyFile[] {
  const keyFilePatterns: Array<{ pattern: RegExp; purpose: string }> = [
    { pattern: /^package\.json$/, purpose: "Node.js package manifest" },
    { pattern: /^Cargo\.toml$/, purpose: "Rust package manifest" },
    { pattern: /^mix\.exs$/, purpose: "Elixir package manifest" },
    { pattern: /^Gemfile$/, purpose: "Ruby package manifest" },
    { pattern: /^go\.mod$/, purpose: "Go module manifest" },
    { pattern: /^pyproject\.toml$/, purpose: "Python package manifest" },
    { pattern: /^tsconfig\.json$/, purpose: "TypeScript configuration" },
    { pattern: /^vite\.config\.(ts|js)$/, purpose: "Vite build configuration" },
    { pattern: /^next\.config\.(ts|js|mjs)$/, purpose: "Next.js configuration" },
    { pattern: /^tailwind\.config\.(ts|js)$/, purpose: "TailwindCSS configuration" },
    { pattern: /^drizzle\.config\.ts$/, purpose: "Drizzle ORM configuration" },
    { pattern: /^wrangler\.(json|jsonc|toml)$/, purpose: "Cloudflare Workers configuration" },
    { pattern: /^README\.md$/, purpose: "Project documentation" },
    { pattern: /^\.env\.example$/, purpose: "Environment variable template" },
    { pattern: /^docker-compose\.ya?ml$/, purpose: "Docker Compose configuration" },
    { pattern: /^Dockerfile$/, purpose: "Docker build instructions" },
  ];

  const keyFiles: KeyFile[] = [];

  for (const file of files) {
    if (file.type !== "blob") continue;

    const fileName = file.path.split("/").pop() || "";

    for (const { pattern, purpose } of keyFilePatterns) {
      if (pattern.test(fileName)) {
        keyFiles.push({ path: file.path, purpose });
        break;
      }
    }
  }

  return keyFiles.slice(0, 15); // Limit to 15 key files
}

/**
 * Analyze package manifest to extract dependencies.
 */
async function analyzePackageManifest(
  owner: string,
  repo: string,
  branch: string,
  headers: Record<string, string>,
  files: Array<{ path: string; type: string }>
): Promise<{ packages: string[]; registry: string; techStack: TechStackInfo }> {
  // Check for different manifest types
  const manifestFiles = [
    { file: "package.json", registry: "npm", language: "javascript" },
    { file: "Cargo.toml", registry: "cargo", language: "rust" },
    { file: "mix.exs", registry: "hex", language: "elixir" },
    { file: "Gemfile", registry: "rubygems", language: "ruby" },
    { file: "go.mod", registry: "go", language: "go" },
    { file: "pyproject.toml", registry: "pypi", language: "python" },
  ];

  for (const { file, registry, language } of manifestFiles) {
    const hasFile = files.some((f) => f.path === file && f.type === "blob");

    if (hasFile) {
      try {
        const contentUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${file}?ref=${branch}`;
        const response = await fetch(contentUrl, { headers });

        if (response.ok) {
          const data = (await response.json()) as { content: string };
          const content = atob(data.content.replace(/\n/g, ""));

          return parseManifest(content, registry, language);
        }
      } catch (e) {
        console.warn(`Failed to fetch ${file}:`, e);
      }
    }
  }

  // Default fallback
  return {
    packages: [],
    registry: "npm",
    techStack: { language: "unknown" },
  };
}

/**
 * Parse a package manifest to extract dependencies.
 */
function parseManifest(
  content: string,
  registry: string,
  language: string
): { packages: string[]; registry: string; techStack: TechStackInfo } {
  const packages: string[] = [];
  const techStack: TechStackInfo = { language };

  try {
    if (registry === "npm") {
      const pkg = JSON.parse(content);
      const deps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
      };

      packages.push(...Object.keys(deps));

      // Detect framework and tools
      if (deps.react) techStack.framework = "react";
      if (deps.next) techStack.framework = "nextjs";
      if (deps.vue) techStack.framework = "vue";
      if (deps.svelte) techStack.framework = "svelte";
      if (deps.hono) techStack.framework = "hono";
      if (deps.express) techStack.framework = "express";
      if (deps.vite) techStack.buildTool = "vite";
      if (deps.vitest) techStack.testFramework = "vitest";
      if (deps.jest) techStack.testFramework = "jest";
      if (deps.eslint) techStack.linter = "eslint";
      if (deps.biome || deps["@biomejs/biome"]) techStack.linter = "biome";
      if (deps.prettier) techStack.formatter = "prettier";
      if (deps.typescript) techStack.language = "typescript";
    } else if (registry === "cargo") {
      // Basic Cargo.toml parsing
      const depsMatch = content.match(/\[dependencies\]([\s\S]*?)(?=\[|$)/);
      if (depsMatch) {
        const depsSection = depsMatch[1];
        const depLines = depsSection.match(/^([a-z_-]+)\s*=/gm);
        if (depLines) {
          packages.push(...depLines.map((l) => l.split("=")[0].trim()));
        }
      }

      // Detect frameworks
      if (content.includes("axum")) techStack.framework = "axum";
      if (content.includes("actix")) techStack.framework = "actix";
      if (content.includes("tauri")) techStack.framework = "tauri";
      if (content.includes("leptos")) techStack.framework = "leptos";
      if (content.includes("ratatui")) techStack.framework = "ratatui";
    }
    // Add more registry parsers as needed
  } catch (e) {
    console.warn(`Failed to parse manifest:`, e);
  }

  return { packages: packages.slice(0, 50), registry, techStack };
}

/**
 * Detect architectural paradigms from the repository.
 */
function detectParadigms(
  files: Array<{ path: string; type: string }>,
  techStack: TechStackInfo
): string[] {
  const paradigms: string[] = [];

  const paths = files.map((f) => f.path);

  // Monorepo patterns
  if (paths.some((p) => p.includes("packages/") || p.includes("apps/"))) {
    paradigms.push("monorepo");
  }

  // API patterns
  if (paths.some((p) => p.includes("/api/") || p.includes("/routes/"))) {
    paradigms.push("api-routes");
  }

  // Component-based
  if (paths.some((p) => p.includes("/components/"))) {
    paradigms.push("component-based");
  }

  // Server-side rendering
  if (techStack.framework === "nextjs" || techStack.framework === "nuxt") {
    paradigms.push("ssr");
  }

  // Edge/serverless
  if (paths.some((p) => p.includes("wrangler") || p.includes("vercel.json"))) {
    paradigms.push("edge-first");
  }

  // Database/ORM patterns
  if (paths.some((p) => p.includes("/schema") || p.includes("drizzle"))) {
    paradigms.push("type-safe-db");
  }

  // Testing
  if (paths.some((p) => p.includes("__tests__") || p.includes(".test.") || p.includes(".spec."))) {
    paradigms.push("test-driven");
  }

  return paradigms;
}

/**
 * Generate a summary of the repository.
 */
function generateSummary(
  techStack: TechStackInfo,
  paradigms: string[],
  _keyFiles: KeyFile[]
): string {
  const parts: string[] = [];

  // Language and framework
  if (techStack.framework) {
    parts.push(`${techStack.framework} ${techStack.language} project`);
  } else {
    parts.push(`${techStack.language} project`);
  }

  // Build tool
  if (techStack.buildTool) {
    parts.push(`using ${techStack.buildTool}`);
  }

  // Paradigms
  if (paradigms.length > 0) {
    parts.push(`with ${paradigms.slice(0, 3).join(", ")} architecture`);
  }

  return parts.join(" ");
}
