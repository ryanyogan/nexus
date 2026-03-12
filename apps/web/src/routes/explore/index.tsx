import { createFileRoute, redirect } from "@tanstack/react-router";

// Redirect /explore to /explore/docs
export const Route = createFileRoute("/explore/")({
  beforeLoad: () => {
    throw redirect({ to: "/explore/docs" });
  },
});
