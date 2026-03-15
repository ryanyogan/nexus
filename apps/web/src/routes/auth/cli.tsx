import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Layers, Github, Check, X, Terminal, Loader2 } from "lucide-react";
import { signIn } from "@nexus/auth/client";

// API URL - use env var or default to production
const API_URL =
  (typeof import.meta !== "undefined" &&
    (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env
      ?.VITE_API_URL) ||
  "https://api.nexus.yogan.dev";

export const Route = createFileRoute("/auth/cli")({
  component: CLIAuthPage,
  validateSearch: (search: Record<string, unknown>) => ({
    code: typeof search.code === "string" ? search.code : undefined,
  }),
  beforeLoad: async ({ search }) => {
    // Require a code
    if (!search.code) {
      throw redirect({ to: "/sign-in", search: { redirect: undefined } });
    }
  },
});

function CLIAuthPage() {
  const { code } = Route.useSearch();
  const { session } = Route.useRouteContext();
  const [status, setStatus] = useState<"pending" | "success" | "error">(
    "pending"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<"google" | "github" | null>(null);

  // If user is already logged in, complete the auth
  useEffect(() => {
    if (session?.user && code) {
      completeAuth();
    }
  }, [session, code]);

  const completeAuth = async () => {
    if (!code) return;

    try {
      const response = await fetch(`${API_URL}/api/cli/auth/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to complete authentication");
      }

      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading("google");
    try {
      await signIn.social({
        provider: "google",
        callbackURL: `/auth/cli?code=${code}`,
      });
    } catch {
      setIsLoading(null);
    }
  };

  const handleGitHubSignIn = async () => {
    setIsLoading("github");
    try {
      await signIn.social({
        provider: "github",
        callbackURL: `/auth/cli?code=${code}`,
      });
    } catch {
      setIsLoading(null);
    }
  };

  const isDisabled = isLoading !== null;

  // Success state
  if (status === "success") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
            <Check className="h-7 w-7 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            CLI Authenticated!
          </h1>
          <p className="mt-2 text-muted-foreground">
            You can close this window and return to your terminal.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Your CLI session is now active.
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (status === "error") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <X className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Authentication Failed
          </h1>
          <p className="mt-2 text-muted-foreground">
            {errorMessage || "Something went wrong"}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Please try running{" "}
            <code className="rounded bg-muted px-1 py-0.5">
              nexus auth login
            </code>{" "}
            again.
          </p>
        </div>
      </div>
    );
  }

  // If not logged in, show sign-in options
  if (!session?.user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8">
          {/* Logo */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
              <Terminal className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Nexus CLI Login
            </h1>
            <p className="mt-2 text-muted-foreground">
              Sign in to authenticate your CLI
            </p>
          </div>

          {/* Code display */}
          {code && (
            <div className="mb-6 rounded-lg border border-border bg-muted/50 p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Verification Code
              </p>
              <p className="mt-1 font-mono text-2xl font-bold tracking-widest text-foreground">
                {code}
              </p>
            </div>
          )}

          {/* Auth buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={isDisabled}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-border bg-background text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading === "google" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              {isLoading === "google" ? "Signing in..." : "Continue with Google"}
            </button>

            <button
              onClick={handleGitHubSignIn}
              disabled={isDisabled}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-border bg-background text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading === "github" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Github className="h-5 w-5" />
              )}
              {isLoading === "github" ? "Signing in..." : "Continue with GitHub"}
            </button>
          </div>

          {/* Info */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            This will create an API token for your CLI session.
          </p>
        </div>
      </div>
    );
  }

  // Logged in, completing auth
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
          <Layers className="h-7 w-7 text-primary-foreground animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Completing Authentication...
        </h1>
        <p className="mt-2 text-muted-foreground">
          Please wait while we set up your CLI session.
        </p>
      </div>
    </div>
  );
}
