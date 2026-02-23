import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { libraries, submissions, libraryStats, chunks, mcpServers, mcpServerStats, serverSubmissions, type NewMcpServer } from "@nexus/db";
import type { AppContext, IngestionJob } from "../types";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const adminRouter = new Hono<AppContext>();

// ============================================================================
// Library Definitions for Seeding
// ============================================================================

interface LibrarySeed {
  id: string;
  name: string;
  description: string;
  sourceType: "github" | "website" | "npm" | "context7";
  sourceUrl: string;
  context7Id?: string; // Context7 library ID (e.g., "/vercel/next.js")
  repositoryUrl?: string;
  homepageUrl?: string;
  iconUrl?: string;
  categories: string[];
  isFeatured?: boolean;
}

const SEED_LIBRARIES: LibrarySeed[] = [
  // ============================================================================
  // Frontend Frameworks
  // ============================================================================
  {
    id: "react",
    name: "React",
    description: "A JavaScript library for building user interfaces with a component-based architecture.",
    sourceType: "context7",
    sourceUrl: "https://react.dev",
    context7Id: "/websites/react_dev",
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
    sourceType: "context7",
    sourceUrl: "https://nextjs.org",
    context7Id: "/vercel/next.js",
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
    sourceType: "context7",
    sourceUrl: "https://vuejs.org",
    context7Id: "/websites/vuejs",
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
    sourceType: "context7",
    sourceUrl: "https://svelte.dev",
    context7Id: "/websites/svelte_dev_svelte",
    repositoryUrl: "https://github.com/sveltejs/svelte",
    homepageUrl: "https://svelte.dev",
    iconUrl: "https://svelte.dev/favicon.png",
    categories: ["frontend"],
  },
  {
    id: "solid",
    name: "SolidJS",
    description: "Simple and performant reactivity for building user interfaces.",
    sourceType: "context7",
    sourceUrl: "https://solidjs.com",
    context7Id: "/llmstxt/solidjs_llms_txt",
    repositoryUrl: "https://github.com/solidjs/solid",
    homepageUrl: "https://solidjs.com",
    iconUrl: "https://solidjs.com/favicon.ico",
    categories: ["frontend"],
  },

  // ============================================================================
  // Backend Frameworks
  // ============================================================================
  {
    id: "hono",
    name: "Hono",
    description: "Ultrafast web framework for the Edges. Works on Cloudflare Workers, Deno, Bun, and more.",
    sourceType: "context7",
    sourceUrl: "https://hono.dev",
    context7Id: "/honojs/website",
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
    sourceType: "context7",
    sourceUrl: "https://expressjs.com",
    context7Id: "/websites/expressjs_en",
    repositoryUrl: "https://github.com/expressjs/express",
    homepageUrl: "https://expressjs.com",
    iconUrl: "https://expressjs.com/images/favicon.png",
    categories: ["backend"],
  },
  {
    id: "fastify",
    name: "Fastify",
    description: "Fast and low overhead web framework for Node.js with TypeScript support.",
    sourceType: "context7",
    sourceUrl: "https://fastify.io",
    context7Id: "/fastify/fastify",
    repositoryUrl: "https://github.com/fastify/fastify",
    homepageUrl: "https://fastify.io",
    iconUrl: "https://fastify.io/img/favicon.ico",
    categories: ["backend"],
  },

  // ============================================================================
  // Database & ORM
  // ============================================================================
  {
    id: "drizzle",
    name: "Drizzle ORM",
    description: "TypeScript ORM for SQL databases with zero dependencies and maximum type safety.",
    sourceType: "context7",
    sourceUrl: "https://orm.drizzle.team",
    context7Id: "/websites/rqbv2_drizzle-orm-fe_pages_dev",
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
    sourceType: "context7",
    sourceUrl: "https://prisma.io",
    context7Id: "/websites/prisma_io",
    repositoryUrl: "https://github.com/prisma/prisma",
    homepageUrl: "https://prisma.io",
    iconUrl: "https://prisma.io/favicon.ico",
    categories: ["database", "backend"],
  },

  // ============================================================================
  // Cloud & Infrastructure
  // ============================================================================
  {
    id: "cloudflare-workers",
    name: "Cloudflare Workers",
    description: "Build serverless applications on Cloudflare's edge network with JavaScript/TypeScript.",
    sourceType: "context7",
    sourceUrl: "https://workers.cloudflare.com",
    context7Id: "/websites/developers_cloudflare_workers",
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
    sourceType: "context7",
    sourceUrl: "https://developers.cloudflare.com/d1",
    context7Id: "/llmstxt/developers_cloudflare_d1_llms-full_txt",
    repositoryUrl: "https://github.com/cloudflare/workers-sdk",
    homepageUrl: "https://developers.cloudflare.com/d1",
    iconUrl: "https://www.cloudflare.com/favicon.ico",
    categories: ["cloud", "database"],
  },

  // ============================================================================
  // State Management & Routing
  // ============================================================================
  {
    id: "tanstack-query",
    name: "TanStack Query",
    description: "Powerful data synchronization for React, Vue, Solid, and Svelte applications.",
    sourceType: "context7",
    sourceUrl: "https://tanstack.com/query",
    context7Id: "/tanstack/query",
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
    sourceType: "context7",
    sourceUrl: "https://tanstack.com/router",
    context7Id: "/tanstack/router",
    repositoryUrl: "https://github.com/TanStack/router",
    homepageUrl: "https://tanstack.com/router",
    iconUrl: "https://tanstack.com/favicon.ico",
    categories: ["frontend"],
  },
  {
    id: "zustand",
    name: "Zustand",
    description: "A small, fast, and scalable state management solution for React.",
    sourceType: "context7",
    sourceUrl: "https://zustand-demo.pmnd.rs",
    context7Id: "/pmndrs/zustand",
    repositoryUrl: "https://github.com/pmndrs/zustand",
    homepageUrl: "https://zustand-demo.pmnd.rs",
    iconUrl: "https://zustand-demo.pmnd.rs/favicon.ico",
    categories: ["frontend", "utilities"],
  },

  // ============================================================================
  // Testing
  // ============================================================================
  {
    id: "vitest",
    name: "Vitest",
    description: "A blazing fast unit test framework powered by Vite.",
    sourceType: "context7",
    sourceUrl: "https://vitest.dev",
    context7Id: "/websites/vitest_dev",
    repositoryUrl: "https://github.com/vitest-dev/vitest",
    homepageUrl: "https://vitest.dev",
    iconUrl: "https://vitest.dev/favicon.ico",
    categories: ["testing", "utilities"],
  },
  {
    id: "playwright",
    name: "Playwright",
    description: "End-to-end testing framework for modern web apps.",
    sourceType: "context7",
    sourceUrl: "https://playwright.dev",
    context7Id: "/microsoft/playwright.dev",
    repositoryUrl: "https://github.com/microsoft/playwright",
    homepageUrl: "https://playwright.dev",
    iconUrl: "https://playwright.dev/img/playwright-logo.svg",
    categories: ["testing"],
  },

  // ============================================================================
  // Utilities & Languages
  // ============================================================================
  {
    id: "zod",
    name: "Zod",
    description: "TypeScript-first schema validation with static type inference.",
    sourceType: "context7",
    sourceUrl: "https://zod.dev",
    context7Id: "/websites/v3_zod_dev",
    repositoryUrl: "https://github.com/colinhacks/zod",
    homepageUrl: "https://zod.dev",
    iconUrl: "https://zod.dev/favicon.ico",
    categories: ["utilities", "backend"],
  },
  {
    id: "tailwindcss",
    name: "Tailwind CSS",
    description: "A utility-first CSS framework for rapid UI development.",
    sourceType: "context7",
    sourceUrl: "https://tailwindcss.com",
    context7Id: "/tailwindlabs/tailwindcss.com",
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
    sourceType: "context7",
    sourceUrl: "https://typescriptlang.org",
    context7Id: "/websites/typescriptlang",
    repositoryUrl: "https://github.com/microsoft/TypeScript",
    homepageUrl: "https://typescriptlang.org",
    iconUrl: "https://www.typescriptlang.org/favicon.ico",
    categories: ["utilities"],
    isFeatured: true,
  },

  // ============================================================================
  // AI & Machine Learning
  // ============================================================================
  {
    id: "vercel-ai-sdk",
    name: "Vercel AI SDK",
    description: "Build AI-powered applications with React, Svelte, Vue, and Node.js.",
    sourceType: "context7",
    sourceUrl: "https://sdk.vercel.ai",
    context7Id: "/websites/ai-sdk_dev",
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
    sourceType: "context7",
    sourceUrl: "https://js.langchain.com",
    context7Id: "/websites/langchain_oss_javascript",
    repositoryUrl: "https://github.com/langchain-ai/langchainjs",
    homepageUrl: "https://js.langchain.com",
    iconUrl: "https://js.langchain.com/img/favicon.ico",
    categories: ["ai", "backend"],
  },

  // ============================================================================
  // E-commerce & Website Platforms (for band merch sites!)
  // ============================================================================
  {
    id: "shopify",
    name: "Shopify",
    description: "E-commerce platform for building online stores. Perfect for band merch and retail.",
    sourceType: "context7",
    sourceUrl: "https://shopify.dev",
    context7Id: "/websites/shopify_dev",
    repositoryUrl: "https://github.com/Shopify",
    homepageUrl: "https://shopify.dev",
    iconUrl: "https://shopify.dev/favicon.ico",
    categories: ["fullstack", "utilities"],
    isFeatured: true,
  },
  {
    id: "shopify-liquid",
    name: "Shopify Liquid",
    description: "Template language for Shopify themes. Build custom storefronts with dynamic content.",
    sourceType: "context7",
    sourceUrl: "https://shopify.dev/api/liquid",
    context7Id: "/websites/shopify_dev_api_liquid",
    homepageUrl: "https://shopify.dev/api/liquid",
    iconUrl: "https://shopify.dev/favicon.ico",
    categories: ["frontend", "utilities"],
  },
  {
    id: "shopify-themes",
    name: "Shopify Themes",
    description: "Build fast, flexible, and customizable themes for Shopify storefronts.",
    sourceType: "context7",
    sourceUrl: "https://shopify.dev/storefronts/themes",
    context7Id: "/websites/shopify_dev_storefronts_themes",
    homepageUrl: "https://shopify.dev/storefronts/themes",
    iconUrl: "https://shopify.dev/favicon.ico",
    categories: ["frontend"],
  },
  {
    id: "wix",
    name: "Wix",
    description: "Full-stack development platform for customizing websites with code and building apps.",
    sourceType: "context7",
    sourceUrl: "https://dev.wix.com",
    context7Id: "/websites/dev_wix",
    homepageUrl: "https://dev.wix.com",
    iconUrl: "https://www.wix.com/favicon.ico",
    categories: ["fullstack", "frontend"],
    isFeatured: true,
  },
  {
    id: "squarespace",
    name: "Squarespace",
    description: "Developer platform for building custom Squarespace websites with templates and APIs.",
    sourceType: "context7",
    sourceUrl: "https://developers.squarespace.com",
    context7Id: "/websites/developers_squarespace",
    homepageUrl: "https://developers.squarespace.com",
    iconUrl: "https://www.squarespace.com/favicon.ico",
    categories: ["frontend", "fullstack"],
  },
  {
    id: "webflow",
    name: "Webflow",
    description: "Visual web development platform with APIs for building custom integrations.",
    sourceType: "context7",
    sourceUrl: "https://developers.webflow.com",
    context7Id: "/llmstxt/developers_webflow_llms_txt",
    homepageUrl: "https://developers.webflow.com",
    iconUrl: "https://webflow.com/favicon.ico",
    categories: ["frontend", "fullstack"],
  },
  {
    id: "bigcommerce",
    name: "BigCommerce",
    description: "E-commerce platform with powerful APIs for custom storefronts and integrations.",
    sourceType: "context7",
    sourceUrl: "https://developer.bigcommerce.com",
    context7Id: "/bigcommerce/docs",
    repositoryUrl: "https://github.com/bigcommerce/docs",
    homepageUrl: "https://developer.bigcommerce.com",
    iconUrl: "https://www.bigcommerce.com/favicon.ico",
    categories: ["fullstack", "backend"],
  },

  // ============================================================================
  // CMS & Content Platforms
  // ============================================================================
  {
    id: "wordpress",
    name: "WordPress",
    description: "Open-source CMS powering over 40% of the web. Plugins, themes, and the Block Editor.",
    sourceType: "context7",
    sourceUrl: "https://developer.wordpress.org",
    context7Id: "/websites/developer_wordpress_block-editor",
    homepageUrl: "https://developer.wordpress.org",
    iconUrl: "https://wordpress.org/favicon.ico",
    categories: ["fullstack", "frontend"],
    isFeatured: true,
  },
  {
    id: "wordpress-functions",
    name: "WordPress Functions",
    description: "Complete reference for all WordPress core functions.",
    sourceType: "context7",
    sourceUrl: "https://developer.wordpress.org/reference/functions",
    context7Id: "/websites/developer_wordpress_reference_functions",
    homepageUrl: "https://developer.wordpress.org/reference/functions",
    iconUrl: "https://wordpress.org/favicon.ico",
    categories: ["backend", "utilities"],
  },
  {
    id: "wordpress-plugins",
    name: "WordPress Plugins",
    description: "Developer handbook for building WordPress plugins.",
    sourceType: "context7",
    sourceUrl: "https://developer.wordpress.org/plugins",
    context7Id: "/websites/developer_wordpress_plugins",
    homepageUrl: "https://developer.wordpress.org/plugins",
    iconUrl: "https://wordpress.org/favicon.ico",
    categories: ["backend"],
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
        context7Id: lib.context7Id || null,
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
    context7Id: library.context7Id || undefined,
  };

  await c.env.INGESTION_QUEUE.send(job);

  return c.json({
    message: "Indexing started",
    libraryId: id,
    sourceUrl: library.sourceUrl,
    sourceType: library.sourceType,
    context7Id: library.context7Id,
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
        context7Id: library.context7Id || undefined,
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

  // Delete from Vectorize (batch size limit is 100)
  if (libraryChunks.length > 0) {
    const chunkIds = libraryChunks.map((c) => c.id);
    for (let i = 0; i < chunkIds.length; i += 100) {
      const batch = chunkIds.slice(i, i + 100);
      try {
        await c.env.VECTORIZE.deleteByIds(batch);
      } catch (error) {
        console.warn(`Failed to delete batch from Vectorize:`, error);
      }
    }

    // Delete from R2 in parallel batches
    const R2_BATCH_SIZE = 50;
    for (let i = 0; i < libraryChunks.length; i += R2_BATCH_SIZE) {
      const batch = libraryChunks.slice(i, i + R2_BATCH_SIZE);
      await Promise.all(
        batch.map((chunk) =>
          c.env.DOCS_BUCKET.delete(chunk.r2Key).catch(() => {})
        )
      );
    }
  }

  // Delete from D1 (cascade will handle chunks)
  await db.delete(chunks).where(eq(chunks.libraryId, id));
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
    context7Id: library.context7Id || undefined,
  };

  await c.env.INGESTION_QUEUE.send(job);

  return c.json({
    message: "Re-indexing started",
    libraryId: id,
    previousChunks: libraryChunks.length,
    sourceType: library.sourceType,
    context7Id: library.context7Id,
  });
});

// ============================================================================
// POST /api/admin/reseed - Delete all libraries and reseed from SEED_LIBRARIES
// ============================================================================

adminRouter.post("/reseed", async (c) => {
  const db = c.get("db");
  const now = new Date().toISOString();

  const results = {
    deleted: 0,
    created: 0,
    errors: [] as string[],
  };

  // Step 1: Get all existing libraries
  const existingLibraries = await db.select({ id: libraries.id }).from(libraries);

  // Step 2: Delete all chunks, stats, and libraries
  for (const lib of existingLibraries) {
    try {
      // Get chunks for this library
      const libraryChunks = await db
        .select({ id: chunks.id, r2Key: chunks.r2Key })
        .from(chunks)
        .where(eq(chunks.libraryId, lib.id));

      // Delete from Vectorize (batch size limit is 100)
      if (libraryChunks.length > 0) {
        const chunkIds = libraryChunks.map((c) => c.id);
        for (let i = 0; i < chunkIds.length; i += 100) {
          const batch = chunkIds.slice(i, i + 100);
          try {
            await c.env.VECTORIZE.deleteByIds(batch);
          } catch {
            // Ignore vectorize delete errors
          }
        }

        // Delete from R2 in parallel batches
        const R2_BATCH_SIZE = 50;
        for (let i = 0; i < libraryChunks.length; i += R2_BATCH_SIZE) {
          const batch = libraryChunks.slice(i, i + R2_BATCH_SIZE);
          await Promise.all(
            batch.map((chunk) =>
              c.env.DOCS_BUCKET.delete(chunk.r2Key).catch(() => {})
            )
          );
        }
      }

      // Delete from D1
      await db.delete(chunks).where(eq(chunks.libraryId, lib.id));
      await db.delete(libraryStats).where(eq(libraryStats.libraryId, lib.id));
      await db.delete(libraries).where(eq(libraries.id, lib.id));
      results.deleted++;
    } catch (error) {
      results.errors.push(`delete ${lib.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Step 3: Seed new libraries
  for (const lib of SEED_LIBRARIES) {
    try {
      await db.insert(libraries).values({
        id: lib.id,
        name: lib.name,
        description: lib.description,
        sourceType: lib.sourceType,
        sourceUrl: lib.sourceUrl,
        context7Id: lib.context7Id || null,
        repositoryUrl: lib.repositoryUrl || null,
        homepageUrl: lib.homepageUrl || null,
        iconUrl: lib.iconUrl || null,
        categories: lib.categories,
        isFeatured: lib.isFeatured || false,
        indexStatus: "pending",
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(libraryStats).values({
        libraryId: lib.id,
        totalQueries: 0,
        totalChunkHits: 0,
      });

      results.created++;
    } catch (error) {
      results.errors.push(`create ${lib.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return c.json({
    message: "Reseed completed",
    ...results,
    totalSeeds: SEED_LIBRARIES.length,
  });
});

// ============================================================================
// MCP Server Seed Data
// ============================================================================

interface McpServerSeed {
  id: string;
  namespace: string;
  name: string;
  displayName: string;
  description: string;
  transportType: "stdio" | "http" | "sse";
  packageType: "npm" | "pypi" | "docker" | "binary" | "remote";
  packageName: string;
  installCommand: string;
  installArgs: string[];
  envVars: Record<string, string>;
  tools: Array<{name: string; description?: string}>;
  resources: Array<{uri: string; name?: string}>;
  prompts: Array<{name: string; description?: string}>;
  hasTools: boolean;
  hasResources: boolean;
  hasPrompts: boolean;
  repositoryUrl?: string;
  documentationUrl?: string;
  homepageUrl?: string;
  iconUrl?: string;
  author?: string;
  license?: string;
  keywords: string[];
  categories: string[];
  isOfficial: boolean;
  isFeatured: boolean;
}

const SEED_MCP_SERVERS: McpServerSeed[] = [
  // ============================================================================
  // Official MCP Servers (from modelcontextprotocol org)
  // ============================================================================
  {
    id: "filesystem",
    namespace: "modelcontextprotocol",
    name: "server-filesystem",
    displayName: "Filesystem",
    description: "Secure file operations with configurable access controls. Read, write, and manage files and directories.",
    transportType: "stdio",
    packageType: "npm",
    packageName: "@modelcontextprotocol/server-filesystem",
    installCommand: "npx",
    installArgs: ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/dir"],
    envVars: {},
    tools: [
      { name: "read_file", description: "Read the complete contents of a file" },
      { name: "read_multiple_files", description: "Read multiple files simultaneously" },
      { name: "write_file", description: "Create or overwrite a file" },
      { name: "edit_file", description: "Make line-based edits to a file" },
      { name: "create_directory", description: "Create a new directory" },
      { name: "list_directory", description: "List directory contents" },
      { name: "directory_tree", description: "Get recursive directory structure" },
      { name: "move_file", description: "Move or rename files and directories" },
      { name: "search_files", description: "Search for files matching a pattern" },
      { name: "get_file_info", description: "Get detailed file metadata" },
    ],
    resources: [],
    prompts: [],
    hasTools: true,
    hasResources: false,
    hasPrompts: false,
    repositoryUrl: "https://github.com/modelcontextprotocol/servers",
    documentationUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem",
    author: "Anthropic",
    license: "MIT",
    keywords: ["filesystem", "files", "directories", "read", "write"],
    categories: ["filesystem", "devtools"],
    isOfficial: true,
    isFeatured: true,
  },
  {
    id: "github",
    namespace: "modelcontextprotocol",
    name: "server-github",
    displayName: "GitHub",
    description: "GitHub API integration for repository management, file operations, issues, pull requests, and more.",
    transportType: "stdio",
    packageType: "npm",
    packageName: "@modelcontextprotocol/server-github",
    installCommand: "npx",
    installArgs: ["-y", "@modelcontextprotocol/server-github"],
    envVars: { "GITHUB_PERSONAL_ACCESS_TOKEN": "your-github-token" },
    tools: [
      { name: "create_or_update_file", description: "Create or update a file in a repository" },
      { name: "search_repositories", description: "Search for GitHub repositories" },
      { name: "create_repository", description: "Create a new GitHub repository" },
      { name: "get_file_contents", description: "Get contents of a file from a repository" },
      { name: "push_files", description: "Push multiple files to a repository" },
      { name: "create_issue", description: "Create a new issue in a repository" },
      { name: "create_pull_request", description: "Create a new pull request" },
      { name: "fork_repository", description: "Fork a repository" },
      { name: "create_branch", description: "Create a new branch" },
    ],
    resources: [],
    prompts: [],
    hasTools: true,
    hasResources: false,
    hasPrompts: false,
    repositoryUrl: "https://github.com/modelcontextprotocol/servers",
    documentationUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/github",
    author: "Anthropic",
    license: "MIT",
    keywords: ["github", "git", "repository", "issues", "pull-requests"],
    categories: ["devtools", "productivity"],
    isOfficial: true,
    isFeatured: true,
  },
  {
    id: "postgres",
    namespace: "modelcontextprotocol",
    name: "server-postgres",
    displayName: "PostgreSQL",
    description: "Read-only PostgreSQL database access with schema inspection and query capabilities.",
    transportType: "stdio",
    packageType: "npm",
    packageName: "@modelcontextprotocol/server-postgres",
    installCommand: "npx",
    installArgs: ["-y", "@modelcontextprotocol/server-postgres", "postgresql://localhost/mydb"],
    envVars: {},
    tools: [
      { name: "query", description: "Execute a read-only SQL query" },
    ],
    resources: [
      { uri: "postgres://schema", name: "Database schema information" },
    ],
    prompts: [],
    hasTools: true,
    hasResources: true,
    hasPrompts: false,
    repositoryUrl: "https://github.com/modelcontextprotocol/servers",
    documentationUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/postgres",
    author: "Anthropic",
    license: "MIT",
    keywords: ["postgres", "postgresql", "database", "sql", "query"],
    categories: ["database"],
    isOfficial: true,
    isFeatured: true,
  },
  {
    id: "sqlite",
    namespace: "modelcontextprotocol",
    name: "server-sqlite",
    displayName: "SQLite",
    description: "SQLite database operations with support for read/write queries.",
    transportType: "stdio",
    packageType: "npm",
    packageName: "@modelcontextprotocol/server-sqlite",
    installCommand: "npx",
    installArgs: ["-y", "@modelcontextprotocol/server-sqlite", "/path/to/database.db"],
    envVars: {},
    tools: [
      { name: "read_query", description: "Execute a SELECT query" },
      { name: "write_query", description: "Execute INSERT, UPDATE, or DELETE" },
      { name: "create_table", description: "Create a new table" },
      { name: "list_tables", description: "List all tables" },
      { name: "describe_table", description: "Get table schema" },
    ],
    resources: [],
    prompts: [],
    hasTools: true,
    hasResources: false,
    hasPrompts: false,
    repositoryUrl: "https://github.com/modelcontextprotocol/servers",
    documentationUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite",
    author: "Anthropic",
    license: "MIT",
    keywords: ["sqlite", "database", "sql", "local"],
    categories: ["database"],
    isOfficial: true,
    isFeatured: false,
  },
  {
    id: "memory",
    namespace: "modelcontextprotocol",
    name: "server-memory",
    displayName: "Memory",
    description: "Knowledge graph-based persistent memory system for storing and retrieving entities and relations.",
    transportType: "stdio",
    packageType: "npm",
    packageName: "@modelcontextprotocol/server-memory",
    installCommand: "npx",
    installArgs: ["-y", "@modelcontextprotocol/server-memory"],
    envVars: {},
    tools: [
      { name: "create_entities", description: "Create new entities in the knowledge graph" },
      { name: "create_relations", description: "Create relations between entities" },
      { name: "add_observations", description: "Add observations to entities" },
      { name: "delete_entities", description: "Delete entities and their relations" },
      { name: "delete_observations", description: "Delete observations from entities" },
      { name: "delete_relations", description: "Delete relations between entities" },
      { name: "read_graph", description: "Read the entire knowledge graph" },
      { name: "search_nodes", description: "Search for nodes by query" },
      { name: "open_nodes", description: "Open specific nodes by name" },
    ],
    resources: [],
    prompts: [],
    hasTools: true,
    hasResources: false,
    hasPrompts: false,
    repositoryUrl: "https://github.com/modelcontextprotocol/servers",
    documentationUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/memory",
    author: "Anthropic",
    license: "MIT",
    keywords: ["memory", "knowledge-graph", "entities", "relations", "persistence"],
    categories: ["ai", "productivity"],
    isOfficial: true,
    isFeatured: true,
  },
  {
    id: "puppeteer",
    namespace: "modelcontextprotocol",
    name: "server-puppeteer",
    displayName: "Puppeteer",
    description: "Browser automation for web scraping, testing, and interaction using Puppeteer.",
    transportType: "stdio",
    packageType: "npm",
    packageName: "@modelcontextprotocol/server-puppeteer",
    installCommand: "npx",
    installArgs: ["-y", "@modelcontextprotocol/server-puppeteer"],
    envVars: {},
    tools: [
      { name: "puppeteer_navigate", description: "Navigate to a URL" },
      { name: "puppeteer_screenshot", description: "Take a screenshot" },
      { name: "puppeteer_click", description: "Click an element" },
      { name: "puppeteer_fill", description: "Fill in an input field" },
      { name: "puppeteer_select", description: "Select an option" },
      { name: "puppeteer_hover", description: "Hover over an element" },
      { name: "puppeteer_evaluate", description: "Execute JavaScript" },
    ],
    resources: [
      { uri: "puppeteer://screenshot", name: "Current page screenshot" },
      { uri: "puppeteer://console", name: "Console logs" },
    ],
    prompts: [],
    hasTools: true,
    hasResources: true,
    hasPrompts: false,
    repositoryUrl: "https://github.com/modelcontextprotocol/servers",
    documentationUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer",
    author: "Anthropic",
    license: "MIT",
    keywords: ["puppeteer", "browser", "automation", "web", "scraping"],
    categories: ["browser", "automation", "devtools"],
    isOfficial: true,
    isFeatured: true,
  },
  {
    id: "brave-search",
    namespace: "modelcontextprotocol",
    name: "server-brave-search",
    displayName: "Brave Search",
    description: "Web and local search using Brave's Search API with privacy focus.",
    transportType: "stdio",
    packageType: "npm",
    packageName: "@modelcontextprotocol/server-brave-search",
    installCommand: "npx",
    installArgs: ["-y", "@modelcontextprotocol/server-brave-search"],
    envVars: { "BRAVE_API_KEY": "your-brave-api-key" },
    tools: [
      { name: "brave_web_search", description: "Search the web using Brave" },
      { name: "brave_local_search", description: "Search local businesses" },
    ],
    resources: [],
    prompts: [],
    hasTools: true,
    hasResources: false,
    hasPrompts: false,
    repositoryUrl: "https://github.com/modelcontextprotocol/servers",
    documentationUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search",
    author: "Anthropic",
    license: "MIT",
    keywords: ["search", "brave", "web", "api"],
    categories: ["search", "web"],
    isOfficial: true,
    isFeatured: false,
  },
  {
    id: "google-maps",
    namespace: "modelcontextprotocol",
    name: "server-google-maps",
    displayName: "Google Maps",
    description: "Google Maps API for location search, directions, and place details.",
    transportType: "stdio",
    packageType: "npm",
    packageName: "@modelcontextprotocol/server-google-maps",
    installCommand: "npx",
    installArgs: ["-y", "@modelcontextprotocol/server-google-maps"],
    envVars: { "GOOGLE_MAPS_API_KEY": "your-google-maps-api-key" },
    tools: [
      { name: "maps_geocode", description: "Convert address to coordinates" },
      { name: "maps_reverse_geocode", description: "Convert coordinates to address" },
      { name: "maps_search_places", description: "Search for places" },
      { name: "maps_place_details", description: "Get place details" },
      { name: "maps_distance_matrix", description: "Calculate distances" },
      { name: "maps_directions", description: "Get directions between places" },
      { name: "maps_elevation", description: "Get elevation data" },
    ],
    resources: [],
    prompts: [],
    hasTools: true,
    hasResources: false,
    hasPrompts: false,
    repositoryUrl: "https://github.com/modelcontextprotocol/servers",
    documentationUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/google-maps",
    author: "Anthropic",
    license: "MIT",
    keywords: ["google", "maps", "location", "places", "directions"],
    categories: ["maps", "location"],
    isOfficial: true,
    isFeatured: false,
  },
  {
    id: "slack",
    namespace: "modelcontextprotocol",
    name: "server-slack",
    displayName: "Slack",
    description: "Slack workspace integration for channels, messages, and users.",
    transportType: "stdio",
    packageType: "npm",
    packageName: "@modelcontextprotocol/server-slack",
    installCommand: "npx",
    installArgs: ["-y", "@modelcontextprotocol/server-slack"],
    envVars: { "SLACK_BOT_TOKEN": "xoxb-your-bot-token", "SLACK_TEAM_ID": "T00000000" },
    tools: [
      { name: "slack_list_channels", description: "List Slack channels" },
      { name: "slack_post_message", description: "Post a message to a channel" },
      { name: "slack_reply_to_thread", description: "Reply to a thread" },
      { name: "slack_add_reaction", description: "Add a reaction to a message" },
      { name: "slack_get_channel_history", description: "Get channel message history" },
      { name: "slack_get_thread_replies", description: "Get thread replies" },
      { name: "slack_get_users", description: "List workspace users" },
      { name: "slack_get_user_profile", description: "Get user profile" },
    ],
    resources: [],
    prompts: [],
    hasTools: true,
    hasResources: false,
    hasPrompts: false,
    repositoryUrl: "https://github.com/modelcontextprotocol/servers",
    documentationUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/slack",
    author: "Anthropic",
    license: "MIT",
    keywords: ["slack", "messaging", "chat", "workspace"],
    categories: ["communication", "productivity"],
    isOfficial: true,
    isFeatured: true,
  },
  {
    id: "fetch",
    namespace: "modelcontextprotocol",
    name: "server-fetch",
    displayName: "Fetch",
    description: "Web content fetching with support for HTML, JSON, and plain text extraction.",
    transportType: "stdio",
    packageType: "npm",
    packageName: "@modelcontextprotocol/server-fetch",
    installCommand: "npx",
    installArgs: ["-y", "@modelcontextprotocol/server-fetch"],
    envVars: {},
    tools: [
      { name: "fetch", description: "Fetch a URL and extract content" },
    ],
    resources: [],
    prompts: [],
    hasTools: true,
    hasResources: false,
    hasPrompts: false,
    repositoryUrl: "https://github.com/modelcontextprotocol/servers",
    documentationUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/fetch",
    author: "Anthropic",
    license: "MIT",
    keywords: ["fetch", "http", "web", "url", "content"],
    categories: ["web", "utilities"],
    isOfficial: true,
    isFeatured: false,
  },
  {
    id: "git",
    namespace: "modelcontextprotocol",
    name: "server-git",
    displayName: "Git",
    description: "Git repository operations including clone, status, diff, commit, and more.",
    transportType: "stdio",
    packageType: "npm",
    packageName: "@modelcontextprotocol/server-git",
    installCommand: "npx",
    installArgs: ["-y", "@modelcontextprotocol/server-git", "--repository", "/path/to/repo"],
    envVars: {},
    tools: [
      { name: "git_status", description: "Get repository status" },
      { name: "git_diff_unstaged", description: "Show unstaged changes" },
      { name: "git_diff_staged", description: "Show staged changes" },
      { name: "git_commit", description: "Create a commit" },
      { name: "git_add", description: "Stage files" },
      { name: "git_reset", description: "Unstage files" },
      { name: "git_log", description: "Show commit history" },
    ],
    resources: [],
    prompts: [],
    hasTools: true,
    hasResources: false,
    hasPrompts: false,
    repositoryUrl: "https://github.com/modelcontextprotocol/servers",
    documentationUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/git",
    author: "Anthropic",
    license: "MIT",
    keywords: ["git", "version-control", "repository", "commit"],
    categories: ["devtools"],
    isOfficial: true,
    isFeatured: false,
  },
  {
    id: "sentry",
    namespace: "modelcontextprotocol",
    name: "server-sentry",
    displayName: "Sentry",
    description: "Sentry.io error tracking integration for issue resolution and analysis.",
    transportType: "stdio",
    packageType: "npm",
    packageName: "@modelcontextprotocol/server-sentry",
    installCommand: "npx",
    installArgs: ["-y", "@modelcontextprotocol/server-sentry"],
    envVars: { "SENTRY_AUTH_TOKEN": "your-sentry-auth-token" },
    tools: [
      { name: "get_sentry_issues", description: "Get list of issues" },
      { name: "get_sentry_issue_details", description: "Get issue details" },
      { name: "resolve_sentry_issue", description: "Resolve an issue" },
    ],
    resources: [],
    prompts: [],
    hasTools: true,
    hasResources: false,
    hasPrompts: false,
    repositoryUrl: "https://github.com/modelcontextprotocol/servers",
    documentationUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/sentry",
    author: "Anthropic",
    license: "MIT",
    keywords: ["sentry", "errors", "monitoring", "debugging"],
    categories: ["devtools", "monitoring"],
    isOfficial: true,
    isFeatured: false,
  },
  {
    id: "sequential-thinking",
    namespace: "modelcontextprotocol",
    name: "server-sequential-thinking",
    displayName: "Sequential Thinking",
    description: "Dynamic problem-solving through thought sequences with branching and revision capabilities.",
    transportType: "stdio",
    packageType: "npm",
    packageName: "@modelcontextprotocol/server-sequential-thinking",
    installCommand: "npx",
    installArgs: ["-y", "@modelcontextprotocol/server-sequential-thinking"],
    envVars: {},
    tools: [
      { name: "sequentialthinking", description: "A tool for dynamic problem-solving" },
    ],
    resources: [],
    prompts: [],
    hasTools: true,
    hasResources: false,
    hasPrompts: false,
    repositoryUrl: "https://github.com/modelcontextprotocol/servers",
    documentationUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking",
    author: "Anthropic",
    license: "MIT",
    keywords: ["thinking", "reasoning", "problem-solving", "ai"],
    categories: ["ai", "utilities"],
    isOfficial: true,
    isFeatured: false,
  },
  {
    id: "everart",
    namespace: "modelcontextprotocol",
    name: "server-everart",
    displayName: "EverArt",
    description: "AI image generation using EverArt's models.",
    transportType: "stdio",
    packageType: "npm",
    packageName: "@modelcontextprotocol/server-everart",
    installCommand: "npx",
    installArgs: ["-y", "@modelcontextprotocol/server-everart"],
    envVars: { "EVERART_API_KEY": "your-everart-api-key" },
    tools: [
      { name: "generate_image", description: "Generate an image from a prompt" },
      { name: "get_models", description: "List available models" },
    ],
    resources: [],
    prompts: [],
    hasTools: true,
    hasResources: false,
    hasPrompts: false,
    repositoryUrl: "https://github.com/modelcontextprotocol/servers",
    documentationUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/everart",
    author: "Anthropic",
    license: "MIT",
    keywords: ["image", "generation", "ai", "art"],
    categories: ["ai", "creative"],
    isOfficial: true,
    isFeatured: false,
  },
  // ============================================================================
  // Cloudflare Servers
  // ============================================================================
  {
    id: "cloudflare",
    namespace: "cloudflare",
    name: "mcp-server-cloudflare",
    displayName: "Cloudflare",
    description: "Manage Cloudflare services including Workers, KV, R2, D1, and more.",
    transportType: "stdio",
    packageType: "npm",
    packageName: "@cloudflare/mcp-server-cloudflare",
    installCommand: "npx",
    installArgs: ["-y", "@cloudflare/mcp-server-cloudflare", "init"],
    envVars: {},
    tools: [
      { name: "worker_list", description: "List Workers" },
      { name: "worker_get", description: "Get Worker details" },
      { name: "worker_put", description: "Create/update a Worker" },
      { name: "worker_delete", description: "Delete a Worker" },
      { name: "kv_namespace_list", description: "List KV namespaces" },
      { name: "kv_get", description: "Get a KV value" },
      { name: "kv_put", description: "Put a KV value" },
      { name: "r2_bucket_list", description: "List R2 buckets" },
      { name: "r2_object_get", description: "Get an R2 object" },
      { name: "r2_object_put", description: "Put an R2 object" },
      { name: "d1_database_list", description: "List D1 databases" },
      { name: "d1_database_query", description: "Query a D1 database" },
    ],
    resources: [],
    prompts: [],
    hasTools: true,
    hasResources: false,
    hasPrompts: false,
    repositoryUrl: "https://github.com/cloudflare/mcp-server-cloudflare",
    documentationUrl: "https://developers.cloudflare.com/workers/",
    author: "Cloudflare",
    license: "MIT",
    keywords: ["cloudflare", "workers", "kv", "r2", "d1", "edge"],
    categories: ["cloud", "devtools"],
    isOfficial: false,
    isFeatured: true,
  },
  // ============================================================================
  // Database Servers
  // ============================================================================
  {
    id: "neon",
    namespace: "neondatabase",
    name: "mcp-server-neon",
    displayName: "Neon",
    description: "Neon serverless PostgreSQL operations including project, branch, and database management.",
    transportType: "stdio",
    packageType: "npm",
    packageName: "@neondatabase/mcp-server-neon",
    installCommand: "npx",
    installArgs: ["-y", "@neondatabase/mcp-server-neon"],
    envVars: { "NEON_API_KEY": "your-neon-api-key" },
    tools: [
      { name: "list_projects", description: "List Neon projects" },
      { name: "create_project", description: "Create a new project" },
      { name: "create_branch", description: "Create a database branch" },
      { name: "run_sql", description: "Execute SQL queries" },
      { name: "get_connection_string", description: "Get connection string" },
    ],
    resources: [],
    prompts: [],
    hasTools: true,
    hasResources: false,
    hasPrompts: false,
    repositoryUrl: "https://github.com/neondatabase/mcp-server-neon",
    documentationUrl: "https://neon.tech/docs",
    author: "Neon",
    license: "MIT",
    keywords: ["neon", "postgres", "serverless", "database"],
    categories: ["database", "cloud"],
    isOfficial: false,
    isFeatured: false,
  },
  // ============================================================================
  // AI/ML Servers
  // ============================================================================
  {
    id: "exa",
    namespace: "exa",
    name: "exa-mcp-server",
    displayName: "Exa",
    description: "Exa AI-powered search for retrieving web content with semantic understanding.",
    transportType: "stdio",
    packageType: "npm",
    packageName: "exa-mcp-server",
    installCommand: "npx",
    installArgs: ["-y", "exa-mcp-server"],
    envVars: { "EXA_API_KEY": "your-exa-api-key" },
    tools: [
      { name: "search", description: "Search using Exa" },
      { name: "get_contents", description: "Get page contents" },
      { name: "find_similar", description: "Find similar pages" },
    ],
    resources: [],
    prompts: [],
    hasTools: true,
    hasResources: false,
    hasPrompts: false,
    repositoryUrl: "https://github.com/exa-labs/exa-mcp-server",
    documentationUrl: "https://docs.exa.ai",
    author: "Exa",
    license: "MIT",
    keywords: ["exa", "search", "ai", "semantic"],
    categories: ["search", "ai"],
    isOfficial: false,
    isFeatured: false,
  },
  // ============================================================================
  // Nexus (our own server!)
  // ============================================================================
  {
    id: "nexus",
    namespace: "nexus",
    name: "nexus-mcp",
    displayName: "Nexus Documentation Oracle",
    description: "Semantic documentation search across 30+ libraries. Find code examples, API references, and learn how to use any library correctly.",
    transportType: "http",
    packageType: "remote",
    packageName: "https://api.nexus.yogan.dev/mcp",
    installCommand: "",
    installArgs: [],
    envVars: {},
    tools: [
      { name: "resolve-library", description: "Search for a library by name" },
      { name: "query-docs", description: "Semantic search in library documentation" },
      { name: "get-library-info", description: "Get library details and stats" },
      { name: "list-libraries", description: "List available indexed libraries" },
      { name: "discover-servers", description: "Find MCP servers by capability" },
      { name: "get-server-info", description: "Get MCP server details" },
      { name: "get-server-config", description: "Get installation config for MCP servers" },
      { name: "save-memory", description: "Store persistent memory" },
      { name: "recall-memories", description: "Search stored memories" },
      { name: "get-project-context", description: "Get all context for a project" },
    ],
    resources: [],
    prompts: [],
    hasTools: true,
    hasResources: false,
    hasPrompts: false,
    repositoryUrl: "https://github.com/ryanyogan/nexus",
    documentationUrl: "https://nexus.yogan.dev/docs",
    homepageUrl: "https://nexus.yogan.dev",
    author: "Ryan Yogan",
    license: "MIT",
    keywords: ["documentation", "search", "semantic", "libraries", "oracle", "memory"],
    categories: ["documentation", "ai", "devtools"],
    isOfficial: false,
    isFeatured: true,
  },
];

// ============================================================================
// POST /api/admin/seed-servers - Seed MCP servers
// ============================================================================

// ============================================================================
// POST /api/admin/server-submissions/:id/approve - Approve a server submission
// ============================================================================

adminRouter.post(
  "/server-submissions/:id/approve",
  zValidator(
    "json",
    z.object({
      namespace: z.string().min(1).max(100).optional(),
      displayName: z.string().max(100).optional(),
      categories: z.array(z.string()).optional(),
      keywords: z.array(z.string()).optional(),
      isFeatured: z.boolean().optional(),
    }).optional()
  ),
  async (c) => {
    const id = c.req.param("id");
    const body = c.req.valid("json") || {};
    const db = c.get("db");
    const now = new Date().toISOString();

    // Get the submission
    const [submission] = await db
      .select()
      .from(serverSubmissions)
      .where(eq(serverSubmissions.id, id))
      .limit(1);

    if (!submission) {
      return c.json({ error: "Submission not found" }, 404);
    }

    if (submission.status !== "pending") {
      return c.json({ error: `Submission already ${submission.status}` }, 400);
    }

    // Generate a server ID from the name
    const serverId = submission.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Check if server already exists
    const [existingServer] = await db
      .select({ id: mcpServers.id })
      .from(mcpServers)
      .where(eq(mcpServers.id, serverId))
      .limit(1);

    if (existingServer) {
      // Link to existing server
      await db
        .update(serverSubmissions)
        .set({
          status: "approved",
          serverId: existingServer.id,
          processedAt: now,
        })
        .where(eq(serverSubmissions.id, id));

      return c.json({
        message: "Submission linked to existing server",
        submissionId: id,
        serverId: existingServer.id,
      });
    }

    // Extract namespace from repository URL or package name
    let namespace = body.namespace || "community";
    if (!body.namespace && submission.repositoryUrl) {
      const match = submission.repositoryUrl.match(/github\.com\/([^\/]+)/);
      if (match) {
        namespace = match[1].toLowerCase();
      }
    }

    // Create new MCP server
    await db.insert(mcpServers).values({
      id: serverId,
      namespace,
      name: submission.name,
      displayName: body.displayName || submission.displayName || submission.name,
      description: submission.description || null,
      transportType: submission.transportType || "stdio",
      packageType: submission.packageType || "npm",
      packageName: submission.packageName || null,
      installCommand: submission.packageType === "npm" ? "npx" : null,
      installArgs: submission.packageName ? ["-y", submission.packageName] : [],
      envVars: {},
      tools: [],
      resources: [],
      prompts: [],
      hasTools: true, // Assume tools by default
      hasResources: false,
      hasPrompts: false,
      repositoryUrl: submission.repositoryUrl,
      documentationUrl: submission.repositoryUrl,
      keywords: body.keywords || [],
      categories: body.categories || ["community"],
      isOfficial: false,
      isFeatured: body.isFeatured || false,
      isVerified: false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // Initialize stats
    await db.insert(mcpServerStats).values({
      serverId,
      totalDiscoveries: 0,
      totalConfigCopies: 0,
    });

    // Update submission
    await db
      .update(serverSubmissions)
      .set({
        status: "approved",
        serverId,
        processedAt: now,
      })
      .where(eq(serverSubmissions.id, id));

    return c.json({
      message: "Server submission approved and server created",
      submissionId: id,
      serverId,
    });
  }
);

// ============================================================================
// POST /api/admin/server-submissions/:id/reject - Reject a server submission
// ============================================================================

adminRouter.post(
  "/server-submissions/:id/reject",
  zValidator(
    "json",
    z.object({
      reason: z.string().max(500).optional(),
    }).optional()
  ),
  async (c) => {
    const id = c.req.param("id");
    const body = c.req.valid("json") || {};
    const db = c.get("db");
    const now = new Date().toISOString();

    const [submission] = await db
      .select()
      .from(serverSubmissions)
      .where(eq(serverSubmissions.id, id))
      .limit(1);

    if (!submission) {
      return c.json({ error: "Submission not found" }, 404);
    }

    if (submission.status !== "pending") {
      return c.json({ error: `Submission already ${submission.status}` }, 400);
    }

    await db
      .update(serverSubmissions)
      .set({
        status: "rejected",
        rejectionReason: body.reason || null,
        processedAt: now,
      })
      .where(eq(serverSubmissions.id, id));

    return c.json({
      message: "Server submission rejected",
      submissionId: id,
    });
  }
);

// ============================================================================
// POST /api/admin/seed-servers - Seed MCP servers
// ============================================================================

adminRouter.post("/seed-servers", async (c) => {
  const db = c.get("db");
  const now = new Date().toISOString();

  const results = {
    created: 0,
    skipped: 0,
    errors: [] as string[],
  };

  for (const server of SEED_MCP_SERVERS) {
    try {
      // Check if server already exists
      const [existing] = await db
        .select({ id: mcpServers.id })
        .from(mcpServers)
        .where(eq(mcpServers.id, server.id))
        .limit(1);

      if (existing) {
        results.skipped++;
        continue;
      }

      // Insert server
      await db.insert(mcpServers).values({
        id: server.id,
        namespace: server.namespace,
        name: server.name,
        displayName: server.displayName,
        description: server.description,
        transportType: server.transportType,
        packageType: server.packageType,
        packageName: server.packageName,
        installCommand: server.installCommand || null,
        installArgs: server.installArgs,
        envVars: server.envVars,
        tools: server.tools,
        resources: server.resources,
        prompts: server.prompts,
        hasTools: server.hasTools,
        hasResources: server.hasResources,
        hasPrompts: server.hasPrompts,
        repositoryUrl: server.repositoryUrl || null,
        documentationUrl: server.documentationUrl || null,
        homepageUrl: server.homepageUrl || null,
        iconUrl: server.iconUrl || null,
        author: server.author || null,
        license: server.license || null,
        keywords: server.keywords,
        categories: server.categories,
        isOfficial: server.isOfficial,
        isFeatured: server.isFeatured,
        isVerified: server.isOfficial, // Auto-verify official servers
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      // Initialize stats
      await db.insert(mcpServerStats).values({
        serverId: server.id,
        totalDiscoveries: 0,
        totalConfigCopies: 0,
      });

      results.created++;
    } catch (error) {
      results.errors.push(`${server.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return c.json({
    message: "MCP server seed completed",
    ...results,
    total: SEED_MCP_SERVERS.length,
  });
});

export { adminRouter };
