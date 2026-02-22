import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Layers, Github, ArrowLeft, Loader2 } from "lucide-react";
import { signIn, useSession } from "@nexus/auth/client";

export const Route = createFileRoute("/sign-in")({ component: SignInPage });

function SignInPage() {
  const navigate = useNavigate();
  const { data: session, isPending } = useSession();

  // Redirect if already signed in
  useEffect(() => {
    if (session?.user) {
      navigate({ to: "/" });
    }
  }, [session, navigate]);

  const handleGoogleSignIn = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  const handleGitHubSignIn = async () => {
    await signIn.social({
      provider: "github",
      callbackURL: "/",
    });
  };

  // Show loading state while checking session
  if (isPending) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <Layers className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Sign in to Nexus
          </h1>
          <p className="mt-2 text-muted-foreground">
            Connect your account to get started
          </p>
        </div>

        {/* Auth buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleSignIn}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-border bg-background text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
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
            Continue with Google
          </button>

          <button
            onClick={handleGitHubSignIn}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-border bg-background text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Github className="h-5 w-5" />
            Continue with GitHub
          </button>
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Email option (future) */}
        <button
          disabled
          className="flex h-12 w-full items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground"
        >
          Continue with Email (coming soon)
        </button>

        {/* Terms */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          By signing in, you agree to our{" "}
          <a href="#" className="text-primary hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-primary hover:underline">
            Privacy Policy
          </a>
        </p>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
