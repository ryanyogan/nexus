import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Menu, BookOpen } from "lucide-react";
import { DocsSidebar, MobileDocsSidebar } from "./DocsSidebar";
import { getPrevNext } from "./navigation";
import { FloatingParticles } from "../FloatingParticles";

interface DocsLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  toc?: Array<{ id: string; title: string; level: number }>;
}

export function DocsLayout({ children, title, description, toc }: DocsLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const { prev, next } = getPrevNext(location.pathname);

  return (
    <div className="relative min-h-screen">
      {/* Background effects */}
      <FloatingParticles />
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Mobile nav toggle */}
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <button
            onClick={() => setMobileNavOpen(true)}
            className="rounded-lg border border-border/50 bg-card/50 p-2 text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <DocsSidebar />
          <MobileDocsSidebar
            isOpen={mobileNavOpen}
            onClose={() => setMobileNavOpen(false)}
          />

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Header */}
            <div className="mb-8">
              <Link
                to="/"
                className="mb-4 hidden lg:inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
              
              <div className="flex items-center gap-3 mt-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"
                  style={{ boxShadow: "0 0 20px rgba(139, 92, 246, 0.2)" }}
                >
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                    {title}
                  </h1>
                  {description && (
                    <p className="mt-1 text-muted-foreground">{description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-invert max-w-none">
              {children}
            </div>

            {/* Prev/Next navigation */}
            <div className="mt-12 flex items-center justify-between border-t border-border/50 pt-6">
              {prev ? (
                <Link
                  to={prev.href}
                  className="group flex items-center gap-2 rounded-lg border border-border/50 bg-card/50 px-4 py-3 text-sm text-muted-foreground transition-all hover:border-primary/50 hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  <div>
                    <div className="text-xs text-muted-foreground">Previous</div>
                    <div className="font-medium text-foreground">{prev.title}</div>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {next ? (
                <Link
                  to={next.href}
                  className="group flex items-center gap-2 rounded-lg border border-border/50 bg-card/50 px-4 py-3 text-sm text-muted-foreground transition-all hover:border-primary/50 hover:text-foreground"
                >
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Next</div>
                    <div className="font-medium text-foreground">{next.title}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              ) : (
                <div />
              )}
            </div>
          </main>

          {/* Table of contents (optional) */}
          {toc && toc.length > 0 && (
            <aside className="hidden xl:block w-56 shrink-0">
              <div className="sticky top-24">
                <h3 className="mb-4 text-sm font-semibold text-foreground">
                  On this page
                </h3>
                <nav className="space-y-1">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground ${
                        item.level > 2 ? "pl-6" : ""
                      }`}
                    >
                      {item.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
