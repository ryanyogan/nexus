// ============================================================================
// API Configuration
// ============================================================================

export const API_URL = typeof window !== "undefined"
  ? (window.location.hostname === "localhost"
      ? "http://localhost:8787"
      : "https://api.nexus.yogan.dev")
  : "https://api.nexus.yogan.dev";

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

// Helper for admin API calls
export async function adminFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const adminKey = getAdminKey();
  
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(adminKey ? { "X-Admin-Key": adminKey } : {}),
      ...options.headers,
    },
  });
}

// Re-export categories from shared package
export { LIBRARY_CATEGORIES, CATEGORY_IDS, type CategoryId } from "@nexus/db";
