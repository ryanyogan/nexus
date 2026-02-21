import { createAuthClient } from "better-auth/react";

// Auth client for React/TanStack Start
// Now same-origin since auth is handled by TanStack Start, not the API
export const authClient = createAuthClient({
  // No baseURL needed - defaults to same origin
});

export const { signIn, signOut, useSession } = authClient;
