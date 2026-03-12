import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  Outlet,
  useMatches,
} from "@tanstack/react-router";
import type { RouterContext } from "../router";
import Header from "../components/Header";
import { Footer } from "../components/Footer";
import { DevModeBadge } from "../components/DevModeBadge";
import { cn } from "@/lib/utils";

import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Nexus - Documentation Search + Memory for AI Assistants" },
      {
        name: "description",
        content:
          "Instant documentation search with persistent memory across sessions. The MCP server that remembers your project context.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  const matches = useMatches();

  // Check if we're on a code editor route - hide footer for full height
  const isCodeEditor = matches.some(
    (match) => match.pathname.startsWith("/code")
  );

  return (
    <html lang="en">
      <head>
        <HeadContent />
        {/* Add mobile PWA meta tags for code routes */}
        {isCodeEditor && (
          <>
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta
              name="apple-mobile-web-app-status-bar-style"
              content="black-translucent"
            />
          </>
        )}
      </head>
      <body className="flex min-h-screen flex-col overflow-x-hidden bg-stone-50 antialiased">
        {/* Green gradient background */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[260px]"
          style={{
            background:
              "linear-gradient(180deg, rgba(0, 153, 101, 0.08) 0%, rgba(0, 153, 101, 0) 100%)",
          }}
        />

        <Header />
        <main
          className={cn(
            "flex-grow pt-0",
            isCodeEditor && "h-[calc(100vh-4rem)] overflow-hidden"
          )}
        >
          <Outlet />
        </main>
        {!isCodeEditor && <Footer />}
        <DevModeBadge />
        <Scripts />
      </body>
    </html>
  );
}
