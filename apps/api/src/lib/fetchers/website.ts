/**
 * Website Documentation Fetcher
 *
 * Crawls documentation websites to extract content.
 * Follows links within the documentation domain and respects robots.txt.
 */

// Parsers available for future use
// import { parseMarkdown, stripMdxComponents } from "../parsers/markdown";

// ============================================================================
// Types
// ============================================================================

export interface WebsiteFetchOptions {
  /** Maximum number of pages to crawl */
  maxPages?: number;
  /** CSS selector for main content area */
  contentSelector?: string;
  /** CSS selector for elements to exclude */
  excludeSelector?: string;
  /** Timeout per page in milliseconds */
  pageTimeout?: number;
  /** Delay between requests in milliseconds */
  requestDelay?: number;
  /** Follow external links */
  followExternal?: boolean;
  /** URL patterns to include (regex strings) */
  includePatterns?: string[];
  /** URL patterns to exclude (regex strings) */
  excludePatterns?: string[];
}

export interface FetchedPage {
  url: string;
  title: string;
  content: string;
  html: string;
  links: string[];
  depth: number;
  fetchedAt: string;
}

export interface WebsiteFetchResult {
  pages: FetchedPage[];
  metadata: {
    baseUrl: string;
    totalPages: number;
    totalTokens: number;
    crawlDurationMs: number;
    errors: Array<{ url: string; error: string }>;
  };
}

// ============================================================================
// Constants
// ============================================================================

const USER_AGENT = "Nexus-Docs-Crawler/1.0 (https://nexus.anmly.co)";
const DEFAULT_MAX_PAGES = 100;
const DEFAULT_TIMEOUT = 10000;
const DEFAULT_DELAY = 500;

// Common documentation content selectors
const CONTENT_SELECTORS = [
  "article",
  "[role='main']",
  "main",
  ".documentation",
  ".docs-content",
  ".markdown-body",
  ".prose",
  "#content",
  ".content",
];

// Elements to exclude from content
const EXCLUDE_SELECTORS = [
  "nav",
  "header",
  "footer",
  "aside",
  ".sidebar",
  ".navigation",
  ".toc",
  ".table-of-contents",
  ".breadcrumb",
  ".edit-link",
  ".page-nav",
  "script",
  "style",
  "noscript",
];

// URL patterns to skip
const SKIP_PATTERNS = [
  /\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|pdf|zip|tar|gz)$/i,
  /\/(api|auth|login|signup|register|admin|dashboard)\//i,
  /[?&](utm_|ref=|source=)/i,
  /#.*/,
];

// ============================================================================
// Main Fetch Function
// ============================================================================

/**
 * Fetch documentation from a website.
 */
export async function fetchWebsiteDocs(
  baseUrl: string,
  options: WebsiteFetchOptions = {}
): Promise<WebsiteFetchResult> {
  const startTime = Date.now();
  const {
    maxPages = DEFAULT_MAX_PAGES,
    contentSelector,
    excludeSelector,
    pageTimeout = DEFAULT_TIMEOUT,
    requestDelay = DEFAULT_DELAY,
    includePatterns = [],
    excludePatterns = [],
  } = options;

  // Normalize base URL
  const normalizedBase = normalizeUrl(baseUrl);
  const baseDomain = new URL(normalizedBase).hostname;

  // Track visited URLs and pages to fetch
  const visited = new Set<string>();
  const queue: Array<{ url: string; depth: number }> = [{ url: normalizedBase, depth: 0 }];
  const pages: FetchedPage[] = [];
  const errors: Array<{ url: string; error: string }> = [];

  // Compile patterns
  const includeRegex = includePatterns.map((p) => new RegExp(p, "i"));
  const excludeRegex = excludePatterns.map((p) => new RegExp(p, "i"));

  console.log(`Starting website crawl of ${normalizedBase}`);

  while (queue.length > 0 && pages.length < maxPages) {
    const { url, depth } = queue.shift()!;

    // Skip if already visited
    const normalizedUrl = normalizeUrl(url);
    if (visited.has(normalizedUrl)) continue;
    visited.add(normalizedUrl);

    // Check URL patterns
    if (!shouldFetchUrl(normalizedUrl, baseDomain, includeRegex, excludeRegex)) {
      continue;
    }

    try {
      const page = await fetchPage(normalizedUrl, {
        contentSelector,
        excludeSelector,
        timeout: pageTimeout,
      });

      if (page) {
        pages.push({
          ...page,
          depth,
          fetchedAt: new Date().toISOString(),
        });

        // Add discovered links to queue
        for (const link of page.links) {
          const absoluteLink = resolveUrl(normalizedUrl, link);
          if (absoluteLink && !visited.has(normalizeUrl(absoluteLink))) {
            queue.push({ url: absoluteLink, depth: depth + 1 });
          }
        }

        console.log(`Fetched ${pages.length}/${maxPages}: ${normalizedUrl}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push({ url: normalizedUrl, error: errorMessage });
      console.warn(`Error fetching ${normalizedUrl}: ${errorMessage}`);
    }

    // Rate limiting delay
    if (queue.length > 0) {
      await sleep(requestDelay);
    }
  }

  // Calculate total tokens
  const totalTokens = pages.reduce((sum, page) => {
    const wordCount = page.content.split(/\s+/).filter((w) => w.length > 0).length;
    return sum + Math.ceil(wordCount * 1.3);
  }, 0);

  console.log(`Website crawl complete: ${pages.length} pages, ${totalTokens} tokens`);

  return {
    pages,
    metadata: {
      baseUrl: normalizedBase,
      totalPages: pages.length,
      totalTokens,
      crawlDurationMs: Date.now() - startTime,
      errors,
    },
  };
}

// ============================================================================
// Page Fetching
// ============================================================================

/**
 * Fetch and parse a single page.
 */
async function fetchPage(
  url: string,
  options: {
    contentSelector?: string;
    excludeSelector?: string;
    timeout?: number;
  }
): Promise<Omit<FetchedPage, "depth" | "fetchedAt"> | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || DEFAULT_TIMEOUT);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return null;
    }

    const html = await response.text();
    const { title, content, links } = parseHtml(html, url, options);

    // Skip pages with no meaningful content
    if (content.length < 100) {
      return null;
    }

    return { url, title, content, html, links };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// ============================================================================
// HTML Parsing
// ============================================================================

/**
 * Parse HTML to extract content and links.
 * Uses simple regex-based parsing (no DOM parser in Workers).
 */
function parseHtml(
  html: string,
  baseUrl: string,
  options: { contentSelector?: string; excludeSelector?: string }
): { title: string; content: string; links: string[] } {
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? decodeHtmlEntities(titleMatch[1].trim()) : "Untitled";

  // Remove scripts, styles, and comments
  let cleanHtml = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "");

  // Try to extract main content area
  let contentHtml = cleanHtml;

  // Look for content selector if provided, otherwise try common selectors
  const selectors = options.contentSelector ? [options.contentSelector] : CONTENT_SELECTORS;

  for (const selector of selectors) {
    const selectorContent = extractBySelector(cleanHtml, selector);
    if (selectorContent && selectorContent.length > 200) {
      contentHtml = selectorContent;
      break;
    }
  }

  // Remove excluded elements
  const excludeSelectors = options.excludeSelector
    ? [options.excludeSelector, ...EXCLUDE_SELECTORS]
    : EXCLUDE_SELECTORS;

  for (const selector of excludeSelectors) {
    contentHtml = removeBySelector(contentHtml, selector);
  }

  // Convert to plain text / markdown-like format
  const content = htmlToText(contentHtml);

  // Extract links
  const links = extractLinks(cleanHtml, baseUrl);

  return { title, content, links };
}

/**
 * Simple selector-based content extraction.
 */
function extractBySelector(html: string, selector: string): string | null {
  // Handle simple tag selectors
  const tagMatch = selector.match(/^([a-z]+)$/i);
  if (tagMatch) {
    const tag = tagMatch[1];
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
    const match = html.match(regex);
    return match ? match[0] : null;
  }

  // Handle class selectors (.classname)
  const classMatch = selector.match(/^\.([a-z0-9_-]+)$/i);
  if (classMatch) {
    const className = classMatch[1];
    const regex = new RegExp(
      `<([a-z]+)[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*>[\\s\\S]*?<\\/\\1>`,
      "i"
    );
    const match = html.match(regex);
    return match ? match[0] : null;
  }

  // Handle ID selectors (#id)
  const idMatch = selector.match(/^#([a-z0-9_-]+)$/i);
  if (idMatch) {
    const id = idMatch[1];
    const regex = new RegExp(`<([a-z]+)[^>]*id="${id}"[^>]*>[\\s\\S]*?<\\/\\1>`, "i");
    const match = html.match(regex);
    return match ? match[0] : null;
  }

  // Handle role selectors ([role='main'])
  const roleMatch = selector.match(/^\[role=['"]([^'"]+)['"]\]$/i);
  if (roleMatch) {
    const role = roleMatch[1];
    const regex = new RegExp(`<([a-z]+)[^>]*role="${role}"[^>]*>[\\s\\S]*?<\\/\\1>`, "i");
    const match = html.match(regex);
    return match ? match[0] : null;
  }

  return null;
}

/**
 * Remove elements matching a selector.
 */
function removeBySelector(html: string, selector: string): string {
  // Handle simple tag selectors
  const tagMatch = selector.match(/^([a-z]+)$/i);
  if (tagMatch) {
    const tag = tagMatch[1];
    return html.replace(new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, "gi"), "");
  }

  // Handle class selectors
  const classMatch = selector.match(/^\.([a-z0-9_-]+)$/i);
  if (classMatch) {
    const className = classMatch[1];
    return html.replace(
      new RegExp(
        `<([a-z]+)[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*>[\\s\\S]*?<\\/\\1>`,
        "gi"
      ),
      ""
    );
  }

  return html;
}

/**
 * Convert HTML to plain text with some markdown formatting preserved.
 */
function htmlToText(html: string): string {
  return (
    html
      // Convert headings
      .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n# $1\n")
      .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n## $1\n")
      .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n### $1\n")
      .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n#### $1\n")
      .replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, "\n##### $1\n")
      .replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, "\n###### $1\n")
      // Convert code blocks
      .replace(
        /<pre[^>]*><code[^>]*class="[^"]*language-([^"]+)[^"]*"[^>]*>([\s\S]*?)<\/code><\/pre>/gi,
        "\n```$1\n$2\n```\n"
      )
      .replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, "\n```\n$1\n```\n")
      .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, "\n```\n$1\n```\n")
      // Convert inline code
      .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`")
      // Convert links
      .replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
      // Convert lists
      .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n")
      .replace(/<[ou]l[^>]*>/gi, "\n")
      .replace(/<\/[ou]l>/gi, "\n")
      // Convert paragraphs and breaks
      .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n$1\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<hr\s*\/?>/gi, "\n---\n")
      // Convert emphasis
      .replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, "**$2**")
      .replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, "*$2*")
      // Remove remaining tags
      .replace(/<[^>]+>/g, "")
      // Decode HTML entities
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
      // Clean up whitespace
      .replace(/\n{3,}/g, "\n\n")
      .replace(/^\s+|\s+$/g, "")
      .trim()
  );
}

/**
 * Extract links from HTML.
 */
function extractLinks(html: string, baseUrl: string): string[] {
  const links: string[] = [];
  const linkRegex = /<a[^>]*href="([^"]+)"[^>]*>/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    if (
      href &&
      !href.startsWith("#") &&
      !href.startsWith("javascript:") &&
      !href.startsWith("mailto:")
    ) {
      const absoluteUrl = resolveUrl(baseUrl, href);
      if (absoluteUrl) {
        links.push(absoluteUrl);
      }
    }
  }

  return [...new Set(links)];
}

/**
 * Decode HTML entities.
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)));
}

// ============================================================================
// URL Utilities
// ============================================================================

/**
 * Normalize a URL for comparison.
 */
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove trailing slash, fragments, and common tracking params
    parsed.hash = "";
    parsed.searchParams.delete("utm_source");
    parsed.searchParams.delete("utm_medium");
    parsed.searchParams.delete("utm_campaign");
    parsed.searchParams.delete("ref");

    let pathname = parsed.pathname;
    if (pathname.endsWith("/") && pathname !== "/") {
      pathname = pathname.slice(0, -1);
    }
    parsed.pathname = pathname;

    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * Resolve a relative URL against a base.
 */
function resolveUrl(base: string, relative: string): string | null {
  try {
    return new URL(relative, base).toString();
  } catch {
    return null;
  }
}

/**
 * Check if a URL should be fetched.
 */
function shouldFetchUrl(
  url: string,
  baseDomain: string,
  includePatterns: RegExp[],
  excludePatterns: RegExp[]
): boolean {
  try {
    const parsed = new URL(url);

    // Must be same domain or subdomain
    if (!parsed.hostname.endsWith(baseDomain) && parsed.hostname !== baseDomain) {
      return false;
    }

    // Check skip patterns
    for (const pattern of SKIP_PATTERNS) {
      if (pattern.test(url)) {
        return false;
      }
    }

    // Check exclude patterns
    for (const pattern of excludePatterns) {
      if (pattern.test(url)) {
        return false;
      }
    }

    // If include patterns specified, must match at least one
    if (includePatterns.length > 0) {
      return includePatterns.some((pattern) => pattern.test(url));
    }

    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Utilities
// ============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// LLM.txt Detection for Websites
// ============================================================================

/**
 * Check if a website has LLM.txt files.
 */
export async function checkWebsiteForLlmTxt(
  baseUrl: string
): Promise<{ hasLlmTxt: boolean; files: string[] }> {
  const llmTxtPaths = ["/llms.txt", "/llms-full.txt", "/.well-known/llms.txt"];

  const files: string[] = [];

  for (const path of llmTxtPaths) {
    try {
      const url = new URL(path, baseUrl).toString();
      const response = await fetch(url, {
        method: "HEAD",
        headers: { "User-Agent": USER_AGENT },
      });

      if (response.ok) {
        files.push(url);
      }
    } catch {
      // Ignore errors
    }
  }

  return {
    hasLlmTxt: files.length > 0,
    files,
  };
}

/**
 * Fetch LLM.txt content from a website.
 */
export async function fetchWebsiteLlmTxt(
  baseUrl: string
): Promise<{ url: string; content: string } | null> {
  const llmTxtPaths = [
    "/llms-full.txt", // Prefer full version
    "/llms.txt",
    "/.well-known/llms.txt",
  ];

  for (const path of llmTxtPaths) {
    try {
      const url = new URL(path, baseUrl).toString();
      const response = await fetch(url, {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "text/plain",
        },
      });

      if (response.ok) {
        const content = await response.text();
        if (content.length > 0) {
          return { url, content };
        }
      }
    } catch {
      // Continue to next path
    }
  }

  return null;
}

// ============================================================================
// Sitemap Support
// ============================================================================

/**
 * Fetch and parse sitemap to get documentation URLs.
 */
export async function fetchSitemapUrls(baseUrl: string, filterPattern?: RegExp): Promise<string[]> {
  const sitemapPaths = ["/sitemap.xml", "/sitemap_index.xml", "/docs/sitemap.xml"];
  const urls: string[] = [];

  for (const path of sitemapPaths) {
    try {
      const sitemapUrl = new URL(path, baseUrl).toString();
      const response = await fetch(sitemapUrl, {
        headers: { "User-Agent": USER_AGENT },
      });

      if (!response.ok) continue;

      const xml = await response.text();

      // Extract URLs from sitemap
      const urlMatches = xml.matchAll(/<loc>([^<]+)<\/loc>/g);
      for (const match of urlMatches) {
        const url = match[1];
        if (!filterPattern || filterPattern.test(url)) {
          urls.push(url);
        }
      }

      // Check for sitemap index (contains references to other sitemaps)
      const sitemapRefs = xml.matchAll(/<sitemap>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?<\/sitemap>/g);
      for (const ref of sitemapRefs) {
        const nestedUrls = await fetchSitemapUrls(ref[1], filterPattern);
        urls.push(...nestedUrls);
      }

      if (urls.length > 0) break;
    } catch {
      // Continue to next sitemap path
    }
  }

  return [...new Set(urls)];
}
