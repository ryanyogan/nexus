import { createAuthClient } from "better-auth/react";

// Auth client for React - connects to the API
// baseURL is set dynamically based on environment
export const authClient = createAuthClient({
  baseURL: "https://api.nexus.yogan.dev",
});

export const { signIn, signOut, useSession } = authClient;
