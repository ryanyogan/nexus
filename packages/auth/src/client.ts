import { createAuthClient } from "better-auth/react";

const BEARER_TOKEN_KEY = "nexus_bearer_token";

// Safe check for browser environment
const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

// Get bearer token from localStorage
function getBearerToken(): string {
  if (!isBrowser()) return "";
  return window.localStorage.getItem(BEARER_TOKEN_KEY) || "";
}

// Auth client for React - connects to the API
export const authClient = createAuthClient({
  baseURL: "https://api.nexus.yogan.dev",
  fetchOptions: {
    credentials: "include",
    // Store bearer token on successful auth responses
    onSuccess: (ctx) => {
      const authToken = ctx.response.headers.get("set-auth-token");
      if (authToken && isBrowser()) {
        window.localStorage.setItem(BEARER_TOKEN_KEY, authToken);
      }
    },
    // Use bearer token for auth
    auth: {
      type: "Bearer",
      token: getBearerToken,
    },
  },
});

// Export helper to get bearer token for admin API calls
export function getAuthToken(): string {
  return getBearerToken();
}

// Clear token on sign out
export async function signOutAndClearToken() {
  if (isBrowser()) {
    window.localStorage.removeItem(BEARER_TOKEN_KEY);
  }
  return authClient.signOut();
}

export const { signIn, signOut, useSession } = authClient;
