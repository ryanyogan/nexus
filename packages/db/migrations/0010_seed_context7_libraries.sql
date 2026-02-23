-- Seed top 200 libraries from Context7
-- This migration adds popular libraries, frameworks, and knowledgebases

-- Frontend Frameworks
INSERT OR IGNORE INTO libraries (id, name, description, source_type, context7_id, source_url, categories, index_status, is_active, is_featured, total_chunks, total_tokens, created_at, updated_at)
VALUES 
  ('angular', 'Angular', 'A fully-featured, reactive framework for building scalable, performant, and reliable web applications with TypeScript.', 'context7', '/websites/v18_angular_dev', 'https://angular.dev', '["frontend", "fullstack"]', 'pending', 1, 1, 0, 0, datetime('now'), datetime('now')),
  ('remix', 'Remix', 'A full-stack web framework that lets you focus on the user experience, delivering best-in-class performance.', 'context7', '/websites/v2_remix_run', 'https://remix.run', '["frontend", "fullstack"]', 'pending', 1, 1, 0, 0, datetime('now'), datetime('now')),
  ('nuxt', 'Nuxt', 'A free and open-source framework for building type-safe, performant full-stack web applications with Vue.js.', 'context7', '/llmstxt/nuxt_llms_txt', 'https://nuxt.com', '["frontend", "fullstack"]', 'pending', 1, 1, 0, 0, datetime('now'), datetime('now')),
  ('astro', 'Astro', 'An all-in-one web framework for building fast, content-focused websites with island architecture.', 'context7', '/llmstxt/astro_build_llms_txt', 'https://astro.build', '["frontend"]', 'pending', 1, 1, 0, 0, datetime('now'), datetime('now')),
  ('preact', 'Preact', 'Fast 3kB alternative to React with the same modern API.', 'context7', '/preactjs/preact', 'https://preactjs.com', '["frontend"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('qwik', 'Qwik', 'A new kind of web framework that can deliver instant loading web applications at any size or complexity.', 'context7', '/qwikdev/qwik', 'https://qwik.dev', '["frontend"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('htmx', 'htmx', 'High power tools for HTML - access AJAX, CSS Transitions, WebSockets and SSE directly from HTML.', 'context7', '/bigskysoftware/htmx', 'https://htmx.org', '["frontend"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('alpinejs', 'Alpine.js', 'A lightweight JavaScript framework for composing behavior directly in your markup.', 'context7', '/alpinejs/alpine', 'https://alpinejs.dev', '["frontend"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('lit', 'Lit', 'Simple, fast web components with declarative templates.', 'context7', '/lit/lit', 'https://lit.dev', '["frontend"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('ember', 'Ember.js', 'A framework for ambitious web developers building full-featured web applications.', 'context7', '/emberjs/ember.js', 'https://emberjs.com', '["frontend", "fullstack"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),

-- Backend Frameworks  
  ('nestjs', 'NestJS', 'A progressive Node.js framework for building efficient and scalable server-side applications.', 'context7', '/nestjs/docs.nestjs.com', 'https://nestjs.com', '["backend"]', 'pending', 1, 1, 0, 0, datetime('now'), datetime('now')),
  ('koa', 'Koa', 'Expressive HTTP middleware framework for Node.js to make web applications and APIs more enjoyable.', 'context7', '/koajs/koa', 'https://koajs.com', '["backend"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('adonis', 'AdonisJS', 'A TypeScript-first web framework for building production-ready Node.js applications.', 'context7', '/adonisjs/core', 'https://adonisjs.com', '["backend", "fullstack"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('elysia', 'Elysia', 'Ergonomic Framework for Humans using Bun with TypeScript.', 'context7', '/elysiajs/elysia', 'https://elysiajs.com', '["backend"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  
-- Databases & ORMs
  ('supabase', 'Supabase', 'The open-source Firebase alternative providing database, auth, storage, and edge functions.', 'context7', '/supabase/supabase', 'https://supabase.com', '["database", "backend"]', 'pending', 1, 1, 0, 0, datetime('now'), datetime('now')),
  ('firebase', 'Firebase', 'A comprehensive platform providing tools and infrastructure for building mobile and web applications.', 'context7', '/websites/firebase_google', 'https://firebase.google.com', '["database", "backend", "cloud"]', 'pending', 1, 1, 0, 0, datetime('now'), datetime('now')),
  ('mongodb', 'MongoDB', 'A document database designed for ease of development and scaling.', 'context7', '/mongodb/docs', 'https://www.mongodb.com', '["database"]', 'pending', 1, 1, 0, 0, datetime('now'), datetime('now')),
  ('redis', 'Redis', 'An in-memory data structure store used as a database, cache, and message broker.', 'context7', '/websites/redis_io', 'https://redis.io', '["database"]', 'pending', 1, 1, 0, 0, datetime('now'), datetime('now')),
  ('postgresql', 'PostgreSQL', 'The world''s most advanced open source relational database.', 'context7', '/postgres/postgres', 'https://www.postgresql.org', '["database"]', 'pending', 1, 1, 0, 0, datetime('now'), datetime('now')),
  ('mysql', 'MySQL', 'The world''s most popular open source database.', 'context7', '/mysql/mysql-server', 'https://www.mysql.com', '["database"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('planetscale', 'PlanetScale', 'The database for developers - serverless MySQL platform.', 'context7', '/planetscale/docs', 'https://planetscale.com', '["database", "cloud"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('turso', 'Turso', 'SQLite for production - a globally distributed database built on libSQL.', 'context7', '/tursodatabase/libsql', 'https://turso.tech', '["database", "cloud"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('typeorm', 'TypeORM', 'ORM for TypeScript and JavaScript supporting various SQL databases.', 'context7', '/typeorm/typeorm', 'https://typeorm.io', '["database", "backend"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('sequelize', 'Sequelize', 'A promise-based Node.js ORM for various SQL dialects.', 'context7', '/sequelize/sequelize', 'https://sequelize.org', '["database", "backend"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('knex', 'Knex.js', 'A SQL query builder for various database clients.', 'context7', '/knex/knex', 'https://knexjs.org', '["database", "backend"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('kysely', 'Kysely', 'A type-safe TypeScript SQL query builder.', 'context7', '/kysely-org/kysely', 'https://kysely.dev', '["database", "backend"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),

-- Testing
  ('jest', 'Jest', 'A delightful JavaScript Testing Framework with a focus on simplicity.', 'context7', '/jestjs/jest', 'https://jestjs.io', '["testing"]', 'pending', 1, 1, 0, 0, datetime('now'), datetime('now')),
  ('cypress', 'Cypress', 'A next-generation front-end testing tool for modern web applications.', 'context7', '/cypress-io/cypress-documentation', 'https://cypress.io', '["testing"]', 'pending', 1, 1, 0, 0, datetime('now'), datetime('now')),
  ('testing-library', 'Testing Library', 'Simple and complete testing utilities that encourage good testing practices.', 'context7', '/testing-library/dom-testing-library', 'https://testing-library.com', '["testing"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('mocha', 'Mocha', 'A feature-rich JavaScript test framework for Node.js and browsers.', 'context7', '/mochajs/mocha', 'https://mochajs.org', '["testing"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('puppeteer', 'Puppeteer', 'A Node.js library providing a high-level API to control Chrome/Chromium.', 'context7', '/puppeteer/puppeteer', 'https://pptr.dev', '["testing", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),

-- State Management
  ('redux', 'Redux', 'A predictable state container for JavaScript apps.', 'context7', '/reduxjs/redux', 'https://redux.js.org', '["frontend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('mobx', 'MobX', 'Simple, scalable state management for JavaScript.', 'context7', '/mobxjs/mobx', 'https://mobx.js.org', '["frontend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('jotai', 'Jotai', 'Primitive and flexible state management for React.', 'context7', '/pmndrs/jotai', 'https://jotai.org', '["frontend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('recoil', 'Recoil', 'A state management library for React from Facebook.', 'context7', '/facebookexperimental/Recoil', 'https://recoiljs.org', '["frontend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('pinia', 'Pinia', 'The intuitive store for Vue.js.', 'context7', '/vuejs/pinia', 'https://pinia.vuejs.org', '["frontend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('xstate', 'XState', 'State machines and statecharts for the modern web.', 'context7', '/statelyai/xstate', 'https://xstate.js.org', '["frontend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('valtio', 'Valtio', 'Proxy-based state management for React and vanilla JS.', 'context7', '/pmndrs/valtio', 'https://valtio.pmnd.rs', '["frontend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),

-- AI & ML
  ('openai', 'OpenAI', 'The OpenAI API for accessing AI models like GPT-4.', 'context7', '/openai/openai-node', 'https://platform.openai.com', '["ai"]', 'pending', 1, 1, 0, 0, datetime('now'), datetime('now')),
  ('anthropic', 'Anthropic', 'The Claude AI SDK for building with Anthropic''s language models.', 'context7', '/anthropics/anthropic-sdk-python', 'https://anthropic.com', '["ai"]', 'pending', 1, 1, 0, 0, datetime('now'), datetime('now')),
  ('huggingface', 'Hugging Face', 'The AI community building the future with open source ML.', 'context7', '/huggingface/transformers', 'https://huggingface.co', '["ai"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('ollama', 'Ollama', 'Get up and running with large language models locally.', 'context7', '/ollama/ollama', 'https://ollama.ai', '["ai"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('replicate', 'Replicate', 'Run machine learning models with a cloud API.', 'context7', '/replicate/replicate-python', 'https://replicate.com', '["ai", "cloud"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('tensorflow', 'TensorFlow.js', 'Machine learning for JavaScript and TypeScript.', 'context7', '/tensorflow/tfjs', 'https://www.tensorflow.org/js', '["ai"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),

-- Cloud & DevOps
  ('aws-amplify', 'AWS Amplify', 'A fullstack development platform for building scalable mobile and web apps on AWS.', 'context7', '/websites/amplify_aws', 'https://docs.amplify.aws', '["cloud", "fullstack"]', 'pending', 1, 1, 0, 0, datetime('now'), datetime('now')),
  ('vercel', 'Vercel', 'The Frontend Cloud for building, scaling, and securing applications.', 'context7', '/vercel/vercel', 'https://vercel.com', '["cloud", "devops"]', 'pending', 1, 1, 0, 0, datetime('now'), datetime('now')),
  ('netlify', 'Netlify', 'A platform for building, deploying, and scaling web applications.', 'context7', '/netlify/cli', 'https://www.netlify.com', '["cloud", "devops"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('docker', 'Docker', 'A platform for developing, shipping, and running applications in containers.', 'context7', '/websites/docker', 'https://www.docker.com', '["devops"]', 'pending', 1, 1, 0, 0, datetime('now'), datetime('now')),
  ('kubernetes', 'Kubernetes', 'Production-grade container orchestration and management.', 'context7', '/websites/kubernetes_io', 'https://kubernetes.io', '["devops", "cloud"]', 'pending', 1, 1, 0, 0, datetime('now'), datetime('now')),
  ('terraform', 'Terraform', 'Infrastructure as code for provisioning cloud resources.', 'context7', '/hashicorp/terraform', 'https://www.terraform.io', '["devops", "cloud"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('github-actions', 'GitHub Actions', 'Automate your build, test, and deployment pipeline.', 'context7', '/actions/toolkit', 'https://docs.github.com/actions', '["devops"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('pulumi', 'Pulumi', 'Infrastructure as code in any programming language.', 'context7', '/pulumi/pulumi', 'https://www.pulumi.com', '["devops", "cloud"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),

-- Build Tools & Bundlers  
  ('vite', 'Vite', 'Next generation frontend tooling with instant server start and lightning fast HMR.', 'context7', '/vitejs/vite', 'https://vitejs.dev', '["utilities", "devops"]', 'pending', 1, 1, 0, 0, datetime('now'), datetime('now')),
  ('webpack', 'webpack', 'A static module bundler for modern JavaScript applications.', 'context7', '/webpack/webpack', 'https://webpack.js.org', '["utilities", "devops"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('rollup', 'Rollup', 'A module bundler for JavaScript which compiles small pieces of code.', 'context7', '/rollup/rollup', 'https://rollupjs.org', '["utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('esbuild', 'esbuild', 'An extremely fast bundler for the web.', 'context7', '/evanw/esbuild', 'https://esbuild.github.io', '["utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('swc', 'SWC', 'A super-fast TypeScript/JavaScript compiler written in Rust.', 'context7', '/swc-project/swc', 'https://swc.rs', '["utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('turbopack', 'Turbopack', 'Incremental bundler and build system optimized for JavaScript.', 'context7', '/vercel/turbo', 'https://turbo.build/pack', '["utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('turborepo', 'Turborepo', 'A high-performance build system for JavaScript and TypeScript monorepos.', 'context7', '/vercel/turborepo', 'https://turbo.build/repo', '["utilities", "devops"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('nx', 'Nx', 'Smart monorepo tooling with powerful caching and code generation.', 'context7', '/nrwl/nx', 'https://nx.dev', '["utilities", "devops"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('pnpm', 'pnpm', 'Fast, disk space efficient package manager.', 'context7', '/pnpm/pnpm', 'https://pnpm.io', '["utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('bun', 'Bun', 'A fast JavaScript runtime, bundler, test runner, and package manager.', 'context7', '/oven-sh/bun', 'https://bun.sh', '["utilities", "backend"]', 'pending', 1, 1, 0, 0, datetime('now'), datetime('now')),
  ('deno', 'Deno', 'A modern runtime for JavaScript and TypeScript.', 'context7', '/denoland/deno', 'https://deno.land', '["utilities", "backend"]', 'pending', 1, 1, 0, 0, datetime('now'), datetime('now')),

-- UI Libraries & Styling
  ('chakra', 'Chakra UI', 'A simple, modular and accessible component library for React.', 'context7', '/chakra-ui/chakra-ui', 'https://chakra-ui.com', '["frontend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('mantine', 'Mantine', 'A fully featured React components library with native dark theme support.', 'context7', '/mantinedev/mantine', 'https://mantine.dev', '["frontend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('radix', 'Radix UI', 'Unstyled, accessible components for building design systems.', 'context7', '/radix-ui/primitives', 'https://www.radix-ui.com', '["frontend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('shadcn', 'shadcn/ui', 'Beautifully designed components built with Radix UI and Tailwind CSS.', 'context7', '/shadcn-ui/ui', 'https://ui.shadcn.com', '["frontend", "utilities"]', 'pending', 1, 1, 0, 0, datetime('now'), datetime('now')),
  ('headlessui', 'Headless UI', 'Completely unstyled, accessible UI components.', 'context7', '/tailwindlabs/headlessui', 'https://headlessui.com', '["frontend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('mui', 'Material UI', 'Ready-to-use React components following Material Design.', 'context7', '/mui/material-ui', 'https://mui.com', '["frontend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('antdesign', 'Ant Design', 'A design system for enterprise-level products.', 'context7', '/ant-design/ant-design', 'https://ant.design', '["frontend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('bootstrap', 'Bootstrap', 'The most popular CSS framework for responsive, mobile-first projects.', 'context7', '/twbs/bootstrap', 'https://getbootstrap.com', '["frontend"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('bulma', 'Bulma', 'A free, open source CSS framework based on Flexbox.', 'context7', '/jgthms/bulma', 'https://bulma.io', '["frontend"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('sass', 'Sass', 'The most mature, stable, and powerful CSS extension language.', 'context7', '/sass/sass', 'https://sass-lang.com', '["frontend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('postcss', 'PostCSS', 'A tool for transforming CSS with JavaScript plugins.', 'context7', '/postcss/postcss', 'https://postcss.org', '["frontend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('stylex', 'StyleX', 'An expressive, deterministic, reliable, and scalable styling system for UI.', 'context7', '/facebook/stylex', 'https://stylexjs.com', '["frontend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('vanilla-extract', 'vanilla-extract', 'Zero-runtime Stylesheets-in-TypeScript.', 'context7', '/vanilla-extract-css/vanilla-extract', 'https://vanilla-extract.style', '["frontend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),

-- Animation & Graphics
  ('framer-motion', 'Framer Motion', 'A production-ready motion library for React.', 'context7', '/framer/motion', 'https://www.framer.com/motion', '["frontend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('gsap', 'GSAP', 'Professional-grade animation for the modern web.', 'context7', '/greensock/GSAP', 'https://greensock.com/gsap', '["frontend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('threejs', 'Three.js', '3D graphics library for the web.', 'context7', '/mrdoob/three.js', 'https://threejs.org', '["frontend"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('d3', 'D3.js', 'Data-Driven Documents - bring data to life with SVG, Canvas and HTML.', 'context7', '/d3/d3', 'https://d3js.org', '["frontend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('recharts', 'Recharts', 'A composable charting library built on React components.', 'context7', '/recharts/recharts', 'https://recharts.org', '["frontend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('chart-js', 'Chart.js', 'Simple yet flexible JavaScript charting library.', 'context7', '/chartjs/Chart.js', 'https://www.chartjs.org', '["frontend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),

-- Forms & Validation  
  ('react-hook-form', 'React Hook Form', 'Performant, flexible and extensible forms with easy-to-use validation.', 'context7', '/react-hook-form/react-hook-form', 'https://react-hook-form.com', '["frontend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('formik', 'Formik', 'Build forms in React with less code.', 'context7', '/jaredpalmer/formik', 'https://formik.org', '["frontend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('yup', 'Yup', 'Schema builder for runtime value parsing and validation.', 'context7', '/jquense/yup', 'https://github.com/jquense/yup', '["utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('valibot', 'Valibot', 'The modular and type safe schema library.', 'context7', '/fabian-hiller/valibot', 'https://valibot.dev', '["utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),

-- Authentication & Authorization
  ('nextauth', 'NextAuth.js', 'Authentication for Next.js with support for many providers.', 'context7', '/nextauthjs/next-auth', 'https://next-auth.js.org', '["backend", "fullstack"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('clerk', 'Clerk', 'User management and authentication for modern applications.', 'context7', '/clerkinc/javascript', 'https://clerk.com', '["backend", "fullstack"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('lucia', 'Lucia', 'A simple and flexible authentication library for TypeScript.', 'context7', '/lucia-auth/lucia', 'https://lucia-auth.com', '["backend"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('auth0', 'Auth0', 'The login solution for modern applications.', 'context7', '/auth0/auth0.js', 'https://auth0.com', '["backend", "cloud"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('passport', 'Passport.js', 'Simple, unobtrusive authentication for Node.js.', 'context7', '/jaredhanson/passport', 'https://www.passportjs.org', '["backend"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),

-- API & GraphQL
  ('trpc', 'tRPC', 'End-to-end typesafe APIs made easy.', 'context7', '/trpc/trpc', 'https://trpc.io', '["backend", "fullstack"]', 'pending', 1, 1, 0, 0, datetime('now'), datetime('now')),
  ('graphql', 'GraphQL', 'A query language for APIs and a runtime for executing queries.', 'context7', '/graphql/graphql-js', 'https://graphql.org', '["backend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('apollo', 'Apollo', 'The industry-standard GraphQL implementation.', 'context7', '/apollographql/apollo-client', 'https://www.apollographql.com', '["frontend", "backend"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('urql', 'urql', 'A highly customizable and versatile GraphQL client.', 'context7', '/urql-graphql/urql', 'https://formidable.com/open-source/urql', '["frontend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('axios', 'Axios', 'Promise based HTTP client for the browser and Node.js.', 'context7', '/axios/axios', 'https://axios-http.com', '["utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('ky', 'ky', 'Tiny and elegant HTTP client based on fetch.', 'context7', '/sindresorhus/ky', 'https://github.com/sindresorhus/ky', '["utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('got', 'got', 'Human-friendly and powerful HTTP request library for Node.js.', 'context7', '/sindresorhus/got', 'https://github.com/sindresorhus/got', '["utilities", "backend"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('swr', 'SWR', 'React Hooks for data fetching.', 'context7', '/vercel/swr', 'https://swr.vercel.app', '["frontend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),

-- Real-time & Sockets
  ('socketio', 'Socket.IO', 'Bidirectional and low-latency communication for every platform.', 'context7', '/socketio/socket.io', 'https://socket.io', '["backend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('pusher', 'Pusher', 'Hosted APIs to add realtime features to your apps.', 'context7', '/pusher/pusher-js', 'https://pusher.com', '["backend", "cloud"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('ably', 'Ably', 'Realtime messaging platform for apps.', 'context7', '/ably/ably-js', 'https://ably.com', '["backend", "cloud"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),

-- Email & Notifications
  ('resend', 'Resend', 'Email for developers - the best way to reach humans instead of spam folders.', 'context7', '/resendlabs/resend-node', 'https://resend.com', '["backend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('nodemailer', 'Nodemailer', 'Send emails from Node.js easily.', 'context7', '/nodemailer/nodemailer', 'https://nodemailer.com', '["backend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('react-email', 'React Email', 'Build and send emails using React.', 'context7', '/resendlabs/react-email', 'https://react.email', '["backend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),

-- File & Media
  ('sharp', 'Sharp', 'High performance Node.js image processing.', 'context7', '/lovell/sharp', 'https://sharp.pixelplumbing.com', '["backend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('uploadthing', 'UploadThing', 'File uploads for modern web apps.', 'context7', '/pingdotgg/uploadthing', 'https://uploadthing.com', '["backend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('ffmpeg', 'FFmpeg', 'A complete solution to record, convert and stream audio and video.', 'context7', '/FFmpeg/FFmpeg', 'https://ffmpeg.org', '["utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),

-- Internationalization
  ('i18next', 'i18next', 'Internationalization framework for JavaScript.', 'context7', '/i18next/i18next', 'https://www.i18next.com', '["utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('formatjs', 'FormatJS', 'Internationalization libraries for web and Node.js.', 'context7', '/formatjs/formatjs', 'https://formatjs.io', '["utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),

-- Utilities
  ('lodash', 'Lodash', 'A modern JavaScript utility library delivering modularity, performance.', 'context7', '/lodash/lodash', 'https://lodash.com', '["utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('date-fns', 'date-fns', 'Modern JavaScript date utility library.', 'context7', '/date-fns/date-fns', 'https://date-fns.org', '["utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('dayjs', 'Day.js', 'Fast 2kB alternative to Moment.js with the same modern API.', 'context7', '/iamkun/dayjs', 'https://day.js.org', '["utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('uuid', 'uuid', 'Generate RFC-compliant UUIDs in JavaScript.', 'context7', '/uuidjs/uuid', 'https://github.com/uuidjs/uuid', '["utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('nanoid', 'nanoid', 'A tiny, secure, URL-friendly unique string ID generator.', 'context7', '/ai/nanoid', 'https://github.com/ai/nanoid', '["utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('immer', 'Immer', 'Create immutable state by mutating the current one.', 'context7', '/immerjs/immer', 'https://immerjs.github.io/immer', '["utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('ramda', 'Ramda', 'A practical functional library for JavaScript programmers.', 'context7', '/ramda/ramda', 'https://ramdajs.com', '["utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('rxjs', 'RxJS', 'Reactive Extensions Library for JavaScript.', 'context7', '/ReactiveX/rxjs', 'https://rxjs.dev', '["utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('effect', 'Effect', 'A powerful TypeScript framework for building production-grade apps.', 'context7', '/Effect-TS/effect', 'https://effect.website', '["utilities", "backend"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('fp-ts', 'fp-ts', 'Functional programming in TypeScript.', 'context7', '/gcanti/fp-ts', 'https://gcanti.github.io/fp-ts', '["utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),

-- Documentation & Markdown
  ('mdx', 'MDX', 'Markdown for the component era.', 'context7', '/mdx-js/mdx', 'https://mdxjs.com', '["utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('marked', 'Marked', 'A markdown parser and compiler built for speed.', 'context7', '/markedjs/marked', 'https://marked.js.org', '["utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('remark', 'remark', 'Markdown processor powered by plugins.', 'context7', '/remarkjs/remark', 'https://remark.js.org', '["utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('storybook', 'Storybook', 'A frontend workshop for UI component development.', 'context7', '/storybookjs/storybook', 'https://storybook.js.org', '["frontend", "testing", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('docusaurus', 'Docusaurus', 'Easy to maintain open source documentation websites.', 'context7', '/facebook/docusaurus', 'https://docusaurus.io', '["frontend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('nextra', 'Nextra', 'Simple, powerful and flexible site generation framework.', 'context7', '/shuding/nextra', 'https://nextra.site', '["frontend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('vitepress', 'VitePress', 'Vite & Vue powered static site generator.', 'context7', '/vuejs/vitepress', 'https://vitepress.dev', '["frontend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),

-- Mobile
  ('react-native', 'React Native', 'Create native apps for Android and iOS using React.', 'context7', '/facebook/react-native', 'https://reactnative.dev', '["mobile", "frontend"]', 'pending', 1, 1, 0, 0, datetime('now'), datetime('now')),
  ('expo', 'Expo', 'An open-source platform for making universal native apps.', 'context7', '/expo/expo', 'https://expo.dev', '["mobile", "frontend"]', 'pending', 1, 1, 0, 0, datetime('now'), datetime('now')),
  ('tauri', 'Tauri', 'Build smaller, faster, and more secure desktop applications.', 'context7', '/tauri-apps/tauri', 'https://tauri.app', '["mobile", "frontend"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('electron', 'Electron', 'Build cross-platform desktop apps with JavaScript, HTML, and CSS.', 'context7', '/electron/electron', 'https://www.electronjs.org', '["mobile", "frontend"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('capacitor', 'Capacitor', 'Cross-platform native runtime for web apps.', 'context7', '/ionic-team/capacitor', 'https://capacitorjs.com', '["mobile"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('flutter', 'Flutter', 'Google''s UI toolkit for building natively compiled applications.', 'context7', '/flutter/flutter', 'https://flutter.dev', '["mobile", "frontend"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),

-- MCP & AI Agents
  ('mcp', 'Model Context Protocol', 'An open protocol for integrating AI with tools and data sources.', 'context7', '/modelcontextprotocol/specification', 'https://modelcontextprotocol.io', '["ai"]', 'pending', 1, 1, 0, 0, datetime('now'), datetime('now')),
  ('opencode', 'OpenCode', 'An open-source AI coding agent for the terminal.', 'context7', '/anomalyco/opencode', 'https://opencode.ai', '["ai", "utilities"]', 'pending', 1, 1, 0, 0, datetime('now'), datetime('now')),

-- Payments
  ('stripe', 'Stripe', 'Online payment processing for internet businesses.', 'context7', '/stripe/stripe-node', 'https://stripe.com', '["backend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('lemon-squeezy', 'Lemon Squeezy', 'The all-in-one payment platform for SaaS.', 'context7', '/lmsqueezy/lemonsqueezy.js', 'https://www.lemonsqueezy.com', '["backend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('paddle', 'Paddle', 'Revenue delivery platform for SaaS companies.', 'context7', '/PaddleHQ/paddle-node-sdk', 'https://www.paddle.com', '["backend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),

-- CMS & Headless
  ('contentful', 'Contentful', 'The leading content platform for digital-first business.', 'context7', '/contentful/contentful.js', 'https://www.contentful.com', '["fullstack", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('sanity', 'Sanity', 'The platform for structured content.', 'context7', '/sanity-io/sanity', 'https://www.sanity.io', '["fullstack", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('strapi', 'Strapi', 'The leading open-source headless CMS.', 'context7', '/strapi/strapi', 'https://strapi.io', '["fullstack", "backend"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('payload', 'Payload', 'The most powerful TypeScript CMS.', 'context7', '/payloadcms/payload', 'https://payloadcms.com', '["fullstack", "backend"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('keystonejs', 'Keystone', 'A powerful GraphQL-based headless CMS for Node.js.', 'context7', '/keystonejs/keystone', 'https://keystonejs.com', '["fullstack", "backend"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),

-- Monorepo Tools
  ('changesets', 'Changesets', 'A way to manage your versioning and changelogs in a monorepo.', 'context7', '/changesets/changesets', 'https://github.com/changesets/changesets', '["utilities", "devops"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('lerna', 'Lerna', 'A tool for managing JavaScript projects with multiple packages.', 'context7', '/lerna/lerna', 'https://lerna.js.org', '["utilities", "devops"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),

-- Code Quality
  ('eslint', 'ESLint', 'Find and fix problems in your JavaScript code.', 'context7', '/eslint/eslint', 'https://eslint.org', '["utilities", "devops"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('prettier', 'Prettier', 'An opinionated code formatter.', 'context7', '/prettier/prettier', 'https://prettier.io', '["utilities", "devops"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('biome', 'Biome', 'Toolchain for web projects - format, lint, and more.', 'context7', '/biomejs/biome', 'https://biomejs.dev', '["utilities", "devops"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('husky', 'Husky', 'Modern native Git hooks made easy.', 'context7', '/typicode/husky', 'https://typicode.github.io/husky', '["utilities", "devops"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('lint-staged', 'lint-staged', 'Run linters against staged git files.', 'context7', '/okonet/lint-staged', 'https://github.com/okonet/lint-staged', '["utilities", "devops"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),

-- Search
  ('algolia', 'Algolia', 'AI-powered search and discovery platform.', 'context7', '/algolia/algoliasearch-client-javascript', 'https://www.algolia.com', '["backend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('meilisearch', 'Meilisearch', 'A lightning-fast search engine.', 'context7', '/meilisearch/meilisearch', 'https://www.meilisearch.com', '["backend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('elasticsearch', 'Elasticsearch', 'Distributed, RESTful search and analytics engine.', 'context7', '/elastic/elasticsearch-js', 'https://www.elastic.co', '["backend", "database"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('typesense', 'Typesense', 'Open source instant search engine.', 'context7', '/typesense/typesense', 'https://typesense.org', '["backend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),

-- Analytics
  ('posthog', 'PostHog', 'Open source product analytics platform.', 'context7', '/PostHog/posthog', 'https://posthog.com', '["backend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('plausible', 'Plausible', 'Simple and privacy-friendly web analytics.', 'context7', '/plausible/analytics', 'https://plausible.io', '["backend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('mixpanel', 'Mixpanel', 'Product analytics for mobile, web, and more.', 'context7', '/mixpanel/mixpanel-js', 'https://mixpanel.com', '["backend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('segment', 'Segment', 'Customer data platform for collecting and routing data.', 'context7', '/segmentio/analytics.js', 'https://segment.com', '["backend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),

-- Monitoring
  ('sentry', 'Sentry', 'Application performance monitoring and error tracking.', 'context7', '/getsentry/sentry-javascript', 'https://sentry.io', '["devops", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('datadog', 'Datadog', 'Monitoring and security platform for cloud applications.', 'context7', '/DataDog/dd-trace-js', 'https://www.datadoghq.com', '["devops", "cloud"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('grafana', 'Grafana', 'The open and composable observability platform.', 'context7', '/grafana/grafana', 'https://grafana.com', '["devops", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('prometheus', 'Prometheus', 'Systems monitoring and alerting toolkit.', 'context7', '/prometheus/prometheus', 'https://prometheus.io', '["devops", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),

-- Logging
  ('pino', 'Pino', 'Super fast, all natural Node.js JSON logger.', 'context7', '/pinojs/pino', 'https://getpino.io', '["backend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('winston', 'Winston', 'A logger for just about everything in Node.js.', 'context7', '/winstonjs/winston', 'https://github.com/winstonjs/winston', '["backend", "utilities"]', 'pending', 1, 0, 0, 0, datetime('now'), datetime('now'));
