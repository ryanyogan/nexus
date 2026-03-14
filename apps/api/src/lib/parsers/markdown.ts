/**
 * Markdown Parser
 * 
 * Parses markdown/MDX files into structured documents.
 * Extracts headings, code blocks, and content sections.
 * Preserves hierarchy for smart chunking.
 */

// ============================================================================
// Types
// ============================================================================

export interface ParsedDocument {
  title: string;
  description?: string;
  headings: Heading[];
  sections: Section[];
  codeBlocks: CodeBlock[];
  frontmatter: Record<string, unknown>;
  links: Link[];
  metadata: {
    wordCount: number;
    estimatedTokens: number;
    hasCodeExamples: boolean;
    primaryLanguage?: string;
  };
}

export interface Heading {
  level: number;         // 1-6
  text: string;
  id: string;           // Generated slug
  line: number;
  parent?: string;      // Parent heading id
}

export interface Section {
  headingId: string;
  headingText: string;
  headingLevel: number;
  content: string;
  startLine: number;
  endLine: number;
  codeBlockIds: string[];
}

export interface CodeBlock {
  id: string;
  language: string;
  code: string;
  title?: string;
  description?: string;  // Text immediately before the code block
  line: number;
  sectionId: string;
}

export interface Link {
  text: string;
  url: string;
  isExternal: boolean;
  line: number;
}

// ============================================================================
// Main Parser Function
// ============================================================================

export function parseMarkdown(content: string, filePath?: string): ParsedDocument {
  const lines = content.split("\n");
  
  // Extract frontmatter
  const { frontmatter, contentStartLine } = extractFrontmatter(lines);
  const contentLines = lines.slice(contentStartLine);
  
  // Parse headings
  const headings = extractHeadings(contentLines, contentStartLine);
  
  // Parse code blocks
  const codeBlocks = extractCodeBlocks(contentLines, contentStartLine);
  
  // Parse sections (content between headings)
  const sections = extractSections(contentLines, headings, codeBlocks, contentStartLine);
  
  // Parse links
  const links = extractLinks(contentLines, contentStartLine);
  
  // Determine title and description
  const title = extractTitle(frontmatter, headings, filePath);
  const description = extractDescription(frontmatter, contentLines);
  
  // Calculate metadata
  const plainText = contentLines.join(" ").replace(/[#*`\[\]()]/g, "");
  const wordCount = plainText.split(/\s+/).filter(w => w.length > 0).length;
  const estimatedTokens = Math.ceil(wordCount * 1.3); // Rough estimate: 1.3 tokens per word
  
  // Determine primary code language
  const languageCounts = new Map<string, number>();
  for (const block of codeBlocks) {
    if (block.language) {
      languageCounts.set(block.language, (languageCounts.get(block.language) || 0) + 1);
    }
  }
  const primaryLanguage = [...languageCounts.entries()]
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  return {
    title,
    description,
    headings,
    sections,
    codeBlocks,
    frontmatter,
    links,
    metadata: {
      wordCount,
      estimatedTokens,
      hasCodeExamples: codeBlocks.length > 0,
      primaryLanguage,
    },
  };
}

// ============================================================================
// Frontmatter Extraction
// ============================================================================

function extractFrontmatter(lines: string[]): { frontmatter: Record<string, unknown>; contentStartLine: number } {
  const frontmatter: Record<string, unknown> = {};
  
  if (lines[0]?.trim() !== "---") {
    return { frontmatter, contentStartLine: 0 };
  }
  
  let endIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      endIndex = i;
      break;
    }
  }
  
  if (endIndex === -1) {
    return { frontmatter, contentStartLine: 0 };
  }
  
  // Parse YAML-like frontmatter
  const frontmatterLines = lines.slice(1, endIndex);
  for (const line of frontmatterLines) {
    const match = line.match(/^(\w+):\s*(.+)?$/);
    if (match) {
      const [, key, value] = match;
      frontmatter[key] = parseYamlValue(value?.trim() || "");
    }
  }
  
  return { frontmatter, contentStartLine: endIndex + 1 };
}

function parseYamlValue(value: string): unknown {
  if (!value) return "";
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^\d+$/.test(value)) return parseInt(value, 10);
  if (/^\d+\.\d+$/.test(value)) return parseFloat(value);
  if (value.startsWith("[") && value.endsWith("]")) {
    return value.slice(1, -1).split(",").map(v => v.trim().replace(/['"]/g, ""));
  }
  return value.replace(/^['"]|['"]$/g, "");
}

// ============================================================================
// Heading Extraction
// ============================================================================

function extractHeadings(lines: string[], offset: number): Heading[] {
  const headings: Heading[] = [];
  const parentStack: { level: number; id: string }[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = slugify(text);
      
      // Find parent heading
      while (parentStack.length > 0 && parentStack[parentStack.length - 1].level >= level) {
        parentStack.pop();
      }
      const parent = parentStack[parentStack.length - 1]?.id;
      
      headings.push({
        level,
        text,
        id,
        line: i + offset,
        parent,
      });
      
      parentStack.push({ level, id });
    }
  }
  
  return headings;
}

// ============================================================================
// Code Block Extraction
// ============================================================================

function extractCodeBlocks(lines: string[], offset: number): CodeBlock[] {
  const codeBlocks: CodeBlock[] = [];
  let inCodeBlock = false;
  let currentBlock: Partial<CodeBlock> | null = null;
  let codeLines: string[] = [];
  let blockId = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for code fence start
    const fenceStart = line.match(/^```(\w*)\s*(.*)$/);
    if (fenceStart && !inCodeBlock) {
      inCodeBlock = true;
      const language = fenceStart[1] || "text";
      const title = fenceStart[2] || undefined;
      
      // Look for description in previous lines
      let description = "";
      for (let j = i - 1; j >= 0 && j >= i - 3; j--) {
        const prevLine = lines[j].trim();
        if (prevLine && !prevLine.startsWith("#") && !prevLine.startsWith("```")) {
          description = prevLine;
          break;
        }
      }
      
      currentBlock = {
        id: `code-${blockId++}`,
        language,
        title,
        description: description || undefined,
        line: i + offset,
        sectionId: "",
      };
      codeLines = [];
      continue;
    }
    
    // Check for code fence end
    if (line.trim() === "```" && inCodeBlock && currentBlock) {
      currentBlock.code = codeLines.join("\n");
      codeBlocks.push(currentBlock as CodeBlock);
      inCodeBlock = false;
      currentBlock = null;
      continue;
    }
    
    // Accumulate code lines
    if (inCodeBlock) {
      codeLines.push(line);
    }
  }
  
  return codeBlocks;
}

// ============================================================================
// Section Extraction
// ============================================================================

function extractSections(
  lines: string[],
  headings: Heading[],
  codeBlocks: CodeBlock[],
  offset: number
): Section[] {
  const sections: Section[] = [];
  
  // If no headings, treat entire document as one section
  if (headings.length === 0) {
    const content = lines.join("\n").trim();
    if (content) {
      sections.push({
        headingId: "root",
        headingText: "Document",
        headingLevel: 0,
        content,
        startLine: offset,
        endLine: offset + lines.length - 1,
        codeBlockIds: codeBlocks.map(cb => cb.id),
      });
    }
    return sections;
  }
  
  // Process each heading as a section
  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const nextHeading = headings[i + 1];
    
    const startLine = heading.line - offset;
    const endLine = nextHeading ? nextHeading.line - offset - 1 : lines.length - 1;
    
    // Extract content between this heading and the next
    const sectionLines = lines.slice(startLine + 1, endLine + 1);
    const content = sectionLines.join("\n").trim();
    
    // Find code blocks in this section
    const sectionCodeBlocks = codeBlocks.filter(cb => {
      const cbLine = cb.line - offset;
      return cbLine > startLine && cbLine <= endLine;
    });
    
    // Update code block section IDs
    for (const cb of sectionCodeBlocks) {
      cb.sectionId = heading.id;
    }
    
    sections.push({
      headingId: heading.id,
      headingText: heading.text,
      headingLevel: heading.level,
      content,
      startLine: heading.line,
      endLine: offset + endLine,
      codeBlockIds: sectionCodeBlocks.map(cb => cb.id),
    });
  }
  
  return sections;
}

// ============================================================================
// Link Extraction
// ============================================================================

function extractLinks(lines: string[], offset: number): Link[] {
  const links: Link[] = [];
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match;
    
    while ((match = linkRegex.exec(line)) !== null) {
      const [, text, url] = match;
      links.push({
        text,
        url,
        isExternal: url.startsWith("http://") || url.startsWith("https://"),
        line: i + offset,
      });
    }
  }
  
  return links;
}

// ============================================================================
// Title & Description Extraction
// ============================================================================

function extractTitle(
  frontmatter: Record<string, unknown>,
  headings: Heading[],
  filePath?: string
): string {
  // Priority: frontmatter > first h1 > filename
  if (frontmatter.title && typeof frontmatter.title === "string") {
    return frontmatter.title;
  }
  
  const h1 = headings.find(h => h.level === 1);
  if (h1) {
    return h1.text;
  }
  
  if (filePath) {
    const filename = filePath.split("/").pop() || "";
    return filename.replace(/\.(md|mdx)$/i, "").replace(/[-_]/g, " ");
  }
  
  return "Untitled";
}

function extractDescription(
  frontmatter: Record<string, unknown>,
  lines: string[]
): string | undefined {
  if (frontmatter.description && typeof frontmatter.description === "string") {
    return frontmatter.description;
  }
  
  // Find first paragraph (non-heading, non-empty line)
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && !trimmed.startsWith("```") && !trimmed.startsWith("-") && !trimmed.startsWith("*")) {
      return trimmed.slice(0, 200);
    }
  }
  
  return undefined;
}

// ============================================================================
// Utilities
// ============================================================================

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ============================================================================
// MDX Support
// ============================================================================

export function isMdxFile(path: string): boolean {
  return path.toLowerCase().endsWith(".mdx");
}

export function stripMdxComponents(content: string): string {
  // Remove import statements
  let result = content.replace(/^import\s+.*$/gm, "");
  
  // Remove export statements (but keep export default)
  result = result.replace(/^export\s+(?!default).*$/gm, "");
  
  // Convert JSX-like components to their children content
  // <Callout>content</Callout> -> content
  result = result.replace(/<(\w+)[^>]*>([\s\S]*?)<\/\1>/g, "$2");
  
  // Remove self-closing components
  result = result.replace(/<\w+[^>]*\/>/g, "");
  
  return result;
}

// ============================================================================
// Batch Processing
// ============================================================================

export function parseMultipleDocuments(
  files: Array<{ path: string; content: string }>
): Map<string, ParsedDocument> {
  const documents = new Map<string, ParsedDocument>();
  
  for (const file of files) {
    let content = file.content;
    
    if (isMdxFile(file.path)) {
      content = stripMdxComponents(content);
    }
    
    const parsed = parseMarkdown(content, file.path);
    documents.set(file.path, parsed);
  }
  
  return documents;
}
