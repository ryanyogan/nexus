#!/usr/bin/env npx tsx
/**
 * Script to import top libraries from Context7 into Nexus
 * Run with: npx tsx scripts/import-context7-libraries.ts
 */

// Top libraries to import - prioritized by popularity and usefulness
const TOP_LIBRARIES = [
  // Frontend Frameworks
  { name: "react", query: "React JavaScript UI library" },
  { name: "vue", query: "Vue.js progressive framework" },
  { name: "svelte", query: "Svelte compiler framework" },
  { name: "angular", query: "Angular TypeScript framework" },
  { name: "solid", query: "SolidJS reactive framework" },
  { name: "preact", query: "Preact lightweight React alternative" },
  { name: "lit", query: "Lit web components library" },
  { name: "htmx", query: "htmx hypermedia library" },
  { name: "alpine", query: "Alpine.js lightweight framework" },
  { name: "qwik", query: "Qwik resumable framework" },

  // Meta Frameworks
  { name: "nextjs", query: "Next.js React framework" },
  { name: "nuxt", query: "Nuxt Vue framework" },
  { name: "remix", query: "Remix React framework" },
  { name: "astro", query: "Astro content framework" },
  { name: "sveltekit", query: "SvelteKit framework" },
  { name: "gatsby", query: "Gatsby React framework" },

  // Backend Frameworks
  { name: "express", query: "Express Node.js framework" },
  { name: "fastify", query: "Fastify Node.js framework" },
  { name: "hono", query: "Hono edge framework" },
  { name: "nestjs", query: "NestJS Node.js framework" },
  { name: "koa", query: "Koa Node.js middleware" },
  { name: "elysia", query: "Elysia Bun framework" },
  { name: "adonis", query: "AdonisJS framework" },

  // Databases & ORMs
  { name: "prisma", query: "Prisma ORM TypeScript" },
  { name: "drizzle", query: "Drizzle ORM SQL" },
  { name: "mongoose", query: "Mongoose MongoDB ODM" },
  { name: "typeorm", query: "TypeORM database" },
  { name: "sequelize", query: "Sequelize ORM Node.js" },
  { name: "knex", query: "Knex.js SQL builder" },
  { name: "kysely", query: "Kysely TypeScript SQL" },

  // State Management
  { name: "redux", query: "Redux state management" },
  { name: "zustand", query: "Zustand React state" },
  { name: "jotai", query: "Jotai atomic state" },
  { name: "mobx", query: "MobX reactive state" },
  { name: "recoil", query: "Recoil Facebook state" },
  { name: "pinia", query: "Pinia Vue store" },
  { name: "xstate", query: "XState state machines" },

  // Data Fetching
  { name: "tanstack-query", query: "TanStack Query React" },
  { name: "swr", query: "SWR Vercel data fetching" },
  { name: "trpc", query: "tRPC end-to-end typesafe" },
  { name: "apollo", query: "Apollo GraphQL client" },
  { name: "urql", query: "urql GraphQL client" },
  { name: "axios", query: "Axios HTTP client" },

  // Routing
  { name: "react-router", query: "React Router navigation" },
  { name: "tanstack-router", query: "TanStack Router typesafe" },
  { name: "wouter", query: "Wouter minimal router" },

  // Styling
  { name: "tailwindcss", query: "Tailwind CSS utility" },
  { name: "styled-components", query: "styled-components CSS-in-JS" },
  { name: "emotion", query: "Emotion CSS-in-JS" },
  { name: "chakra-ui", query: "Chakra UI components" },
  { name: "radix", query: "Radix UI primitives" },
  { name: "shadcn", query: "shadcn/ui components" },
  { name: "material-ui", query: "Material UI React" },
  { name: "ant-design", query: "Ant Design components" },
  { name: "mantine", query: "Mantine React components" },

  // Testing
  { name: "jest", query: "Jest testing framework" },
  { name: "vitest", query: "Vitest testing Vite" },
  { name: "playwright", query: "Playwright e2e testing" },
  { name: "cypress", query: "Cypress e2e testing" },
  { name: "testing-library", query: "Testing Library DOM" },
  { name: "msw", query: "MSW Mock Service Worker" },

  // Build Tools
  { name: "vite", query: "Vite build tool" },
  { name: "webpack", query: "Webpack bundler" },
  { name: "esbuild", query: "esbuild bundler" },
  { name: "rollup", query: "Rollup bundler" },
  { name: "turbo", query: "Turbo monorepo" },
  { name: "nx", query: "Nx monorepo build" },

  // TypeScript & Validation
  { name: "typescript", query: "TypeScript language" },
  { name: "zod", query: "Zod TypeScript validation" },
  { name: "yup", query: "Yup schema validation" },
  { name: "valibot", query: "Valibot validation" },
  { name: "typebox", query: "TypeBox JSON Schema" },

  // Auth
  { name: "nextauth", query: "NextAuth.js authentication" },
  { name: "clerk", query: "Clerk authentication" },
  { name: "lucia", query: "Lucia auth library" },
  { name: "passport", query: "Passport.js auth" },

  // Cloud & Deployment
  { name: "cloudflare-workers", query: "Cloudflare Workers edge" },
  { name: "vercel", query: "Vercel deployment platform" },
  { name: "aws-sdk", query: "AWS SDK JavaScript" },
  { name: "firebase", query: "Firebase Google platform" },
  { name: "supabase", query: "Supabase open source Firebase" },

  // AI & ML
  { name: "langchain", query: "LangChain LLM framework" },
  { name: "openai", query: "OpenAI API client" },
  { name: "vercel-ai", query: "Vercel AI SDK" },
  { name: "huggingface", query: "Hugging Face transformers" },

  // Utilities
  { name: "lodash", query: "Lodash utility library" },
  { name: "date-fns", query: "date-fns date utility" },
  { name: "dayjs", query: "Day.js date library" },
  { name: "uuid", query: "UUID generation" },
  { name: "nanoid", query: "Nano ID generation" },

  // Documentation & CMS
  { name: "docusaurus", query: "Docusaurus documentation" },
  { name: "nextra", query: "Nextra Next.js docs" },
  { name: "contentlayer", query: "Contentlayer content" },
  { name: "sanity", query: "Sanity CMS" },
  { name: "strapi", query: "Strapi headless CMS" },

  // Animation
  { name: "framer-motion", query: "Framer Motion animation" },
  { name: "gsap", query: "GSAP animation library" },
  { name: "react-spring", query: "react-spring animation" },

  // Forms
  { name: "react-hook-form", query: "React Hook Form" },
  { name: "formik", query: "Formik React forms" },

  // Tables & Data
  { name: "tanstack-table", query: "TanStack Table headless" },
  { name: "ag-grid", query: "AG Grid data grid" },

  // Real-time
  { name: "socket.io", query: "Socket.IO real-time" },
  { name: "pusher", query: "Pusher real-time" },

  // E-commerce
  { name: "shopify", query: "Shopify e-commerce API" },
  { name: "stripe", query: "Stripe payments API" },
  { name: "medusa", query: "Medusa open source commerce" },

  // Mobile
  { name: "react-native", query: "React Native mobile" },
  { name: "expo", query: "Expo React Native" },
  { name: "capacitor", query: "Capacitor mobile apps" },
  { name: "tauri", query: "Tauri desktop apps" },
  { name: "electron", query: "Electron desktop apps" },
];

// SQL to generate for importing
console.log("-- Context7 Library Import SQL");
console.log("-- Generated: " + new Date().toISOString());
console.log("");

TOP_LIBRARIES.forEach((lib, i) => {
  const id = lib.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const categories = getCategoriesForLibrary(lib.name);
  const sourceUrl = `https://context7.com/${lib.name}`;

  console.log(`-- ${i + 1}. ${lib.name}`);
  console.log(
    `INSERT INTO libraries (id, name, description, categories, source_type, source_url, index_status, is_featured, created_at, updated_at)`
  );
  console.log(
    `VALUES ('${id}', '${escapeSQL(lib.name)}', '${escapeSQL(lib.query)}', '${JSON.stringify(categories)}', 'context7', '${sourceUrl}', 'pending', ${i < 30 ? 1 : 0}, datetime('now'), datetime('now'))`
  );
  console.log(`ON CONFLICT(id) DO UPDATE SET updated_at = datetime('now');`);
  console.log("");
});

console.log(`-- Total: ${TOP_LIBRARIES.length} libraries`);

function getCategoriesForLibrary(name: string): string[] {
  const categoryMap: Record<string, string[]> = {
    // Frontend
    react: ["frontend"],
    vue: ["frontend"],
    svelte: ["frontend"],
    angular: ["frontend"],
    solid: ["frontend"],
    preact: ["frontend"],
    lit: ["frontend"],
    htmx: ["frontend"],
    alpine: ["frontend"],
    qwik: ["frontend"],

    // Meta frameworks
    nextjs: ["frontend", "fullstack"],
    nuxt: ["frontend", "fullstack"],
    remix: ["frontend", "fullstack"],
    astro: ["frontend"],
    sveltekit: ["frontend", "fullstack"],
    gatsby: ["frontend"],

    // Backend
    express: ["backend"],
    fastify: ["backend"],
    hono: ["backend", "cloud"],
    nestjs: ["backend"],
    koa: ["backend"],
    elysia: ["backend"],
    adonis: ["backend", "fullstack"],

    // Database
    prisma: ["database", "backend"],
    drizzle: ["database", "backend"],
    mongoose: ["database"],
    typeorm: ["database"],
    sequelize: ["database"],
    knex: ["database"],
    kysely: ["database"],

    // State
    redux: ["frontend", "utilities"],
    zustand: ["frontend", "utilities"],
    jotai: ["frontend"],
    mobx: ["frontend"],
    recoil: ["frontend"],
    pinia: ["frontend"],
    xstate: ["utilities"],

    // Testing
    jest: ["testing"],
    vitest: ["testing"],
    playwright: ["testing"],
    cypress: ["testing"],
    "testing-library": ["testing"],
    msw: ["testing"],

    // Build
    vite: ["devops", "utilities"],
    webpack: ["devops"],
    esbuild: ["devops"],
    rollup: ["devops"],
    turbo: ["devops"],
    nx: ["devops"],

    // Cloud
    "cloudflare-workers": ["cloud", "backend"],
    vercel: ["cloud"],
    "aws-sdk": ["cloud"],
    firebase: ["cloud", "backend"],
    supabase: ["database", "backend"],

    // AI
    langchain: ["ai"],
    openai: ["ai"],
    "vercel-ai": ["ai"],
    huggingface: ["ai"],

    // Mobile
    "react-native": ["mobile"],
    expo: ["mobile"],
    capacitor: ["mobile"],
    tauri: ["mobile"],
    electron: ["mobile"],
  };

  return categoryMap[name.toLowerCase()] || ["utilities"];
}

function escapeSQL(str: string): string {
  return str.replace(/'/g, "''");
}
