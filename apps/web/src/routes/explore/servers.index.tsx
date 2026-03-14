import { createFileRoute, redirect } from "@tanstack/react-router";

// Redirect /explore/servers to homepage
export const Route = createFileRoute("/explore/servers/")({
  beforeLoad: ({ search }) => {
    throw redirect({ 
      to: "/", 
      search: { 
        q: (search as { q?: string }).q 
      } 
    });
  },
});
