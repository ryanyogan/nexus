import { Nexus } from "@nexus/sdk";
import { getToken, getApiUrl, isAuthenticated } from "./config.js";

/**
 * Create an authenticated Nexus API client
 */
export function createClient(): Nexus {
  const token = getToken();
  const baseUrl = getApiUrl();

  return new Nexus({
    baseUrl,
    apiKey: token || "",
  });
}

/**
 * Get the current client (creates a new one each time for fresh auth)
 */
export function getClient(): Nexus {
  return createClient();
}

/**
 * Check if we have a valid API connection
 */
export async function checkConnection(): Promise<{
  connected: boolean;
  authenticated: boolean;
  error?: string;
}> {
  try {
    const client = createClient();

    // Try to list libraries (doesn't require auth)
    await client.listLibraries({ limit: 1 });

    return {
      connected: true,
      authenticated: isAuthenticated(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      connected: false,
      authenticated: false,
      error: message,
    };
  }
}

// Re-export types from SDK
export type {
  Library,
  LibrarySearchResult,
  DocChunk,
  QueryDocsResult,
  Memory,
  McpServer,
} from "@nexus/sdk";
