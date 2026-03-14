/**
 * Curated list of top 500 skills for AI coding assistants
 * 
 * These are practical skills that developers use with Claude, Cursor, and other AI tools.
 * Skills are organized by category and prioritized by usefulness.
 */

export interface SkillEntry {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  priority: number; // 1-5, higher = more important
}

export const TOP_SKILLS: SkillEntry[] = [
  // ============================================================================
  // Code Analysis (Priority 5)
  // ============================================================================
  { id: "code-review", name: "Code Review", description: "Review code for bugs, security issues, and best practices", category: "analysis", tags: ["review", "quality", "bugs"], priority: 5 },
  { id: "security-audit", name: "Security Audit", description: "Identify security vulnerabilities and suggest fixes", category: "analysis", tags: ["security", "vulnerabilities", "audit"], priority: 5 },
  { id: "performance-analysis", name: "Performance Analysis", description: "Analyze code for performance bottlenecks", category: "analysis", tags: ["performance", "optimization", "profiling"], priority: 5 },
  { id: "code-complexity", name: "Complexity Analysis", description: "Measure and reduce code complexity", category: "analysis", tags: ["complexity", "maintainability", "metrics"], priority: 4 },
  { id: "dependency-audit", name: "Dependency Audit", description: "Check dependencies for vulnerabilities and updates", category: "analysis", tags: ["dependencies", "security", "npm"], priority: 4 },
  { id: "accessibility-audit", name: "Accessibility Audit", description: "Check UI for accessibility compliance (WCAG)", category: "analysis", tags: ["a11y", "accessibility", "wcag"], priority: 4 },
  { id: "seo-analysis", name: "SEO Analysis", description: "Analyze and improve SEO for web pages", category: "analysis", tags: ["seo", "web", "marketing"], priority: 3 },
  { id: "bundle-analysis", name: "Bundle Analysis", description: "Analyze JavaScript bundle size and composition", category: "analysis", tags: ["bundle", "webpack", "performance"], priority: 4 },
  { id: "type-coverage", name: "Type Coverage Analysis", description: "Identify untyped code and improve TypeScript coverage", category: "analysis", tags: ["typescript", "types", "coverage"], priority: 4 },
  { id: "dead-code", name: "Dead Code Detection", description: "Find and remove unused code", category: "analysis", tags: ["cleanup", "unused", "maintenance"], priority: 3 },
  { id: "memory-leak-detection", name: "Memory Leak Detection", description: "Identify potential memory leaks in code", category: "analysis", tags: ["memory", "performance", "debugging"], priority: 4 },
  { id: "race-condition-analysis", name: "Race Condition Analysis", description: "Find potential race conditions in async code", category: "analysis", tags: ["async", "concurrency", "bugs"], priority: 4 },
  { id: "sql-injection-check", name: "SQL Injection Check", description: "Detect SQL injection vulnerabilities", category: "analysis", tags: ["security", "sql", "database"], priority: 5 },
  { id: "xss-detection", name: "XSS Detection", description: "Find cross-site scripting vulnerabilities", category: "analysis", tags: ["security", "xss", "web"], priority: 5 },
  { id: "code-smell-detection", name: "Code Smell Detection", description: "Identify code smells and anti-patterns", category: "analysis", tags: ["quality", "patterns", "refactoring"], priority: 4 },

  // ============================================================================
  // Code Generation - Components (Priority 5)
  // ============================================================================
  { id: "react-component", name: "React Component", description: "Generate React functional components with hooks", category: "generation", tags: ["react", "components", "frontend"], priority: 5 },
  { id: "react-hook", name: "React Custom Hook", description: "Create custom React hooks", category: "generation", tags: ["react", "hooks", "state"], priority: 5 },
  { id: "vue-component", name: "Vue Component", description: "Generate Vue 3 components with Composition API", category: "generation", tags: ["vue", "components", "frontend"], priority: 5 },
  { id: "vue-composable", name: "Vue Composable", description: "Create Vue composables for reusable logic", category: "generation", tags: ["vue", "composables", "state"], priority: 4 },
  { id: "svelte-component", name: "Svelte Component", description: "Generate Svelte components", category: "generation", tags: ["svelte", "components", "frontend"], priority: 4 },
  { id: "angular-component", name: "Angular Component", description: "Generate Angular components with services", category: "generation", tags: ["angular", "components", "frontend"], priority: 4 },
  { id: "web-component", name: "Web Component", description: "Create vanilla Web Components", category: "generation", tags: ["web-components", "custom-elements", "frontend"], priority: 3 },
  { id: "shadcn-component", name: "shadcn/ui Component", description: "Generate shadcn/ui styled components", category: "generation", tags: ["shadcn", "tailwind", "ui"], priority: 5 },
  { id: "tailwind-component", name: "Tailwind Component", description: "Create components with Tailwind CSS", category: "generation", tags: ["tailwind", "css", "styling"], priority: 5 },
  { id: "form-component", name: "Form Component", description: "Generate form components with validation", category: "generation", tags: ["forms", "validation", "ui"], priority: 5 },
  { id: "table-component", name: "Data Table", description: "Create sortable, filterable data tables", category: "generation", tags: ["tables", "data", "ui"], priority: 4 },
  { id: "modal-component", name: "Modal/Dialog", description: "Generate accessible modal dialogs", category: "generation", tags: ["modal", "dialog", "ui"], priority: 4 },
  { id: "dropdown-component", name: "Dropdown Menu", description: "Create accessible dropdown menus", category: "generation", tags: ["dropdown", "menu", "ui"], priority: 4 },
  { id: "toast-component", name: "Toast Notifications", description: "Generate toast notification system", category: "generation", tags: ["toast", "notifications", "ui"], priority: 4 },
  { id: "carousel-component", name: "Image Carousel", description: "Create responsive image carousels", category: "generation", tags: ["carousel", "images", "ui"], priority: 3 },

  // ============================================================================
  // Code Generation - API & Backend (Priority 5)
  // ============================================================================
  { id: "rest-endpoint", name: "REST API Endpoint", description: "Generate RESTful API endpoints", category: "generation", tags: ["api", "rest", "backend"], priority: 5 },
  { id: "graphql-resolver", name: "GraphQL Resolver", description: "Create GraphQL resolvers and types", category: "generation", tags: ["graphql", "api", "backend"], priority: 4 },
  { id: "trpc-router", name: "tRPC Router", description: "Generate type-safe tRPC routers", category: "generation", tags: ["trpc", "typescript", "api"], priority: 4 },
  { id: "express-middleware", name: "Express Middleware", description: "Create Express.js middleware functions", category: "generation", tags: ["express", "middleware", "backend"], priority: 4 },
  { id: "hono-handler", name: "Hono Route Handler", description: "Generate Hono API handlers", category: "generation", tags: ["hono", "cloudflare", "edge"], priority: 4 },
  { id: "fastify-plugin", name: "Fastify Plugin", description: "Create Fastify plugins and routes", category: "generation", tags: ["fastify", "plugins", "backend"], priority: 4 },
  { id: "nextjs-api-route", name: "Next.js API Route", description: "Generate Next.js API routes", category: "generation", tags: ["nextjs", "api", "fullstack"], priority: 5 },
  { id: "nextjs-server-action", name: "Next.js Server Action", description: "Create Next.js Server Actions", category: "generation", tags: ["nextjs", "server-actions", "fullstack"], priority: 5 },
  { id: "cloudflare-worker", name: "Cloudflare Worker", description: "Generate Cloudflare Worker scripts", category: "generation", tags: ["cloudflare", "edge", "serverless"], priority: 4 },
  { id: "lambda-function", name: "AWS Lambda Function", description: "Create AWS Lambda handlers", category: "generation", tags: ["aws", "lambda", "serverless"], priority: 4 },
  { id: "webhook-handler", name: "Webhook Handler", description: "Generate webhook endpoint handlers", category: "generation", tags: ["webhooks", "api", "integrations"], priority: 4 },
  { id: "cron-job", name: "Cron Job/Scheduled Task", description: "Create scheduled task handlers", category: "generation", tags: ["cron", "scheduling", "automation"], priority: 4 },
  { id: "queue-worker", name: "Queue Worker", description: "Generate message queue consumers", category: "generation", tags: ["queues", "workers", "async"], priority: 4 },
  { id: "websocket-handler", name: "WebSocket Handler", description: "Create WebSocket connection handlers", category: "generation", tags: ["websocket", "realtime", "backend"], priority: 4 },
  { id: "sse-endpoint", name: "Server-Sent Events", description: "Generate SSE streaming endpoints", category: "generation", tags: ["sse", "streaming", "realtime"], priority: 3 },

  // ============================================================================
  // Code Generation - Database (Priority 5)
  // ============================================================================
  { id: "prisma-schema", name: "Prisma Schema", description: "Generate Prisma database schemas", category: "generation", tags: ["prisma", "database", "schema"], priority: 5 },
  { id: "drizzle-schema", name: "Drizzle Schema", description: "Create Drizzle ORM schemas", category: "generation", tags: ["drizzle", "database", "schema"], priority: 5 },
  { id: "sql-migration", name: "SQL Migration", description: "Generate database migration files", category: "generation", tags: ["sql", "migrations", "database"], priority: 5 },
  { id: "mongoose-model", name: "Mongoose Model", description: "Create MongoDB Mongoose models", category: "generation", tags: ["mongoose", "mongodb", "database"], priority: 4 },
  { id: "typeorm-entity", name: "TypeORM Entity", description: "Generate TypeORM entity classes", category: "generation", tags: ["typeorm", "database", "orm"], priority: 4 },
  { id: "sql-query", name: "SQL Query", description: "Write optimized SQL queries", category: "generation", tags: ["sql", "queries", "database"], priority: 5 },
  { id: "database-index", name: "Database Index", description: "Design database indexes for performance", category: "generation", tags: ["indexes", "performance", "database"], priority: 4 },
  { id: "seed-data", name: "Seed Data", description: "Generate database seed scripts", category: "generation", tags: ["seeding", "testing", "database"], priority: 3 },
  { id: "database-trigger", name: "Database Trigger", description: "Create database triggers and functions", category: "generation", tags: ["triggers", "sql", "database"], priority: 3 },
  { id: "redis-cache", name: "Redis Cache Layer", description: "Implement Redis caching patterns", category: "generation", tags: ["redis", "caching", "performance"], priority: 4 },

  // ============================================================================
  // Code Generation - Authentication (Priority 5)
  // ============================================================================
  { id: "auth-flow", name: "Authentication Flow", description: "Implement complete auth flows", category: "generation", tags: ["auth", "security", "users"], priority: 5 },
  { id: "oauth-integration", name: "OAuth Integration", description: "Add OAuth provider authentication", category: "generation", tags: ["oauth", "social-login", "auth"], priority: 5 },
  { id: "jwt-auth", name: "JWT Authentication", description: "Implement JWT-based auth", category: "generation", tags: ["jwt", "tokens", "auth"], priority: 5 },
  { id: "session-auth", name: "Session Authentication", description: "Create session-based auth system", category: "generation", tags: ["sessions", "cookies", "auth"], priority: 4 },
  { id: "password-reset", name: "Password Reset Flow", description: "Generate password reset functionality", category: "generation", tags: ["password", "email", "auth"], priority: 4 },
  { id: "2fa-implementation", name: "Two-Factor Auth", description: "Add 2FA/MFA authentication", category: "generation", tags: ["2fa", "mfa", "security"], priority: 4 },
  { id: "rbac-system", name: "Role-Based Access Control", description: "Implement RBAC authorization", category: "generation", tags: ["rbac", "permissions", "auth"], priority: 4 },
  { id: "api-key-auth", name: "API Key Authentication", description: "Create API key auth system", category: "generation", tags: ["api-keys", "auth", "backend"], priority: 4 },
  { id: "magic-link-auth", name: "Magic Link Auth", description: "Implement passwordless magic links", category: "generation", tags: ["magic-link", "passwordless", "auth"], priority: 3 },
  { id: "passkey-auth", name: "Passkey/WebAuthn", description: "Add WebAuthn passkey support", category: "generation", tags: ["passkey", "webauthn", "auth"], priority: 3 },

  // ============================================================================
  // Documentation (Priority 4)
  // ============================================================================
  { id: "readme-generation", name: "README Generation", description: "Generate comprehensive README files", category: "documentation", tags: ["readme", "markdown", "docs"], priority: 5 },
  { id: "api-docs", name: "API Documentation", description: "Create API documentation from code", category: "documentation", tags: ["api", "openapi", "swagger"], priority: 5 },
  { id: "jsdoc-comments", name: "JSDoc Comments", description: "Add JSDoc documentation comments", category: "documentation", tags: ["jsdoc", "comments", "typescript"], priority: 4 },
  { id: "typedoc-generation", name: "TypeDoc Generation", description: "Generate TypeDoc documentation", category: "documentation", tags: ["typedoc", "typescript", "docs"], priority: 4 },
  { id: "changelog", name: "Changelog Generation", description: "Create changelogs from commits", category: "documentation", tags: ["changelog", "releases", "git"], priority: 4 },
  { id: "code-comments", name: "Code Comments", description: "Add explanatory code comments", category: "documentation", tags: ["comments", "explanation", "clarity"], priority: 4 },
  { id: "architecture-docs", name: "Architecture Documentation", description: "Document system architecture", category: "documentation", tags: ["architecture", "diagrams", "design"], priority: 4 },
  { id: "contributing-guide", name: "Contributing Guide", description: "Create CONTRIBUTING.md files", category: "documentation", tags: ["contributing", "opensource", "community"], priority: 3 },
  { id: "deployment-docs", name: "Deployment Documentation", description: "Document deployment processes", category: "documentation", tags: ["deployment", "devops", "infrastructure"], priority: 4 },
  { id: "storybook-stories", name: "Storybook Stories", description: "Generate Storybook component stories", category: "documentation", tags: ["storybook", "components", "ui"], priority: 4 },
  { id: "inline-docs", name: "Inline Documentation", description: "Add comprehensive inline docs", category: "documentation", tags: ["inline", "comments", "maintenance"], priority: 3 },
  { id: "tutorial-creation", name: "Tutorial Creation", description: "Write step-by-step tutorials", category: "documentation", tags: ["tutorials", "learning", "guides"], priority: 3 },
  { id: "runbook-creation", name: "Runbook Creation", description: "Create operational runbooks", category: "documentation", tags: ["runbooks", "operations", "devops"], priority: 3 },
  { id: "adr-documentation", name: "ADR Documentation", description: "Write Architecture Decision Records", category: "documentation", tags: ["adr", "decisions", "architecture"], priority: 3 },
  { id: "error-catalog", name: "Error Catalog", description: "Document error codes and messages", category: "documentation", tags: ["errors", "debugging", "support"], priority: 3 },

  // ============================================================================
  // Testing (Priority 5)
  // ============================================================================
  { id: "unit-test", name: "Unit Test Generation", description: "Generate unit tests for functions", category: "testing", tags: ["unit-tests", "jest", "vitest"], priority: 5 },
  { id: "integration-test", name: "Integration Tests", description: "Create integration test suites", category: "testing", tags: ["integration", "testing", "api"], priority: 5 },
  { id: "e2e-test", name: "E2E Test Generation", description: "Generate end-to-end tests", category: "testing", tags: ["e2e", "playwright", "cypress"], priority: 5 },
  { id: "component-test", name: "Component Tests", description: "Create React/Vue component tests", category: "testing", tags: ["components", "testing-library", "ui"], priority: 5 },
  { id: "api-test", name: "API Tests", description: "Generate API endpoint tests", category: "testing", tags: ["api", "supertest", "backend"], priority: 5 },
  { id: "snapshot-test", name: "Snapshot Tests", description: "Create snapshot tests for UI", category: "testing", tags: ["snapshots", "ui", "regression"], priority: 3 },
  { id: "mock-generation", name: "Mock Generation", description: "Generate mocks and fixtures", category: "testing", tags: ["mocks", "fixtures", "testing"], priority: 4 },
  { id: "test-coverage", name: "Test Coverage", description: "Improve test coverage systematically", category: "testing", tags: ["coverage", "quality", "testing"], priority: 4 },
  { id: "mutation-testing", name: "Mutation Testing", description: "Set up mutation testing", category: "testing", tags: ["mutation", "stryker", "quality"], priority: 3 },
  { id: "load-testing", name: "Load Testing", description: "Create load test scenarios", category: "testing", tags: ["load", "performance", "k6"], priority: 3 },
  { id: "visual-regression", name: "Visual Regression", description: "Set up visual regression testing", category: "testing", tags: ["visual", "screenshots", "ui"], priority: 3 },
  { id: "contract-testing", name: "Contract Testing", description: "Implement API contract tests", category: "testing", tags: ["contracts", "pact", "api"], priority: 3 },
  { id: "property-testing", name: "Property-Based Testing", description: "Generate property-based tests", category: "testing", tags: ["property", "fast-check", "testing"], priority: 3 },
  { id: "accessibility-test", name: "Accessibility Tests", description: "Create a11y automated tests", category: "testing", tags: ["a11y", "accessibility", "testing"], priority: 4 },
  { id: "database-test", name: "Database Tests", description: "Write database integration tests", category: "testing", tags: ["database", "integration", "testing"], priority: 4 },

  // ============================================================================
  // Refactoring (Priority 5)
  // ============================================================================
  { id: "clean-code", name: "Clean Code Refactor", description: "Refactor code following clean code principles", category: "refactoring", tags: ["clean-code", "readability", "maintenance"], priority: 5 },
  { id: "extract-function", name: "Extract Function", description: "Extract reusable functions from code", category: "refactoring", tags: ["functions", "dry", "modular"], priority: 5 },
  { id: "extract-component", name: "Extract Component", description: "Extract reusable UI components", category: "refactoring", tags: ["components", "reuse", "ui"], priority: 5 },
  { id: "design-patterns", name: "Apply Design Patterns", description: "Implement appropriate design patterns", category: "refactoring", tags: ["patterns", "architecture", "oop"], priority: 4 },
  { id: "solid-principles", name: "SOLID Principles", description: "Refactor to follow SOLID principles", category: "refactoring", tags: ["solid", "oop", "design"], priority: 4 },
  { id: "reduce-duplication", name: "Reduce Duplication", description: "Identify and remove code duplication", category: "refactoring", tags: ["dry", "duplication", "cleanup"], priority: 5 },
  { id: "simplify-conditionals", name: "Simplify Conditionals", description: "Simplify complex conditional logic", category: "refactoring", tags: ["conditionals", "logic", "readability"], priority: 4 },
  { id: "modernize-code", name: "Modernize Code", description: "Update to modern syntax and APIs", category: "refactoring", tags: ["modern", "es6", "upgrade"], priority: 4 },
  { id: "typescript-migration", name: "TypeScript Migration", description: "Convert JavaScript to TypeScript", category: "refactoring", tags: ["typescript", "migration", "types"], priority: 5 },
  { id: "async-refactor", name: "Async/Await Refactor", description: "Convert callbacks to async/await", category: "refactoring", tags: ["async", "promises", "modern"], priority: 4 },
  { id: "composition-refactor", name: "Composition over Inheritance", description: "Refactor from inheritance to composition", category: "refactoring", tags: ["composition", "inheritance", "design"], priority: 3 },
  { id: "dependency-injection", name: "Dependency Injection", description: "Implement DI patterns", category: "refactoring", tags: ["di", "testing", "decoupling"], priority: 4 },
  { id: "error-handling", name: "Error Handling Refactor", description: "Improve error handling patterns", category: "refactoring", tags: ["errors", "exceptions", "reliability"], priority: 4 },
  { id: "api-versioning", name: "API Versioning", description: "Implement API versioning strategy", category: "refactoring", tags: ["api", "versioning", "backend"], priority: 3 },
  { id: "code-splitting", name: "Code Splitting", description: "Implement code splitting for performance", category: "refactoring", tags: ["performance", "lazy-loading", "bundles"], priority: 4 },

  // ============================================================================
  // DevOps & CI/CD (Priority 4)
  // ============================================================================
  { id: "dockerfile", name: "Dockerfile Creation", description: "Create optimized Dockerfiles", category: "devops", tags: ["docker", "containers", "deployment"], priority: 5 },
  { id: "docker-compose", name: "Docker Compose", description: "Create docker-compose configurations", category: "devops", tags: ["docker", "compose", "development"], priority: 5 },
  { id: "github-actions", name: "GitHub Actions", description: "Create GitHub Actions workflows", category: "devops", tags: ["github", "ci-cd", "automation"], priority: 5 },
  { id: "gitlab-ci", name: "GitLab CI", description: "Create GitLab CI pipelines", category: "devops", tags: ["gitlab", "ci-cd", "pipelines"], priority: 4 },
  { id: "kubernetes", name: "Kubernetes Config", description: "Generate Kubernetes manifests", category: "devops", tags: ["kubernetes", "k8s", "deployment"], priority: 4 },
  { id: "terraform", name: "Terraform Infrastructure", description: "Write Terraform IaC scripts", category: "devops", tags: ["terraform", "iac", "infrastructure"], priority: 4 },
  { id: "nginx-config", name: "Nginx Configuration", description: "Create Nginx server configs", category: "devops", tags: ["nginx", "server", "proxy"], priority: 4 },
  { id: "env-management", name: "Environment Management", description: "Set up environment variable handling", category: "devops", tags: ["env", "config", "secrets"], priority: 4 },
  { id: "monitoring-setup", name: "Monitoring Setup", description: "Configure monitoring and alerting", category: "devops", tags: ["monitoring", "alerts", "observability"], priority: 4 },
  { id: "logging-config", name: "Logging Configuration", description: "Set up structured logging", category: "devops", tags: ["logging", "debugging", "observability"], priority: 4 },
  { id: "deployment-script", name: "Deployment Scripts", description: "Create deployment automation", category: "devops", tags: ["deployment", "automation", "scripts"], priority: 4 },
  { id: "rollback-strategy", name: "Rollback Strategy", description: "Implement deployment rollbacks", category: "devops", tags: ["rollback", "deployment", "safety"], priority: 3 },
  { id: "secrets-management", name: "Secrets Management", description: "Set up secure secrets handling", category: "devops", tags: ["secrets", "security", "vault"], priority: 4 },
  { id: "cdn-setup", name: "CDN Configuration", description: "Configure CDN for assets", category: "devops", tags: ["cdn", "performance", "caching"], priority: 3 },
  { id: "ssl-setup", name: "SSL/TLS Setup", description: "Configure SSL certificates", category: "devops", tags: ["ssl", "tls", "security"], priority: 4 },

  // ============================================================================
  // Framework-Specific - React (Priority 5)
  // ============================================================================
  { id: "react-context", name: "React Context", description: "Create React Context providers", category: "framework", tags: ["react", "context", "state"], priority: 5 },
  { id: "react-query-setup", name: "TanStack Query Setup", description: "Configure TanStack Query", category: "framework", tags: ["react", "tanstack", "data-fetching"], priority: 5 },
  { id: "react-form-hook", name: "React Hook Form", description: "Set up React Hook Form", category: "framework", tags: ["react", "forms", "validation"], priority: 5 },
  { id: "react-router-config", name: "React Router Config", description: "Configure React Router", category: "framework", tags: ["react", "routing", "navigation"], priority: 4 },
  { id: "react-suspense", name: "React Suspense", description: "Implement Suspense patterns", category: "framework", tags: ["react", "suspense", "loading"], priority: 4 },
  { id: "react-error-boundary", name: "Error Boundary", description: "Create React error boundaries", category: "framework", tags: ["react", "errors", "resilience"], priority: 4 },
  { id: "react-portal", name: "React Portal", description: "Implement React portals", category: "framework", tags: ["react", "portal", "modal"], priority: 3 },
  { id: "react-memo", name: "React Memo Optimization", description: "Optimize with React.memo", category: "framework", tags: ["react", "performance", "memo"], priority: 4 },
  { id: "react-hoc", name: "Higher-Order Component", description: "Create React HOCs", category: "framework", tags: ["react", "hoc", "patterns"], priority: 3 },
  { id: "react-render-props", name: "Render Props Pattern", description: "Implement render props", category: "framework", tags: ["react", "patterns", "composition"], priority: 3 },
  { id: "react-animation", name: "React Animation", description: "Add animations with Framer Motion", category: "framework", tags: ["react", "animation", "framer"], priority: 4 },
  { id: "react-ssr", name: "React SSR Setup", description: "Configure server-side rendering", category: "framework", tags: ["react", "ssr", "performance"], priority: 4 },
  { id: "react-testing", name: "React Testing Setup", description: "Set up Testing Library", category: "framework", tags: ["react", "testing", "rtl"], priority: 5 },
  { id: "react-storybook", name: "React Storybook", description: "Configure Storybook for React", category: "framework", tags: ["react", "storybook", "docs"], priority: 4 },
  { id: "react-i18n", name: "React Internationalization", description: "Add i18n with react-i18next", category: "framework", tags: ["react", "i18n", "localization"], priority: 4 },

  // ============================================================================
  // Framework-Specific - Next.js (Priority 5)
  // ============================================================================
  { id: "nextjs-app-router", name: "Next.js App Router", description: "Set up App Router patterns", category: "framework", tags: ["nextjs", "routing", "rsc"], priority: 5 },
  { id: "nextjs-middleware", name: "Next.js Middleware", description: "Create Edge middleware", category: "framework", tags: ["nextjs", "middleware", "edge"], priority: 5 },
  { id: "nextjs-rsc", name: "React Server Components", description: "Implement RSC patterns", category: "framework", tags: ["nextjs", "rsc", "server"], priority: 5 },
  { id: "nextjs-data-fetching", name: "Next.js Data Fetching", description: "Implement data fetching patterns", category: "framework", tags: ["nextjs", "fetching", "caching"], priority: 5 },
  { id: "nextjs-auth", name: "Next.js Authentication", description: "Add auth with NextAuth.js", category: "framework", tags: ["nextjs", "auth", "nextauth"], priority: 5 },
  { id: "nextjs-image", name: "Next.js Image Optimization", description: "Optimize images with next/image", category: "framework", tags: ["nextjs", "images", "performance"], priority: 4 },
  { id: "nextjs-seo", name: "Next.js SEO", description: "Configure SEO with metadata API", category: "framework", tags: ["nextjs", "seo", "metadata"], priority: 4 },
  { id: "nextjs-streaming", name: "Next.js Streaming", description: "Implement streaming SSR", category: "framework", tags: ["nextjs", "streaming", "ssr"], priority: 4 },
  { id: "nextjs-parallel-routes", name: "Parallel Routes", description: "Set up parallel routes", category: "framework", tags: ["nextjs", "routing", "layouts"], priority: 4 },
  { id: "nextjs-intercepting", name: "Intercepting Routes", description: "Create intercepting routes", category: "framework", tags: ["nextjs", "routing", "modals"], priority: 3 },
  { id: "nextjs-error-handling", name: "Next.js Error Handling", description: "Implement error.tsx patterns", category: "framework", tags: ["nextjs", "errors", "boundaries"], priority: 4 },
  { id: "nextjs-loading", name: "Next.js Loading States", description: "Add loading.tsx patterns", category: "framework", tags: ["nextjs", "loading", "suspense"], priority: 4 },
  { id: "nextjs-og-images", name: "Dynamic OG Images", description: "Generate dynamic OG images", category: "framework", tags: ["nextjs", "og", "social"], priority: 3 },
  { id: "nextjs-sitemap", name: "Next.js Sitemap", description: "Generate sitemap.xml", category: "framework", tags: ["nextjs", "seo", "sitemap"], priority: 3 },
  { id: "nextjs-ratelimit", name: "Next.js Rate Limiting", description: "Add rate limiting middleware", category: "framework", tags: ["nextjs", "security", "ratelimit"], priority: 4 },

  // ============================================================================
  // Framework-Specific - Vue (Priority 4)
  // ============================================================================
  { id: "vue-pinia", name: "Pinia Store", description: "Create Pinia state stores", category: "framework", tags: ["vue", "pinia", "state"], priority: 5 },
  { id: "vue-router", name: "Vue Router Setup", description: "Configure Vue Router", category: "framework", tags: ["vue", "router", "navigation"], priority: 5 },
  { id: "vue-vueuse", name: "VueUse Composables", description: "Use VueUse utility composables", category: "framework", tags: ["vue", "vueuse", "composables"], priority: 4 },
  { id: "vue-transitions", name: "Vue Transitions", description: "Add Vue transition effects", category: "framework", tags: ["vue", "transitions", "animation"], priority: 3 },
  { id: "vue-teleport", name: "Vue Teleport", description: "Use Vue Teleport component", category: "framework", tags: ["vue", "teleport", "portal"], priority: 3 },
  { id: "nuxt-module", name: "Nuxt Module", description: "Create Nuxt.js modules", category: "framework", tags: ["nuxt", "modules", "plugins"], priority: 4 },
  { id: "nuxt-middleware", name: "Nuxt Middleware", description: "Write Nuxt route middleware", category: "framework", tags: ["nuxt", "middleware", "routing"], priority: 4 },
  { id: "nuxt-composable", name: "Nuxt Composable", description: "Create auto-imported composables", category: "framework", tags: ["nuxt", "composables", "auto-import"], priority: 4 },
  { id: "nuxt-api", name: "Nuxt API Routes", description: "Create Nitro API endpoints", category: "framework", tags: ["nuxt", "nitro", "api"], priority: 4 },
  { id: "nuxt-auth", name: "Nuxt Authentication", description: "Add auth to Nuxt apps", category: "framework", tags: ["nuxt", "auth", "sidebase"], priority: 4 },

  // ============================================================================
  // Framework-Specific - Svelte (Priority 4)
  // ============================================================================
  { id: "svelte-store", name: "Svelte Store", description: "Create Svelte writable stores", category: "framework", tags: ["svelte", "stores", "state"], priority: 4 },
  { id: "svelte-action", name: "Svelte Action", description: "Create Svelte actions", category: "framework", tags: ["svelte", "actions", "dom"], priority: 4 },
  { id: "sveltekit-load", name: "SvelteKit Load Function", description: "Implement load functions", category: "framework", tags: ["sveltekit", "loading", "data"], priority: 4 },
  { id: "sveltekit-hooks", name: "SvelteKit Hooks", description: "Create server hooks", category: "framework", tags: ["sveltekit", "hooks", "server"], priority: 4 },
  { id: "sveltekit-form", name: "SvelteKit Form Actions", description: "Implement form actions", category: "framework", tags: ["sveltekit", "forms", "actions"], priority: 4 },

  // ============================================================================
  // Language-Specific - TypeScript (Priority 5)
  // ============================================================================
  { id: "ts-types", name: "TypeScript Types", description: "Define complex TypeScript types", category: "language", tags: ["typescript", "types", "generics"], priority: 5 },
  { id: "ts-generics", name: "TypeScript Generics", description: "Create generic types and functions", category: "language", tags: ["typescript", "generics", "reuse"], priority: 5 },
  { id: "ts-utility-types", name: "Utility Types", description: "Use and create utility types", category: "language", tags: ["typescript", "utility", "types"], priority: 4 },
  { id: "ts-type-guards", name: "Type Guards", description: "Implement type guard functions", category: "language", tags: ["typescript", "guards", "narrowing"], priority: 4 },
  { id: "ts-mapped-types", name: "Mapped Types", description: "Create mapped types", category: "language", tags: ["typescript", "mapped", "advanced"], priority: 4 },
  { id: "ts-conditional", name: "Conditional Types", description: "Write conditional types", category: "language", tags: ["typescript", "conditional", "advanced"], priority: 4 },
  { id: "ts-infer", name: "Type Inference", description: "Use infer keyword effectively", category: "language", tags: ["typescript", "infer", "advanced"], priority: 3 },
  { id: "ts-decorators", name: "TypeScript Decorators", description: "Create and use decorators", category: "language", tags: ["typescript", "decorators", "metadata"], priority: 3 },
  { id: "ts-config", name: "TSConfig Setup", description: "Configure tsconfig.json", category: "language", tags: ["typescript", "config", "setup"], priority: 4 },
  { id: "ts-strict-mode", name: "Strict Mode Migration", description: "Enable strict TypeScript", category: "language", tags: ["typescript", "strict", "quality"], priority: 4 },
  { id: "ts-branded-types", name: "Branded Types", description: "Create branded/nominal types", category: "language", tags: ["typescript", "branded", "safety"], priority: 3 },
  { id: "ts-template-literal", name: "Template Literal Types", description: "Use template literal types", category: "language", tags: ["typescript", "template", "strings"], priority: 3 },
  { id: "ts-satisfies", name: "Satisfies Operator", description: "Use satisfies for type checking", category: "language", tags: ["typescript", "satisfies", "inference"], priority: 3 },
  { id: "ts-const-assertion", name: "Const Assertions", description: "Use as const effectively", category: "language", tags: ["typescript", "const", "readonly"], priority: 4 },
  { id: "ts-discriminated-union", name: "Discriminated Unions", description: "Create discriminated unions", category: "language", tags: ["typescript", "unions", "patterns"], priority: 4 },

  // ============================================================================
  // Language-Specific - Python (Priority 4)
  // ============================================================================
  { id: "python-typing", name: "Python Type Hints", description: "Add Python type annotations", category: "language", tags: ["python", "typing", "mypy"], priority: 5 },
  { id: "python-dataclass", name: "Python Dataclasses", description: "Create Python dataclasses", category: "language", tags: ["python", "dataclass", "models"], priority: 4 },
  { id: "python-pydantic", name: "Pydantic Models", description: "Define Pydantic schemas", category: "language", tags: ["python", "pydantic", "validation"], priority: 5 },
  { id: "python-async", name: "Python Async/Await", description: "Write async Python code", category: "language", tags: ["python", "async", "asyncio"], priority: 4 },
  { id: "python-decorator", name: "Python Decorators", description: "Create Python decorators", category: "language", tags: ["python", "decorators", "patterns"], priority: 4 },
  { id: "python-context-manager", name: "Context Managers", description: "Implement context managers", category: "language", tags: ["python", "context", "with"], priority: 3 },
  { id: "python-generator", name: "Python Generators", description: "Create generator functions", category: "language", tags: ["python", "generators", "iterators"], priority: 3 },
  { id: "python-comprehension", name: "List Comprehensions", description: "Write Pythonic comprehensions", category: "language", tags: ["python", "comprehension", "idioms"], priority: 4 },
  { id: "fastapi-endpoint", name: "FastAPI Endpoint", description: "Create FastAPI routes", category: "language", tags: ["python", "fastapi", "api"], priority: 5 },
  { id: "django-view", name: "Django Views", description: "Write Django views", category: "language", tags: ["python", "django", "web"], priority: 4 },

  // ============================================================================
  // Language-Specific - Go (Priority 4)
  // ============================================================================
  { id: "go-struct", name: "Go Struct", description: "Define Go structs with tags", category: "language", tags: ["go", "struct", "types"], priority: 4 },
  { id: "go-interface", name: "Go Interface", description: "Create Go interfaces", category: "language", tags: ["go", "interface", "polymorphism"], priority: 4 },
  { id: "go-goroutine", name: "Goroutines", description: "Write concurrent Go code", category: "language", tags: ["go", "goroutines", "concurrency"], priority: 4 },
  { id: "go-channel", name: "Go Channels", description: "Implement channel patterns", category: "language", tags: ["go", "channels", "communication"], priority: 4 },
  { id: "go-error-handling", name: "Go Error Handling", description: "Implement Go error patterns", category: "language", tags: ["go", "errors", "handling"], priority: 4 },
  { id: "go-testing", name: "Go Testing", description: "Write Go tests", category: "language", tags: ["go", "testing", "benchmarks"], priority: 4 },
  { id: "go-http-handler", name: "Go HTTP Handler", description: "Create HTTP handlers", category: "language", tags: ["go", "http", "server"], priority: 4 },
  { id: "go-middleware", name: "Go Middleware", description: "Write HTTP middleware", category: "language", tags: ["go", "middleware", "http"], priority: 4 },
  { id: "go-context", name: "Go Context", description: "Use context properly", category: "language", tags: ["go", "context", "cancellation"], priority: 4 },
  { id: "go-generics", name: "Go Generics", description: "Write generic Go code", category: "language", tags: ["go", "generics", "types"], priority: 3 },

  // ============================================================================
  // Language-Specific - Rust (Priority 3)
  // ============================================================================
  { id: "rust-struct", name: "Rust Struct", description: "Define Rust structs with derive", category: "language", tags: ["rust", "struct", "types"], priority: 4 },
  { id: "rust-enum", name: "Rust Enum", description: "Create Rust enums with variants", category: "language", tags: ["rust", "enum", "pattern-matching"], priority: 4 },
  { id: "rust-trait", name: "Rust Trait", description: "Implement Rust traits", category: "language", tags: ["rust", "trait", "polymorphism"], priority: 4 },
  { id: "rust-result", name: "Rust Result Handling", description: "Use Result for error handling", category: "language", tags: ["rust", "result", "errors"], priority: 4 },
  { id: "rust-option", name: "Rust Option Handling", description: "Work with Option types", category: "language", tags: ["rust", "option", "null-safety"], priority: 4 },
  { id: "rust-lifetime", name: "Rust Lifetimes", description: "Annotate lifetime parameters", category: "language", tags: ["rust", "lifetimes", "borrowing"], priority: 3 },
  { id: "rust-async", name: "Rust Async", description: "Write async Rust code", category: "language", tags: ["rust", "async", "tokio"], priority: 4 },
  { id: "rust-macro", name: "Rust Macros", description: "Create Rust macros", category: "language", tags: ["rust", "macros", "metaprogramming"], priority: 3 },
  { id: "rust-testing", name: "Rust Testing", description: "Write Rust unit tests", category: "language", tags: ["rust", "testing", "cargo"], priority: 4 },
  { id: "rust-serde", name: "Rust Serde", description: "Serialize with Serde", category: "language", tags: ["rust", "serde", "json"], priority: 4 },

  // ============================================================================
  // Domain - E-commerce (Priority 4)
  // ============================================================================
  { id: "cart-system", name: "Shopping Cart", description: "Implement shopping cart logic", category: "domain", tags: ["ecommerce", "cart", "shopping"], priority: 4 },
  { id: "checkout-flow", name: "Checkout Flow", description: "Build checkout process", category: "domain", tags: ["ecommerce", "checkout", "payments"], priority: 4 },
  { id: "product-catalog", name: "Product Catalog", description: "Create product catalog system", category: "domain", tags: ["ecommerce", "products", "catalog"], priority: 4 },
  { id: "inventory-management", name: "Inventory Management", description: "Track inventory levels", category: "domain", tags: ["ecommerce", "inventory", "stock"], priority: 4 },
  { id: "order-management", name: "Order Management", description: "Handle order lifecycle", category: "domain", tags: ["ecommerce", "orders", "fulfillment"], priority: 4 },
  { id: "stripe-integration", name: "Stripe Integration", description: "Integrate Stripe payments", category: "domain", tags: ["ecommerce", "stripe", "payments"], priority: 5 },
  { id: "subscription-billing", name: "Subscription Billing", description: "Implement recurring billing", category: "domain", tags: ["ecommerce", "subscriptions", "billing"], priority: 4 },
  { id: "discount-system", name: "Discount/Coupon System", description: "Create discount logic", category: "domain", tags: ["ecommerce", "discounts", "coupons"], priority: 3 },
  { id: "shipping-calculator", name: "Shipping Calculator", description: "Calculate shipping rates", category: "domain", tags: ["ecommerce", "shipping", "logistics"], priority: 3 },
  { id: "tax-calculation", name: "Tax Calculation", description: "Handle tax calculations", category: "domain", tags: ["ecommerce", "tax", "compliance"], priority: 3 },

  // ============================================================================
  // Domain - SaaS (Priority 4)
  // ============================================================================
  { id: "multi-tenancy", name: "Multi-Tenancy", description: "Implement multi-tenant architecture", category: "domain", tags: ["saas", "multi-tenant", "architecture"], priority: 4 },
  { id: "subscription-plans", name: "Subscription Plans", description: "Create tiered subscription system", category: "domain", tags: ["saas", "subscriptions", "pricing"], priority: 4 },
  { id: "usage-tracking", name: "Usage Tracking", description: "Track feature usage and limits", category: "domain", tags: ["saas", "usage", "analytics"], priority: 4 },
  { id: "team-management", name: "Team Management", description: "Build team invite and roles", category: "domain", tags: ["saas", "teams", "collaboration"], priority: 4 },
  { id: "audit-logging", name: "Audit Logging", description: "Implement audit trail", category: "domain", tags: ["saas", "audit", "compliance"], priority: 4 },
  { id: "onboarding-flow", name: "User Onboarding", description: "Create onboarding wizard", category: "domain", tags: ["saas", "onboarding", "ux"], priority: 4 },
  { id: "feature-flags", name: "Feature Flags", description: "Implement feature flag system", category: "domain", tags: ["saas", "features", "toggles"], priority: 4 },
  { id: "notification-system", name: "Notification System", description: "Build notification center", category: "domain", tags: ["saas", "notifications", "alerts"], priority: 4 },
  { id: "settings-page", name: "Settings Page", description: "Create comprehensive settings", category: "domain", tags: ["saas", "settings", "preferences"], priority: 3 },
  { id: "analytics-dashboard", name: "Analytics Dashboard", description: "Build analytics views", category: "domain", tags: ["saas", "analytics", "dashboard"], priority: 4 },

  // ============================================================================
  // Domain - Content & Media (Priority 3)
  // ============================================================================
  { id: "file-upload", name: "File Upload", description: "Implement file upload system", category: "domain", tags: ["files", "upload", "storage"], priority: 5 },
  { id: "image-optimization", name: "Image Optimization", description: "Optimize and resize images", category: "domain", tags: ["images", "optimization", "cdn"], priority: 4 },
  { id: "video-player", name: "Video Player", description: "Create custom video player", category: "domain", tags: ["video", "media", "player"], priority: 3 },
  { id: "rich-text-editor", name: "Rich Text Editor", description: "Implement WYSIWYG editor", category: "domain", tags: ["editor", "wysiwyg", "content"], priority: 4 },
  { id: "markdown-editor", name: "Markdown Editor", description: "Create markdown editor", category: "domain", tags: ["markdown", "editor", "content"], priority: 4 },
  { id: "blog-system", name: "Blog System", description: "Build blog with posts/comments", category: "domain", tags: ["blog", "cms", "content"], priority: 4 },
  { id: "comment-system", name: "Comment System", description: "Implement commenting", category: "domain", tags: ["comments", "social", "engagement"], priority: 3 },
  { id: "search-implementation", name: "Search Implementation", description: "Add full-text search", category: "domain", tags: ["search", "elasticsearch", "algolia"], priority: 4 },
  { id: "content-versioning", name: "Content Versioning", description: "Track content versions", category: "domain", tags: ["versioning", "history", "content"], priority: 3 },
  { id: "media-gallery", name: "Media Gallery", description: "Create image/video gallery", category: "domain", tags: ["gallery", "media", "lightbox"], priority: 3 },

  // ============================================================================
  // AI/ML Skills (Priority 5)
  // ============================================================================
  { id: "openai-integration", name: "OpenAI Integration", description: "Integrate OpenAI API", category: "ai", tags: ["openai", "gpt", "llm"], priority: 5 },
  { id: "anthropic-integration", name: "Anthropic Integration", description: "Integrate Claude API", category: "ai", tags: ["anthropic", "claude", "llm"], priority: 5 },
  { id: "langchain-setup", name: "LangChain Setup", description: "Configure LangChain pipelines", category: "ai", tags: ["langchain", "llm", "chains"], priority: 5 },
  { id: "rag-implementation", name: "RAG Implementation", description: "Build retrieval-augmented generation", category: "ai", tags: ["rag", "embeddings", "search"], priority: 5 },
  { id: "prompt-engineering", name: "Prompt Engineering", description: "Craft effective prompts", category: "ai", tags: ["prompts", "llm", "optimization"], priority: 5 },
  { id: "embedding-generation", name: "Embedding Generation", description: "Create and use embeddings", category: "ai", tags: ["embeddings", "vectors", "similarity"], priority: 5 },
  { id: "vector-database", name: "Vector Database Setup", description: "Configure vector stores", category: "ai", tags: ["vectors", "pinecone", "database"], priority: 4 },
  { id: "chatbot-creation", name: "Chatbot Creation", description: "Build conversational AI", category: "ai", tags: ["chatbot", "conversation", "llm"], priority: 5 },
  { id: "ai-streaming", name: "AI Streaming Response", description: "Implement streaming LLM output", category: "ai", tags: ["streaming", "sse", "llm"], priority: 4 },
  { id: "function-calling", name: "AI Function Calling", description: "Implement tool/function calling", category: "ai", tags: ["functions", "tools", "agents"], priority: 5 },
  { id: "ai-agent", name: "AI Agent Creation", description: "Build autonomous AI agents", category: "ai", tags: ["agents", "autonomous", "llm"], priority: 4 },
  { id: "text-classification", name: "Text Classification", description: "Classify text with ML", category: "ai", tags: ["classification", "nlp", "ml"], priority: 4 },
  { id: "sentiment-analysis", name: "Sentiment Analysis", description: "Analyze text sentiment", category: "ai", tags: ["sentiment", "nlp", "analysis"], priority: 4 },
  { id: "summarization", name: "Text Summarization", description: "Summarize long content", category: "ai", tags: ["summarization", "llm", "content"], priority: 4 },
  { id: "semantic-search", name: "Semantic Search", description: "Implement semantic search", category: "ai", tags: ["search", "embeddings", "similarity"], priority: 5 },

  // ============================================================================
  // Performance Optimization (Priority 4)
  // ============================================================================
  { id: "lazy-loading", name: "Lazy Loading", description: "Implement lazy loading patterns", category: "performance", tags: ["lazy", "loading", "optimization"], priority: 5 },
  { id: "code-splitting", name: "Code Splitting", description: "Split bundles for faster loads", category: "performance", tags: ["splitting", "bundles", "webpack"], priority: 5 },
  { id: "image-lazy-load", name: "Image Lazy Loading", description: "Lazy load images", category: "performance", tags: ["images", "lazy", "performance"], priority: 4 },
  { id: "caching-strategy", name: "Caching Strategy", description: "Implement effective caching", category: "performance", tags: ["cache", "cdn", "headers"], priority: 5 },
  { id: "memoization", name: "Memoization", description: "Optimize with memoization", category: "performance", tags: ["memo", "cache", "optimization"], priority: 4 },
  { id: "debounce-throttle", name: "Debounce/Throttle", description: "Implement rate limiting patterns", category: "performance", tags: ["debounce", "throttle", "events"], priority: 4 },
  { id: "virtual-scrolling", name: "Virtual Scrolling", description: "Render large lists efficiently", category: "performance", tags: ["virtual", "scrolling", "lists"], priority: 4 },
  { id: "web-workers", name: "Web Workers", description: "Offload work to Web Workers", category: "performance", tags: ["workers", "threads", "background"], priority: 3 },
  { id: "service-workers", name: "Service Workers", description: "Implement offline-first PWA", category: "performance", tags: ["pwa", "offline", "caching"], priority: 4 },
  { id: "preloading", name: "Resource Preloading", description: "Preload critical resources", category: "performance", tags: ["preload", "prefetch", "hints"], priority: 4 },
  { id: "critical-css", name: "Critical CSS", description: "Inline critical CSS", category: "performance", tags: ["css", "critical", "rendering"], priority: 3 },
  { id: "tree-shaking", name: "Tree Shaking", description: "Optimize bundle tree shaking", category: "performance", tags: ["tree-shaking", "bundle", "dead-code"], priority: 4 },
  { id: "compression", name: "Asset Compression", description: "Configure gzip/brotli compression", category: "performance", tags: ["compression", "gzip", "brotli"], priority: 4 },
  { id: "database-optimization", name: "Database Optimization", description: "Optimize database queries", category: "performance", tags: ["database", "queries", "indexing"], priority: 5 },
  { id: "n+1-query-fix", name: "N+1 Query Fix", description: "Identify and fix N+1 queries", category: "performance", tags: ["database", "n+1", "optimization"], priority: 4 },

  // ============================================================================
  // Accessibility (Priority 4)
  // ============================================================================
  { id: "a11y-forms", name: "Accessible Forms", description: "Create accessible form controls", category: "accessibility", tags: ["a11y", "forms", "aria"], priority: 5 },
  { id: "a11y-navigation", name: "Accessible Navigation", description: "Build keyboard-accessible nav", category: "accessibility", tags: ["a11y", "keyboard", "navigation"], priority: 5 },
  { id: "a11y-modals", name: "Accessible Modals", description: "Create accessible dialogs", category: "accessibility", tags: ["a11y", "modal", "focus-trap"], priority: 4 },
  { id: "a11y-images", name: "Accessible Images", description: "Add proper alt text and ARIA", category: "accessibility", tags: ["a11y", "images", "alt-text"], priority: 4 },
  { id: "a11y-color-contrast", name: "Color Contrast", description: "Ensure WCAG color contrast", category: "accessibility", tags: ["a11y", "contrast", "wcag"], priority: 4 },
  { id: "a11y-screen-reader", name: "Screen Reader Support", description: "Optimize for screen readers", category: "accessibility", tags: ["a11y", "screen-reader", "aria"], priority: 4 },
  { id: "a11y-focus-management", name: "Focus Management", description: "Manage focus properly", category: "accessibility", tags: ["a11y", "focus", "keyboard"], priority: 4 },
  { id: "a11y-skip-links", name: "Skip Links", description: "Add skip navigation links", category: "accessibility", tags: ["a11y", "skip-links", "navigation"], priority: 3 },
  { id: "a11y-tables", name: "Accessible Tables", description: "Create accessible data tables", category: "accessibility", tags: ["a11y", "tables", "data"], priority: 3 },
  { id: "a11y-animations", name: "Accessible Animations", description: "Respect reduced motion", category: "accessibility", tags: ["a11y", "motion", "animations"], priority: 3 },

  // ============================================================================
  // Git & Version Control (Priority 4)
  // ============================================================================
  { id: "git-commit-message", name: "Commit Message", description: "Write conventional commits", category: "git", tags: ["git", "commits", "conventional"], priority: 5 },
  { id: "git-pr-description", name: "PR Description", description: "Write clear PR descriptions", category: "git", tags: ["git", "pr", "review"], priority: 5 },
  { id: "git-branching", name: "Branching Strategy", description: "Implement branching model", category: "git", tags: ["git", "branches", "workflow"], priority: 4 },
  { id: "git-merge-conflict", name: "Merge Conflict Resolution", description: "Resolve merge conflicts", category: "git", tags: ["git", "conflicts", "merge"], priority: 4 },
  { id: "git-rebase", name: "Git Rebase", description: "Clean history with rebase", category: "git", tags: ["git", "rebase", "history"], priority: 3 },
  { id: "git-hooks", name: "Git Hooks", description: "Set up Git hooks", category: "git", tags: ["git", "hooks", "husky"], priority: 4 },
  { id: "git-bisect", name: "Git Bisect", description: "Find bugs with bisect", category: "git", tags: ["git", "bisect", "debugging"], priority: 3 },
  { id: "gitignore", name: "Gitignore Setup", description: "Configure .gitignore", category: "git", tags: ["git", "gitignore", "config"], priority: 4 },
  { id: "git-submodules", name: "Git Submodules", description: "Manage submodules", category: "git", tags: ["git", "submodules", "monorepo"], priority: 3 },
  { id: "git-release", name: "Git Release Process", description: "Create release workflow", category: "git", tags: ["git", "releases", "tags"], priority: 4 },

  // ============================================================================
  // Code Quality & Linting (Priority 4)
  // ============================================================================
  { id: "eslint-config", name: "ESLint Configuration", description: "Set up ESLint rules", category: "quality", tags: ["eslint", "linting", "config"], priority: 5 },
  { id: "prettier-config", name: "Prettier Configuration", description: "Configure Prettier formatting", category: "quality", tags: ["prettier", "formatting", "config"], priority: 5 },
  { id: "typescript-strict", name: "TypeScript Strict Mode", description: "Enable strict TypeScript", category: "quality", tags: ["typescript", "strict", "types"], priority: 4 },
  { id: "husky-setup", name: "Husky Setup", description: "Configure pre-commit hooks", category: "quality", tags: ["husky", "hooks", "automation"], priority: 4 },
  { id: "lint-staged", name: "Lint-Staged Setup", description: "Run linters on staged files", category: "quality", tags: ["lint-staged", "commits", "automation"], priority: 4 },
  { id: "commitlint", name: "Commitlint Setup", description: "Enforce commit conventions", category: "quality", tags: ["commitlint", "commits", "conventional"], priority: 3 },
  { id: "editorconfig", name: "EditorConfig Setup", description: "Configure EditorConfig", category: "quality", tags: ["editorconfig", "formatting", "consistency"], priority: 3 },
  { id: "stylelint", name: "Stylelint Setup", description: "Configure CSS linting", category: "quality", tags: ["stylelint", "css", "linting"], priority: 3 },
  { id: "sonarqube", name: "SonarQube Integration", description: "Add code quality analysis", category: "quality", tags: ["sonarqube", "analysis", "quality"], priority: 3 },
  { id: "biome-setup", name: "Biome Setup", description: "Configure Biome linter", category: "quality", tags: ["biome", "linting", "formatting"], priority: 3 },

  // ============================================================================
  // Debugging & Troubleshooting (Priority 4)
  // ============================================================================
  { id: "debug-react", name: "Debug React", description: "Debug React applications", category: "debugging", tags: ["react", "debugging", "devtools"], priority: 5 },
  { id: "debug-node", name: "Debug Node.js", description: "Debug Node.js applications", category: "debugging", tags: ["nodejs", "debugging", "inspector"], priority: 4 },
  { id: "debug-network", name: "Debug Network Issues", description: "Troubleshoot API/network", category: "debugging", tags: ["network", "api", "debugging"], priority: 4 },
  { id: "debug-performance", name: "Debug Performance", description: "Profile performance issues", category: "debugging", tags: ["performance", "profiling", "debugging"], priority: 4 },
  { id: "debug-memory", name: "Debug Memory Issues", description: "Find memory leaks", category: "debugging", tags: ["memory", "leaks", "profiling"], priority: 4 },
  { id: "debug-typescript", name: "Debug TypeScript Errors", description: "Fix TypeScript errors", category: "debugging", tags: ["typescript", "errors", "types"], priority: 5 },
  { id: "debug-css", name: "Debug CSS Issues", description: "Fix CSS/layout problems", category: "debugging", tags: ["css", "layout", "debugging"], priority: 4 },
  { id: "debug-async", name: "Debug Async Code", description: "Debug promises/async", category: "debugging", tags: ["async", "promises", "debugging"], priority: 4 },
  { id: "debug-ssr", name: "Debug SSR Issues", description: "Fix server rendering problems", category: "debugging", tags: ["ssr", "hydration", "debugging"], priority: 4 },
  { id: "debug-build", name: "Debug Build Issues", description: "Fix build/bundle errors", category: "debugging", tags: ["build", "webpack", "debugging"], priority: 4 },

  // ============================================================================
  // Utilities & Helpers (Priority 3)
  // ============================================================================
  { id: "date-formatting", name: "Date Formatting", description: "Format dates properly", category: "utilities", tags: ["dates", "formatting", "i18n"], priority: 4 },
  { id: "number-formatting", name: "Number Formatting", description: "Format numbers/currency", category: "utilities", tags: ["numbers", "currency", "formatting"], priority: 4 },
  { id: "string-manipulation", name: "String Manipulation", description: "Common string operations", category: "utilities", tags: ["strings", "manipulation", "text"], priority: 4 },
  { id: "array-utils", name: "Array Utilities", description: "Array helper functions", category: "utilities", tags: ["arrays", "utilities", "helpers"], priority: 4 },
  { id: "object-utils", name: "Object Utilities", description: "Object manipulation helpers", category: "utilities", tags: ["objects", "utilities", "helpers"], priority: 4 },
  { id: "url-parsing", name: "URL Parsing", description: "Parse and build URLs", category: "utilities", tags: ["url", "parsing", "query-strings"], priority: 4 },
  { id: "json-utils", name: "JSON Utilities", description: "Safe JSON parsing", category: "utilities", tags: ["json", "parsing", "utilities"], priority: 3 },
  { id: "regex-patterns", name: "Regex Patterns", description: "Common regex patterns", category: "utilities", tags: ["regex", "patterns", "validation"], priority: 4 },
  { id: "uuid-generation", name: "UUID Generation", description: "Generate unique identifiers", category: "utilities", tags: ["uuid", "id", "unique"], priority: 3 },
  { id: "slug-generation", name: "Slug Generation", description: "Create URL-safe slugs", category: "utilities", tags: ["slug", "url", "seo"], priority: 3 },
  { id: "deep-clone", name: "Deep Clone", description: "Deep clone objects/arrays", category: "utilities", tags: ["clone", "deep", "objects"], priority: 3 },
  { id: "debounce-throttle-impl", name: "Debounce/Throttle Implementation", description: "Implement rate limiting", category: "utilities", tags: ["debounce", "throttle", "performance"], priority: 4 },
  { id: "event-emitter", name: "Event Emitter", description: "Create event emitter pattern", category: "utilities", tags: ["events", "emitter", "pubsub"], priority: 3 },
  { id: "retry-logic", name: "Retry Logic", description: "Implement retry with backoff", category: "utilities", tags: ["retry", "backoff", "resilience"], priority: 4 },
  { id: "batch-processing", name: "Batch Processing", description: "Process items in batches", category: "utilities", tags: ["batch", "processing", "async"], priority: 3 },
];

// Helper to get skills by category
export function getSkillsByCategory(category: string): SkillEntry[] {
  return TOP_SKILLS.filter(skill => skill.category === category);
}

// Helper to get skills by priority
export function getSkillsByPriority(minPriority: number): SkillEntry[] {
  return TOP_SKILLS.filter(skill => skill.priority >= minPriority);
}

// Helper to search skills by tag
export function getSkillsByTag(tag: string): SkillEntry[] {
  return TOP_SKILLS.filter(skill => skill.tags.includes(tag));
}

// Total count
export const SKILL_COUNT = TOP_SKILLS.length;
