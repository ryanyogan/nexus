import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Layers, Github, ArrowLeft, Loader2 } from "lucide-react";
import { NeuralNetwork } from "../components/NeuralNetwork";
import { signIn, useSession } from "@nexus/auth/client";

export const Route = createFileRoute("/sign-in")({ component: SignInPage });

function SignInPage() {
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { data: session, isPending } = useSession();

  // Redirect if already signed in
  useEffect(() => {
    if (session?.user) {
      navigate({ to: "/" });
    }
  }, [session, navigate]);

  useEffect(() => {
    // Card entrance animation
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out" }
    );

    // Logo animation
    gsap.fromTo(
      ".auth-logo",
      { opacity: 0, scale: 0.8, rotate: -10 },
      { opacity: 1, scale: 1, rotate: 0, duration: 0.5, ease: "back.out(1.7)", delay: 0.2 }
    );

    // Text animations
    gsap.fromTo(
      ".auth-title",
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", delay: 0.3 }
    );

    gsap.fromTo(
      ".auth-subtitle",
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", delay: 0.4 }
    );

    // Buttons animation
    gsap.fromTo(
      ".auth-button",
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: "power2.out", delay: 0.5 }
    );

    // Footer animation
    gsap.fromTo(
      ".auth-footer",
      { opacity: 0 },
      { opacity: 1, duration: 0.5, delay: 0.7 }
    );
  }, []);

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
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      {/* Neural network background */}
      <div className="absolute inset-0 -z-10">
        <NeuralNetwork />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background/90" />
      </div>

      {/* Glow effects */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-accent/20 blur-[100px]" />
      </div>

      <div
        ref={cardRef}
        className="relative w-full max-w-sm rounded-2xl border border-border/50 bg-card/80 p-8 backdrop-blur-xl"
        style={{
          boxShadow: `
            0 0 60px rgba(139, 92, 246, 0.1),
            0 25px 50px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.05)
          `,
        }}
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <div
            className="auth-logo mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary"
            style={{
              boxShadow: `
                0 0 30px rgba(139, 92, 246, 0.4),
                0 0 60px rgba(139, 92, 246, 0.2)
              `,
            }}
          >
            <Layers className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="auth-title text-2xl font-bold text-foreground">
            Sign in to Nexus
          </h1>
          <p className="auth-subtitle mt-2 text-muted-foreground">
            Connect your account to get started
          </p>
        </div>

        {/* Auth buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleSignIn}
            className="auth-button group relative flex h-12 w-full items-center justify-center gap-3 overflow-hidden rounded-xl border border-border/50 bg-card text-sm font-medium text-foreground transition-all hover:border-primary/50"
            style={{
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
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
            className="auth-button group relative flex h-12 w-full items-center justify-center gap-3 overflow-hidden rounded-xl border border-border/50 bg-card text-sm font-medium text-foreground transition-all hover:border-primary/50"
            style={{
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <Github className="h-5 w-5" />
            Continue with GitHub
          </button>
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border/50" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border/50" />
        </div>

        {/* Email option (future) */}
        <button
          disabled
          className="auth-button flex h-12 w-full items-center justify-center rounded-xl border border-dashed border-border/50 text-sm text-muted-foreground transition-colors hover:border-border hover:text-foreground"
        >
          Continue with Email (coming soon)
        </button>

        {/* Terms */}
        <p className="auth-footer mt-6 text-center text-xs text-muted-foreground">
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
        <div className="auth-footer mt-6 text-center">
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
