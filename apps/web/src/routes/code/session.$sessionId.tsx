import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/code/session/$sessionId")({
  // Component is lazy loaded from session.$sessionId.lazy.tsx
});
