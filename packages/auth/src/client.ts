import { createAuthClient } from "better-auth/react";

// Auth client for React/TanStack Start
export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
});

export const { signIn, signOut, useSession } = authClient;
