import { createFileRoute, redirect } from "@tanstack/react-router";

// Redirect /explore/skills to homepage
export const Route = createFileRoute("/explore/skills/")({
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/",
      search: {
        q: (search as { q?: string }).q,
      },
    });
  },
});
