import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  Outlet,
} from "@tanstack/react-router";
import type { RouterContext } from "../router";
import Header from "../components/Header";
import { Footer } from "../components/Footer";

import appCss from "../styles.css?url";

// Inline script to prevent FOUC (flash of unstyled content)
const themeScript = `
(function() {
  try {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})()
`;

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
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <Header />
        <main>
          <Outlet />
        </main>
        <Footer />
        <Scripts />
      </body>
    </html>
  );
}
