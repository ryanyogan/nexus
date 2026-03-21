import { Link } from "@tanstack/react-router";
import {
  Menu,
  X,
  Github,
  User,
  LogOut,
  Settings,
  Key,
  BookOpen,
  Server,
  Database,
  ArrowUpRight,
  Moon,
  Sun,
  Layers,
  Zap,
  LayoutDashboard,
} from "lucide-react";
import { LAYOUT_WIDTHS } from "./layout/PageContainer";
import { useState, useRef, useEffect } from "react";
import { signOut } from "@nexus/auth/client";
import type { SessionData } from "../server/auth";

interface HeaderProps {
  session: SessionData | null;
}

export default function Header({ session }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const isSignedIn = !!session?.user;

  // Initialize dark mode from system/localStorage
  // IMPORTANT: Use 'nexus-theme' key to match __root.tsx initialization script
  useEffect(() => {
    const stored = localStorage.getItem("nexus-theme");
    if (
      stored === "dark" ||
      (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else if (stored === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    if (newValue) {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
      localStorage.setItem("nexus-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
      localStorage.setItem("nexus-theme", "light");
    }
  };

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    window.location.href = "/";
  };

  return (
    <header className="left-0 right-0 top-0 z-40 bg-background pt-4 md:pt-6">
      <div
        className={`mx-auto flex w-full items-center justify-between px-4 sm:px-6 lg:px-8 h-14 ${LAYOUT_WIDTHS.full}`}
      >
        {/* Logo - Always goes to home */}
        <Link
          to="/"
          className="flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wider hover:text-accent transition-colors"
        >
          <span className="border border-foreground bg-foreground text-background px-2 py-1">
            N
          </span>
          <span className="hidden sm:inline">NEXUS</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 font-mono text-xs font-bold uppercase tracking-wider">
          {/* Dashboard link for logged-in users */}
          {isSignedIn && (
            <>
              <Link
                to="/dashboard"
                className="px-3 py-2 hover:bg-muted transition-colors flex items-center gap-1"
              >
                <LayoutDashboard className="h-4 w-4" />
                DASHBOARD
              </Link>
              <span className="text-border">|</span>
            </>
          )}
          <a
            href="https://github.com/ryanyogan/nexus"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 hover:bg-muted transition-colors flex items-center gap-1"
          >
            <Github className="h-4 w-4" />
            INSTALL
          </a>
          <span className="text-border">|</span>
          <Link to="/plans" className="px-3 py-2 hover:bg-muted transition-colors">
            PLANS
          </Link>
          <span className="text-border">|</span>

          {/* More Dropdown */}
          <div className="group relative">
            <button className="px-3 py-2 hover:bg-muted transition-colors">MORE...</button>

            <div className="pointer-events-none invisible absolute right-0 top-full z-50 w-56 opacity-0 transition-all duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100">
              <div className="mt-1 border border-border bg-background shadow-sm">
                {/* Links */}
                <a
                  href="https://docs.nexus.yogan.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted border-b border-border transition-colors"
                >
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">DOCS</span>
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <Link
                  to="/"
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted border-b border-border transition-colors"
                >
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">
                    LIBRARIES
                  </span>
                  <BookOpen className="h-4 w-4" />
                </Link>
                <Link
                  to="/"
                  search={{ filter: "servers" }}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted border-b border-border transition-colors"
                >
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">
                    MCP SERVERS
                  </span>
                  <Server className="h-4 w-4" />
                </Link>
                <Link
                  to="/"
                  search={{ filter: "skills" }}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted border-b border-border transition-colors"
                >
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">
                    SKILLS
                  </span>
                  <Zap className="h-4 w-4" />
                </Link>
                <Link
                  to="/dashboard/stacks"
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted border-b border-border transition-colors"
                >
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">
                    STACKS
                  </span>
                  <Layers className="h-4 w-4" />
                </Link>
                <Link
                  to="/dashboard/prompts"
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted border-b border-border transition-colors"
                >
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">
                    PROMPTS
                  </span>
                  <Zap className="h-4 w-4" />
                </Link>
                <div className="flex items-center justify-between px-4 py-3 text-muted-foreground cursor-not-allowed border-b border-border">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">
                    MEMORY
                  </span>
                  <Database className="h-4 w-4" />
                </div>

                {/* Dark mode toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted border-b border-border transition-colors"
                >
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">
                    {isDark ? "LIGHT MODE" : "DARK MODE"}
                  </span>
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>

                {/* CTA */}
                {isSignedIn ? (
                  <Link
                    to="/dashboard/keys"
                    className="flex items-center justify-between px-4 py-3 bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
                  >
                    <span className="font-mono text-xs font-bold uppercase tracking-wider">
                      CREATE API KEY
                    </span>
                    <Key className="h-4 w-4" />
                  </Link>
                ) : (
                  <a
                    href="/sign-in"
                    className="flex items-center justify-between px-4 py-3 bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
                  >
                    <span className="font-mono text-xs font-bold uppercase tracking-wider">
                      SIGN IN
                    </span>
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Right side - Auth + Mobile */}
        <div className="flex items-center gap-2">
          {/* User Menu */}
          {isSignedIn && session?.user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 border border-border px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider hover:bg-muted transition-colors"
              >
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="h-5 w-5"
                  />
                ) : (
                  <User className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{session.user.name?.toUpperCase()}</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 w-56 border border-border bg-background shadow-sm">
                  <div className="px-4 py-2 text-xs font-mono text-muted-foreground border-b border-border">
                    {session.user.email}
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider hover:bg-muted transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    DASHBOARD
                  </Link>
                  <Link
                    to="/settings/secrets"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider hover:bg-muted transition-colors"
                  >
                    <Key className="h-4 w-4" />
                    API VAULT
                  </Link>
                  {session.user.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider hover:bg-muted transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      ADMIN
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider hover:bg-muted border-t border-border transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    SIGN OUT
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a
              href="/sign-in"
              className="hidden md:flex items-center gap-1 border border-border px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider hover:bg-muted transition-colors"
            >
              LOG IN
            </a>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden flex items-center justify-center h-9 w-9 border border-border"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-4 space-y-2">
            {/* Dashboard link for signed-in users */}
            {isSignedIn && (
              <Link
                to="/dashboard"
                className="flex items-center justify-center gap-2 px-4 py-3 border border-accent bg-accent/10 text-accent font-mono text-xs font-bold uppercase tracking-wider hover:bg-accent/20 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LayoutDashboard className="h-4 w-4" />
                DASHBOARD
              </Link>
            )}

            {/* Primary links: DOCS + PLANS + INSTALL */}
            <div className="grid grid-cols-3 gap-2">
              <a
                href="https://docs.nexus.yogan.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] flex items-center justify-center border border-border font-mono text-xs font-bold uppercase tracking-wider text-center hover:bg-muted transition-colors"
              >
                DOCS
              </a>
              <Link
                to="/plans"
                className="min-h-[44px] flex items-center justify-center border border-border font-mono text-xs font-bold uppercase tracking-wider text-center hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                PLANS
              </Link>
              <a
                href="https://github.com/ryanyogan/nexus"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] flex items-center justify-center border border-border font-mono text-xs font-bold uppercase tracking-wider text-center hover:bg-muted transition-colors"
              >
                INSTALL
              </a>
            </div>

            {/* Secondary links: content filters */}
            <div className="grid grid-cols-2 gap-2 xs:grid-cols-4">
              <Link
                to="/"
                search={{ filter: "servers" }}
                className="min-h-[44px] flex items-center justify-center border border-border font-mono text-xs font-bold uppercase tracking-wider text-center hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                SERVERS
              </Link>
              <Link
                to="/"
                search={{ filter: "skills" }}
                className="min-h-[44px] flex items-center justify-center border border-border font-mono text-xs font-bold uppercase tracking-wider text-center hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                SKILLS
              </Link>
              <Link
                to="/"
                search={{ filter: "stacks" }}
                className="min-h-[44px] flex items-center justify-center border border-border font-mono text-xs font-bold uppercase tracking-wider text-center hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                STACKS
              </Link>
              <Link
                to="/"
                search={{ filter: "prompts" }}
                className="min-h-[44px] flex items-center justify-center border border-border font-mono text-xs font-bold uppercase tracking-wider text-center hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                PROMPTS
              </Link>
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-full min-h-[44px] flex items-center justify-center gap-2 border border-border font-mono text-xs font-bold uppercase tracking-wider hover:bg-muted transition-colors"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {isDark ? "LIGHT MODE" : "DARK MODE"}
            </button>

            {/* Sign in for unauthenticated users */}
            {!isSignedIn && (
              <a
                href="/sign-in"
                className="block px-4 py-3 bg-accent text-accent-foreground font-mono text-xs font-bold uppercase tracking-wider text-center hover:bg-accent/90 transition-colors"
              >
                SIGN IN
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
