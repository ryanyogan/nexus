import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { apiTokens } from "@nexus/db";
import { createAuth } from "@nexus/auth";
import type { AppContext, AuthUser } from "../types";

/**
 * CLI Authentication Flow
 *
 * 1. CLI calls POST /api/cli/auth/start to get a session code
 * 2. CLI opens browser to {WEB_URL}/auth/cli?code={code}
 * 3. User authenticates via OAuth in browser
 * 4. Browser calls POST /api/cli/auth/complete with code and user session
 * 5. CLI polls GET /api/cli/auth/poll?code={code} until auth completes
 * 6. CLI receives API token
 */

const cliAuthRouter = new Hono<AppContext>();

// In-memory store for pending CLI auth sessions
// In production, this should use KV or D1
interface PendingAuth {
  code: string;
  createdAt: number;
  expiresAt: number;
  status: "pending" | "completed" | "expired";
  token?: string;
  tokenPrefix?: string;
  userEmail?: string;
}

// Use a simple Map for now - in production, use KV
const pendingAuths = new Map<string, PendingAuth>();

// Clean up expired sessions periodically
function cleanupExpired() {
  const now = Date.now();
  for (const [code, auth] of pendingAuths.entries()) {
    if (auth.expiresAt < now) {
      pendingAuths.delete(code);
    }
  }
}

// Generate a short, user-friendly code
function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I, O, 0, 1 to avoid confusion
  let code = "";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code.slice(0, 4) + "-" + code.slice(4);
}

// ============================================================================
// Start CLI Auth Session
// ============================================================================

cliAuthRouter.post("/start", async (c) => {
  cleanupExpired();

  const code = generateCode();
  const now = Date.now();
  const expiresAt = now + 10 * 60 * 1000; // 10 minutes

  pendingAuths.set(code, {
    code,
    createdAt: now,
    expiresAt,
    status: "pending",
  });

  // Build the auth URL
  const webUrl = (c.env as unknown as { WEB_URL?: string }).WEB_URL || "https://nexus.yogan.dev";
  const authUrl = `${webUrl}/auth/cli?code=${code}`;

  return c.json({
    code,
    authUrl,
    expiresIn: 600, // seconds
    pollInterval: 2, // seconds
  });
});

// ============================================================================
// Poll for Auth Completion (called by CLI)
// ============================================================================

cliAuthRouter.get("/poll", async (c) => {
  const code = c.req.query("code");

  if (!code) {
    return c.json({ error: "Code is required" }, 400);
  }

  const auth = pendingAuths.get(code);

  if (!auth) {
    return c.json({ error: "Invalid or expired code" }, 404);
  }

  if (Date.now() > auth.expiresAt) {
    pendingAuths.delete(code);
    return c.json({ error: "Code expired" }, 410);
  }

  if (auth.status === "pending") {
    return c.json({ status: "pending" });
  }

  if (auth.status === "completed" && auth.token) {
    // Clean up after successful retrieval
    pendingAuths.delete(code);

    return c.json({
      status: "completed",
      token: auth.token,
      tokenPrefix: auth.tokenPrefix,
      userEmail: auth.userEmail,
    });
  }

  return c.json({ status: "pending" });
});

// ============================================================================
// Complete Auth (called by web app after OAuth)
// ============================================================================

cliAuthRouter.post("/complete", async (c) => {
  const db = c.get("db");

  // Get user from session (web app is authenticated)
  const auth = createAuth({
    DB: c.env.DB,
    GOOGLE_CLIENT_ID: c.env.GOOGLE_CLIENT_ID || "",
    GOOGLE_CLIENT_SECRET: c.env.GOOGLE_CLIENT_SECRET || "",
    GITHUB_CLIENT_ID: c.env.GITHUB_CLIENT_ID || "",
    GITHUB_CLIENT_SECRET: c.env.GITHUB_CLIENT_SECRET || "",
    BETTER_AUTH_SECRET: c.env.BETTER_AUTH_SECRET || "",
    BETTER_AUTH_URL: c.env.BETTER_AUTH_URL || "",
  });

  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session?.user) {
    return c.json({ error: "Not authenticated" }, 401);
  }

  const user = session.user as AuthUser;
  const body = await c.req.json();
  const { code } = body;

  if (!code) {
    return c.json({ error: "Code is required" }, 400);
  }

  const pending = pendingAuths.get(code);

  if (!pending) {
    return c.json({ error: "Invalid or expired code" }, 404);
  }

  if (Date.now() > pending.expiresAt) {
    pendingAuths.delete(code);
    return c.json({ error: "Code expired" }, 410);
  }

  if (pending.status !== "pending") {
    return c.json({ error: "Code already used" }, 409);
  }

  // Generate an API token for the CLI
  const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
  const token = `nxs_${Array.from(tokenBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`;
  const tokenPrefix = token.slice(0, 12);

  // Hash the token for storage
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(token));
  const tokenHash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  // Store the token in the database
  await db.insert(apiTokens).values({
    id,
    userId: user.id,
    name: "Nexus CLI",
    tokenHash,
    tokenPrefix,
    scopes: ["read:docs", "write:memories", "read:servers"],
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  // Update pending auth with the token
  pending.status = "completed";
  pending.token = token;
  pending.tokenPrefix = tokenPrefix;
  pending.userEmail = user.email;

  return c.json({
    success: true,
    message: "CLI authenticated successfully",
  });
});

// ============================================================================
// Cancel Auth (optional - user can cancel from browser)
// ============================================================================

cliAuthRouter.post("/cancel", async (c) => {
  const body = await c.req.json();
  const { code } = body;

  if (!code) {
    return c.json({ error: "Code is required" }, 400);
  }

  const pending = pendingAuths.get(code);
  if (pending) {
    pendingAuths.delete(code);
  }

  return c.json({ success: true });
});

// ============================================================================
// Verify Token (CLI can verify its stored token is still valid)
// ============================================================================

cliAuthRouter.get("/verify", async (c) => {
  const db = c.get("db");
  const authHeader = c.req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "No token provided" }, 401);
  }

  const token = authHeader.slice(7);

  // Hash the token
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(token));
  const tokenHash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Look up the token
  const [apiToken] = await db
    .select()
    .from(apiTokens)
    .where(and(eq(apiTokens.tokenHash, tokenHash), eq(apiTokens.isActive, true)))
    .limit(1);

  if (!apiToken) {
    return c.json({ valid: false, error: "Invalid or revoked token" }, 401);
  }

  // Check expiration
  if (apiToken.expiresAt && new Date(apiToken.expiresAt) < new Date()) {
    return c.json({ valid: false, error: "Token expired" }, 401);
  }

  return c.json({
    valid: true,
    tokenPrefix: apiToken.tokenPrefix,
    scopes: apiToken.scopes,
    createdAt: apiToken.createdAt,
  });
});

export { cliAuthRouter };
