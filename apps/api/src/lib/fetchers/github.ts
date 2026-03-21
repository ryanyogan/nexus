import type { GitHubContent } from "../../types";

// ============================================================================
// Types
// ============================================================================

interface GitHubTreeItem {
  path: string;
  type: "blob" | "tree";
  sha: string;
  url: string;
  size?: number;
}

interface GitHubTreeResponse {
  tree: GitHubTreeItem[];
  truncated: boolean;
  sha: string;
}

interface GitHubRepoInfo {
  default_branch: string;
  description: string | null;
  homepage: string | null;
  stargazers_count: number;
  updated_at: string;
}

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: { date: string };
  };
}

interface GitHubTag {
  name: string;
  commit: { sha: string };
}

interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  prerelease: boolean;
}

export interface FetchedFile {
  path: string;
  content: string;
  sha: string;
  size: number;
  isLlmTxt: boolean;
}

export interface FetchResult {
  files: FetchedFile[];
  metadata: {
    owner: string;
    repo: string;
    branch: string;
    commitSha: string;
    description: string | null;
    homepage: string | null;
    stars: number;
    updatedAt: string;
  };
  versions: Array<{
    version: string;
    tag: string;
    isPrerelease: boolean;
    publishedAt?: string;
  }>;
  hasLlmTxt: boolean;
  llmTxtFiles: string[];
}

export interface IncrementalFetchResult {
  changedFiles: FetchedFile[];
  deletedPaths: string[];
  newCommitSha: string;
  hasChanges: boolean;
}

const USER_AGENT = "Nexus-Docs-Indexer/1.0";

// ============================================================================
// LLM.txt Priority Files (checked first, in order of priority)
// ============================================================================

const _LLM_TXT_FILES = [
  "llms.txt",
  "llms-full.txt",
  "LLMS.txt",
  "LLMS-FULL.txt",
  "LLMs.txt",
  "LLMs-full.txt",
  ".llms.txt",
  "llm.txt",
  "LLM.txt",
];

const LLM_TXT_PATTERNS = [/llms?[-_]?full\.txt$/i, /llms?\.txt$/i, /\.llms?\.txt$/i];

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
  "src/content",
  "src/docs",
  "website/docs",
  "packages/docs",
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
export async function fetchGitHubDocs(repoUrl: string, token?: string): Promise<GitHubContent[]> {
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
  const docFiles = tree.filter((item) => item.type === "blob" && isDocFile(item.path));

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

// ============================================================================
// LLM.txt Detection
// ============================================================================

/**
 * Check if a file path matches LLM.txt patterns.
 */
function isLlmTxtFile(path: string): boolean {
  const filename = path.split("/").pop() || "";
  return LLM_TXT_PATTERNS.some((pattern) => pattern.test(filename));
}

/**
 * Find LLM.txt files in the repository tree.
 * Returns paths sorted by priority (llms-full.txt > llms.txt).
 */
function findLlmTxtFiles(tree: GitHubTreeItem[]): string[] {
  const llmFiles: Array<{ path: string; priority: number }> = [];

  for (const item of tree) {
    if (item.type !== "blob") continue;

    const filename = item.path.split("/").pop()?.toLowerCase() || "";

    // Check root-level llm files first (highest priority)
    const isRootLevel = !item.path.includes("/");

    // Prioritize llms-full.txt over llms.txt
    let priority = 100;
    if (filename.includes("full")) {
      priority = isRootLevel ? 1 : 10;
    } else if (isLlmTxtFile(item.path)) {
      priority = isRootLevel ? 2 : 20;
    } else {
      continue;
    }

    llmFiles.push({ path: item.path, priority });
  }

  return llmFiles.sort((a, b) => a.priority - b.priority).map((f) => f.path);
}

// ============================================================================
// Version Detection
// ============================================================================

/**
 * Fetch all tags from a repository.
 */
async function fetchTags(owner: string, repo: string, token?: string): Promise<GitHubTag[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/tags?per_page=100`;
  const headers: Record<string, string> = {
    "User-Agent": USER_AGENT,
    Accept: "application/vnd.github.v3+json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      console.warn(`Failed to fetch tags: ${response.status}`);
      return [];
    }
    return response.json();
  } catch (error) {
    console.warn("Error fetching tags:", error);
    return [];
  }
}

/**
 * Fetch releases from a repository.
 */
async function fetchReleases(
  owner: string,
  repo: string,
  token?: string
): Promise<GitHubRelease[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/releases?per_page=50`;
  const headers: Record<string, string> = {
    "User-Agent": USER_AGENT,
    Accept: "application/vnd.github.v3+json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      console.warn(`Failed to fetch releases: ${response.status}`);
      return [];
    }
    return response.json();
  } catch (error) {
    console.warn("Error fetching releases:", error);
    return [];
  }
}

/**
 * Parse version from tag name.
 */
function parseVersionFromTag(tag: string): string {
  // Remove common prefixes like "v", "@org/package@"
  return tag
    .replace(/^v/i, "")
    .replace(/^@[^/]+\/[^@]+@/, "")
    .replace(/^[a-z-]+@/i, "");
}

// ============================================================================
// Incremental Updates
// ============================================================================

/**
 * Fetch the latest commit SHA for a branch.
 */
async function fetchLatestCommit(
  owner: string,
  repo: string,
  branch: string,
  token?: string
): Promise<GitHubCommit | null> {
  const url = `https://api.github.com/repos/${owner}/${repo}/commits/${branch}`;
  const headers: Record<string, string> = {
    "User-Agent": USER_AGENT,
    Accept: "application/vnd.github.v3+json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

/**
 * Compare two commits to find changed files.
 */
async function compareCommits(
  owner: string,
  repo: string,
  baseSha: string,
  headSha: string,
  token?: string
): Promise<Array<{ filename: string; status: string; sha: string }>> {
  const url = `https://api.github.com/repos/${owner}/${repo}/compare/${baseSha}...${headSha}`;
  const headers: Record<string, string> = {
    "User-Agent": USER_AGENT,
    Accept: "application/vnd.github.v3+json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      console.warn(`Failed to compare commits: ${response.status}`);
      return [];
    }
    const data = (await response.json()) as {
      files?: Array<{ filename: string; status: string; sha: string }>;
    };
    return data.files || [];
  } catch (error) {
    console.warn("Error comparing commits:", error);
    return [];
  }
}

/**
 * Perform incremental fetch - only get changed files since last commit.
 */
export async function fetchIncrementalChanges(
  owner: string,
  repo: string,
  branch: string,
  lastCommitSha: string,
  existingFileShas: Map<string, string>,
  token?: string
): Promise<IncrementalFetchResult> {
  // Get latest commit
  const latestCommit = await fetchLatestCommit(owner, repo, branch, token);
  if (!latestCommit) {
    return {
      changedFiles: [],
      deletedPaths: [],
      newCommitSha: lastCommitSha,
      hasChanges: false,
    };
  }

  // If no changes, return early
  if (latestCommit.sha === lastCommitSha) {
    return {
      changedFiles: [],
      deletedPaths: [],
      newCommitSha: lastCommitSha,
      hasChanges: false,
    };
  }

  // Get changed files between commits
  const changedFilesList = await compareCommits(
    owner,
    repo,
    lastCommitSha,
    latestCommit.sha,
    token
  );

  const changedFiles: FetchedFile[] = [];
  const deletedPaths: string[] = [];

  // Filter to doc files and fetch content for changed/added files
  for (const file of changedFilesList) {
    if (!isDocFile(file.filename) && !isLlmTxtFile(file.filename)) {
      continue;
    }

    if (file.status === "removed") {
      deletedPaths.push(file.filename);
    } else if (file.status === "modified" || file.status === "added") {
      // Check if SHA changed (skip if identical)
      if (existingFileShas.get(file.filename) === file.sha) {
        continue;
      }

      const content = await fetchFileContent(owner, repo, file.filename, token);
      if (content) {
        changedFiles.push({
          path: file.filename,
          content,
          sha: file.sha,
          size: content.length,
          isLlmTxt: isLlmTxtFile(file.filename),
        });
      }
    }
  }

  return {
    changedFiles,
    deletedPaths,
    newCommitSha: latestCommit.sha,
    hasChanges: changedFiles.length > 0 || deletedPaths.length > 0,
  };
}

// ============================================================================
// Full Fetch with LLM.txt Priority
// ============================================================================

/**
 * Fetch all documentation from a GitHub repository.
 * Prioritizes LLM.txt files if available.
 */
export async function fetchGitHubDocsEnhanced(
  repoUrl: string,
  options: {
    token?: string;
    branch?: string;
    docsPaths?: string[];
    preferLlmTxt?: boolean;
    fetchVersions?: boolean;
  } = {}
): Promise<FetchResult> {
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    throw new Error(`Invalid GitHub URL: ${repoUrl}`);
  }

  const { owner, repo } = parsed;
  const { token, preferLlmTxt = true, fetchVersions = true } = options;

  // Get repo info
  const repoInfo = await fetchRepoInfo(owner, repo, token);
  const branch = options.branch || repoInfo.default_branch;

  // Get repository tree
  const tree = await fetchRepoTree(owner, repo, branch, token);

  // Get latest commit SHA
  const latestCommit = await fetchLatestCommit(owner, repo, branch, token);
  const commitSha = latestCommit?.sha || "";

  // Find LLM.txt files
  const llmTxtFiles = findLlmTxtFiles(tree);
  const hasLlmTxt = llmTxtFiles.length > 0;

  const files: FetchedFile[] = [];

  // If we have LLM.txt and prefer it, fetch those first
  if (hasLlmTxt && preferLlmTxt) {
    console.log(`Found LLM.txt files in ${owner}/${repo}: ${llmTxtFiles.join(", ")}`);

    // Fetch the best LLM.txt file (usually llms-full.txt if available)
    const primaryLlmFile = llmTxtFiles[0];
    const content = await fetchFileContent(owner, repo, primaryLlmFile, token);

    if (content) {
      const treeItem = tree.find((t) => t.path === primaryLlmFile);
      files.push({
        path: primaryLlmFile,
        content,
        sha: treeItem?.sha || "",
        size: content.length,
        isLlmTxt: true,
      });
    }

    // Also fetch other LLM files for completeness
    for (const llmFile of llmTxtFiles.slice(1)) {
      const llmContent = await fetchFileContent(owner, repo, llmFile, token);
      if (llmContent) {
        const treeItem = tree.find((t) => t.path === llmFile);
        files.push({
          path: llmFile,
          content: llmContent,
          sha: treeItem?.sha || "",
          size: llmContent.length,
          isLlmTxt: true,
        });
      }
    }
  }

  // Fetch regular documentation files
  let docFiles = tree.filter((item) => item.type === "blob" && isDocFile(item.path));

  // If custom docs paths specified, filter to those
  if (options.docsPaths && options.docsPaths.length > 0) {
    docFiles = docFiles.filter((item) =>
      options.docsPaths!.some((path) => item.path.startsWith(path))
    );
  }

  // Skip files already fetched as LLM.txt
  const fetchedPaths = new Set(files.map((f) => f.path));
  docFiles = docFiles.filter((item) => !fetchedPaths.has(item.path));

  console.log(`Fetching ${docFiles.length} documentation files from ${owner}/${repo}`);

  // Fetch content with concurrency limit
  const CONCURRENT_LIMIT = 5;
  for (let i = 0; i < docFiles.length; i += CONCURRENT_LIMIT) {
    const batch = docFiles.slice(i, i + CONCURRENT_LIMIT);
    const results = await Promise.all(
      batch.map(async (file) => {
        const content = await fetchFileContent(owner, repo, file.path, token);
        if (content) {
          return {
            path: file.path,
            content,
            sha: file.sha,
            size: file.size || content.length,
            isLlmTxt: false,
          };
        }
        return null;
      })
    );

    for (const result of results) {
      if (result) {
        files.push(result);
      }
    }
  }

  // Fetch versions if requested
  let versions: FetchResult["versions"] = [];
  if (fetchVersions) {
    const [tags, releases] = await Promise.all([
      fetchTags(owner, repo, token),
      fetchReleases(owner, repo, token),
    ]);

    // Create a map of releases for additional metadata
    const releaseMap = new Map(releases.map((r) => [r.tag_name, r]));

    versions = tags.map((tag) => {
      const release = releaseMap.get(tag.name);
      return {
        version: parseVersionFromTag(tag.name),
        tag: tag.name,
        isPrerelease: release?.prerelease || false,
        publishedAt: release?.published_at,
      };
    });

    console.log(`Found ${versions.length} versions for ${owner}/${repo}`);
  }

  return {
    files,
    metadata: {
      owner,
      repo,
      branch,
      commitSha,
      description: repoInfo.description,
      homepage: repoInfo.homepage,
      stars: repoInfo.stargazers_count,
      updatedAt: repoInfo.updated_at,
    },
    versions,
    hasLlmTxt,
    llmTxtFiles,
  };
}

/**
 * Check if a repository has LLM.txt files without fetching content.
 */
export async function checkForLlmTxt(
  owner: string,
  repo: string,
  branch?: string,
  token?: string
): Promise<{ hasLlmTxt: boolean; files: string[] }> {
  try {
    const repoInfo = await fetchRepoInfo(owner, repo, token);
    const targetBranch = branch || repoInfo.default_branch;
    const tree = await fetchRepoTree(owner, repo, targetBranch, token);
    const llmFiles = findLlmTxtFiles(tree);

    return {
      hasLlmTxt: llmFiles.length > 0,
      files: llmFiles,
    };
  } catch (error) {
    console.warn(`Error checking for LLM.txt: ${error}`);
    return { hasLlmTxt: false, files: [] };
  }
}
