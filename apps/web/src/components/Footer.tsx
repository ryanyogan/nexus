import { Link } from "@tanstack/react-router";
import { Github, BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Nexus</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/docs" className="transition-colors hover:text-foreground">
              Docs
            </Link>
            <Link to="/explore" className="transition-colors hover:text-foreground">
              Explore
            </Link>
            <a
              href="https://github.com/ryanyogan/nexus"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 transition-colors hover:text-foreground"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Nexus
          </p>
        </div>
      </div>
    </footer>
  );
}
