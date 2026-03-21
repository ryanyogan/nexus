import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Layers, Github, ArrowLeft, Loader2 } from "lucide-react";
import { signIn } from "@nexus/auth/client";

// Only allow redirects to our own subdomains for security
function getValidRedirectUrl(redirect: string | undefined): string {
  const defaultUrl = "https://nexus.yogan.dev/";

  if (!redirect) return defaultUrl;

  try {
    const url = new URL(redirect);
    // Only allow redirects to *.yogan.dev subdomains
    if (url.hostname.endsWith(".yogan.dev") || url.hostname === "yogan.dev") {
      return redirect;
    }
  } catch {
    // Invalid URL, use default
  }

  return defaultUrl;
}

export const Route = createFileRoute("/sign-in")({
  component: SignInPage,
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  beforeLoad: async ({ context, search }) => {
    const { session } = context;
    if (session?.user) {
      // Redirect to callback URL or dashboard
      const callbackURL =
        getValidRedirectUrl((search as { redirect?: string })?.redirect) || "/dashboard";
      throw redirect({ to: callbackURL });
    }
  },
});

function SignInPage() {
  const { redirect: redirectParam } = Route.useSearch();
  const [isLoading, setIsLoading] = useState<"google" | "github" | null>(null);

  const callbackURL = useMemo(() => getValidRedirectUrl(redirectParam), [redirectParam]);

  const handleGoogleSignIn = async () => {
    setIsLoading("google");
    try {
      await signIn.social({
        provider: "google",
        callbackURL,
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
        callbackURL,
      });
    } catch {
      setIsLoading(null);
    }
  };

  const isDisabled = isLoading !== null;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm border border-border bg-background p-8">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border border-foreground bg-foreground">
            <Layers className="h-7 w-7 text-background" />
          </div>
          <h1 className="font-mono text-xl font-bold uppercase tracking-tight text-foreground">
            Sign in to Nexus
          </h1>
          <p className="mt-2 font-mono text-sm text-muted-foreground">
            Connect your account to get started
          </p>
        </div>

        {/* Auth buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={isDisabled}
            className="flex h-12 w-full items-center justify-center gap-3 border border-border bg-background font-mono text-sm font-bold uppercase tracking-wide text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
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
            {isLoading === "google" ? "Signing in..." : "Google"}
          </button>

          <button
            onClick={handleGitHubSignIn}
            disabled={isDisabled}
            className="flex h-12 w-full items-center justify-center gap-3 border border-border bg-background font-mono text-sm font-bold uppercase tracking-wide text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading === "github" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Github className="h-5 w-5" />
            )}
            {isLoading === "github" ? "Signing in..." : "GitHub"}
          </button>
        </div>

        {/* Terms */}
        <p className="mt-6 text-center font-mono text-xs text-muted-foreground">
          By signing in, you agree to our{" "}
          <a href="#" className="text-accent hover:underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="text-accent hover:underline">
            Privacy Policy
          </a>
        </p>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase text-muted-foreground transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
