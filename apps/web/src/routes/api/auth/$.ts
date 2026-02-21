import { createFileRoute } from "@tanstack/react-router";
import { getAuth } from "../../../lib/auth.server";

// Catch-all route for Better Auth
// Handles all /api/auth/* requests (sign-in, sign-out, callback, get-session, etc.)
export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await getAuth();
        return auth.handler(request);
      },
      POST: async ({ request }) => {
        const auth = await getAuth();
        return auth.handler(request);
      },
    },
  },
});
