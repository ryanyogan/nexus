import { Link } from "@tanstack/react-router";
import {
  Menu,
  X,
  Plus,
  Github,
  User,
  LogOut,
  Settings,
  Key,
  BookOpen,
  Brain,
  Server,
  Database,
  ArrowUpRight,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { signOut } from "@nexus/auth/client";
import type { SessionData } from "../server/auth";

interface HeaderProps {
  session: SessionData | null;
}

export default function Header({ session }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const isSignedIn = !!session?.user;

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    // Refresh the page to clear state
    window.location.href = "/";
  };

  return (
    <header className="left-0 right-0 top-0 z-40">
      <div className="mx-auto flex w-full max-w-[880px] flex-col items-start justify-between border-b border-stone-200 px-4 md:h-[88px] md:flex-row md:items-center lg:px-0">
        {/* Logo and mobile menu toggle */}
        <div className="flex w-full items-center justify-between py-4 md:w-auto md:py-0">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <Link
              to={isSignedIn ? "/dashboard" : "/"}
              className="inline-flex items-center"
            >
              <div className="flex h-10 items-center justify-center rounded-lg border border-stone-300 bg-white px-3 hover:bg-stone-50">
                <span className="text-lg font-semibold text-stone-800">
                  Nexus
                </span>
              </div>
            </Link>

            {/* Auth Button - Next to logo */}
            {isSignedIn && session?.user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex h-10 items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 text-base font-medium text-stone-700 transition-colors hover:bg-stone-50"
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="h-6 w-6 rounded-full"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                  <span className="hidden sm:inline">{session.user.name}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-stone-300 bg-white py-2 shadow-xl">
                    <div className="px-4 py-2 text-sm text-stone-500">
                      {session.user.email}
                    </div>
                    <div className="my-1 border-t border-stone-100" />
                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-stone-700 transition-colors hover:bg-stone-100"
                    >
                      <Settings className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-stone-700 transition-colors hover:bg-stone-100"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <Link
                      to="/settings/secrets"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-stone-700 transition-colors hover:bg-stone-100"
                    >
                      <Key className="h-4 w-4" />
                      API Key Vault
                    </Link>
                    {session.user.role === "admin" && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-stone-700 transition-colors hover:bg-stone-100"
                      >
                        <Settings className="h-4 w-4" />
                        Admin
                      </Link>
                    )}
                    <div className="my-1 border-t border-stone-100" />
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-stone-700 transition-colors hover:bg-stone-100"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <a
                href="/sign-in"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-stone-300 bg-white px-4 text-base font-medium text-stone-700 transition-colors hover:bg-stone-50"
              >
                Log In
              </a>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="flex h-10 w-10 items-center justify-center text-stone-700 transition-colors duration-300 hover:text-stone-800 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <div className="relative h-6 w-6">
              <Menu
                className={`absolute transition-all duration-300 ${mobileMenuOpen ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`}
              />
              <X
                className={`absolute transition-all duration-300 ${mobileMenuOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`}
              />
            </div>
          </button>
        </div>

        {/* Navigation - Desktop and Mobile */}
        <div
          className={`
          absolute left-0 right-0 top-[72px] z-20 origin-top transform-gpu flex-col items-start border-b border-stone-200 bg-stone-50 transition-all duration-300 ease-out
          md:static md:flex md:w-auto md:flex-row md:items-center md:gap-3 md:overflow-visible md:border-none md:bg-transparent md:py-0 md:shadow-none
          ${
            mobileMenuOpen
              ? "pointer-events-auto flex translate-y-0 scale-y-100 opacity-100"
              : "pointer-events-none flex -translate-y-2 scale-y-0 opacity-0 md:pointer-events-auto md:flex md:translate-y-0 md:scale-y-100 md:opacity-100"
          }
        `}
        >
          <div className="flex w-full flex-col gap-3 p-4 md:w-auto md:flex-row md:items-center md:gap-3 md:p-0">
            {/* Mobile buttons */}
            <div className="flex w-full items-center gap-2 md:hidden">
              <Link
                to="/explore"
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-3 text-base font-medium leading-none text-white transition-colors hover:bg-emerald-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Explore
              </Link>
              <Link
                to="/submit"
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-3 text-base font-medium leading-none text-white transition-colors hover:bg-emerald-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Plus className="h-4 w-4" />
                Submit
              </Link>
            </div>

            {/* Mobile grid */}
            <div className="grid w-full grid-cols-2 gap-2 md:hidden">
              <Link
                to="/explore/docs"
                className="flex flex-1 cursor-pointer items-center justify-center rounded-lg border border-stone-300 px-3 py-3 text-base font-medium leading-none text-stone-700 transition-colors hover:bg-stone-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Libraries
              </Link>
              <Link
                to="/explore/servers"
                className="flex flex-1 cursor-pointer items-center justify-center rounded-lg border border-stone-300 px-3 py-3 text-base font-medium leading-none text-stone-700 transition-colors hover:bg-stone-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                MCP Servers
              </Link>
              <a
                href="https://docs.nexus.yogan.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-stone-300 px-3 py-3 text-base font-medium leading-none text-stone-700 transition-colors hover:bg-stone-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Docs
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <a
                href="https://github.com/ryanyogan/nexus"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-stone-300 px-3 py-3 text-base font-medium leading-none text-stone-700 transition-colors hover:bg-stone-100"
              >
                <Github className="h-4 w-4" />
                Install
              </a>
            </div>

            {/* Desktop nav links */}
            <Link
              to="/explore"
              className="hidden cursor-pointer text-base text-stone-700 underline underline-offset-2 transition-all hover:text-stone-800 md:block"
            >
              Explore
            </Link>

            <span className="hidden h-4 w-px bg-stone-300 md:block" />

            <a
              href="https://github.com/ryanyogan/nexus"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden cursor-pointer items-center gap-1 text-base text-stone-700 underline underline-offset-2 transition-all hover:text-stone-800 md:flex"
            >
              <Github className="h-5 w-5" />
              Install
            </a>

            <span className="hidden h-4 w-px bg-stone-300 md:block" />

            {/* More... Dropdown - CSS-based hover */}
            <div className="group relative hidden md:block">
              <span className="cursor-pointer text-base text-stone-700 underline underline-offset-2 transition-all hover:text-stone-800">
                More...
              </span>

              {/* Dropdown Menu - CSS hover controlled */}
              <div className="pointer-events-none invisible absolute -left-[21px] -top-[17px] z-50 w-[200px] opacity-0 transition-all duration-200 ease-in-out group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100">
                <div className="rounded-xl border border-stone-300 bg-white shadow-xl">
                  <div className="rounded-xl bg-white px-2 py-2">
                    {/* Header item */}
                    <div className="flex w-full items-center rounded-lg px-3 py-2 text-left text-base font-normal text-stone-400">
                      More...
                    </div>

                    {/* Documentation */}
                    <a
                      href="https://docs.nexus.yogan.dev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-base font-normal text-stone-800 underline transition-colors hover:bg-stone-100"
                    >
                      <span>Documentation</span>
                      <ArrowUpRight className="h-5 w-5" />
                    </a>

                    {/* Libraries */}
                    <Link
                      to="/explore/docs"
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-base font-normal text-stone-800 underline transition-colors hover:bg-stone-100"
                    >
                      <span>Libraries</span>
                      <BookOpen className="h-5 w-5" />
                    </Link>

                    {/* MCP Servers */}
                    <Link
                      to="/explore/servers"
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-base font-normal text-stone-800 underline transition-colors hover:bg-stone-100"
                    >
                      <span>MCP Servers</span>
                      <Server className="h-5 w-5" />
                    </Link>

                    {/* AI Skills */}
                    <Link
                      to="/explore/skills"
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-base font-normal text-stone-800 underline transition-colors hover:bg-stone-100"
                    >
                      <span>AI Skills</span>
                      <Brain className="h-5 w-5" />
                    </Link>

                    {/* Memory - Coming Soon */}
                    <div className="flex w-full cursor-not-allowed items-center justify-between rounded-lg px-3 py-2 text-left text-base font-normal text-stone-400">
                      <span>Memory</span>
                      <Database className="h-5 w-5" />
                    </div>

                    {/* Divider and CTA */}
                    <div className="py-2">
                      <div className="border-b border-stone-200" />
                    </div>

                    {isSignedIn ? (
                      <Link
                        to="/dashboard/keys"
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-base font-normal text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <span>Create API Key</span>
                        <Plus className="h-5 w-5" />
                      </Link>
                    ) : (
                      <a
                        href="/sign-in"
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-base font-normal text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <span>Sign In</span>
                        <ArrowUpRight className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <span className="hidden h-4 w-px bg-stone-300 md:block" />

            {/* Submit button */}
            <Link
              to="/submit"
              className="hidden h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 text-base font-normal leading-none text-white transition-colors hover:bg-emerald-700 md:inline-flex"
            >
              <Plus className="h-4 w-4" />
              Submit
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
