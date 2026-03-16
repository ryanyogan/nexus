import { eq, and } from "drizzle-orm";
import { apiTokens, type Database, type ApiTokenScope } from "@nexus/db";

export interface TokenValidationResult {
  valid: boolean;
  userId?: string | null;
  tokenId?: string;
  scopes?: ApiTokenScope[];
  error?: string;
}

/**
 * Hash a token using SHA-256
 */
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Generate a new API token
 */
export async function generateApiToken(): Promise<{ token: string; hash: string; prefix: string }> {
  const tokenBytes = new Uint8Array(32);
  crypto.getRandomValues(tokenBytes);
  const token = "nxs_" + Array.from(tokenBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  
  const hash = await hashToken(token);
  const prefix = token.slice(0, 12); // nxs_ + 8 chars
  
  return { token, hash, prefix };
}

/**
 * Validate a bearer token from the Authorization header
 */
export async function validateToken(
  authHeader: string | undefined,
  db: Database
): Promise<TokenValidationResult> {
  if (!authHeader) {
    return { valid: false, error: "No authorization header" };
  }

  // Extract bearer token
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return { valid: false, error: "Invalid authorization header format" };
  }

  const token = match[1];
  
  // Check if it's a Nexus token
  if (!token.startsWith("nxs_")) {
    return { valid: false, error: "Invalid token format" };
  }

  // Hash the token and look it up
  const tokenHash = await hashToken(token);
  
  const [apiToken] = await db
    .select()
    .from(apiTokens)
    .where(
      and(
        eq(apiTokens.tokenHash, tokenHash),
        eq(apiTokens.isActive, true)
      )
    )
    .limit(1);

  if (!apiToken) {
    return { valid: false, error: "Invalid or expired token" };
  }

  // Check expiry
  if (apiToken.expiresAt && new Date(apiToken.expiresAt) < new Date()) {
    return { valid: false, error: "Token has expired" };
  }

  // Update last used timestamp (non-blocking)
  db.update(apiTokens)
    .set({ lastUsedAt: new Date().toISOString() })
    .where(eq(apiTokens.id, apiToken.id))
    .catch(console.error);

  return {
    valid: true,
    userId: apiToken.userId,
    tokenId: apiToken.id,
    scopes: apiToken.scopes || [],
  };
}

/**
 * Check if a token has the required scope
 */
export function hasScope(scopes: ApiTokenScope[], required: ApiTokenScope): boolean {
  return scopes.includes(required);
}
