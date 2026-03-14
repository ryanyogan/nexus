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
import { getSessionFn } from "../server/auth";

import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async () => {
    // Fetch session on every navigation - this runs on the server
    const session = await getSessionFn();
    return { session };
  },
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
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
});

function RootComponent() {
  const matches = useMatches();
  const { session } = Route.useRouteContext();

  // Check if we're on a code editor route - hide footer for full height
  const isCodeEditor = matches.some((match) =>
    match.pathname.startsWith("/code")
  );

  return (
    <html lang="en" className="light" style={{ colorScheme: "light" }} suppressHydrationWarning>
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
        {/* Dark mode initialization script - runs before paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('nexus-theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.remove('light');
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col overflow-x-hidden bg-background font-sans text-foreground antialiased">
        <Header session={session} />
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
