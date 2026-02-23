-- Seed initial skills for Nexus Skills Registry
-- These are curated skills inspired by official sources

-- Anthropic-style skills (document processing)
INSERT INTO skills (id, name, slug, description, source_repo, author, type, categories, tags, format, r2_key, content_preview, is_official, is_featured, is_active, created_at, updated_at) VALUES
('pdf-extraction', 'PDF Extraction', 'pdf-extraction', 'Extract text, tables, and structured data from PDF documents. Handles multi-page documents, OCR for scanned PDFs, and preserves formatting.', 'nexus/skills', 'Nexus', 'transformation', '["document-processing", "extraction"]', '["pdf", "ocr", "tables"]', 'markdown', 'skills/pdf-extraction.md', 'Use this skill when you need to extract content from PDF files. The skill handles...', 1, 1, 1, datetime('now'), datetime('now')),

('docx-extraction', 'DOCX Extraction', 'docx-extraction', 'Extract content from Microsoft Word documents including text, tables, images, and formatting information.', 'nexus/skills', 'Nexus', 'transformation', '["document-processing", "extraction"]', '["docx", "word", "microsoft"]', 'markdown', 'skills/docx-extraction.md', 'Extract content from Word documents while preserving structure...', 1, 0, 1, datetime('now'), datetime('now')),

('xlsx-analysis', 'Excel Analysis', 'xlsx-analysis', 'Analyze Excel spreadsheets, extract data, perform calculations, and generate insights from tabular data.', 'nexus/skills', 'Nexus', 'analysis', '["document-processing", "data-analysis"]', '["excel", "spreadsheet", "data"]', 'markdown', 'skills/xlsx-analysis.md', 'Analyze Excel files to extract insights, summarize data...', 1, 0, 1, datetime('now'), datetime('now')),

('csv-processing', 'CSV Processing', 'csv-processing', 'Parse, transform, and analyze CSV files. Handle large datasets, detect schemas, and perform data cleaning.', 'nexus/skills', 'Nexus', 'transformation', '["data-processing", "extraction"]', '["csv", "data", "etl"]', 'markdown', 'skills/csv-processing.md', 'Process CSV files efficiently with schema detection...', 1, 0, 1, datetime('now'), datetime('now'));

-- Code quality skills
INSERT INTO skills (id, name, slug, description, source_repo, author, type, categories, tags, format, r2_key, content_preview, is_official, is_featured, is_active, created_at, updated_at) VALUES
('code-review', 'Code Review', 'code-review', 'Perform thorough code reviews focusing on best practices, security vulnerabilities, performance issues, and maintainability.', 'nexus/skills', 'Nexus', 'analysis', '["code-quality", "review"]', '["review", "security", "best-practices"]', 'markdown', 'skills/code-review.md', 'Conduct comprehensive code reviews that identify issues...', 1, 1, 1, datetime('now'), datetime('now')),

('typescript-strict', 'TypeScript Strict Mode', 'typescript-strict', 'Apply strict TypeScript practices including proper typing, avoiding any, using discriminated unions, and leveraging the type system.', 'nexus/skills', 'Nexus', 'generation', '["typescript", "code-quality"]', '["typescript", "types", "strict"]', 'markdown', 'skills/typescript-strict.md', 'Write TypeScript code with strict type safety...', 1, 1, 1, datetime('now'), datetime('now')),

('security-audit', 'Security Audit', 'security-audit', 'Identify security vulnerabilities in code including XSS, SQL injection, authentication flaws, and insecure dependencies.', 'nexus/skills', 'Nexus', 'analysis', '["security", "audit"]', '["security", "vulnerabilities", "owasp"]', 'markdown', 'skills/security-audit.md', 'Perform security audits to identify vulnerabilities...', 1, 1, 1, datetime('now'), datetime('now')),

('performance-optimization', 'Performance Optimization', 'performance-optimization', 'Analyze and optimize code performance including algorithm complexity, memory usage, and runtime efficiency.', 'nexus/skills', 'Nexus', 'analysis', '["performance", "optimization"]', '["performance", "speed", "memory"]', 'markdown', 'skills/performance-optimization.md', 'Identify performance bottlenecks and suggest optimizations...', 1, 0, 1, datetime('now'), datetime('now'));

-- Framework-specific skills
INSERT INTO skills (id, name, slug, description, source_repo, author, type, categories, tags, format, r2_key, content_preview, is_official, is_featured, is_active, created_at, updated_at) VALUES
('react-best-practices', 'React Best Practices', 'react-best-practices', 'Apply React best practices including hooks usage, component composition, state management, and performance optimization.', 'vercel-labs/agent-skills', 'Vercel', 'generation', '["react", "frontend"]', '["react", "hooks", "components"]', 'markdown', 'skills/react-best-practices.md', 'Follow React best practices for building maintainable...', 1, 1, 1, datetime('now'), datetime('now')),

('nextjs-app-router', 'Next.js App Router', 'nextjs-app-router', 'Build applications using Next.js App Router with server components, streaming, and modern data fetching patterns.', 'nexus/skills', 'Nexus', 'generation', '["nextjs", "fullstack"]', '["nextjs", "app-router", "rsc"]', 'markdown', 'skills/nextjs-app-router.md', 'Build Next.js applications using the App Router...', 1, 1, 1, datetime('now'), datetime('now')),

('tailwind-styling', 'Tailwind CSS Styling', 'tailwind-styling', 'Apply Tailwind CSS best practices including utility composition, responsive design, and custom configurations.', 'nexus/skills', 'Nexus', 'generation', '["css", "styling"]', '["tailwind", "css", "responsive"]', 'markdown', 'skills/tailwind-styling.md', 'Style components using Tailwind CSS utilities...', 1, 0, 1, datetime('now'), datetime('now')),

('hono-api', 'Hono API Development', 'hono-api', 'Build fast, edge-ready APIs with Hono framework including middleware, routing, and Cloudflare Workers integration.', 'nexus/skills', 'Nexus', 'generation', '["hono", "backend", "edge"]', '["hono", "api", "cloudflare"]', 'markdown', 'skills/hono-api.md', 'Build edge-first APIs using Hono framework...', 1, 0, 1, datetime('now'), datetime('now'));

-- Database skills
INSERT INTO skills (id, name, slug, description, source_repo, author, type, categories, tags, format, r2_key, content_preview, is_official, is_featured, is_active, created_at, updated_at) VALUES
('database-design', 'Database Design', 'database-design', 'Design efficient database schemas with proper normalization, indexing strategies, and relationship modeling.', 'nexus/skills', 'Nexus', 'generation', '["database", "architecture"]', '["schema", "sql", "modeling"]', 'markdown', 'skills/database-design.md', 'Design database schemas with proper normalization...', 1, 0, 1, datetime('now'), datetime('now')),

('drizzle-orm', 'Drizzle ORM', 'drizzle-orm', 'Use Drizzle ORM for type-safe database operations including migrations, queries, and relations.', 'nexus/skills', 'Nexus', 'generation', '["database", "orm"]', '["drizzle", "typescript", "sql"]', 'markdown', 'skills/drizzle-orm.md', 'Build type-safe database queries with Drizzle ORM...', 1, 0, 1, datetime('now'), datetime('now')),

('supabase-postgres', 'Supabase PostgreSQL', 'supabase-postgres', 'Build applications with Supabase including authentication, real-time subscriptions, and PostgreSQL best practices.', 'supabase/agent-skills', 'Supabase', 'integration', '["supabase", "database"]', '["supabase", "postgres", "realtime"]', 'markdown', 'skills/supabase-postgres.md', 'Use Supabase for authentication, database, and realtime...', 1, 0, 1, datetime('now'), datetime('now'));

-- Testing skills
INSERT INTO skills (id, name, slug, description, source_repo, author, type, categories, tags, format, r2_key, content_preview, is_official, is_featured, is_active, created_at, updated_at) VALUES
('testing-strategies', 'Testing Strategies', 'testing-strategies', 'Implement comprehensive testing strategies including unit tests, integration tests, and end-to-end tests.', 'nexus/skills', 'Nexus', 'generation', '["testing", "quality"]', '["vitest", "playwright", "tdd"]', 'markdown', 'skills/testing-strategies.md', 'Write comprehensive tests for reliable software...', 1, 0, 1, datetime('now'), datetime('now')),

('web-testing', 'Web Testing', 'web-testing', 'Test web applications with Playwright including page interactions, assertions, and visual regression testing.', 'nexus/skills', 'Nexus', 'generation', '["testing", "e2e"]', '["playwright", "e2e", "browser"]', 'markdown', 'skills/web-testing.md', 'Write end-to-end tests for web applications...', 1, 0, 1, datetime('now'), datetime('now'));

-- DevOps skills
INSERT INTO skills (id, name, slug, description, source_repo, author, type, categories, tags, format, r2_key, content_preview, is_official, is_featured, is_active, created_at, updated_at) VALUES
('ci-cd-pipelines', 'CI/CD Pipelines', 'ci-cd-pipelines', 'Design and implement CI/CD pipelines with GitHub Actions including testing, building, and deployment automation.', 'nexus/skills', 'Nexus', 'generation', '["devops", "automation"]', '["github-actions", "ci", "cd"]', 'markdown', 'skills/ci-cd-pipelines.md', 'Build automated CI/CD pipelines for continuous delivery...', 1, 0, 1, datetime('now'), datetime('now')),

('docker-containers', 'Docker Containers', 'docker-containers', 'Create optimized Docker containers including multi-stage builds, security hardening, and orchestration.', 'nexus/skills', 'Nexus', 'generation', '["devops", "containers"]', '["docker", "containers", "kubernetes"]', 'markdown', 'skills/docker-containers.md', 'Build and deploy containerized applications...', 1, 0, 1, datetime('now'), datetime('now'));

-- Documentation skills  
INSERT INTO skills (id, name, slug, description, source_repo, author, type, categories, tags, format, r2_key, content_preview, is_official, is_featured, is_active, created_at, updated_at) VALUES
('documentation-writer', 'Documentation Writer', 'documentation-writer', 'Write clear, comprehensive documentation including API references, tutorials, and architectural decisions.', 'nexus/skills', 'Nexus', 'generation', '["documentation", "writing"]', '["docs", "readme", "api"]', 'markdown', 'skills/documentation-writer.md', 'Write clear documentation for projects and APIs...', 1, 0, 1, datetime('now'), datetime('now')),

('api-design', 'API Design', 'api-design', 'Design RESTful and GraphQL APIs following best practices for versioning, error handling, and documentation.', 'nexus/skills', 'Nexus', 'generation', '["api", "design"]', '["rest", "graphql", "openapi"]', 'markdown', 'skills/api-design.md', 'Design clean, consistent APIs...', 1, 0, 1, datetime('now'), datetime('now'));

-- Accessibility and SEO
INSERT INTO skills (id, name, slug, description, source_repo, author, type, categories, tags, format, r2_key, content_preview, is_official, is_featured, is_active, created_at, updated_at) VALUES
('accessibility-audit', 'Accessibility Audit', 'accessibility-audit', 'Audit web applications for accessibility compliance including WCAG guidelines, screen reader support, and keyboard navigation.', 'nexus/skills', 'Nexus', 'analysis', '["accessibility", "audit"]', '["a11y", "wcag", "aria"]', 'markdown', 'skills/accessibility-audit.md', 'Ensure web applications are accessible to all users...', 1, 0, 1, datetime('now'), datetime('now')),

('seo-optimization', 'SEO Optimization', 'seo-optimization', 'Optimize web pages for search engines including meta tags, structured data, and Core Web Vitals.', 'nexus/skills', 'Nexus', 'analysis', '["seo", "marketing"]', '["seo", "meta", "performance"]', 'markdown', 'skills/seo-optimization.md', 'Optimize pages for better search engine rankings...', 1, 0, 1, datetime('now'), datetime('now'));

-- Error handling and observability
INSERT INTO skills (id, name, slug, description, source_repo, author, type, categories, tags, format, r2_key, content_preview, is_official, is_featured, is_active, created_at, updated_at) VALUES
('error-handling', 'Error Handling', 'error-handling', 'Implement robust error handling patterns including error boundaries, logging, and graceful degradation.', 'nexus/skills', 'Nexus', 'generation', '["error-handling", "resilience"]', '["errors", "logging", "recovery"]', 'markdown', 'skills/error-handling.md', 'Handle errors gracefully with proper logging...', 1, 0, 1, datetime('now'), datetime('now')),

('logging-observability', 'Logging & Observability', 'logging-observability', 'Implement logging and observability including structured logs, metrics, and distributed tracing.', 'nexus/skills', 'Nexus', 'generation', '["observability", "monitoring"]', '["logging", "metrics", "tracing"]', 'markdown', 'skills/logging-observability.md', 'Add comprehensive observability to applications...', 1, 0, 1, datetime('now'), datetime('now'));

-- Git and collaboration
INSERT INTO skills (id, name, slug, description, source_repo, author, type, categories, tags, format, r2_key, content_preview, is_official, is_featured, is_active, created_at, updated_at) VALUES
('git-workflow', 'Git Workflow', 'git-workflow', 'Follow Git best practices including commit messages, branching strategies, and pull request workflows.', 'nexus/skills', 'Nexus', 'utility', '["git", "collaboration"]', '["git", "commits", "branches"]', 'markdown', 'skills/git-workflow.md', 'Use Git effectively with clean commit history...', 1, 0, 1, datetime('now'), datetime('now')),

('commit-messages', 'Commit Messages', 'commit-messages', 'Write clear, conventional commit messages that explain the what and why of changes.', 'anthropics/skills', 'Anthropic', 'utility', '["git", "documentation"]', '["commits", "conventional", "changelog"]', 'markdown', 'skills/commit-messages.md', 'Write meaningful commit messages following conventions...', 1, 0, 1, datetime('now'), datetime('now'));

-- MCP integration skills
INSERT INTO skills (id, name, slug, description, source_repo, author, type, categories, tags, format, r2_key, content_preview, required_mcp_servers, is_official, is_featured, is_active, created_at, updated_at) VALUES
('mcp-server-builder', 'MCP Server Builder', 'mcp-server-builder', 'Build Model Context Protocol servers with tools, resources, and prompts for AI agent integration.', 'nexus/skills', 'Nexus', 'generation', '["mcp", "ai"]', '["mcp", "server", "tools"]', 'markdown', 'skills/mcp-server-builder.md', 'Create MCP servers to extend AI capabilities...', '[]', 1, 1, 1, datetime('now'), datetime('now')),

('browser-automation', 'Browser Automation', 'browser-automation', 'Automate browser interactions for testing, scraping, and web automation tasks.', 'nexus/skills', 'Nexus', 'integration', '["automation", "browser"]', '["puppeteer", "playwright", "scraping"]', 'markdown', 'skills/browser-automation.md', 'Automate browser tasks and extract data from websites...', '["puppeteer"]', 1, 0, 1, datetime('now'), datetime('now'));

-- Cloudflare-specific skills
INSERT INTO skills (id, name, slug, description, source_repo, author, type, categories, tags, format, r2_key, content_preview, is_official, is_featured, is_active, created_at, updated_at) VALUES
('cloudflare-workers', 'Cloudflare Workers', 'cloudflare-workers', 'Build edge-first applications with Cloudflare Workers including KV, D1, R2, and Durable Objects.', 'nexus/skills', 'Nexus', 'generation', '["cloudflare", "edge"]', '["workers", "edge", "serverless"]', 'markdown', 'skills/cloudflare-workers.md', 'Deploy applications to the edge with Cloudflare Workers...', 1, 1, 1, datetime('now'), datetime('now')),

('d1-database', 'D1 Database', 'd1-database', 'Use Cloudflare D1 SQLite database including migrations, queries, and integration with Workers.', 'nexus/skills', 'Nexus', 'generation', '["cloudflare", "database"]', '["d1", "sqlite", "edge"]', 'markdown', 'skills/d1-database.md', 'Build edge-first databases with Cloudflare D1...', 1, 0, 1, datetime('now'), datetime('now'));
