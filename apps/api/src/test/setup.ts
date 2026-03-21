/**
 * Test setup and utilities for API tests
 */
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@nexus/db";

// Mock D1 database for testing
export function createMockD1(): D1Database {
  return {
    prepare: (_query: string) => ({
      bind: (..._params: unknown[]) => ({
        all: async () => ({ results: [], success: true }),
        first: async () => null,
        run: async () => ({ success: true, meta: {} }),
      }),
      all: async () => ({ results: [], success: true }),
      first: async () => null,
      run: async () => ({ success: true, meta: {} }),
    }),
    batch: async (_statements: unknown[]) => [],
    exec: async (_query: string) => ({ count: 0, duration: 0 }),
    dump: async () => new ArrayBuffer(0),
  } as unknown as D1Database;
}

// Create a test database with drizzle
export function createTestDb(d1: D1Database = createMockD1()) {
  return drizzle(d1, { schema });
}

// Mock user for authenticated tests
export const mockUser = {
  id: "test-user-id",
  name: "Test User",
  email: "test@example.com",
  emailVerified: true,
  image: null,
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock admin user
export const mockAdmin = {
  ...mockUser,
  id: "admin-user-id",
  email: "admin@example.com",
  role: "admin" as const,
};

// Mock session
export const mockSession = {
  id: "test-session-id",
  userId: mockUser.id,
  token: "test-token",
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock environment bindings
export function createMockEnv(): Record<string, any> {
  return {
    DB: createMockD1(),
    KV: {
      get: async () => null,
      put: async () => {},
      delete: async () => {},
    },
    RATE_LIMITER: {
      limit: async () => ({ success: true }),
    },
    VECTORIZE: {
      query: async () => ({ matches: [] }),
      insert: async () => {},
    },
    AI: {
      run: async () => ({ response: "test" }),
    },
    BETTER_AUTH_SECRET: "test-secret",
    BETTER_AUTH_URL: "http://localhost:8787",
  };
}

// Mock prompt data for testing
export const mockPrompts = [
  {
    id: "prompt-1",
    userId: null,
    name: "TypeScript Expert",
    slug: "typescript-expert",
    description: "Expert TypeScript developer assistant",
    systemPrompt: "You are an expert TypeScript developer...",
    parentPromptId: null,
    skills: ["typescript", "node"],
    libraries: ["hono", "drizzle"],
    mcpServers: ["filesystem"],
    preferences: {},
    category: "development",
    tags: ["typescript", "backend"],
    isPublic: true,
    isStarterPack: true,
    isFeatured: true,
    isActive: true,
    installCount: 100,
    usageCount: 500,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prompt-2",
    userId: mockUser.id,
    name: "My Custom Prompt",
    slug: "my-custom-prompt",
    description: "My personal prompt",
    systemPrompt: "Custom instructions...",
    parentPromptId: "prompt-1",
    skills: [],
    libraries: [],
    mcpServers: [],
    preferences: { verbosity: "concise" },
    category: "general",
    tags: [],
    isPublic: false,
    isStarterPack: false,
    isFeatured: false,
    isActive: true,
    installCount: 0,
    usageCount: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
