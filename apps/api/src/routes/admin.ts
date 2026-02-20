import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { libraries, submissions, libraryStats, chunks } from "@nexus/db";
import type { AppContext, IngestionJob } from "../types";

const adminRouter = new Hono<AppContext>();

// ============================================================================
// Library Definitions for Seeding
// ============================================================================

interface LibrarySeed {
  id: string;
  name: string;
  description: string;
  sourceType: "github" | "website" | "npm";
  sourceUrl: string;
  repositoryUrl?: string;
  homepageUrl?: string;
  iconUrl?: string;
  categories: string[];
  isFeatured?: boolean;
}

const SEED_LIBRARIES: LibrarySeed[] = [
  // Frontend Frameworks
  {
    id: "react",
    name: "React",
    description: "A JavaScript library for building user interfaces with a component-based architecture.",
    sourceType: "github",
    sourceUrl: "https://github.com/reactjs/react.dev",
    repositoryUrl: "https://github.com/facebook/react",
    homepageUrl: "https://react.dev",
    iconUrl: "https://react.dev/favicon.ico",
    categories: ["frontend", "fullstack"],
    isFeatured: true,
  },
  {
    id: "nextjs",
    name: "Next.js",
    description: "The React framework for production with hybrid static & server rendering, TypeScript support, and more.",
    sourceType: "github",
    sourceUrl: "https://github.com/vercel/next.js",
    repositoryUrl: "https://github.com/vercel/next.js",
    homepageUrl: "https://nextjs.org",
    iconUrl: "https://nextjs.org/favicon.ico",
    categories: ["frontend", "fullstack", "backend"],
    isFeatured: true,
  },
  {
    id: "vue",
    name: "Vue.js",
    description: "The progressive JavaScript framework for building web interfaces.",
    sourceType: "github",
    sourceUrl: "https://github.com/vuejs/docs",
    repositoryUrl: "https://github.com/vuejs/vue",
    homepageUrl: "https://vuejs.org",
    iconUrl: "https://vuejs.org/logo.svg",
    categories: ["frontend"],
    isFeatured: true,
  },
  {
    id: "svelte",
    name: "Svelte",
    description: "Cybernetically enhanced web apps with a compile-time framework approach.",
    sourceType: "github",
    sourceUrl: "https://github.com/sveltejs/svelte",
    repositoryUrl: "https://github.com/sveltejs/svelte",
    homepageUrl: "https://svelte.dev",
    iconUrl: "https://svelte.dev/favicon.png",
    categories: ["frontend"],
  },
  {
    id: "solid",
    name: "SolidJS",
    description: "Simple and performant reactivity for building user interfaces.",
    sourceType: "github",
    sourceUrl: "https://github.com/solidjs/solid-docs-next",
    repositoryUrl: "https://github.com/solidjs/solid",
    homepageUrl: "https://solidjs.com",
    iconUrl: "https://solidjs.com/favicon.ico",
    categories: ["frontend"],
  },

  // Backend Frameworks
  {
    id: "hono",
    name: "Hono",
    description: "Ultrafast web framework for the Edges. Works on Cloudflare Workers, Deno, Bun, and more.",
    sourceType: "github",
    sourceUrl: "https://github.com/honojs/hono",
    repositoryUrl: "https://github.com/honojs/hono",
    homepageUrl: "https://hono.dev",
    iconUrl: "https://hono.dev/images/logo.png",
    categories: ["backend", "cloud"],
    isFeatured: true,
  },
  {
    id: "express",
    name: "Express",
    description: "Fast, unopinionated, minimalist web framework for Node.js.",
    sourceType: "github",
    sourceUrl: "https://github.com/expressjs/expressjs.com",
    repositoryUrl: "https://github.com/expressjs/express",
    homepageUrl: "https://expressjs.com",
    iconUrl: "https://expressjs.com/images/favicon.png",
    categories: ["backend"],
  },
  {
    id: "fastify",
    name: "Fastify",
    description: "Fast and low overhead web framework for Node.js with TypeScript support.",
    sourceType: "github",
    sourceUrl: "https://github.com/fastify/fastify",
    repositoryUrl: "https://github.com/fastify/fastify",
    homepageUrl: "https://fastify.io",
    iconUrl: "https://fastify.io/img/favicon.ico",
    categories: ["backend"],
  },

  // Database & ORM
  {
    id: "drizzle",
    name: "Drizzle ORM",
    description: "TypeScript ORM for SQL databases with zero dependencies and maximum type safety.",
    sourceType: "github",
    sourceUrl: "https://github.com/drizzle-team/drizzle-orm",
    repositoryUrl: "https://github.com/drizzle-team/drizzle-orm",
    homepageUrl: "https://orm.drizzle.team",
    iconUrl: "https://orm.drizzle.team/favicon.ico",
    categories: ["database", "backend"],
    isFeatured: true,
  },
  {
    id: "prisma",
    name: "Prisma",
    description: "Next-generation Node.js and TypeScript ORM with auto-generated query builder.",
    sourceType: "github",
    sourceUrl: "https://github.com/prisma/docs",
    repositoryUrl: "https://github.com/prisma/prisma",
    homepageUrl: "https://prisma.io",
    iconUrl: "https://prisma.io/favicon.ico",
    categories: ["database", "backend"],
  },

  // Cloud & Infrastructure
  {
    id: "cloudflare-workers",
    name: "Cloudflare Workers",
    description: "Build serverless applications on Cloudflare's edge network with JavaScript/TypeScript.",
    sourceType: "github",
    sourceUrl: "https://github.com/cloudflare/cloudflare-docs",
    repositoryUrl: "https://github.com/cloudflare/workers-sdk",
    homepageUrl: "https://workers.cloudflare.com",
    iconUrl: "https://www.cloudflare.com/favicon.ico",
    categories: ["cloud", "backend"],
    isFeatured: true,
  },
  {
    id: "cloudflare-d1",
    name: "Cloudflare D1",
    description: "Cloudflare's native serverless SQL database built on SQLite.",
    sourceType: "github",
    sourceUrl: "https://github.com/cloudflare/cloudflare-docs",
    repositoryUrl: "https://github.com/cloudflare/workers-sdk",
    homepageUrl: "https://developers.cloudflare.com/d1",
    iconUrl: "https://www.cloudflare.com/favicon.ico",
    categories: ["cloud", "database"],
  },

  // State Management
  {
    id: "tanstack-query",
    name: "TanStack Query",
    description: "Powerful data synchronization for React, Vue, Solid, and Svelte applications.",
    sourceType: "github",
    sourceUrl: "https://github.com/TanStack/query",
    repositoryUrl: "https://github.com/TanStack/query",
    homepageUrl: "https://tanstack.com/query",
    iconUrl: "https://tanstack.com/favicon.ico",
    categories: ["frontend", "utilities"],
    isFeatured: true,
  },
  {
    id: "tanstack-router",
    name: "TanStack Router",
    description: "Type-safe router with built-in caching for React applications.",
    sourceType: "github",
    sourceUrl: "https://github.com/TanStack/router",
    repositoryUrl: "https://github.com/TanStack/router",
    homepageUrl: "https://tanstack.com/router",
    iconUrl: "https://tanstack.com/favicon.ico",
    categories: ["frontend"],
  },
  {
    id: "zustand",
    name: "Zustand",
    description: "A small, fast, and scalable state management solution for React.",
    sourceType: "github",
    sourceUrl: "https://github.com/pmndrs/zustand",
    repositoryUrl: "https://github.com/pmndrs/zustand",
    homepageUrl: "https://zustand-demo.pmnd.rs",
    iconUrl: "https://zustand-demo.pmnd.rs/favicon.ico",
    categories: ["frontend", "utilities"],
  },

  // Testing
  {
    id: "vitest",
    name: "Vitest",
    description: "A blazing fast unit test framework powered by Vite.",
    sourceType: "github",
    sourceUrl: "https://github.com/vitest-dev/vitest",
    repositoryUrl: "https://github.com/vitest-dev/vitest",
    homepageUrl: "https://vitest.dev",
    iconUrl: "https://vitest.dev/favicon.ico",
    categories: ["testing", "utilities"],
  },
  {
    id: "playwright",
    name: "Playwright",
    description: "End-to-end testing framework for modern web apps.",
    sourceType: "github",
    sourceUrl: "https://github.com/microsoft/playwright",
    repositoryUrl: "https://github.com/microsoft/playwright",
    homepageUrl: "https://playwright.dev",
    iconUrl: "https://playwright.dev/img/playwright-logo.svg",
    categories: ["testing"],
  },

  // Utilities
  {
    id: "zod",
    name: "Zod",
    description: "TypeScript-first schema validation with static type inference.",
    sourceType: "github",
    sourceUrl: "https://github.com/colinhacks/zod",
    repositoryUrl: "https://github.com/colinhacks/zod",
    homepageUrl: "https://zod.dev",
    iconUrl: "https://zod.dev/favicon.ico",
    categories: ["utilities", "backend"],
  },
  {
    id: "tailwindcss",
    name: "Tailwind CSS",
    description: "A utility-first CSS framework for rapid UI development.",
    sourceType: "github",
    sourceUrl: "https://github.com/tailwindlabs/tailwindcss.com",
    repositoryUrl: "https://github.com/tailwindlabs/tailwindcss",
    homepageUrl: "https://tailwindcss.com",
    iconUrl: "https://tailwindcss.com/favicons/favicon.ico",
    categories: ["frontend", "utilities"],
    isFeatured: true,
  },
  {
    id: "typescript",
    name: "TypeScript",
    description: "JavaScript with syntax for types. A strongly typed programming language that builds on JavaScript.",
    sourceType: "github",
    sourceUrl: "https://github.com/microsoft/TypeScript-Website",
    repositoryUrl: "https://github.com/microsoft/TypeScript",
    homepageUrl: "https://typescriptlang.org",
    iconUrl: "https://www.typescriptlang.org/favicon.ico",
    categories: ["utilities"],
    isFeatured: true,
  },

  // AI
  {
    id: "vercel-ai-sdk",
    name: "Vercel AI SDK",
    description: "Build AI-powered applications with React, Svelte, Vue, and Node.js.",
    sourceType: "github",
    sourceUrl: "https://github.com/vercel/ai",
    repositoryUrl: "https://github.com/vercel/ai",
    homepageUrl: "https://sdk.vercel.ai",
    iconUrl: "https://sdk.vercel.ai/favicon.ico",
    categories: ["ai", "fullstack"],
    isFeatured: true,
  },
  {
    id: "langchain",
    name: "LangChain.js",
    description: "Framework for developing applications powered by language models in JavaScript/TypeScript.",
    sourceType: "github",
    sourceUrl: "https://github.com/langchain-ai/langchainjs",
    repositoryUrl: "https://github.com/langchain-ai/langchainjs",
    homepageUrl: "https://js.langchain.com",
    iconUrl: "https://js.langchain.com/img/favicon.ico",
    categories: ["ai", "backend"],
  },
];

// ============================================================================
// POST /api/admin/seed - Seed initial libraries
// ============================================================================

adminRouter.post("/seed", async (c) => {
  const db = c.get("db");
  const now = new Date().toISOString();

  const results = {
    created: 0,
    skipped: 0,
    queued: 0,
    errors: [] as string[],
  };

  for (const lib of SEED_LIBRARIES) {
    try {
      // Check if library already exists
      const [existing] = await db
        .select({ id: libraries.id })
        .from(libraries)
        .where(eq(libraries.id, lib.id))
        .limit(1);

      if (existing) {
        results.skipped++;
        continue;
      }

      // Insert library with pending status
      await db.insert(libraries).values({
        id: lib.id,
        name: lib.name,
        description: lib.description,
        sourceType: lib.sourceType,
        sourceUrl: lib.sourceUrl,
        repositoryUrl: lib.repositoryUrl || null,
        homepageUrl: lib.homepageUrl || null,
        iconUrl: lib.iconUrl || null,
        categories: lib.categories,
        isFeatured: lib.isFeatured || false,
        indexStatus: "pending",
        createdAt: now,
        updatedAt: now,
      });

      // Initialize stats
      await db.insert(libraryStats).values({
        libraryId: lib.id,
        totalQueries: 0,
        totalChunkHits: 0,
      });

      results.created++;
    } catch (error) {
      results.errors.push(`${lib.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return c.json({
    message: "Seed completed",
    ...results,
    total: SEED_LIBRARIES.length,
  });
});

// ============================================================================
// POST /api/admin/index/:id - Trigger indexing for a library
// ============================================================================

adminRouter.post("/index/:id", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");
  const now = new Date().toISOString();

  // Get the library
  const [library] = await db
    .select()
    .from(libraries)
    .where(eq(libraries.id, id))
    .limit(1);

  if (!library) {
    return c.json({ error: "Library not found" }, 404);
  }

  if (library.indexStatus === "indexing") {
    return c.json({ error: "Library is already being indexed" }, 400);
  }

  // Update status to indexing
  await db
    .update(libraries)
    .set({ indexStatus: "indexing", updatedAt: now })
    .where(eq(libraries.id, id));

  // Queue the ingestion job
  const job: IngestionJob = {
    libraryId: library.id,
    sourceUrl: library.sourceUrl,
    sourceType: library.sourceType,
  };

  await c.env.INGESTION_QUEUE.send(job);

  return c.json({
    message: "Indexing started",
    libraryId: id,
    sourceUrl: library.sourceUrl,
  });
});

// ============================================================================
// POST /api/admin/index-all - Trigger indexing for all pending libraries
// ============================================================================

adminRouter.post("/index-all", async (c) => {
  const db = c.get("db");
  const now = new Date().toISOString();

  // Get all pending libraries
  const pendingLibraries = await db
    .select()
    .from(libraries)
    .where(eq(libraries.indexStatus, "pending"));

  const results = {
    queued: 0,
    errors: [] as string[],
  };

  for (const library of pendingLibraries) {
    try {
      // Update status to indexing
      await db
        .update(libraries)
        .set({ indexStatus: "indexing", updatedAt: now })
        .where(eq(libraries.id, library.id));

      // Queue the ingestion job
      const job: IngestionJob = {
        libraryId: library.id,
        sourceUrl: library.sourceUrl,
        sourceType: library.sourceType,
      };

      await c.env.INGESTION_QUEUE.send(job);
      results.queued++;
    } catch (error) {
      results.errors.push(
        `${library.id}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  return c.json({
    message: "Indexing jobs queued",
    ...results,
    total: pendingLibraries.length,
  });
});

// ============================================================================
// POST /api/admin/submissions/:id/approve - Approve a submission
// ============================================================================

adminRouter.post("/submissions/:id/approve", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");
  const now = new Date().toISOString();

  // Get the submission
  const [submission] = await db
    .select()
    .from(submissions)
    .where(eq(submissions.id, id))
    .limit(1);

  if (!submission) {
    return c.json({ error: "Submission not found" }, 404);
  }

  if (submission.status !== "pending") {
    return c.json({ error: `Submission already ${submission.status}` }, 400);
  }

  // Generate a library ID from the name
  const libraryId = submission.libraryName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Check if library already exists
  const [existingLibrary] = await db
    .select({ id: libraries.id })
    .from(libraries)
    .where(eq(libraries.id, libraryId))
    .limit(1);

  if (existingLibrary) {
    // Link to existing library
    await db
      .update(submissions)
      .set({
        status: "indexed",
        libraryId: existingLibrary.id,
        processedAt: now,
      })
      .where(eq(submissions.id, id));

    return c.json({
      message: "Submission linked to existing library",
      submissionId: id,
      libraryId: existingLibrary.id,
    });
  }

  // Create new library
  await db.insert(libraries).values({
    id: libraryId,
    name: submission.libraryName,
    description: submission.description || null,
    sourceType: "github", // Assume GitHub for now
    sourceUrl: submission.sourceUrl,
    categories: [],
    indexStatus: "pending",
    createdAt: now,
    updatedAt: now,
  });

  // Initialize stats
  await db.insert(libraryStats).values({
    libraryId,
    totalQueries: 0,
    totalChunkHits: 0,
  });

  // Update submission
  await db
    .update(submissions)
    .set({
      status: "approved",
      libraryId,
      processedAt: now,
    })
    .where(eq(submissions.id, id));

  // Queue indexing
  const job: IngestionJob = {
    libraryId,
    sourceUrl: submission.sourceUrl,
    sourceType: "github",
  };

  await c.env.INGESTION_QUEUE.send(job);

  // Update library status
  await db
    .update(libraries)
    .set({ indexStatus: "indexing", updatedAt: now })
    .where(eq(libraries.id, libraryId));

  return c.json({
    message: "Submission approved and indexing started",
    submissionId: id,
    libraryId,
  });
});

// ============================================================================
// POST /api/admin/submissions/:id/reject - Reject a submission
// ============================================================================

adminRouter.post("/submissions/:id/reject", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");
  const now = new Date().toISOString();

  const [submission] = await db
    .select()
    .from(submissions)
    .where(eq(submissions.id, id))
    .limit(1);

  if (!submission) {
    return c.json({ error: "Submission not found" }, 404);
  }

  if (submission.status !== "pending") {
    return c.json({ error: `Submission already ${submission.status}` }, 400);
  }

  await db
    .update(submissions)
    .set({
      status: "rejected",
      processedAt: now,
    })
    .where(eq(submissions.id, id));

  return c.json({
    message: "Submission rejected",
    submissionId: id,
  });
});

// ============================================================================
// DELETE /api/admin/libraries/:id - Delete a library and all its data
// ============================================================================

adminRouter.delete("/libraries/:id", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");

  // Get the library
  const [library] = await db
    .select()
    .from(libraries)
    .where(eq(libraries.id, id))
    .limit(1);

  if (!library) {
    return c.json({ error: "Library not found" }, 404);
  }

  // Get all chunk IDs for this library
  const libraryChunks = await db
    .select({ id: chunks.id, r2Key: chunks.r2Key })
    .from(chunks)
    .where(eq(chunks.libraryId, id));

  // Delete from Vectorize
  if (libraryChunks.length > 0) {
    const chunkIds = libraryChunks.map((c) => c.id);
    // Vectorize delete in batches of 1000
    for (let i = 0; i < chunkIds.length; i += 1000) {
      const batch = chunkIds.slice(i, i + 1000);
      await c.env.VECTORIZE.deleteByIds(batch);
    }

    // Delete from R2
    for (const chunk of libraryChunks) {
      try {
        await c.env.DOCS_BUCKET.delete(chunk.r2Key);
      } catch (error) {
        console.warn(`Failed to delete R2 object ${chunk.r2Key}:`, error);
      }
    }
  }

  // Delete from D1 (cascade will handle chunks)
  await db.delete(libraryStats).where(eq(libraryStats.libraryId, id));
  await db.delete(libraries).where(eq(libraries.id, id));

  return c.json({
    message: "Library deleted",
    libraryId: id,
    chunksDeleted: libraryChunks.length,
  });
});

// ============================================================================
// POST /api/admin/reindex/:id - Re-index a library (delete chunks, re-fetch)
// ============================================================================

adminRouter.post("/reindex/:id", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");
  const now = new Date().toISOString();

  // Get the library
  const [library] = await db
    .select()
    .from(libraries)
    .where(eq(libraries.id, id))
    .limit(1);

  if (!library) {
    return c.json({ error: "Library not found" }, 404);
  }

  // Get all chunk IDs for this library
  const libraryChunks = await db
    .select({ id: chunks.id, r2Key: chunks.r2Key })
    .from(chunks)
    .where(eq(chunks.libraryId, id));

  // Delete from Vectorize
  if (libraryChunks.length > 0) {
    const chunkIds = libraryChunks.map((c) => c.id);
    for (let i = 0; i < chunkIds.length; i += 1000) {
      const batch = chunkIds.slice(i, i + 1000);
      await c.env.VECTORIZE.deleteByIds(batch);
    }

    // Delete from R2
    for (const chunk of libraryChunks) {
      try {
        await c.env.DOCS_BUCKET.delete(chunk.r2Key);
      } catch (error) {
        console.warn(`Failed to delete R2 object ${chunk.r2Key}:`, error);
      }
    }
  }

  // Delete chunks from D1
  await db.delete(chunks).where(eq(chunks.libraryId, id));

  // Reset library stats
  await db
    .update(libraries)
    .set({
      totalChunks: 0,
      totalTokens: 0,
      indexStatus: "indexing",
      indexError: null,
      updatedAt: now,
    })
    .where(eq(libraries.id, id));

  // Queue new indexing job
  const job: IngestionJob = {
    libraryId: library.id,
    sourceUrl: library.sourceUrl,
    sourceType: library.sourceType,
  };

  await c.env.INGESTION_QUEUE.send(job);

  return c.json({
    message: "Re-indexing started",
    libraryId: id,
    previousChunks: libraryChunks.length,
  });
});

export { adminRouter };
