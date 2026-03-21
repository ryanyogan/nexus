import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { eq, and, desc } from "drizzle-orm";
import { userSecrets, SECRET_PROVIDERS } from "@nexus/db";
import { createAuth } from "@nexus/auth";
import type { AppContext, AuthUser } from "../types";

const secretsRouter = new Hono<AppContext>();

// ============================================================================
// Encryption utilities using Web Crypto API
// ============================================================================

async function getEncryptionKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("nexus-vault-salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptValue(
  value: string,
  secret: string
): Promise<{ encrypted: string; iv: string }> {
  const key = await getEncryptionKey(secret);
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(value)
  );

  return {
    encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

async function decryptValue(encrypted: string, iv: string, secret: string): Promise<string> {
  const key = await getEncryptionKey(secret);
  const decoder = new TextDecoder();

  const encryptedBytes = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0));
  const ivBytes = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes },
    key,
    encryptedBytes
  );

  return decoder.decode(decrypted);
}

// ============================================================================
// Auth middleware - require authenticated user
// ============================================================================

async function requireAuth(c: any, next: () => Promise<void>) {
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
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("user", session.user);
  c.set("session", session.session);
  await next();
}

// Apply auth middleware to all routes
secretsRouter.use("*", requireAuth);

// ============================================================================
// Schemas
// ============================================================================

const createSecretSchema = z.object({
  name: z.string().min(1).max(100),
  provider: z.enum(SECRET_PROVIDERS),
  value: z.string().min(1),
  description: z.string().max(500).optional(),
});

const updateSecretSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

// ============================================================================
// Routes
// ============================================================================

// List user's secrets (without decrypted values)
secretsRouter.get("/", async (c) => {
  const db = c.get("db");
  const user = c.get("user") as AuthUser;

  const secrets = await db
    .select({
      id: userSecrets.id,
      name: userSecrets.name,
      provider: userSecrets.provider,
      description: userSecrets.description,
      keyPrefix: userSecrets.keyPrefix,
      lastUsedAt: userSecrets.lastUsedAt,
      usageCount: userSecrets.usageCount,
      isActive: userSecrets.isActive,
      createdAt: userSecrets.createdAt,
      updatedAt: userSecrets.updatedAt,
      expiresAt: userSecrets.expiresAt,
    })
    .from(userSecrets)
    .where(eq(userSecrets.userId, user.id))
    .orderBy(desc(userSecrets.createdAt));

  return c.json({ secrets });
});

// Create a new secret
secretsRouter.post("/", zValidator("json", createSecretSchema), async (c) => {
  const db = c.get("db");
  const user = c.get("user") as AuthUser;
  const { name, provider, value, description } = c.req.valid("json");

  // Encrypt the value
  const { encrypted, iv } = await encryptValue(value, c.env.BETTER_AUTH_SECRET);

  // Extract prefix for display (first 4-8 chars depending on format)
  let keyPrefix = value.slice(0, 4) + "...";
  if (value.startsWith("sk-")) {
    keyPrefix = value.slice(0, 7) + "...";
  } else if (value.startsWith("pk_") || value.startsWith("sk_")) {
    keyPrefix = value.slice(0, 7) + "...";
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.insert(userSecrets).values({
    id,
    userId: user.id,
    name,
    provider,
    encryptedValue: encrypted,
    iv,
    description,
    keyPrefix,
    usageCount: 0,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  return c.json(
    {
      success: true,
      secret: {
        id,
        name,
        provider,
        description,
        keyPrefix,
        isActive: true,
        createdAt: now,
      },
    },
    201
  );
});

// Get a single secret (with option to decrypt)
secretsRouter.get("/:id", async (c) => {
  const db = c.get("db");
  const user = c.get("user") as AuthUser;
  const { id } = c.req.param();
  const decrypt = c.req.query("decrypt") === "true";

  const [secret] = await db
    .select()
    .from(userSecrets)
    .where(and(eq(userSecrets.id, id), eq(userSecrets.userId, user.id)));

  if (!secret) {
    return c.json({ error: "Secret not found" }, 404);
  }

  // Update usage stats if decrypting
  if (decrypt) {
    await db
      .update(userSecrets)
      .set({
        lastUsedAt: new Date().toISOString(),
        usageCount: secret.usageCount + 1,
      })
      .where(eq(userSecrets.id, id));

    const decryptedValue = await decryptValue(
      secret.encryptedValue,
      secret.iv,
      c.env.BETTER_AUTH_SECRET
    );

    return c.json({
      secret: {
        id: secret.id,
        name: secret.name,
        provider: secret.provider,
        value: decryptedValue,
        description: secret.description,
        keyPrefix: secret.keyPrefix,
        isActive: secret.isActive,
        createdAt: secret.createdAt,
      },
    });
  }

  return c.json({
    secret: {
      id: secret.id,
      name: secret.name,
      provider: secret.provider,
      description: secret.description,
      keyPrefix: secret.keyPrefix,
      lastUsedAt: secret.lastUsedAt,
      usageCount: secret.usageCount,
      isActive: secret.isActive,
      createdAt: secret.createdAt,
      updatedAt: secret.updatedAt,
    },
  });
});

// Update a secret
secretsRouter.patch("/:id", zValidator("json", updateSecretSchema), async (c) => {
  const db = c.get("db");
  const user = c.get("user") as AuthUser;
  const { id } = c.req.param();
  const updates = c.req.valid("json");

  const [existing] = await db
    .select()
    .from(userSecrets)
    .where(and(eq(userSecrets.id, id), eq(userSecrets.userId, user.id)));

  if (!existing) {
    return c.json({ error: "Secret not found" }, 404);
  }

  await db
    .update(userSecrets)
    .set({
      ...updates,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(userSecrets.id, id));

  return c.json({ success: true });
});

// Delete a secret
secretsRouter.delete("/:id", async (c) => {
  const db = c.get("db");
  const user = c.get("user") as AuthUser;
  const { id } = c.req.param();

  const [existing] = await db
    .select()
    .from(userSecrets)
    .where(and(eq(userSecrets.id, id), eq(userSecrets.userId, user.id)));

  if (!existing) {
    return c.json({ error: "Secret not found" }, 404);
  }

  await db.delete(userSecrets).where(eq(userSecrets.id, id));

  return c.json({ success: true });
});

// Rotate a secret (update value)
secretsRouter.post("/:id/rotate", async (c) => {
  const db = c.get("db");
  const user = c.get("user") as AuthUser;
  const { id } = c.req.param();

  const body = await c.req.json();
  const newValue = body.value;

  if (!newValue || typeof newValue !== "string") {
    return c.json({ error: "New value is required" }, 400);
  }

  const [existing] = await db
    .select()
    .from(userSecrets)
    .where(and(eq(userSecrets.id, id), eq(userSecrets.userId, user.id)));

  if (!existing) {
    return c.json({ error: "Secret not found" }, 404);
  }

  // Encrypt the new value
  const { encrypted, iv } = await encryptValue(newValue, c.env.BETTER_AUTH_SECRET);

  // Extract new prefix
  let keyPrefix = newValue.slice(0, 4) + "...";
  if (newValue.startsWith("sk-")) {
    keyPrefix = newValue.slice(0, 7) + "...";
  } else if (newValue.startsWith("pk_") || newValue.startsWith("sk_")) {
    keyPrefix = newValue.slice(0, 7) + "...";
  }

  await db
    .update(userSecrets)
    .set({
      encryptedValue: encrypted,
      iv,
      keyPrefix,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(userSecrets.id, id));

  return c.json({ success: true, keyPrefix });
});

export { secretsRouter };
