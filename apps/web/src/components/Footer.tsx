import { Link } from "@tanstack/react-router";
import { Github, BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-stone-200 py-8">
      <div className="mx-auto max-w-[880px] px-4 lg:px-0">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-600" />
            <span className="font-semibold text-stone-800">Nexus</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-stone-500">
            <a 
              href="https://docs.nexus.yogan.dev" 
              className="transition-colors hover:text-stone-800"
            >
              Docs
            </a>
            <Link to="/explore" className="transition-colors hover:text-stone-800">
              Explore
            </Link>
            <a
              href="https://github.com/ryanyogan/nexus"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 transition-colors hover:text-stone-800"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </div>
          <p className="text-sm text-stone-500">
            &copy; {new Date().getFullYear()} Nexus
          </p>
        </div>
      </div>
    </footer>
  );
}
