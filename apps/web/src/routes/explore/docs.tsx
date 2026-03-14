import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

// Layout route for /explore/docs/*
// Only redirects if accessing /explore/docs directly (no child route)
export const Route = createFileRoute("/explore/docs")({
  component: () => <Outlet />,
  beforeLoad: ({ location }) => {
    // Only redirect if we're at exactly /explore/docs (no child path)
    if (location.pathname === "/explore/docs" || location.pathname === "/explore/docs/") {
      throw redirect({ to: "/" });
    }
  },
});
