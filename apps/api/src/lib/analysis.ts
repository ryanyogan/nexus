/**
 * AI Quality Analysis
 *
 * Analyzes documentation quality using AI to generate benchmark scores,
 * trust scores, and quality metrics.
 */

import type { ParsedDocument, CodeBlock, Section } from "./parsers/markdown";

// ============================================================================
// Types
// ============================================================================

export interface QualityAnalysis {
  /** Overall benchmark score (0-100) */
  benchmarkScore: number;
  /** Trust/authority score (0-100) */
  trustScore: number;
  /** Detailed quality metrics */
  metrics: QualityMetrics;
  /** Breakdown of scoring */
  breakdown: ScoreBreakdown;
  /** AI-generated summary of documentation quality */
  summary: string;
  /** Suggestions for improvement */
  suggestions: string[];
}

export interface QualityMetrics {
  /** Total documentation files */
  totalFiles: number;
  /** Total word count */
  totalWords: number;
  /** Estimated token count */
  totalTokens: number;
  /** Number of code examples */
  codeExamples: number;
  /** Code languages used */
  codeLanguages: string[];
  /** Has getting started guide */
  hasGettingStarted: boolean;
  /** Has API reference */
  hasApiReference: boolean;
  /** Has code examples */
  hasCodeExamples: boolean;
  /** Has LLM.txt file */
  hasLlmTxt: boolean;
  /** Documentation coverage score */
  coverageScore: number;
  /** Code quality score */
  codeQualityScore: number;
  /** Freshness score (based on last update) */
  freshnessScore: number;
}

export interface ScoreBreakdown {
  /** Content quality (clear, well-structured) */
  contentQuality: number;
  /** Code example quality */
  codeExampleQuality: number;
  /** Documentation coverage */
  coverage: number;
  /** Structure and organization */
  structure: number;
  /** LLM-readiness (llms.txt, clear sections) */
  llmReadiness: number;
}

export interface AnalysisInput {
  /** Parsed documentation files */
  documents: Map<string, ParsedDocument>;
  /** Repository metadata */
  repoMetadata?: {
    stars?: number;
    updatedAt?: string;
    hasLlmTxt: boolean;
  };
  /** Library name for context */
  libraryName?: string;
}

// ============================================================================
// Main Analysis Function
// ============================================================================

/**
 * Analyze documentation quality.
 * Uses heuristics for most scoring, with optional AI enhancement.
 */
export function analyzeDocumentation(input: AnalysisInput): QualityAnalysis {
  const { documents, repoMetadata, libraryName } = input;

  // Calculate basic metrics
  const metrics = calculateMetrics(documents, repoMetadata);

  // Calculate score breakdown
  const breakdown = calculateBreakdown(documents, metrics, repoMetadata);

  // Calculate overall scores
  const benchmarkScore = calculateBenchmarkScore(breakdown, metrics);
  const trustScore = calculateTrustScore(metrics, repoMetadata);

  // Generate summary and suggestions
  const { summary, suggestions } = generateSummary(
    libraryName || "Library",
    metrics,
    breakdown,
    benchmarkScore
  );

  return {
    benchmarkScore,
    trustScore,
    metrics,
    breakdown,
    summary,
    suggestions,
  };
}

// ============================================================================
// Metrics Calculation
// ============================================================================

function calculateMetrics(
  documents: Map<string, ParsedDocument>,
  repoMetadata?: { hasLlmTxt: boolean; updatedAt?: string }
): QualityMetrics {
  let totalWords = 0;
  let totalTokens = 0;
  let codeExamples = 0;
  const codeLanguages = new Set<string>();
  let hasGettingStarted = false;
  let hasApiReference = false;

  for (const [path, doc] of documents) {
    totalWords += doc.metadata.wordCount;
    totalTokens += doc.metadata.estimatedTokens;
    codeExamples += doc.codeBlocks.length;

    for (const block of doc.codeBlocks) {
      if (block.language && block.language !== "text") {
        codeLanguages.add(block.language);
      }
    }

    // Check for getting started content
    const lowerPath = path.toLowerCase();
    const lowerTitle = doc.title.toLowerCase();
    if (
      lowerPath.includes("getting-started") ||
      lowerPath.includes("quickstart") ||
      lowerPath.includes("installation") ||
      lowerTitle.includes("getting started") ||
      lowerTitle.includes("quick start")
    ) {
      hasGettingStarted = true;
    }

    // Check for API reference
    if (
      lowerPath.includes("api") ||
      lowerPath.includes("reference") ||
      lowerTitle.includes("api reference")
    ) {
      hasApiReference = true;
    }
  }

  // Calculate coverage score (based on documentation completeness)
  let coverageScore = 0;
  if (hasGettingStarted) coverageScore += 25;
  if (hasApiReference) coverageScore += 25;
  if (codeExamples > 5) coverageScore += 25;
  if (documents.size >= 5) coverageScore += 25;

  // Calculate code quality score
  let codeQualityScore = 0;
  if (codeExamples > 0) codeQualityScore += 30;
  if (codeExamples > 10) codeQualityScore += 20;
  if (codeLanguages.size > 0) codeQualityScore += 25;
  if (codeLanguages.size > 1) codeQualityScore += 25;

  // Calculate freshness score
  let freshnessScore = 50; // Default to medium
  if (repoMetadata?.updatedAt) {
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(repoMetadata.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceUpdate < 7) freshnessScore = 100;
    else if (daysSinceUpdate < 30) freshnessScore = 80;
    else if (daysSinceUpdate < 90) freshnessScore = 60;
    else if (daysSinceUpdate < 180) freshnessScore = 40;
    else freshnessScore = 20;
  }

  return {
    totalFiles: documents.size,
    totalWords,
    totalTokens,
    codeExamples,
    codeLanguages: [...codeLanguages],
    hasGettingStarted,
    hasApiReference,
    hasCodeExamples: codeExamples > 0,
    hasLlmTxt: repoMetadata?.hasLlmTxt || false,
    coverageScore,
    codeQualityScore,
    freshnessScore,
  };
}

// ============================================================================
// Score Breakdown Calculation
// ============================================================================

function calculateBreakdown(
  documents: Map<string, ParsedDocument>,
  metrics: QualityMetrics,
  repoMetadata?: { hasLlmTxt: boolean }
): ScoreBreakdown {
  // Content quality: based on structure, headings, descriptions
  let contentQuality = 0;
  let totalHeadings = 0;
  let docsWithDescription = 0;
  let docsWithGoodStructure = 0;

  for (const [_, doc] of documents) {
    totalHeadings += doc.headings.length;
    if (doc.description) docsWithDescription++;

    // Good structure = has multiple heading levels
    const headingLevels = new Set(doc.headings.map((h) => h.level));
    if (headingLevels.size >= 2) docsWithGoodStructure++;
  }

  // Content quality scoring
  const avgHeadings = documents.size > 0 ? totalHeadings / documents.size : 0;
  const descriptionRate = documents.size > 0 ? docsWithDescription / documents.size : 0;
  const structureRate = documents.size > 0 ? docsWithGoodStructure / documents.size : 0;

  contentQuality = Math.min(
    100,
    avgHeadings * 5 + descriptionRate * 40 + structureRate * 40
  );

  // Code example quality
  let codeExampleQuality = 0;
  if (metrics.codeExamples > 0) {
    // More examples = better
    codeExampleQuality += Math.min(40, metrics.codeExamples * 2);
    // Multiple languages = better
    codeExampleQuality += Math.min(30, metrics.codeLanguages.length * 10);
    // Languages used for this type of project
    if (
      metrics.codeLanguages.some((l) =>
        ["typescript", "javascript", "tsx", "jsx"].includes(l.toLowerCase())
      )
    ) {
      codeExampleQuality += 30;
    }
  }
  codeExampleQuality = Math.min(100, codeExampleQuality);

  // Coverage
  const coverage = metrics.coverageScore;

  // Structure
  const structure = Math.min(100, structureRate * 50 + avgHeadings * 5 + 20);

  // LLM Readiness
  let llmReadiness = 30; // Base score
  if (repoMetadata?.hasLlmTxt) llmReadiness += 40;
  if (contentQuality > 60) llmReadiness += 15;
  if (structureRate > 0.5) llmReadiness += 15;
  llmReadiness = Math.min(100, llmReadiness);

  return {
    contentQuality: Math.round(contentQuality),
    codeExampleQuality: Math.round(codeExampleQuality),
    coverage: Math.round(coverage),
    structure: Math.round(structure),
    llmReadiness: Math.round(llmReadiness),
  };
}

// ============================================================================
// Overall Score Calculation
// ============================================================================

function calculateBenchmarkScore(
  breakdown: ScoreBreakdown,
  metrics: QualityMetrics
): number {
  // Weighted average of breakdown components
  const weights = {
    contentQuality: 0.25,
    codeExampleQuality: 0.25,
    coverage: 0.2,
    structure: 0.15,
    llmReadiness: 0.15,
  };

  let score =
    breakdown.contentQuality * weights.contentQuality +
    breakdown.codeExampleQuality * weights.codeExampleQuality +
    breakdown.coverage * weights.coverage +
    breakdown.structure * weights.structure +
    breakdown.llmReadiness * weights.llmReadiness;

  // Bonus for LLM.txt
  if (metrics.hasLlmTxt) {
    score = Math.min(100, score + 5);
  }

  // Penalty for very low token count (thin documentation)
  if (metrics.totalTokens < 1000) {
    score = Math.max(0, score - 20);
  }

  return Math.round(score);
}

function calculateTrustScore(
  metrics: QualityMetrics,
  repoMetadata?: { stars?: number; updatedAt?: string }
): number {
  let score = 50; // Base score

  // Stars factor
  const stars = repoMetadata?.stars || 0;
  if (stars > 10000) score += 20;
  else if (stars > 5000) score += 15;
  else if (stars > 1000) score += 10;
  else if (stars > 500) score += 5;

  // Freshness factor
  score += Math.floor(metrics.freshnessScore * 0.2);

  // Documentation quality factor
  if (metrics.hasGettingStarted) score += 5;
  if (metrics.hasApiReference) score += 5;
  if (metrics.hasCodeExamples) score += 5;
  if (metrics.hasLlmTxt) score += 5;

  // Coverage factor
  score += Math.floor(metrics.coverageScore * 0.1);

  return Math.min(100, Math.round(score));
}

// ============================================================================
// Summary Generation
// ============================================================================

function generateSummary(
  libraryName: string,
  metrics: QualityMetrics,
  breakdown: ScoreBreakdown,
  benchmarkScore: number
): { summary: string; suggestions: string[] } {
  const suggestions: string[] = [];
  const summaryParts: string[] = [];

  // Overall assessment
  if (benchmarkScore >= 80) {
    summaryParts.push(
      `${libraryName} has excellent documentation quality with comprehensive coverage.`
    );
  } else if (benchmarkScore >= 60) {
    summaryParts.push(
      `${libraryName} has good documentation with room for improvement.`
    );
  } else if (benchmarkScore >= 40) {
    summaryParts.push(
      `${libraryName} documentation is adequate but could benefit from enhancements.`
    );
  } else {
    summaryParts.push(
      `${libraryName} documentation needs improvement for better developer experience.`
    );
  }

  // Code examples assessment
  if (metrics.codeExamples > 10) {
    summaryParts.push(`Rich code examples (${metrics.codeExamples} total).`);
  } else if (metrics.codeExamples > 0) {
    summaryParts.push(`Contains ${metrics.codeExamples} code example(s).`);
    if (breakdown.codeExampleQuality < 60) {
      suggestions.push("Add more code examples to demonstrate common use cases.");
    }
  } else {
    suggestions.push("Add code examples to help developers understand usage patterns.");
  }

  // LLM readiness
  if (metrics.hasLlmTxt) {
    summaryParts.push("Includes LLM.txt for AI-optimized access.");
  } else {
    suggestions.push(
      "Consider adding an llms.txt file for better AI assistant compatibility."
    );
  }

  // Coverage suggestions
  if (!metrics.hasGettingStarted) {
    suggestions.push("Add a getting started or quickstart guide.");
  }
  if (!metrics.hasApiReference) {
    suggestions.push("Include an API reference section.");
  }

  // Structure suggestions
  if (breakdown.structure < 50) {
    suggestions.push(
      "Improve document structure with clear headings and sections."
    );
  }

  // Content suggestions
  if (breakdown.contentQuality < 50) {
    suggestions.push("Add descriptions to documents for better context.");
  }

  return {
    summary: summaryParts.join(" "),
    suggestions: suggestions.slice(0, 5), // Limit to top 5 suggestions
  };
}

// ============================================================================
// AI-Enhanced Analysis (Optional)
// ============================================================================

/**
 * Enhance analysis using AI (Workers AI).
 * This is optional and can be called for more detailed analysis.
 */
export async function enhanceAnalysisWithAI(
  analysis: QualityAnalysis,
  sampleContent: string,
  ai: Ai
): Promise<QualityAnalysis> {
  try {
    const prompt = `Analyze the quality of this documentation excerpt and provide a brief assessment.

Documentation sample:
"""
${sampleContent.slice(0, 2000)}
"""

Current scores:
- Benchmark Score: ${analysis.benchmarkScore}/100
- Trust Score: ${analysis.trustScore}/100
- Content Quality: ${analysis.breakdown.contentQuality}/100
- Code Examples: ${analysis.breakdown.codeExampleQuality}/100

Provide a 1-2 sentence assessment of the documentation quality. Focus on clarity, completeness, and usefulness for developers.`;

    const response = await ai.run("@cf/meta/llama-3-8b-instruct", {
      prompt,
      max_tokens: 150,
    });

    if (response && typeof response === "object" && "response" in response) {
      const aiSummary = (response as { response: string }).response;
      if (aiSummary) {
        // Append AI assessment to summary
        analysis.summary = `${analysis.summary} ${aiSummary}`;
      }
    }
  } catch (error) {
    console.warn("AI enhancement failed:", error);
    // Continue with existing analysis
  }

  return analysis;
}

// ============================================================================
// Quick Score (Lightweight)
// ============================================================================

/**
 * Calculate a quick benchmark score without full parsing.
 * Useful for large libraries where full analysis would be slow.
 */
export function quickBenchmarkScore(
  fileCount: number,
  totalTokens: number,
  hasLlmTxt: boolean,
  codeExampleCount: number,
  stars?: number
): number {
  let score = 30; // Base score

  // File count factor
  if (fileCount > 50) score += 15;
  else if (fileCount > 20) score += 10;
  else if (fileCount > 10) score += 5;

  // Token count factor (documentation depth)
  if (totalTokens > 100000) score += 15;
  else if (totalTokens > 50000) score += 10;
  else if (totalTokens > 10000) score += 5;

  // LLM.txt bonus
  if (hasLlmTxt) score += 10;

  // Code examples factor
  if (codeExampleCount > 50) score += 15;
  else if (codeExampleCount > 20) score += 10;
  else if (codeExampleCount > 5) score += 5;

  // Stars factor (popularity/trust)
  if (stars) {
    if (stars > 10000) score += 15;
    else if (stars > 1000) score += 10;
    else if (stars > 100) score += 5;
  }

  return Math.min(100, score);
}

// ============================================================================
// Serialization
// ============================================================================

/**
 * Serialize analysis to JSON for storage.
 */
export function serializeAnalysis(analysis: QualityAnalysis): string {
  return JSON.stringify(analysis);
}

/**
 * Deserialize analysis from JSON.
 */
export function deserializeAnalysis(json: string): QualityAnalysis | null {
  try {
    return JSON.parse(json) as QualityAnalysis;
  } catch {
    return null;
  }
}
