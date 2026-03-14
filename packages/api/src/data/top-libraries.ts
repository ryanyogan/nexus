/**
 * Curated list of top 500 libraries to sync from Context7
 * 
 * These are organized by category and prioritized by popularity/usefulness.
 * The sync service will search Context7 for each of these and store metadata.
 */

export interface LibraryEntry {
  name: string;
  searchQuery: string;
  categories: string[];
  priority: number; // 1-5, higher = more important
}

export const TOP_LIBRARIES: LibraryEntry[] = [
  // ============================================================================
  // Frontend Frameworks (Priority 5)
  // ============================================================================
  { name: "react", searchQuery: "React JavaScript UI library", categories: ["frontend"], priority: 5 },
  { name: "vue", searchQuery: "Vue.js progressive framework", categories: ["frontend"], priority: 5 },
  { name: "angular", searchQuery: "Angular TypeScript framework", categories: ["frontend"], priority: 5 },
  { name: "svelte", searchQuery: "Svelte compiler framework", categories: ["frontend"], priority: 5 },
  { name: "solid", searchQuery: "SolidJS reactive framework", categories: ["frontend"], priority: 4 },
  { name: "preact", searchQuery: "Preact lightweight React alternative", categories: ["frontend"], priority: 4 },
  { name: "lit", searchQuery: "Lit web components library", categories: ["frontend"], priority: 4 },
  { name: "htmx", searchQuery: "htmx hypermedia library", categories: ["frontend"], priority: 4 },
  { name: "alpine", searchQuery: "Alpine.js lightweight framework", categories: ["frontend"], priority: 4 },
  { name: "qwik", searchQuery: "Qwik resumable framework", categories: ["frontend"], priority: 3 },
  { name: "marko", searchQuery: "Marko UI framework", categories: ["frontend"], priority: 3 },
  { name: "stimulus", searchQuery: "Stimulus JavaScript framework", categories: ["frontend"], priority: 3 },
  { name: "mithril", searchQuery: "Mithril JavaScript framework", categories: ["frontend"], priority: 3 },
  { name: "inferno", searchQuery: "Inferno fast React-like library", categories: ["frontend"], priority: 2 },
  { name: "riot", searchQuery: "Riot.js component library", categories: ["frontend"], priority: 2 },

  // ============================================================================
  // Meta Frameworks (Priority 5)
  // ============================================================================
  { name: "nextjs", searchQuery: "Next.js React framework", categories: ["frontend", "fullstack"], priority: 5 },
  { name: "nuxt", searchQuery: "Nuxt Vue framework", categories: ["frontend", "fullstack"], priority: 5 },
  { name: "remix", searchQuery: "Remix React framework", categories: ["frontend", "fullstack"], priority: 5 },
  { name: "astro", searchQuery: "Astro content framework", categories: ["frontend"], priority: 5 },
  { name: "sveltekit", searchQuery: "SvelteKit framework", categories: ["frontend", "fullstack"], priority: 5 },
  { name: "gatsby", searchQuery: "Gatsby React framework", categories: ["frontend"], priority: 4 },
  { name: "solidstart", searchQuery: "SolidStart meta framework", categories: ["frontend", "fullstack"], priority: 3 },
  { name: "analog", searchQuery: "Analog Angular meta framework", categories: ["frontend", "fullstack"], priority: 3 },
  { name: "fresh", searchQuery: "Fresh Deno framework", categories: ["frontend", "fullstack"], priority: 3 },
  { name: "eleventy", searchQuery: "Eleventy static site generator", categories: ["frontend"], priority: 3 },
  { name: "hugo", searchQuery: "Hugo static site generator", categories: ["frontend"], priority: 3 },
  { name: "jekyll", searchQuery: "Jekyll static site generator", categories: ["frontend"], priority: 3 },

  // ============================================================================
  // Backend Frameworks - Node.js (Priority 5)
  // ============================================================================
  { name: "express", searchQuery: "Express Node.js framework", categories: ["backend"], priority: 5 },
  { name: "fastify", searchQuery: "Fastify Node.js framework", categories: ["backend"], priority: 5 },
  { name: "hono", searchQuery: "Hono edge framework", categories: ["backend", "cloud"], priority: 5 },
  { name: "nestjs", searchQuery: "NestJS Node.js framework", categories: ["backend"], priority: 5 },
  { name: "koa", searchQuery: "Koa Node.js middleware", categories: ["backend"], priority: 4 },
  { name: "elysia", searchQuery: "Elysia Bun framework", categories: ["backend"], priority: 4 },
  { name: "adonis", searchQuery: "AdonisJS framework", categories: ["backend", "fullstack"], priority: 4 },
  { name: "feathers", searchQuery: "FeathersJS framework", categories: ["backend"], priority: 3 },
  { name: "sails", searchQuery: "Sails.js MVC framework", categories: ["backend"], priority: 3 },
  { name: "loopback", searchQuery: "LoopBack framework", categories: ["backend"], priority: 3 },
  { name: "restify", searchQuery: "Restify REST framework", categories: ["backend"], priority: 3 },
  { name: "polka", searchQuery: "Polka micro web server", categories: ["backend"], priority: 2 },

  // ============================================================================
  // Backend Frameworks - Python (Priority 5)
  // ============================================================================
  { name: "django", searchQuery: "Django Python framework", categories: ["backend", "fullstack"], priority: 5 },
  { name: "flask", searchQuery: "Flask Python microframework", categories: ["backend"], priority: 5 },
  { name: "fastapi", searchQuery: "FastAPI Python framework", categories: ["backend"], priority: 5 },
  { name: "starlette", searchQuery: "Starlette ASGI framework", categories: ["backend"], priority: 4 },
  { name: "tornado", searchQuery: "Tornado Python web framework", categories: ["backend"], priority: 3 },
  { name: "pyramid", searchQuery: "Pyramid Python framework", categories: ["backend"], priority: 3 },
  { name: "bottle", searchQuery: "Bottle Python microframework", categories: ["backend"], priority: 3 },
  { name: "falcon", searchQuery: "Falcon Python REST framework", categories: ["backend"], priority: 3 },
  { name: "sanic", searchQuery: "Sanic async Python framework", categories: ["backend"], priority: 3 },
  { name: "litestar", searchQuery: "Litestar Python framework", categories: ["backend"], priority: 3 },

  // ============================================================================
  // Backend Frameworks - Go (Priority 4)
  // ============================================================================
  { name: "gin", searchQuery: "Gin Go web framework", categories: ["backend"], priority: 4 },
  { name: "echo", searchQuery: "Echo Go web framework", categories: ["backend"], priority: 4 },
  { name: "fiber", searchQuery: "Fiber Go web framework", categories: ["backend"], priority: 4 },
  { name: "chi", searchQuery: "Chi Go router", categories: ["backend"], priority: 3 },
  { name: "gorilla", searchQuery: "Gorilla web toolkit Go", categories: ["backend"], priority: 3 },
  { name: "buffalo", searchQuery: "Buffalo Go web framework", categories: ["backend"], priority: 3 },
  { name: "beego", searchQuery: "Beego Go framework", categories: ["backend"], priority: 3 },

  // ============================================================================
  // Backend Frameworks - Rust (Priority 4)
  // ============================================================================
  { name: "actix", searchQuery: "Actix Web Rust framework", categories: ["backend"], priority: 4 },
  { name: "axum", searchQuery: "Axum Rust web framework", categories: ["backend"], priority: 4 },
  { name: "rocket", searchQuery: "Rocket Rust web framework", categories: ["backend"], priority: 4 },
  { name: "warp", searchQuery: "Warp Rust web framework", categories: ["backend"], priority: 3 },
  { name: "tide", searchQuery: "Tide Rust async framework", categories: ["backend"], priority: 3 },

  // ============================================================================
  // Backend Frameworks - Ruby (Priority 4)
  // ============================================================================
  { name: "rails", searchQuery: "Ruby on Rails framework", categories: ["backend", "fullstack"], priority: 5 },
  { name: "sinatra", searchQuery: "Sinatra Ruby framework", categories: ["backend"], priority: 4 },
  { name: "hanami", searchQuery: "Hanami Ruby framework", categories: ["backend"], priority: 3 },
  { name: "grape", searchQuery: "Grape Ruby REST API", categories: ["backend"], priority: 3 },

  // ============================================================================
  // Backend Frameworks - PHP (Priority 4)
  // ============================================================================
  { name: "laravel", searchQuery: "Laravel PHP framework", categories: ["backend", "fullstack"], priority: 5 },
  { name: "symfony", searchQuery: "Symfony PHP framework", categories: ["backend"], priority: 4 },
  { name: "codeigniter", searchQuery: "CodeIgniter PHP framework", categories: ["backend"], priority: 3 },
  { name: "slim", searchQuery: "Slim PHP microframework", categories: ["backend"], priority: 3 },
  { name: "yii", searchQuery: "Yii PHP framework", categories: ["backend"], priority: 3 },
  { name: "cakephp", searchQuery: "CakePHP framework", categories: ["backend"], priority: 3 },

  // ============================================================================
  // Backend Frameworks - Java/Kotlin (Priority 4)
  // ============================================================================
  { name: "spring", searchQuery: "Spring Boot Java framework", categories: ["backend"], priority: 5 },
  { name: "quarkus", searchQuery: "Quarkus Java framework", categories: ["backend"], priority: 4 },
  { name: "micronaut", searchQuery: "Micronaut Java framework", categories: ["backend"], priority: 4 },
  { name: "ktor", searchQuery: "Ktor Kotlin framework", categories: ["backend"], priority: 4 },
  { name: "vertx", searchQuery: "Vert.x reactive toolkit", categories: ["backend"], priority: 3 },

  // ============================================================================
  // Backend Frameworks - .NET (Priority 4)
  // ============================================================================
  { name: "aspnet", searchQuery: "ASP.NET Core framework", categories: ["backend"], priority: 5 },
  { name: "blazor", searchQuery: "Blazor web framework", categories: ["frontend", "fullstack"], priority: 4 },
  { name: "minimal-apis", searchQuery: ".NET Minimal APIs", categories: ["backend"], priority: 3 },

  // ============================================================================
  // Databases & ORMs (Priority 5)
  // ============================================================================
  { name: "prisma", searchQuery: "Prisma ORM TypeScript", categories: ["database", "backend"], priority: 5 },
  { name: "drizzle", searchQuery: "Drizzle ORM SQL", categories: ["database", "backend"], priority: 5 },
  { name: "mongoose", searchQuery: "Mongoose MongoDB ODM", categories: ["database"], priority: 5 },
  { name: "typeorm", searchQuery: "TypeORM database", categories: ["database"], priority: 4 },
  { name: "sequelize", searchQuery: "Sequelize ORM Node.js", categories: ["database"], priority: 4 },
  { name: "knex", searchQuery: "Knex.js SQL builder", categories: ["database"], priority: 4 },
  { name: "kysely", searchQuery: "Kysely TypeScript SQL", categories: ["database"], priority: 4 },
  { name: "mikro-orm", searchQuery: "MikroORM TypeScript", categories: ["database"], priority: 3 },
  { name: "objection", searchQuery: "Objection.js ORM", categories: ["database"], priority: 3 },
  { name: "bookshelf", searchQuery: "Bookshelf.js ORM", categories: ["database"], priority: 2 },
  
  // Python ORMs
  { name: "sqlalchemy", searchQuery: "SQLAlchemy Python ORM", categories: ["database"], priority: 5 },
  { name: "django-orm", searchQuery: "Django ORM database", categories: ["database"], priority: 4 },
  { name: "peewee", searchQuery: "Peewee Python ORM", categories: ["database"], priority: 3 },
  { name: "tortoise-orm", searchQuery: "Tortoise ORM async Python", categories: ["database"], priority: 3 },
  
  // Database clients
  { name: "redis", searchQuery: "Redis database client", categories: ["database"], priority: 5 },
  { name: "mongodb", searchQuery: "MongoDB database driver", categories: ["database"], priority: 5 },
  { name: "postgresql", searchQuery: "PostgreSQL database", categories: ["database"], priority: 5 },
  { name: "mysql", searchQuery: "MySQL database driver", categories: ["database"], priority: 4 },
  { name: "sqlite", searchQuery: "SQLite database", categories: ["database"], priority: 4 },
  { name: "cassandra", searchQuery: "Cassandra database driver", categories: ["database"], priority: 3 },
  { name: "elasticsearch", searchQuery: "Elasticsearch client", categories: ["database"], priority: 4 },
  { name: "neo4j", searchQuery: "Neo4j graph database", categories: ["database"], priority: 3 },
  { name: "dynamodb", searchQuery: "DynamoDB AWS database", categories: ["database", "cloud"], priority: 4 },
  { name: "planetscale", searchQuery: "PlanetScale database", categories: ["database", "cloud"], priority: 3 },
  { name: "turso", searchQuery: "Turso SQLite edge database", categories: ["database", "cloud"], priority: 3 },
  { name: "neon", searchQuery: "Neon serverless Postgres", categories: ["database", "cloud"], priority: 3 },

  // ============================================================================
  // State Management (Priority 4)
  // ============================================================================
  { name: "redux", searchQuery: "Redux state management", categories: ["frontend", "utilities"], priority: 5 },
  { name: "zustand", searchQuery: "Zustand React state", categories: ["frontend", "utilities"], priority: 5 },
  { name: "jotai", searchQuery: "Jotai atomic state", categories: ["frontend"], priority: 4 },
  { name: "mobx", searchQuery: "MobX reactive state", categories: ["frontend"], priority: 4 },
  { name: "recoil", searchQuery: "Recoil Facebook state", categories: ["frontend"], priority: 3 },
  { name: "pinia", searchQuery: "Pinia Vue store", categories: ["frontend"], priority: 5 },
  { name: "vuex", searchQuery: "Vuex Vue state", categories: ["frontend"], priority: 4 },
  { name: "xstate", searchQuery: "XState state machines", categories: ["utilities"], priority: 4 },
  { name: "valtio", searchQuery: "Valtio proxy state", categories: ["frontend"], priority: 3 },
  { name: "nanostores", searchQuery: "Nano Stores state", categories: ["frontend"], priority: 3 },
  { name: "effector", searchQuery: "Effector state manager", categories: ["frontend"], priority: 3 },
  { name: "legend-state", searchQuery: "Legend State React", categories: ["frontend"], priority: 2 },

  // ============================================================================
  // Data Fetching (Priority 5)
  // ============================================================================
  { name: "tanstack-query", searchQuery: "TanStack Query React", categories: ["frontend", "utilities"], priority: 5 },
  { name: "swr", searchQuery: "SWR Vercel data fetching", categories: ["frontend"], priority: 5 },
  { name: "trpc", searchQuery: "tRPC end-to-end typesafe", categories: ["fullstack"], priority: 5 },
  { name: "apollo-client", searchQuery: "Apollo GraphQL client", categories: ["frontend"], priority: 5 },
  { name: "urql", searchQuery: "urql GraphQL client", categories: ["frontend"], priority: 4 },
  { name: "axios", searchQuery: "Axios HTTP client", categories: ["utilities"], priority: 5 },
  { name: "ky", searchQuery: "Ky HTTP client", categories: ["utilities"], priority: 3 },
  { name: "got", searchQuery: "Got HTTP client Node", categories: ["utilities"], priority: 3 },
  { name: "ofetch", searchQuery: "ofetch universal fetch", categories: ["utilities"], priority: 3 },
  { name: "graphql-request", searchQuery: "graphql-request client", categories: ["utilities"], priority: 3 },
  { name: "relay", searchQuery: "Relay GraphQL React", categories: ["frontend"], priority: 4 },

  // ============================================================================
  // Routing (Priority 4)
  // ============================================================================
  { name: "react-router", searchQuery: "React Router navigation", categories: ["frontend"], priority: 5 },
  { name: "tanstack-router", searchQuery: "TanStack Router typesafe", categories: ["frontend"], priority: 4 },
  { name: "wouter", searchQuery: "Wouter minimal router", categories: ["frontend"], priority: 3 },
  { name: "vue-router", searchQuery: "Vue Router navigation", categories: ["frontend"], priority: 5 },
  { name: "reach-router", searchQuery: "Reach Router accessible", categories: ["frontend"], priority: 2 },

  // ============================================================================
  // UI Component Libraries (Priority 5)
  // ============================================================================
  { name: "tailwindcss", searchQuery: "Tailwind CSS utility", categories: ["frontend", "styling"], priority: 5 },
  { name: "shadcn", searchQuery: "shadcn/ui components", categories: ["frontend"], priority: 5 },
  { name: "radix", searchQuery: "Radix UI primitives", categories: ["frontend"], priority: 5 },
  { name: "chakra-ui", searchQuery: "Chakra UI components", categories: ["frontend"], priority: 4 },
  { name: "material-ui", searchQuery: "Material UI React MUI", categories: ["frontend"], priority: 5 },
  { name: "ant-design", searchQuery: "Ant Design components", categories: ["frontend"], priority: 4 },
  { name: "mantine", searchQuery: "Mantine React components", categories: ["frontend"], priority: 4 },
  { name: "headless-ui", searchQuery: "Headless UI components", categories: ["frontend"], priority: 4 },
  { name: "daisyui", searchQuery: "DaisyUI Tailwind components", categories: ["frontend"], priority: 4 },
  { name: "flowbite", searchQuery: "Flowbite Tailwind components", categories: ["frontend"], priority: 3 },
  { name: "primereact", searchQuery: "PrimeReact components", categories: ["frontend"], priority: 3 },
  { name: "primevue", searchQuery: "PrimeVue components", categories: ["frontend"], priority: 3 },
  { name: "vuetify", searchQuery: "Vuetify Vue components", categories: ["frontend"], priority: 4 },
  { name: "quasar", searchQuery: "Quasar Vue framework", categories: ["frontend"], priority: 3 },
  { name: "element-plus", searchQuery: "Element Plus Vue", categories: ["frontend"], priority: 3 },
  { name: "naive-ui", searchQuery: "Naive UI Vue", categories: ["frontend"], priority: 3 },
  { name: "bootstrap", searchQuery: "Bootstrap CSS framework", categories: ["frontend", "styling"], priority: 4 },
  { name: "bulma", searchQuery: "Bulma CSS framework", categories: ["frontend", "styling"], priority: 3 },
  { name: "unocss", searchQuery: "UnoCSS atomic CSS", categories: ["frontend", "styling"], priority: 3 },
  { name: "panda-css", searchQuery: "Panda CSS styling", categories: ["frontend", "styling"], priority: 3 },
  { name: "vanilla-extract", searchQuery: "Vanilla Extract CSS", categories: ["frontend", "styling"], priority: 3 },
  { name: "stitches", searchQuery: "Stitches CSS-in-JS", categories: ["frontend", "styling"], priority: 2 },
  { name: "styled-components", searchQuery: "styled-components CSS-in-JS", categories: ["frontend", "styling"], priority: 4 },
  { name: "emotion", searchQuery: "Emotion CSS-in-JS", categories: ["frontend", "styling"], priority: 4 },

  // ============================================================================
  // Testing (Priority 5)
  // ============================================================================
  { name: "jest", searchQuery: "Jest testing framework", categories: ["testing"], priority: 5 },
  { name: "vitest", searchQuery: "Vitest testing Vite", categories: ["testing"], priority: 5 },
  { name: "playwright", searchQuery: "Playwright e2e testing", categories: ["testing"], priority: 5 },
  { name: "cypress", searchQuery: "Cypress e2e testing", categories: ["testing"], priority: 5 },
  { name: "testing-library", searchQuery: "Testing Library DOM", categories: ["testing"], priority: 5 },
  { name: "msw", searchQuery: "MSW Mock Service Worker", categories: ["testing"], priority: 4 },
  { name: "storybook", searchQuery: "Storybook UI testing", categories: ["testing", "devops"], priority: 5 },
  { name: "puppeteer", searchQuery: "Puppeteer browser automation", categories: ["testing"], priority: 4 },
  { name: "webdriverio", searchQuery: "WebdriverIO testing", categories: ["testing"], priority: 3 },
  { name: "mocha", searchQuery: "Mocha testing framework", categories: ["testing"], priority: 4 },
  { name: "chai", searchQuery: "Chai assertion library", categories: ["testing"], priority: 3 },
  { name: "sinon", searchQuery: "Sinon test spies stubs", categories: ["testing"], priority: 3 },
  { name: "supertest", searchQuery: "SuperTest HTTP testing", categories: ["testing"], priority: 3 },
  { name: "pytest", searchQuery: "Pytest Python testing", categories: ["testing"], priority: 5 },
  { name: "unittest", searchQuery: "Python unittest testing", categories: ["testing"], priority: 3 },
  { name: "rspec", searchQuery: "RSpec Ruby testing", categories: ["testing"], priority: 4 },
  { name: "phpunit", searchQuery: "PHPUnit testing", categories: ["testing"], priority: 4 },
  { name: "junit", searchQuery: "JUnit Java testing", categories: ["testing"], priority: 4 },

  // ============================================================================
  // Build Tools (Priority 5)
  // ============================================================================
  { name: "vite", searchQuery: "Vite build tool", categories: ["devops", "utilities"], priority: 5 },
  { name: "webpack", searchQuery: "Webpack bundler", categories: ["devops"], priority: 5 },
  { name: "esbuild", searchQuery: "esbuild bundler", categories: ["devops"], priority: 4 },
  { name: "rollup", searchQuery: "Rollup bundler", categories: ["devops"], priority: 4 },
  { name: "parcel", searchQuery: "Parcel bundler", categories: ["devops"], priority: 3 },
  { name: "turbopack", searchQuery: "Turbopack Vercel bundler", categories: ["devops"], priority: 4 },
  { name: "swc", searchQuery: "SWC Rust compiler", categories: ["devops"], priority: 4 },
  { name: "babel", searchQuery: "Babel JavaScript compiler", categories: ["devops"], priority: 4 },
  { name: "tsup", searchQuery: "tsup TypeScript bundler", categories: ["devops"], priority: 3 },
  { name: "unbuild", searchQuery: "unbuild library bundler", categories: ["devops"], priority: 3 },
  { name: "rspack", searchQuery: "Rspack Rust bundler", categories: ["devops"], priority: 3 },

  // ============================================================================
  // Monorepo Tools (Priority 4)
  // ============================================================================
  { name: "turborepo", searchQuery: "Turborepo monorepo build", categories: ["devops"], priority: 5 },
  { name: "nx", searchQuery: "Nx monorepo build", categories: ["devops"], priority: 5 },
  { name: "lerna", searchQuery: "Lerna monorepo", categories: ["devops"], priority: 3 },
  { name: "pnpm", searchQuery: "pnpm package manager", categories: ["devops"], priority: 5 },
  { name: "yarn", searchQuery: "Yarn package manager", categories: ["devops"], priority: 4 },
  { name: "npm", searchQuery: "npm package manager", categories: ["devops"], priority: 5 },
  { name: "bun", searchQuery: "Bun JavaScript runtime", categories: ["devops"], priority: 5 },
  { name: "deno", searchQuery: "Deno JavaScript runtime", categories: ["devops"], priority: 4 },

  // ============================================================================
  // TypeScript & Validation (Priority 5)
  // ============================================================================
  { name: "typescript", searchQuery: "TypeScript language", categories: ["utilities"], priority: 5 },
  { name: "zod", searchQuery: "Zod TypeScript validation", categories: ["utilities"], priority: 5 },
  { name: "yup", searchQuery: "Yup schema validation", categories: ["utilities"], priority: 4 },
  { name: "valibot", searchQuery: "Valibot validation", categories: ["utilities"], priority: 4 },
  { name: "typebox", searchQuery: "TypeBox JSON Schema", categories: ["utilities"], priority: 3 },
  { name: "arktype", searchQuery: "ArkType TypeScript validation", categories: ["utilities"], priority: 3 },
  { name: "superstruct", searchQuery: "Superstruct validation", categories: ["utilities"], priority: 2 },
  { name: "io-ts", searchQuery: "io-ts TypeScript runtime", categories: ["utilities"], priority: 2 },
  { name: "class-validator", searchQuery: "class-validator decorators", categories: ["utilities"], priority: 3 },
  { name: "ajv", searchQuery: "AJV JSON schema validator", categories: ["utilities"], priority: 4 },

  // ============================================================================
  // Authentication (Priority 5)
  // ============================================================================
  { name: "nextauth", searchQuery: "NextAuth.js authentication", categories: ["auth"], priority: 5 },
  { name: "authjs", searchQuery: "Auth.js authentication", categories: ["auth"], priority: 5 },
  { name: "clerk", searchQuery: "Clerk authentication", categories: ["auth"], priority: 5 },
  { name: "lucia", searchQuery: "Lucia auth library", categories: ["auth"], priority: 4 },
  { name: "passport", searchQuery: "Passport.js auth", categories: ["auth"], priority: 4 },
  { name: "better-auth", searchQuery: "Better Auth authentication", categories: ["auth"], priority: 3 },
  { name: "supertokens", searchQuery: "SuperTokens authentication", categories: ["auth"], priority: 3 },
  { name: "keycloak", searchQuery: "Keycloak identity management", categories: ["auth"], priority: 3 },
  { name: "auth0", searchQuery: "Auth0 authentication", categories: ["auth"], priority: 4 },
  { name: "okta", searchQuery: "Okta identity platform", categories: ["auth"], priority: 3 },
  { name: "firebase-auth", searchQuery: "Firebase Authentication", categories: ["auth", "cloud"], priority: 4 },
  { name: "cognito", searchQuery: "AWS Cognito authentication", categories: ["auth", "cloud"], priority: 3 },
  { name: "oauth", searchQuery: "OAuth authentication protocol", categories: ["auth"], priority: 4 },
  { name: "jwt", searchQuery: "JWT JSON Web Tokens", categories: ["auth"], priority: 4 },
  { name: "jose", searchQuery: "JOSE JWT library", categories: ["auth"], priority: 3 },

  // ============================================================================
  // Cloud Platforms (Priority 5)
  // ============================================================================
  { name: "cloudflare-workers", searchQuery: "Cloudflare Workers edge", categories: ["cloud", "backend"], priority: 5 },
  { name: "cloudflare-pages", searchQuery: "Cloudflare Pages deployment", categories: ["cloud"], priority: 4 },
  { name: "cloudflare-d1", searchQuery: "Cloudflare D1 database", categories: ["cloud", "database"], priority: 4 },
  { name: "cloudflare-r2", searchQuery: "Cloudflare R2 storage", categories: ["cloud"], priority: 4 },
  { name: "cloudflare-kv", searchQuery: "Cloudflare KV storage", categories: ["cloud"], priority: 4 },
  { name: "cloudflare-durable-objects", searchQuery: "Cloudflare Durable Objects", categories: ["cloud"], priority: 4 },
  { name: "vercel", searchQuery: "Vercel deployment platform", categories: ["cloud"], priority: 5 },
  { name: "netlify", searchQuery: "Netlify deployment platform", categories: ["cloud"], priority: 4 },
  { name: "railway", searchQuery: "Railway deployment platform", categories: ["cloud"], priority: 3 },
  { name: "render", searchQuery: "Render cloud platform", categories: ["cloud"], priority: 3 },
  { name: "fly", searchQuery: "Fly.io deployment", categories: ["cloud"], priority: 4 },

  // AWS
  { name: "aws-sdk", searchQuery: "AWS SDK JavaScript", categories: ["cloud"], priority: 5 },
  { name: "aws-cdk", searchQuery: "AWS CDK infrastructure", categories: ["cloud", "devops"], priority: 4 },
  { name: "aws-lambda", searchQuery: "AWS Lambda serverless", categories: ["cloud"], priority: 5 },
  { name: "aws-s3", searchQuery: "AWS S3 storage", categories: ["cloud"], priority: 4 },
  { name: "aws-sqs", searchQuery: "AWS SQS queue", categories: ["cloud"], priority: 3 },
  { name: "aws-sns", searchQuery: "AWS SNS notifications", categories: ["cloud"], priority: 3 },
  { name: "aws-amplify", searchQuery: "AWS Amplify fullstack", categories: ["cloud", "fullstack"], priority: 4 },

  // Google Cloud
  { name: "google-cloud", searchQuery: "Google Cloud SDK", categories: ["cloud"], priority: 4 },
  { name: "firebase", searchQuery: "Firebase Google platform", categories: ["cloud", "backend"], priority: 5 },
  { name: "firestore", searchQuery: "Firebase Firestore database", categories: ["cloud", "database"], priority: 4 },

  // Azure
  { name: "azure", searchQuery: "Azure SDK JavaScript", categories: ["cloud"], priority: 4 },
  { name: "azure-functions", searchQuery: "Azure Functions serverless", categories: ["cloud"], priority: 3 },

  // Backend as a Service
  { name: "supabase", searchQuery: "Supabase open source Firebase", categories: ["database", "backend", "cloud"], priority: 5 },
  { name: "appwrite", searchQuery: "Appwrite backend platform", categories: ["backend", "cloud"], priority: 4 },
  { name: "pocketbase", searchQuery: "PocketBase backend", categories: ["backend", "cloud"], priority: 3 },
  { name: "convex", searchQuery: "Convex reactive backend", categories: ["backend", "cloud"], priority: 4 },

  // ============================================================================
  // AI & ML (Priority 5)
  // ============================================================================
  { name: "openai", searchQuery: "OpenAI API client", categories: ["ai"], priority: 5 },
  { name: "anthropic", searchQuery: "Anthropic Claude API", categories: ["ai"], priority: 5 },
  { name: "vercel-ai", searchQuery: "Vercel AI SDK", categories: ["ai"], priority: 5 },
  { name: "langchain", searchQuery: "LangChain LLM framework", categories: ["ai"], priority: 5 },
  { name: "langchain-js", searchQuery: "LangChain JavaScript", categories: ["ai"], priority: 4 },
  { name: "llamaindex", searchQuery: "LlamaIndex data framework", categories: ["ai"], priority: 4 },
  { name: "huggingface", searchQuery: "Hugging Face transformers", categories: ["ai"], priority: 4 },
  { name: "ollama", searchQuery: "Ollama local LLM", categories: ["ai"], priority: 4 },
  { name: "transformers", searchQuery: "Transformers Python ML", categories: ["ai"], priority: 5 },
  { name: "pytorch", searchQuery: "PyTorch deep learning", categories: ["ai"], priority: 5 },
  { name: "tensorflow", searchQuery: "TensorFlow machine learning", categories: ["ai"], priority: 5 },
  { name: "scikit-learn", searchQuery: "scikit-learn ML Python", categories: ["ai"], priority: 4 },
  { name: "keras", searchQuery: "Keras deep learning", categories: ["ai"], priority: 4 },
  { name: "numpy", searchQuery: "NumPy numerical Python", categories: ["ai", "utilities"], priority: 5 },
  { name: "pandas", searchQuery: "Pandas data analysis", categories: ["ai", "utilities"], priority: 5 },
  { name: "pinecone", searchQuery: "Pinecone vector database", categories: ["ai", "database"], priority: 4 },
  { name: "weaviate", searchQuery: "Weaviate vector database", categories: ["ai", "database"], priority: 3 },
  { name: "qdrant", searchQuery: "Qdrant vector database", categories: ["ai", "database"], priority: 3 },
  { name: "chromadb", searchQuery: "ChromaDB vector database", categories: ["ai", "database"], priority: 3 },
  { name: "milvus", searchQuery: "Milvus vector database", categories: ["ai", "database"], priority: 3 },

  // ============================================================================
  // Utilities (Priority 4)
  // ============================================================================
  { name: "lodash", searchQuery: "Lodash utility library", categories: ["utilities"], priority: 5 },
  { name: "ramda", searchQuery: "Ramda functional library", categories: ["utilities"], priority: 3 },
  { name: "date-fns", searchQuery: "date-fns date utility", categories: ["utilities"], priority: 5 },
  { name: "dayjs", searchQuery: "Day.js date library", categories: ["utilities"], priority: 4 },
  { name: "moment", searchQuery: "Moment.js date library", categories: ["utilities"], priority: 3 },
  { name: "luxon", searchQuery: "Luxon date library", categories: ["utilities"], priority: 3 },
  { name: "uuid", searchQuery: "UUID generation", categories: ["utilities"], priority: 4 },
  { name: "nanoid", searchQuery: "Nano ID generation", categories: ["utilities"], priority: 4 },
  { name: "ulid", searchQuery: "ULID unique identifiers", categories: ["utilities"], priority: 3 },
  { name: "immer", searchQuery: "Immer immutable state", categories: ["utilities"], priority: 4 },
  { name: "rxjs", searchQuery: "RxJS reactive extensions", categories: ["utilities"], priority: 4 },
  { name: "fp-ts", searchQuery: "fp-ts functional TypeScript", categories: ["utilities"], priority: 3 },
  { name: "effect", searchQuery: "Effect TypeScript", categories: ["utilities"], priority: 3 },
  { name: "neverthrow", searchQuery: "neverthrow Result type", categories: ["utilities"], priority: 2 },
  { name: "ts-pattern", searchQuery: "ts-pattern matching", categories: ["utilities"], priority: 3 },
  { name: "remeda", searchQuery: "Remeda utility library", categories: ["utilities"], priority: 2 },

  // ============================================================================
  // Documentation & CMS (Priority 4)
  // ============================================================================
  { name: "docusaurus", searchQuery: "Docusaurus documentation", categories: ["frontend"], priority: 4 },
  { name: "vitepress", searchQuery: "VitePress Vue documentation", categories: ["frontend"], priority: 4 },
  { name: "nextra", searchQuery: "Nextra Next.js docs", categories: ["frontend"], priority: 4 },
  { name: "mintlify", searchQuery: "Mintlify documentation", categories: ["frontend"], priority: 3 },
  { name: "gitbook", searchQuery: "GitBook documentation", categories: ["frontend"], priority: 3 },
  { name: "readme", searchQuery: "ReadMe documentation", categories: ["frontend"], priority: 3 },
  { name: "contentlayer", searchQuery: "Contentlayer content", categories: ["frontend"], priority: 3 },
  { name: "sanity", searchQuery: "Sanity CMS", categories: ["backend"], priority: 4 },
  { name: "strapi", searchQuery: "Strapi headless CMS", categories: ["backend"], priority: 4 },
  { name: "payload", searchQuery: "Payload CMS", categories: ["backend"], priority: 4 },
  { name: "directus", searchQuery: "Directus headless CMS", categories: ["backend"], priority: 3 },
  { name: "ghost", searchQuery: "Ghost CMS blogging", categories: ["backend"], priority: 3 },
  { name: "keystonejs", searchQuery: "KeystoneJS CMS", categories: ["backend"], priority: 3 },
  { name: "contentful", searchQuery: "Contentful CMS", categories: ["backend"], priority: 4 },
  { name: "prismic", searchQuery: "Prismic CMS", categories: ["backend"], priority: 3 },
  { name: "hygraph", searchQuery: "Hygraph GraphCMS", categories: ["backend"], priority: 3 },

  // ============================================================================
  // Animation (Priority 4)
  // ============================================================================
  { name: "framer-motion", searchQuery: "Framer Motion animation", categories: ["frontend"], priority: 5 },
  { name: "gsap", searchQuery: "GSAP animation library", categories: ["frontend"], priority: 4 },
  { name: "react-spring", searchQuery: "react-spring animation", categories: ["frontend"], priority: 4 },
  { name: "motion", searchQuery: "Motion One animation", categories: ["frontend"], priority: 3 },
  { name: "animejs", searchQuery: "Anime.js animation", categories: ["frontend"], priority: 3 },
  { name: "popmotion", searchQuery: "Popmotion animation", categories: ["frontend"], priority: 2 },
  { name: "lottie", searchQuery: "Lottie animation library", categories: ["frontend"], priority: 4 },
  { name: "rive", searchQuery: "Rive interactive animation", categories: ["frontend"], priority: 3 },
  { name: "three", searchQuery: "Three.js 3D JavaScript", categories: ["frontend"], priority: 5 },
  { name: "react-three-fiber", searchQuery: "React Three Fiber 3D", categories: ["frontend"], priority: 4 },
  { name: "babylonjs", searchQuery: "Babylon.js 3D engine", categories: ["frontend"], priority: 3 },
  { name: "pixi", searchQuery: "PixiJS 2D WebGL", categories: ["frontend"], priority: 3 },
  { name: "d3", searchQuery: "D3.js data visualization", categories: ["frontend"], priority: 5 },
  { name: "echarts", searchQuery: "ECharts visualization", categories: ["frontend"], priority: 4 },
  { name: "chart.js", searchQuery: "Chart.js charting", categories: ["frontend"], priority: 4 },
  { name: "recharts", searchQuery: "Recharts React charts", categories: ["frontend"], priority: 4 },
  { name: "visx", searchQuery: "visx visualization primitives", categories: ["frontend"], priority: 3 },
  { name: "nivo", searchQuery: "Nivo React dataviz", categories: ["frontend"], priority: 3 },
  { name: "tremor", searchQuery: "Tremor React dashboards", categories: ["frontend"], priority: 3 },

  // ============================================================================
  // Forms (Priority 4)
  // ============================================================================
  { name: "react-hook-form", searchQuery: "React Hook Form", categories: ["frontend"], priority: 5 },
  { name: "formik", searchQuery: "Formik React forms", categories: ["frontend"], priority: 4 },
  { name: "vee-validate", searchQuery: "VeeValidate Vue forms", categories: ["frontend"], priority: 4 },
  { name: "react-final-form", searchQuery: "React Final Form", categories: ["frontend"], priority: 3 },
  { name: "conform", searchQuery: "Conform form validation", categories: ["frontend"], priority: 3 },
  { name: "formkit", searchQuery: "FormKit Vue forms", categories: ["frontend"], priority: 3 },

  // ============================================================================
  // Tables & Data (Priority 4)
  // ============================================================================
  { name: "tanstack-table", searchQuery: "TanStack Table headless", categories: ["frontend"], priority: 5 },
  { name: "ag-grid", searchQuery: "AG Grid data grid", categories: ["frontend"], priority: 4 },
  { name: "handsontable", searchQuery: "Handsontable spreadsheet", categories: ["frontend"], priority: 3 },
  { name: "react-data-grid", searchQuery: "React Data Grid", categories: ["frontend"], priority: 3 },
  { name: "tanstack-virtual", searchQuery: "TanStack Virtual scrolling", categories: ["frontend"], priority: 4 },
  { name: "react-window", searchQuery: "react-window virtual list", categories: ["frontend"], priority: 3 },
  { name: "react-virtualized", searchQuery: "react-virtualized efficient", categories: ["frontend"], priority: 3 },

  // ============================================================================
  // Real-time (Priority 4)
  // ============================================================================
  { name: "socket.io", searchQuery: "Socket.IO real-time", categories: ["backend", "utilities"], priority: 5 },
  { name: "pusher", searchQuery: "Pusher real-time", categories: ["backend", "cloud"], priority: 4 },
  { name: "ably", searchQuery: "Ably real-time messaging", categories: ["backend", "cloud"], priority: 3 },
  { name: "partykit", searchQuery: "PartyKit real-time", categories: ["backend", "cloud"], priority: 3 },
  { name: "liveblocks", searchQuery: "Liveblocks collaboration", categories: ["backend", "cloud"], priority: 4 },
  { name: "y-js", searchQuery: "Yjs CRDT collaboration", categories: ["utilities"], priority: 3 },
  { name: "automerge", searchQuery: "Automerge CRDT", categories: ["utilities"], priority: 3 },
  { name: "websocket", searchQuery: "WebSocket API protocol", categories: ["utilities"], priority: 4 },
  { name: "ws", searchQuery: "ws WebSocket library", categories: ["backend"], priority: 4 },
  { name: "graphql-ws", searchQuery: "graphql-ws subscriptions", categories: ["utilities"], priority: 3 },

  // ============================================================================
  // E-commerce (Priority 4)
  // ============================================================================
  { name: "shopify", searchQuery: "Shopify e-commerce API", categories: ["backend"], priority: 5 },
  { name: "shopify-hydrogen", searchQuery: "Shopify Hydrogen React", categories: ["frontend", "fullstack"], priority: 4 },
  { name: "stripe", searchQuery: "Stripe payments API", categories: ["backend"], priority: 5 },
  { name: "paypal", searchQuery: "PayPal payments API", categories: ["backend"], priority: 4 },
  { name: "medusa", searchQuery: "Medusa open source commerce", categories: ["backend", "fullstack"], priority: 4 },
  { name: "saleor", searchQuery: "Saleor headless commerce", categories: ["backend"], priority: 3 },
  { name: "vendure", searchQuery: "Vendure TypeScript commerce", categories: ["backend"], priority: 3 },
  { name: "commercejs", searchQuery: "Commerce.js headless", categories: ["backend"], priority: 3 },
  { name: "snipcart", searchQuery: "Snipcart shopping cart", categories: ["frontend"], priority: 3 },
  { name: "lemonsqueezy", searchQuery: "Lemon Squeezy payments", categories: ["backend"], priority: 3 },
  { name: "paddle", searchQuery: "Paddle payments billing", categories: ["backend"], priority: 3 },

  // ============================================================================
  // Mobile (Priority 4)
  // ============================================================================
  { name: "react-native", searchQuery: "React Native mobile", categories: ["mobile"], priority: 5 },
  { name: "expo", searchQuery: "Expo React Native", categories: ["mobile"], priority: 5 },
  { name: "capacitor", searchQuery: "Capacitor mobile apps", categories: ["mobile"], priority: 4 },
  { name: "ionic", searchQuery: "Ionic mobile framework", categories: ["mobile"], priority: 4 },
  { name: "tauri", searchQuery: "Tauri desktop apps", categories: ["mobile"], priority: 4 },
  { name: "electron", searchQuery: "Electron desktop apps", categories: ["mobile"], priority: 5 },
  { name: "flutter", searchQuery: "Flutter mobile framework", categories: ["mobile"], priority: 5 },
  { name: "swift", searchQuery: "Swift iOS development", categories: ["mobile"], priority: 4 },
  { name: "swiftui", searchQuery: "SwiftUI iOS framework", categories: ["mobile"], priority: 4 },
  { name: "kotlin", searchQuery: "Kotlin Android development", categories: ["mobile"], priority: 4 },
  { name: "jetpack-compose", searchQuery: "Jetpack Compose Android", categories: ["mobile"], priority: 4 },
  { name: "nativescript", searchQuery: "NativeScript mobile", categories: ["mobile"], priority: 3 },
  { name: "wails", searchQuery: "Wails Go desktop", categories: ["mobile"], priority: 3 },
  { name: "neutralino", searchQuery: "Neutralino lightweight desktop", categories: ["mobile"], priority: 2 },

  // ============================================================================
  // Email (Priority 3)
  // ============================================================================
  { name: "nodemailer", searchQuery: "Nodemailer email Node.js", categories: ["backend"], priority: 4 },
  { name: "resend", searchQuery: "Resend email API", categories: ["backend", "cloud"], priority: 4 },
  { name: "sendgrid", searchQuery: "SendGrid email API", categories: ["backend", "cloud"], priority: 4 },
  { name: "mailgun", searchQuery: "Mailgun email API", categories: ["backend", "cloud"], priority: 3 },
  { name: "postmark", searchQuery: "Postmark email API", categories: ["backend", "cloud"], priority: 3 },
  { name: "react-email", searchQuery: "React Email components", categories: ["frontend"], priority: 4 },
  { name: "mjml", searchQuery: "MJML email markup", categories: ["frontend"], priority: 3 },

  // ============================================================================
  // File Handling (Priority 3)
  // ============================================================================
  { name: "uploadthing", searchQuery: "UploadThing file uploads", categories: ["backend", "cloud"], priority: 4 },
  { name: "multer", searchQuery: "Multer file upload middleware", categories: ["backend"], priority: 4 },
  { name: "formidable", searchQuery: "Formidable file parsing", categories: ["backend"], priority: 3 },
  { name: "sharp", searchQuery: "Sharp image processing", categories: ["backend"], priority: 4 },
  { name: "jimp", searchQuery: "Jimp image manipulation", categories: ["backend"], priority: 3 },
  { name: "pdf-lib", searchQuery: "pdf-lib PDF generation", categories: ["utilities"], priority: 3 },
  { name: "pdfkit", searchQuery: "PDFKit document generation", categories: ["utilities"], priority: 3 },
  { name: "docx", searchQuery: "docx Word document generation", categories: ["utilities"], priority: 2 },
  { name: "exceljs", searchQuery: "ExcelJS spreadsheet", categories: ["utilities"], priority: 3 },
  { name: "papaparse", searchQuery: "PapaParse CSV parsing", categories: ["utilities"], priority: 3 },

  // ============================================================================
  // Logging & Monitoring (Priority 3)
  // ============================================================================
  { name: "winston", searchQuery: "Winston logging Node.js", categories: ["backend"], priority: 4 },
  { name: "pino", searchQuery: "Pino fast logging", categories: ["backend"], priority: 4 },
  { name: "bunyan", searchQuery: "Bunyan JSON logging", categories: ["backend"], priority: 3 },
  { name: "morgan", searchQuery: "Morgan HTTP logging", categories: ["backend"], priority: 3 },
  { name: "sentry", searchQuery: "Sentry error monitoring", categories: ["devops"], priority: 5 },
  { name: "datadog", searchQuery: "Datadog monitoring", categories: ["devops"], priority: 4 },
  { name: "newrelic", searchQuery: "New Relic monitoring", categories: ["devops"], priority: 3 },
  { name: "logrocket", searchQuery: "LogRocket session replay", categories: ["devops"], priority: 3 },
  { name: "axiom", searchQuery: "Axiom observability", categories: ["devops"], priority: 3 },
  { name: "highlight", searchQuery: "Highlight.io monitoring", categories: ["devops"], priority: 3 },

  // ============================================================================
  // CLI & Scripts (Priority 3)
  // ============================================================================
  { name: "commander", searchQuery: "Commander.js CLI", categories: ["utilities"], priority: 4 },
  { name: "yargs", searchQuery: "yargs CLI arguments", categories: ["utilities"], priority: 4 },
  { name: "inquirer", searchQuery: "Inquirer.js prompts", categories: ["utilities"], priority: 4 },
  { name: "prompts", searchQuery: "Prompts CLI input", categories: ["utilities"], priority: 3 },
  { name: "clack", searchQuery: "Clack CLI prompts", categories: ["utilities"], priority: 3 },
  { name: "chalk", searchQuery: "Chalk terminal colors", categories: ["utilities"], priority: 4 },
  { name: "picocolors", searchQuery: "picocolors terminal", categories: ["utilities"], priority: 3 },
  { name: "ora", searchQuery: "Ora CLI spinners", categories: ["utilities"], priority: 3 },
  { name: "listr", searchQuery: "Listr terminal tasks", categories: ["utilities"], priority: 2 },
  { name: "execa", searchQuery: "execa process execution", categories: ["utilities"], priority: 4 },
  { name: "zx", searchQuery: "zx shell scripting", categories: ["utilities"], priority: 4 },
  { name: "shelljs", searchQuery: "ShellJS Unix shell", categories: ["utilities"], priority: 3 },
  { name: "glob", searchQuery: "glob file matching", categories: ["utilities"], priority: 4 },
  { name: "fast-glob", searchQuery: "fast-glob file matching", categories: ["utilities"], priority: 3 },
  { name: "chokidar", searchQuery: "Chokidar file watching", categories: ["utilities"], priority: 4 },
  { name: "fs-extra", searchQuery: "fs-extra file system", categories: ["utilities"], priority: 4 },

  // ============================================================================
  // Code Quality (Priority 4)
  // ============================================================================
  { name: "eslint", searchQuery: "ESLint JavaScript linter", categories: ["devops"], priority: 5 },
  { name: "prettier", searchQuery: "Prettier code formatter", categories: ["devops"], priority: 5 },
  { name: "biome", searchQuery: "Biome formatter linter", categories: ["devops"], priority: 4 },
  { name: "stylelint", searchQuery: "Stylelint CSS linter", categories: ["devops"], priority: 3 },
  { name: "husky", searchQuery: "Husky Git hooks", categories: ["devops"], priority: 4 },
  { name: "lint-staged", searchQuery: "lint-staged staged files", categories: ["devops"], priority: 4 },
  { name: "commitlint", searchQuery: "commitlint commit messages", categories: ["devops"], priority: 3 },
  { name: "semantic-release", searchQuery: "semantic-release versioning", categories: ["devops"], priority: 3 },
  { name: "changesets", searchQuery: "Changesets versioning", categories: ["devops"], priority: 4 },
  { name: "release-it", searchQuery: "release-it automation", categories: ["devops"], priority: 2 },
  { name: "oxlint", searchQuery: "OXLint Rust linter", categories: ["devops"], priority: 3 },

  // ============================================================================
  // API & GraphQL (Priority 4)
  // ============================================================================
  { name: "graphql", searchQuery: "GraphQL query language", categories: ["backend"], priority: 5 },
  { name: "apollo-server", searchQuery: "Apollo Server GraphQL", categories: ["backend"], priority: 5 },
  { name: "graphql-yoga", searchQuery: "GraphQL Yoga server", categories: ["backend"], priority: 4 },
  { name: "pothos", searchQuery: "Pothos GraphQL schema", categories: ["backend"], priority: 3 },
  { name: "nexus", searchQuery: "Nexus GraphQL schema", categories: ["backend"], priority: 3 },
  { name: "type-graphql", searchQuery: "TypeGraphQL decorators", categories: ["backend"], priority: 3 },
  { name: "mercurius", searchQuery: "Mercurius Fastify GraphQL", categories: ["backend"], priority: 3 },
  { name: "graphql-codegen", searchQuery: "GraphQL Code Generator", categories: ["devops"], priority: 4 },
  { name: "gql-tag", searchQuery: "graphql-tag template literals", categories: ["utilities"], priority: 3 },
  { name: "swagger", searchQuery: "Swagger OpenAPI", categories: ["backend"], priority: 4 },
  { name: "openapi", searchQuery: "OpenAPI specification", categories: ["backend"], priority: 4 },
  { name: "tsoa", searchQuery: "TSOA TypeScript OpenAPI", categories: ["backend"], priority: 3 },
  { name: "hapi", searchQuery: "Hapi Node.js framework", categories: ["backend"], priority: 3 },

  // ============================================================================
  // Caching & Queues (Priority 3)
  // ============================================================================
  { name: "ioredis", searchQuery: "ioredis Redis client", categories: ["database"], priority: 4 },
  { name: "bullmq", searchQuery: "BullMQ job queue", categories: ["backend"], priority: 4 },
  { name: "bee-queue", searchQuery: "Bee-Queue job processing", categories: ["backend"], priority: 2 },
  { name: "agenda", searchQuery: "Agenda job scheduling", categories: ["backend"], priority: 2 },
  { name: "node-cron", searchQuery: "node-cron scheduling", categories: ["backend"], priority: 3 },
  { name: "cron", searchQuery: "cron job scheduling", categories: ["backend"], priority: 3 },
  { name: "temporal", searchQuery: "Temporal workflow engine", categories: ["backend"], priority: 3 },
  { name: "inngest", searchQuery: "Inngest event-driven", categories: ["backend", "cloud"], priority: 3 },
  { name: "trigger-dev", searchQuery: "Trigger.dev background jobs", categories: ["backend", "cloud"], priority: 3 },
  { name: "quirrel", searchQuery: "Quirrel job scheduling", categories: ["backend"], priority: 2 },

  // ============================================================================
  // Security (Priority 4)
  // ============================================================================
  { name: "helmet", searchQuery: "Helmet Express security", categories: ["backend"], priority: 4 },
  { name: "cors", searchQuery: "CORS Express middleware", categories: ["backend"], priority: 4 },
  { name: "csurf", searchQuery: "CSRF protection", categories: ["backend"], priority: 3 },
  { name: "rate-limiter", searchQuery: "rate-limiter Express", categories: ["backend"], priority: 3 },
  { name: "bcrypt", searchQuery: "bcrypt password hashing", categories: ["backend"], priority: 4 },
  { name: "argon2", searchQuery: "Argon2 password hashing", categories: ["backend"], priority: 4 },
  { name: "crypto-js", searchQuery: "CryptoJS encryption", categories: ["utilities"], priority: 3 },
  { name: "sodium", searchQuery: "libsodium encryption", categories: ["utilities"], priority: 3 },

  // ============================================================================
  // Internationalization (Priority 3)
  // ============================================================================
  { name: "i18next", searchQuery: "i18next internationalization", categories: ["utilities"], priority: 4 },
  { name: "react-intl", searchQuery: "React Intl formatting", categories: ["frontend"], priority: 4 },
  { name: "formatjs", searchQuery: "FormatJS internationalization", categories: ["utilities"], priority: 3 },
  { name: "vue-i18n", searchQuery: "Vue I18n localization", categories: ["frontend"], priority: 4 },
  { name: "lingui", searchQuery: "Lingui internationalization", categories: ["utilities"], priority: 3 },
  { name: "next-intl", searchQuery: "next-intl Next.js i18n", categories: ["frontend"], priority: 3 },
  { name: "paraglide", searchQuery: "Paraglide i18n compiler", categories: ["utilities"], priority: 2 },

  // ============================================================================
  // Markdown & Rich Text (Priority 3)
  // ============================================================================
  { name: "marked", searchQuery: "Marked Markdown parser", categories: ["utilities"], priority: 4 },
  { name: "remark", searchQuery: "remark Markdown processor", categories: ["utilities"], priority: 4 },
  { name: "rehype", searchQuery: "rehype HTML processor", categories: ["utilities"], priority: 3 },
  { name: "mdx", searchQuery: "MDX Markdown JSX", categories: ["frontend"], priority: 4 },
  { name: "markdown-it", searchQuery: "markdown-it parser", categories: ["utilities"], priority: 3 },
  { name: "showdown", searchQuery: "Showdown Markdown", categories: ["utilities"], priority: 2 },
  { name: "tiptap", searchQuery: "Tiptap rich text editor", categories: ["frontend"], priority: 4 },
  { name: "prosemirror", searchQuery: "ProseMirror editor toolkit", categories: ["frontend"], priority: 4 },
  { name: "slate", searchQuery: "Slate rich text framework", categories: ["frontend"], priority: 4 },
  { name: "lexical", searchQuery: "Lexical text editor", categories: ["frontend"], priority: 4 },
  { name: "quill", searchQuery: "Quill rich text editor", categories: ["frontend"], priority: 3 },
  { name: "draft-js", searchQuery: "Draft.js React editor", categories: ["frontend"], priority: 3 },
  { name: "editorjs", searchQuery: "Editor.js block editor", categories: ["frontend"], priority: 3 },
  { name: "milkdown", searchQuery: "Milkdown Markdown editor", categories: ["frontend"], priority: 2 },
  { name: "novel", searchQuery: "Novel AI editor", categories: ["frontend"], priority: 3 },

  // ============================================================================
  // Drag & Drop (Priority 3)
  // ============================================================================
  { name: "dnd-kit", searchQuery: "dnd kit drag drop React", categories: ["frontend"], priority: 4 },
  { name: "react-beautiful-dnd", searchQuery: "react-beautiful-dnd", categories: ["frontend"], priority: 3 },
  { name: "react-dnd", searchQuery: "React DnD drag drop", categories: ["frontend"], priority: 3 },
  { name: "sortablejs", searchQuery: "SortableJS drag sort", categories: ["frontend"], priority: 3 },
  { name: "dragula", searchQuery: "Dragula drag drop", categories: ["frontend"], priority: 2 },
  { name: "pragmatic-drag-and-drop", searchQuery: "Pragmatic drag drop Atlassian", categories: ["frontend"], priority: 3 },

  // ============================================================================
  // Modals & Tooltips (Priority 3)
  // ============================================================================
  { name: "floating-ui", searchQuery: "Floating UI positioning", categories: ["frontend"], priority: 4 },
  { name: "popper", searchQuery: "Popper.js tooltips", categories: ["frontend"], priority: 3 },
  { name: "tippy", searchQuery: "Tippy.js tooltips", categories: ["frontend"], priority: 3 },
  { name: "react-modal", searchQuery: "React Modal dialog", categories: ["frontend"], priority: 3 },
  { name: "react-aria", searchQuery: "React Aria accessibility", categories: ["frontend"], priority: 4 },
  { name: "ariakit", searchQuery: "Ariakit accessible components", categories: ["frontend"], priority: 3 },
  { name: "cmdk", searchQuery: "cmdk command menu", categories: ["frontend"], priority: 3 },
  { name: "kbar", searchQuery: "kbar command palette", categories: ["frontend"], priority: 2 },

  // ============================================================================
  // Date Pickers & Calendars (Priority 3)
  // ============================================================================
  { name: "react-datepicker", searchQuery: "React Datepicker", categories: ["frontend"], priority: 3 },
  { name: "react-day-picker", searchQuery: "React Day Picker", categories: ["frontend"], priority: 3 },
  { name: "fullcalendar", searchQuery: "FullCalendar JavaScript", categories: ["frontend"], priority: 3 },
  { name: "react-big-calendar", searchQuery: "React Big Calendar", categories: ["frontend"], priority: 3 },

  // ============================================================================
  // Maps (Priority 3)
  // ============================================================================
  { name: "mapbox", searchQuery: "Mapbox GL JS", categories: ["frontend"], priority: 4 },
  { name: "leaflet", searchQuery: "Leaflet map library", categories: ["frontend"], priority: 4 },
  { name: "react-map-gl", searchQuery: "react-map-gl Mapbox", categories: ["frontend"], priority: 3 },
  { name: "google-maps", searchQuery: "Google Maps JavaScript API", categories: ["frontend"], priority: 4 },
  { name: "openlayers", searchQuery: "OpenLayers mapping", categories: ["frontend"], priority: 3 },
  { name: "deck-gl", searchQuery: "deck.gl visualization", categories: ["frontend"], priority: 3 },

  // ============================================================================
  // Media (Priority 3)
  // ============================================================================
  { name: "video-js", searchQuery: "Video.js HTML5 player", categories: ["frontend"], priority: 3 },
  { name: "plyr", searchQuery: "Plyr media player", categories: ["frontend"], priority: 3 },
  { name: "howler", searchQuery: "Howler.js audio library", categories: ["frontend"], priority: 3 },
  { name: "tone", searchQuery: "Tone.js Web Audio", categories: ["frontend"], priority: 3 },
  { name: "wavesurfer", searchQuery: "wavesurfer.js audio waveform", categories: ["frontend"], priority: 2 },
  { name: "cloudinary", searchQuery: "Cloudinary media management", categories: ["cloud"], priority: 4 },
  { name: "imgix", searchQuery: "imgix image optimization", categories: ["cloud"], priority: 3 },

  // ============================================================================
  // Infrastructure as Code (Priority 3)
  // ============================================================================
  { name: "terraform", searchQuery: "Terraform infrastructure", categories: ["devops"], priority: 5 },
  { name: "pulumi", searchQuery: "Pulumi infrastructure code", categories: ["devops"], priority: 4 },
  { name: "ansible", searchQuery: "Ansible automation", categories: ["devops"], priority: 4 },
  { name: "docker", searchQuery: "Docker containerization", categories: ["devops"], priority: 5 },
  { name: "kubernetes", searchQuery: "Kubernetes container orchestration", categories: ["devops"], priority: 5 },
  { name: "helm", searchQuery: "Helm Kubernetes charts", categories: ["devops"], priority: 4 },
  { name: "github-actions", searchQuery: "GitHub Actions CI/CD", categories: ["devops"], priority: 5 },
  { name: "circleci", searchQuery: "CircleCI CI/CD", categories: ["devops"], priority: 3 },
  { name: "jenkins", searchQuery: "Jenkins CI/CD", categories: ["devops"], priority: 3 },

  // ============================================================================
  // WebAssembly (Priority 2)
  // ============================================================================
  { name: "wasm", searchQuery: "WebAssembly Wasm", categories: ["utilities"], priority: 3 },
  { name: "wasmer", searchQuery: "Wasmer WebAssembly runtime", categories: ["utilities"], priority: 2 },
  { name: "wasmtime", searchQuery: "Wasmtime WebAssembly", categories: ["utilities"], priority: 2 },
  { name: "emscripten", searchQuery: "Emscripten WebAssembly compiler", categories: ["devops"], priority: 2 },

  // ============================================================================
  // Web APIs (Priority 3)
  // ============================================================================
  { name: "service-worker", searchQuery: "Service Worker API", categories: ["frontend"], priority: 3 },
  { name: "workbox", searchQuery: "Workbox PWA service worker", categories: ["frontend"], priority: 4 },
  { name: "pwa", searchQuery: "Progressive Web App PWA", categories: ["frontend"], priority: 3 },
  { name: "web-push", searchQuery: "Web Push notifications", categories: ["backend"], priority: 3 },
  { name: "webrtc", searchQuery: "WebRTC real-time communication", categories: ["utilities"], priority: 3 },
  { name: "web-crypto", searchQuery: "Web Crypto API", categories: ["utilities"], priority: 2 },
  { name: "indexeddb", searchQuery: "IndexedDB browser storage", categories: ["frontend"], priority: 3 },
  { name: "dexie", searchQuery: "Dexie.js IndexedDB wrapper", categories: ["frontend"], priority: 3 },
  { name: "localforage", searchQuery: "localForage storage", categories: ["frontend"], priority: 3 },

  // ============================================================================
  // Accessibility (Priority 3)
  // ============================================================================
  { name: "axe-core", searchQuery: "axe-core accessibility testing", categories: ["testing"], priority: 4 },
  { name: "pa11y", searchQuery: "Pa11y accessibility testing", categories: ["testing"], priority: 3 },
  { name: "lighthouse", searchQuery: "Lighthouse web auditing", categories: ["testing", "devops"], priority: 4 },
  { name: "focus-trap", searchQuery: "focus-trap accessibility", categories: ["frontend"], priority: 3 },

  // ============================================================================
  // SEO (Priority 3)
  // ============================================================================
  { name: "next-seo", searchQuery: "next-seo Next.js SEO", categories: ["frontend"], priority: 4 },
  { name: "react-helmet", searchQuery: "React Helmet head management", categories: ["frontend"], priority: 3 },
  { name: "schema-dts", searchQuery: "schema-dts structured data", categories: ["utilities"], priority: 2 },

  // ============================================================================
  // Miscellaneous (Priority 2-3)
  // ============================================================================
  { name: "qrcode", searchQuery: "QRCode generation JavaScript", categories: ["utilities"], priority: 3 },
  { name: "barcode", searchQuery: "JsBarcode barcode generation", categories: ["utilities"], priority: 2 },
  { name: "json5", searchQuery: "JSON5 JavaScript object notation", categories: ["utilities"], priority: 2 },
  { name: "yaml", searchQuery: "YAML JavaScript parser", categories: ["utilities"], priority: 3 },
  { name: "toml", searchQuery: "TOML parser JavaScript", categories: ["utilities"], priority: 2 },
  { name: "dotenv", searchQuery: "dotenv environment variables", categories: ["utilities"], priority: 4 },
  { name: "env-schema", searchQuery: "env-schema validation", categories: ["utilities"], priority: 2 },
  { name: "envalid", searchQuery: "envalid env validation", categories: ["utilities"], priority: 2 },
  { name: "cross-env", searchQuery: "cross-env environment", categories: ["devops"], priority: 3 },
  { name: "debug", searchQuery: "debug debugging utility", categories: ["utilities"], priority: 3 },
  { name: "bottleneck", searchQuery: "Bottleneck rate limiter", categories: ["utilities"], priority: 3 },
  { name: "p-limit", searchQuery: "p-limit concurrency", categories: ["utilities"], priority: 3 },
  { name: "async", searchQuery: "Async utility functions", categories: ["utilities"], priority: 3 },
  { name: "eventemitter3", searchQuery: "EventEmitter3 events", categories: ["utilities"], priority: 3 },
  { name: "mitt", searchQuery: "mitt event emitter", categories: ["utilities"], priority: 2 },
];

// Helper to get libraries by category
export function getLibrariesByCategory(category: string): LibraryEntry[] {
  return TOP_LIBRARIES.filter(lib => lib.categories.includes(category));
}

// Helper to get libraries by priority
export function getLibrariesByPriority(minPriority: number): LibraryEntry[] {
  return TOP_LIBRARIES.filter(lib => lib.priority >= minPriority);
}

// Total count
export const LIBRARY_COUNT = TOP_LIBRARIES.length;
