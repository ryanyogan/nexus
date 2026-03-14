import { Link } from "@tanstack/react-router";
import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-6">
      <div className="mx-auto max-w-[880px] px-4 lg:px-0">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center border border-foreground bg-foreground">
              <span className="font-mono text-xs font-bold text-background">N</span>
            </div>
            <span className="font-mono text-sm font-bold uppercase tracking-tight text-foreground">
              Nexus
            </span>
          </div>

          {/* Links with pipe separators */}
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wide">
            <a
              href="https://docs.nexus.yogan.dev"
              className="text-muted-foreground transition-colors hover:text-accent"
            >
              Docs
            </a>
            <span className="text-border">|</span>
            <Link
              to="/explore"
              className="text-muted-foreground transition-colors hover:text-accent"
            >
              Explore
            </Link>
            <span className="text-border">|</span>
            <a
              href="https://github.com/ryanyogan/nexus"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-accent"
            >
              <Github className="h-3 w-3" />
              GitHub
            </a>
          </div>

          {/* Copyright */}
          <p className="font-mono text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} NEXUS
          </p>
        </div>
      </div>
    </footer>
  );
}
