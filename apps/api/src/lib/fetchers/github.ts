import type { GitHubContent } from "../../types";

interface GitHubTreeItem {
  path: string;
  type: "blob" | "tree";
  sha: string;
  url: string;
}

interface GitHubTreeResponse {
  tree: GitHubTreeItem[];
  truncated: boolean;
}

interface GitHubRepoInfo {
  default_branch: string;
  description: string | null;
  homepage: string | null;
  stargazers_count: number;
}

const USER_AGENT = "Nexus-Docs-Indexer/1.0";

// File extensions we care about for documentation
const DOC_EXTENSIONS = [".md", ".mdx", ".txt", ".rst"];

// Directories commonly containing documentation
const DOC_DIRECTORIES = [
  "docs",
  "documentation",
  "doc",
  "guide",
  "guides",
  "wiki",
  "pages",
  "content",
];

// Files commonly containing documentation
const DOC_FILES = [
  "README.md",
  "README.mdx",
  "readme.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "USAGE.md",
  "GUIDE.md",
  "API.md",
];

/**
 * Parse owner and repo from GitHub URL.
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;

  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ""),
  };
}

/**
 * Fetch repository information.
 */
export async function fetchRepoInfo(
  owner: string,
  repo: string,
  token?: string
): Promise<GitHubRepoInfo> {
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  const headers: Record<string, string> = {
    "User-Agent": USER_AGENT,
    Accept: "application/vnd.github.v3+json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch repo info: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch the repository tree to find documentation files.
 */
async function fetchRepoTree(
  owner: string,
  repo: string,
  branch: string,
  token?: string
): Promise<GitHubTreeItem[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
  const headers: Record<string, string> = {
    "User-Agent": USER_AGENT,
    Accept: "application/vnd.github.v3+json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch repo tree: ${response.status} ${response.statusText}`);
  }

  const data: GitHubTreeResponse = await response.json();
  return data.tree;
}

/**
 * Check if a file path is a documentation file.
 */
function isDocFile(path: string): boolean {
  const lowerPath = path.toLowerCase();

  // Check if it's in a doc directory
  const inDocDir = DOC_DIRECTORIES.some(
    (dir) => lowerPath.startsWith(`${dir}/`) || lowerPath.includes(`/${dir}/`)
  );

  // Check if it's a known doc file
  const isKnownDocFile = DOC_FILES.some(
    (file) => lowerPath === file.toLowerCase() || lowerPath.endsWith(`/${file.toLowerCase()}`)
  );

  // Check extension
  const hasDocExtension = DOC_EXTENSIONS.some((ext) => lowerPath.endsWith(ext));

  return (inDocDir && hasDocExtension) || isKnownDocFile;
}

/**
 * Fetch a single file's content.
 */
async function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  token?: string
): Promise<string | null> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const headers: Record<string, string> = {
    "User-Agent": USER_AGENT,
    Accept: "application/vnd.github.v3.raw",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      console.warn(`Failed to fetch ${path}: ${response.status}`);
      return null;
    }

    return await response.text();
  } catch (error) {
    console.warn(`Error fetching ${path}:`, error);
    return null;
  }
}

/**
 * Fetch all documentation from a GitHub repository.
 */
export async function fetchGitHubDocs(
  repoUrl: string,
  token?: string
): Promise<GitHubContent[]> {
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    throw new Error(`Invalid GitHub URL: ${repoUrl}`);
  }

  const { owner, repo } = parsed;
  const contents: GitHubContent[] = [];

  // Get repo info to find default branch
  const repoInfo = await fetchRepoInfo(owner, repo, token);
  const branch = repoInfo.default_branch;

  // Get repository tree
  const tree = await fetchRepoTree(owner, repo, branch, token);

  // Filter to documentation files only
  const docFiles = tree.filter(
    (item) => item.type === "blob" && isDocFile(item.path)
  );

  console.log(`Found ${docFiles.length} documentation files in ${owner}/${repo}`);

  // Fetch content for each doc file (with concurrency limit)
  const CONCURRENT_LIMIT = 5;
  for (let i = 0; i < docFiles.length; i += CONCURRENT_LIMIT) {
    const batch = docFiles.slice(i, i + CONCURRENT_LIMIT);
    const results = await Promise.all(
      batch.map(async (file) => {
        const content = await fetchFileContent(owner, repo, file.path, token);
        if (content) {
          return { path: file.path, content };
        }
        return null;
      })
    );

    for (const result of results) {
      if (result) {
        contents.push(result);
      }
    }
  }

  return contents;
}

/**
 * Get repository metadata for library info.
 */
export async function getGitHubRepoMetadata(
  repoUrl: string,
  token?: string
): Promise<{
  description: string | null;
  homepage: string | null;
  stars: number;
  defaultBranch: string;
}> {
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    throw new Error(`Invalid GitHub URL: ${repoUrl}`);
  }

  const info = await fetchRepoInfo(parsed.owner, parsed.repo, token);

  return {
    description: info.description,
    homepage: info.homepage,
    stars: info.stargazers_count,
    defaultBranch: info.default_branch,
  };
}
