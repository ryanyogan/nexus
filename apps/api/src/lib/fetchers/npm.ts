/**
 * NPM Registry API Client
 *
 * Resolves package names to GitHub repository URLs by querying
 * the npm registry for package metadata.
 */

const NPM_REGISTRY = "https://registry.npmjs.org";
const NPM_TIMEOUT = 5000;
const USER_AGENT = "Nexus-Docs-Indexer/1.0";

// ============================================================================
// Types
// ============================================================================

interface NpmPackageMetadata {
  name: string;
  description?: string;
  "dist-tags"?: {
    latest?: string;
  };
  repository?: string | { type?: string; url?: string; directory?: string };
  homepage?: string;
  bugs?: { url?: string } | string;
  keywords?: string[];
}

export interface NpmResolveResult {
  name: string;
  description: string | null;
  repositoryUrl: string | null;
  homepageUrl: string | null;
  latestVersion: string | null;
  keywords: string[];
}

// ============================================================================
// Main Function
// ============================================================================

/**
 * Resolve an npm package name to its metadata including GitHub URL.
 * Handles scoped packages like @tanstack/query.
 */
export async function resolvePackageFromNpm(packageName: string): Promise<NpmResolveResult | null> {
  // Encode package name (handles scoped packages like @scope/name)
  const encodedName = encodeURIComponent(packageName).replace("%40", "@");
  const url = `${NPM_REGISTRY}/${encodedName}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), NPM_TIMEOUT);

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      // Package not found or other error
      return null;
    }

    const data = (await res.json()) as NpmPackageMetadata;

    return {
      name: data.name,
      description: data.description || null,
      repositoryUrl: normalizeGitHubUrl(data.repository),
      homepageUrl: data.homepage || null,
      latestVersion: data["dist-tags"]?.latest || null,
      keywords: data.keywords || [],
    };
  } catch (error) {
    // Timeout, network error, or JSON parse error
    console.warn(`npm lookup failed for ${packageName}:`, error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// ============================================================================
// URL Normalization
// ============================================================================

/**
 * Normalize various git URL formats to https://github.com/owner/repo
 *
 * Handles:
 * - git://github.com/owner/repo.git
 * - git+https://github.com/owner/repo.git
 * - git+ssh://git@github.com/owner/repo.git
 * - git@github.com:owner/repo.git
 * - https://github.com/owner/repo.git
 * - https://github.com/owner/repo
 * - github:owner/repo
 */
function normalizeGitHubUrl(
  repo: string | { type?: string; url?: string; directory?: string } | undefined
): string | null {
  if (!repo) return null;

  let url = typeof repo === "string" ? repo : repo.url;
  if (!url) return null;

  // Trim whitespace
  url = url.trim();

  // Shorthand: github:owner/repo
  if (url.startsWith("github:")) {
    const path = url.slice(7);
    return `https://github.com/${path}`;
  }

  // git@github.com:owner/repo.git (SSH format)
  const sshMatch = url.match(/^git@github\.com:(.+?)(?:\.git)?$/);
  if (sshMatch) {
    return `https://github.com/${sshMatch[1]}`;
  }

  // git+ssh://git@github.com/owner/repo.git
  if (url.startsWith("git+ssh://")) {
    url = url.replace("git+ssh://git@github.com/", "https://github.com/");
    url = url.replace("git+ssh://git@github.com:", "https://github.com/");
  }

  // git+https:// or git+http://
  url = url.replace(/^git\+(https?):\/\//, "$1://");

  // git:// protocol
  url = url.replace(/^git:\/\//, "https://");

  // Remove .git suffix
  url = url.replace(/\.git$/, "");

  // Verify it's a GitHub URL
  if (!url.includes("github.com")) {
    return null;
  }

  // Ensure https://
  if (url.startsWith("http://github.com")) {
    url = url.replace("http://", "https://");
  }

  // Extract just owner/repo (remove any trailing paths like /tree/main)
  const match = url.match(/https:\/\/github\.com\/([^/]+\/[^/]+)/);
  if (match) {
    return `https://github.com/${match[1]}`;
  }

  return url;
}
