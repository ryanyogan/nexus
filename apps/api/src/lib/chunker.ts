import type { ChunkData } from "../types";

interface ChunkOptions {
  maxTokens: number;
  overlap: number;
  preserveCodeBlocks: boolean;
}

interface Section {
  title: string | null;
  content: string;
  level: number;
}

const DEFAULT_OPTIONS: ChunkOptions = {
  maxTokens: 512,
  overlap: 50,
  preserveCodeBlocks: true,
};

/**
 * Estimate token count using a simple heuristic.
 * More accurate than word count, less expensive than actual tokenization.
 * Roughly 1 token ≈ 4 characters for English text.
 */
export function estimateTokens(text: string): number {
  // Average of ~4 chars per token for English
  return Math.ceil(text.length / 4);
}

/**
 * Detect the content type of a text section.
 */
function detectContentType(content: string): "text" | "code" | "mixed" {
  const codeBlockMatches = content.match(/```[\s\S]*?```/g) || [];
  const codeBlockLength = codeBlockMatches.reduce((sum, block) => sum + block.length, 0);
  const codeRatio = codeBlockLength / content.length;

  if (codeRatio > 0.6) return "code";
  if (codeRatio > 0.2) return "mixed";
  return "text";
}

/**
 * Split markdown content by headers while preserving header hierarchy.
 */
function splitByHeaders(content: string): Section[] {
  const sections: Section[] = [];
  const headerRegex = /^(#{1,6})\s+(.+)$/gm;

  let lastIndex = 0;
  let lastTitle: string | null = null;
  let lastLevel = 0;
  let match: RegExpExecArray | null;

  while ((match = headerRegex.exec(content)) !== null) {
    // Get content before this header
    if (match.index > lastIndex) {
      const sectionContent = content.slice(lastIndex, match.index).trim();
      if (sectionContent) {
        sections.push({
          title: lastTitle,
          content: sectionContent,
          level: lastLevel,
        });
      }
    }

    lastTitle = match[2].trim();
    lastLevel = match[1].length;
    lastIndex = match.index + match[0].length;
  }

  // Get remaining content after last header
  if (lastIndex < content.length) {
    const sectionContent = content.slice(lastIndex).trim();
    if (sectionContent) {
      sections.push({
        title: lastTitle,
        content: sectionContent,
        level: lastLevel,
      });
    }
  }

  // If no headers found, return entire content as one section
  if (sections.length === 0 && content.trim()) {
    sections.push({
      title: null,
      content: content.trim(),
      level: 0,
    });
  }

  return sections;
}

/**
 * Split a large text into smaller chunks with overlap.
 */
function splitWithOverlap(
  content: string,
  title: string | null,
  sourceFile: string | null,
  options: ChunkOptions
): ChunkData[] {
  const chunks: ChunkData[] = [];
  const paragraphs = content.split(/\n\n+/);

  let currentChunk = "";
  let currentTokens = 0;

  for (const paragraph of paragraphs) {
    const paragraphTokens = estimateTokens(paragraph);

    // If single paragraph is too large, split by sentences
    if (paragraphTokens > options.maxTokens) {
      // Flush current chunk first
      if (currentChunk.trim()) {
        chunks.push(createChunk(currentChunk.trim(), title, sourceFile));
      }

      // Split large paragraph
      const sentences = paragraph.split(/(?<=[.!?])\s+/);
      currentChunk = "";
      currentTokens = 0;

      for (const sentence of sentences) {
        const sentenceTokens = estimateTokens(sentence);

        if (currentTokens + sentenceTokens > options.maxTokens && currentChunk.trim()) {
          chunks.push(createChunk(currentChunk.trim(), title, sourceFile));

          // Add overlap from previous chunk
          const words = currentChunk.trim().split(/\s+/);
          const overlapWords = words.slice(-Math.floor(options.overlap / 4));
          currentChunk = overlapWords.join(" ") + " " + sentence;
          currentTokens = estimateTokens(currentChunk);
        } else {
          currentChunk += (currentChunk ? " " : "") + sentence;
          currentTokens += sentenceTokens;
        }
      }
      continue;
    }

    // Check if adding this paragraph would exceed limit
    if (currentTokens + paragraphTokens > options.maxTokens && currentChunk.trim()) {
      chunks.push(createChunk(currentChunk.trim(), title, sourceFile));

      // Add overlap from previous chunk
      const words = currentChunk.trim().split(/\s+/);
      const overlapWords = words.slice(-Math.floor(options.overlap / 4));
      currentChunk = overlapWords.join(" ") + "\n\n" + paragraph;
      currentTokens = estimateTokens(currentChunk);
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
      currentTokens += paragraphTokens;
    }
  }

  // Don't forget the last chunk
  if (currentChunk.trim()) {
    chunks.push(createChunk(currentChunk.trim(), title, sourceFile));
  }

  return chunks;
}

/**
 * Create a ChunkData object.
 */
function createChunk(content: string, title: string | null, sourceFile: string | null): ChunkData {
  return {
    id: crypto.randomUUID(),
    title,
    content,
    contentType: detectContentType(content),
    sourceFile,
    tokenCount: estimateTokens(content),
  };
}

/**
 * Chunk markdown content into smaller pieces suitable for embedding.
 */
export function chunkMarkdown(
  content: string,
  sourceFile: string | null,
  options: Partial<ChunkOptions> = {}
): ChunkData[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const chunks: ChunkData[] = [];

  // Split by headers first
  const sections = splitByHeaders(content);

  for (const section of sections) {
    const sectionTokens = estimateTokens(section.content);

    if (sectionTokens <= opts.maxTokens) {
      // Section fits in one chunk
      chunks.push({
        id: crypto.randomUUID(),
        title: section.title,
        content: section.content,
        contentType: detectContentType(section.content),
        sourceFile,
        tokenCount: sectionTokens,
      });
    } else {
      // Section too large, split with overlap
      const subChunks = splitWithOverlap(section.content, section.title, sourceFile, opts);
      chunks.push(...subChunks);
    }
  }

  return chunks;
}

/**
 * Chunk multiple files and return all chunks.
 */
export function chunkFiles(
  files: Array<{ path: string; content: string }>,
  options: Partial<ChunkOptions> = {}
): ChunkData[] {
  const allChunks: ChunkData[] = [];

  for (const file of files) {
    const chunks = chunkMarkdown(file.content, file.path, options);
    allChunks.push(...chunks);
  }

  return allChunks;
}
