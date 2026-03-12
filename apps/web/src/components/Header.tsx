import { Link } from "@tanstack/react-router";
import {
  Menu,
  X,
  Plus,
  Github,
  ChevronDown,
  User,
  LogOut,
  Settings,
  Key,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { signOut } from "@nexus/auth/client";
import type { SessionData } from "../server/auth";

interface HeaderProps {
  session: SessionData | null;
}

export default function Header({ session }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
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
                  <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-stone-200 bg-white py-2 shadow-lg">
                    <div className="px-4 py-2 text-sm text-stone-500">
                      {session.user.email}
                    </div>
                    <div className="my-1 border-t border-stone-100" />
                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-stone-700 transition-colors hover:bg-stone-50"
                    >
                      <Settings className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/settings/secrets"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-stone-700 transition-colors hover:bg-stone-50"
                    >
                      <Key className="h-4 w-4" />
                      API Key Vault
                    </Link>
                    {session.user.role === "admin" && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-stone-700 transition-colors hover:bg-stone-50"
                      >
                        <Settings className="h-4 w-4" />
                        Admin
                      </Link>
                    )}
                    <div className="my-1 border-t border-stone-100" />
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-stone-700 transition-colors hover:bg-stone-50"
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
                to="/code"
                className="flex flex-1 cursor-pointer items-center justify-center rounded-lg border border-stone-300 px-3 py-3 text-base font-medium leading-none text-stone-700 transition-colors hover:bg-stone-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Code
              </Link>
              <a
                href="https://docs.nexus.yogan.dev"
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-stone-300 px-3 py-3 text-base font-medium leading-none text-stone-700 transition-colors hover:bg-stone-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Documentation
              </a>
              <a
                href="https://github.com/ryanyogan/nexus"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-stone-300 px-3 py-3 text-base font-medium leading-none text-stone-700 transition-colors hover:bg-stone-100"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </div>

            {/* Desktop nav links - Channel9 Style */}
            <Link
              to="/explore"
              className="hidden cursor-pointer text-base text-stone-700 underline underline-offset-2 transition-all hover:text-stone-800 md:block"
            >
              Explore
            </Link>

            <span className="hidden h-4 w-px bg-stone-300 md:block" />

            <Link
              to="/code"
              className="hidden cursor-pointer text-base text-stone-700 underline underline-offset-2 transition-all hover:text-stone-800 md:block"
            >
              Code
            </Link>

            <span className="hidden h-4 w-px bg-stone-300 md:block" />

            <a
              href="https://github.com/ryanyogan/nexus"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden cursor-pointer items-center gap-1 text-base text-stone-700 underline underline-offset-2 transition-all hover:text-stone-800 md:flex"
            >
              <Github className="h-5 w-5" />
              GitHub
            </a>

            <span className="hidden h-4 w-px bg-stone-300 md:block" />

            {/* More... Dropdown */}
            <div
              className="relative hidden md:block"
              onMouseEnter={() => setMoreMenuOpen(true)}
              onMouseLeave={() => setMoreMenuOpen(false)}
            >
              <button className="flex cursor-pointer items-center gap-1 text-base text-stone-700 underline underline-offset-2 transition-all hover:text-stone-800">
                More...
                <ChevronDown className="h-4 w-4" />
              </button>

              {/* Dropdown Menu */}
              {moreMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-stone-200 bg-white py-2 shadow-lg">
                  <a
                    href="https://docs.nexus.yogan.dev"
                    className="block px-4 py-2 text-sm text-stone-700 transition-colors hover:bg-stone-50"
                  >
                    Documentation
                  </a>
                  <Link
                    to="/explore"
                    className="block px-4 py-2 text-sm text-stone-700 transition-colors hover:bg-stone-50"
                  >
                    Explore Libraries
                  </Link>
                  <Link
                    to="/code"
                    className="block px-4 py-2 text-sm text-stone-700 transition-colors hover:bg-stone-50"
                  >
                    Code Editor
                  </Link>
                  {isSignedIn && (
                    <>
                      <div className="my-1 border-t border-stone-100" />
                      <Link
                        to="/dashboard/keys"
                        className="block px-4 py-2 text-sm font-medium text-emerald-600 transition-colors hover:bg-stone-50"
                      >
                        Create API Key
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <span className="hidden h-4 w-px bg-stone-300 md:block" />

            {/* Submit button - To the right of More... */}
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
