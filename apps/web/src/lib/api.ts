// ============================================================================
// API Configuration
// ============================================================================

import { getAuthToken } from "@nexus/auth/client";

// Always use production API - local dev connects to deployed API
// To use local API, set VITE_API_URL=http://localhost:8787
export const API_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL) ||
  "https://api.nexus.yogan.dev";

// Admin API key - stored in localStorage after first successful admin access
// In production, this would be set by an admin during initial setup
const ADMIN_KEY_STORAGE = "nexus-admin-key";

export function getAdminKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_KEY_STORAGE);
}

export function setAdminKey(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_KEY_STORAGE, key);
}

// Helper for admin API calls - uses bearer token for auth
export async function adminFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const adminKey = getAdminKey();
  const bearerToken = getAuthToken();

  return fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      // Prefer bearer token, fall back to admin key
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
      ...(adminKey && !bearerToken ? { "X-Admin-Key": adminKey } : {}),
      ...options.headers,
    },
  });
}

// Re-export categories from shared package
export {
  LIBRARY_CATEGORIES,
  CATEGORY_IDS,
  type CategoryId,
  SECRET_PROVIDERS,
  type SecretProvider,
} from "@nexus/db";

// ============================================================================
// Authenticated API calls (with credentials for cross-domain cookies)
// ============================================================================

export async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}
