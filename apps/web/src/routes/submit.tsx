import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Upload,
  Loader2,
  Search,
  Star,
  GitFork,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Github,
} from "lucide-react";
import { useSession } from "@nexus/auth/client";
import { API_URL, LIBRARY_CATEGORIES } from "../lib/api";

export const Route = createFileRoute("/submit")({ component: SubmitPage });

// Types for analysis result
interface DocSource {
  type: string;
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

function SubmitPage() {
  const { data: session, isPending: sessionPending } = useSession();

  const [repoUrl, setRepoUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!sessionPending && !session?.user) {
      window.location.href = "/sign-in";
    }
  }, [session, sessionPending]);

  // Update selected categories when analysis suggests some
  useEffect(() => {
    if (analysis?.suggestedCategories) {
      setSelectedCategories(analysis.suggestedCategories);
    }
    if (analysis?.repo.description) {
      setDescription(analysis.repo.description);
    }
  }, [analysis]);

  const handleAnalyze = async () => {
    if (!repoUrl.trim()) return;

    setAnalyzing(true);
    setAnalyzeError(null);
    setAnalysis(null);

    try {
      const response = await fetch(
        `${API_URL}/api/analyze?url=${encodeURIComponent(repoUrl)}`,
        { credentials: "include" }
      );

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || "Failed to analyze repository");
      }

      const data: AnalysisResult = await response.json();
      setAnalysis(data);
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : "Failed to analyze repository");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!analysis || selectedCategories.length === 0) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(`${API_URL}/api/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          libraryName: analysis.repo.name,
          sourceUrl: analysis.repo.url,
          description: description || analysis.repo.description,
          email: session?.user?.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json() as { message?: string };
        throw new Error(errorData.message || "Failed to submit library");
      }

      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit library");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  if (sessionPending) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  if (submitSuccess) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Submission Received!</h1>
          <p className="mb-6 text-muted-foreground">
            We'll review your submission and add it to the index if it meets our criteria.
            You'll receive an email notification when it's processed.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/explore"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Explore Libraries
            </Link>
            <button
              onClick={() => {
                setSubmitSuccess(false);
                setAnalysis(null);
                setRepoUrl("");
                setSelectedCategories([]);
                setDescription("");
              }}
              className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <div className="rounded-xl border border-border bg-card p-8">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Submit a Library</h1>
            <p className="text-muted-foreground">
              Request a library to be added to the documentation index
            </p>
          </div>
        </div>

        {/* Step 1: Enter GitHub URL */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-foreground">
            GitHub Repository URL
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Github className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/owner/repo"
                className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                disabled={analyzing || !!analysis}
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={!repoUrl.trim() || analyzing || !!analysis}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {analyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Analyze
            </button>
          </div>
          {analyzeError && (
            <p className="mt-2 flex items-center gap-1 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {analyzeError}
            </p>
          )}
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Repo Info */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-start gap-4">
                <img
                  src={analysis.repo.owner.avatar}
                  alt={analysis.repo.owner.name}
                  className="h-12 w-12 rounded-lg"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{analysis.repo.name}</h3>
                    <a
                      href={analysis.repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  <p className="text-sm text-muted-foreground">{analysis.repo.fullName}</p>
                  <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {analysis.repo.stars.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="h-4 w-4" />
                      {analysis.repo.forks.toLocaleString()}
                    </span>
                    {analysis.repo.language && (
                      <span>{analysis.repo.language}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Documentation Sources */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-foreground">Documentation Found</h3>
              {analysis.docSources.length > 0 ? (
                <div className="space-y-2">
                  {analysis.docSources.map((source, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between rounded-lg border p-3 ${
                        source.type === "llms-txt" || source.type === "llms-full-txt"
                          ? "border-green-500/50 bg-green-500/10"
                          : "border-border bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {source.type === "llms-txt" || source.type === "llms-full-txt" ? (
                          <Sparkles className="h-5 w-5 text-green-500" />
                        ) : (
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-foreground">{source.path}</p>
                          <p className="text-xs text-muted-foreground">{source.description}</p>
                        </div>
                      </div>
                      {(source.type === "llms-txt" || source.type === "llms-full-txt") && (
                        <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-500">
                          Recommended
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    No documentation sources found. Consider adding a <code className="rounded bg-muted px-1">llms.txt</code> file.
                  </p>
                </div>
              )}
              
              {analysis.hasLlmsTxt && (
                <div className="mt-3 flex items-center gap-2 text-sm text-green-500">
                  <CheckCircle2 className="h-4 w-4" />
                  This repo has LLM-optimized documentation!
                </div>
              )}
            </div>

            {/* Categories */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-foreground">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {LIBRARY_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                      selectedCategories.includes(cat.id)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              {selectedCategories.length === 0 && (
                <p className="mt-2 text-xs text-destructive">Select at least one category</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the library..."
                rows={3}
                className="w-full rounded-lg border border-border bg-background p-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Submit */}
            {submitError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {submitError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setAnalysis(null);
                  setRepoUrl("");
                  setSelectedCategories([]);
                  setDescription("");
                }}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Start Over
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || selectedCategories.length === 0}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Submit for Review
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
