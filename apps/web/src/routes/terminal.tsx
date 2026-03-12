import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/terminal")({
  beforeLoad: () => {
    // Redirect to the new code editor
    throw redirect({ to: "/code" });
  },
  component: () => null,
});
