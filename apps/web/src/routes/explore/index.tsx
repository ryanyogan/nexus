import { createFileRoute, redirect } from "@tanstack/react-router";

// Redirect /explore to homepage
export const Route = createFileRoute("/explore/")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});
