import { createFileRoute, Link } from "@tanstack/react-router";
import { DocsLayout } from "../../../components/docs/DocsLayout";
import { CodeBlock } from "../../../components/docs/CodeBlock";
import { Callout } from "../../../components/docs/Callout";

export const Route = createFileRoute("/docs/tutorials/vibe-with-nexus")({
  component: VibeWithNexusTutorial,
});

function VibeWithNexusTutorial() {
  const toc = [
    { id: "introduction", title: "Introduction", level: 2 },
    { id: "what-well-build", title: "What We'll Build", level: 2 },
    { id: "prerequisites", title: "Prerequisites", level: 2 },
    { id: "phase-1", title: "Phase 1: Project Setup", level: 2 },
    { id: "phase-2", title: "Phase 2: Database with D1", level: 2 },
    { id: "phase-3", title: "Phase 3: File Storage with R2", level: 2 },
    { id: "phase-4", title: "Phase 4: Caching with KV", level: 2 },
    { id: "phase-5", title: "Phase 5: Build the App", level: 2 },
    { id: "phase-6", title: "Phase 6: Deploy to Cloudflare", level: 2 },
    { id: "tips", title: "Vibe Coding Tips", level: 2 },
    { id: "troubleshooting", title: "Troubleshooting", level: 2 },
  ];

  return (
    <DocsLayout
      title="Vibe with Nexus"
      description="Build a full-stack app using AI assistance - no manual coding required"
      toc={toc}
    >
      {/* Introduction */}
      <section className="mb-12">
        <h2 id="introduction" className="mb-4 text-xl font-semibold text-foreground">
          Introduction
        </h2>
        <p className="mb-4 text-muted-foreground">
          Welcome to <strong>Vibe with Nexus</strong> - a tutorial where you'll build a complete 
          full-stack application without writing a single line of code yourself. Instead, you'll 
          use OpenCode (or your preferred AI coding assistant) to do all the work while you 
          guide the process.
        </p>
        <p className="mb-4 text-muted-foreground">
          This is <strong>vibe coding</strong>: you describe what you want, the AI builds it, 
          and you iterate until it's perfect. Think of yourself as the architect and the AI 
          as your skilled contractor.
        </p>
        <Callout type="info" title="What is Vibe Coding?">
          <p className="text-sm">
            Vibe coding is a development approach where you guide AI assistants through natural 
            language to build your application. You focus on <em>what</em> you want, not 
            <em>how</em> to implement it. The AI handles the technical details while you 
            maintain creative control.
          </p>
        </Callout>
      </section>

      {/* What We'll Build */}
      <section className="mb-12">
        <h2 id="what-well-build" className="mb-4 text-xl font-semibold text-foreground">
          What We'll Build
        </h2>
        <p className="mb-4 text-muted-foreground">
          By the end of this tutorial, you'll have deployed a <strong>Link Bookmarking App</strong> with:
        </p>
        <ul className="mb-4 list-disc pl-6 text-muted-foreground space-y-2">
          <li><strong>TanStack Start</strong> - Modern React meta-framework with SSR</li>
          <li><strong>Cloudflare D1</strong> - SQLite database for storing bookmarks</li>
          <li><strong>Cloudflare R2</strong> - Object storage for bookmark screenshots/favicons</li>
          <li><strong>Cloudflare KV</strong> - Fast key-value store for caching</li>
          <li><strong>Cloudflare Workers</strong> - Serverless deployment at the edge</li>
        </ul>
        <p className="text-muted-foreground">
          All on Cloudflare's generous free tier - no credit card required.
        </p>
        <div className="mt-6 rounded-lg border border-border bg-card p-4">
          <h3 className="mb-2 font-medium text-foreground">App Features</h3>
          <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
            <li>Save bookmarks with title, URL, and description</li>
            <li>Automatic favicon fetching and caching</li>
            <li>Tag-based organization</li>
            <li>Full-text search across bookmarks</li>
            <li>Responsive design for mobile and desktop</li>
          </ul>
        </div>
      </section>

      {/* Prerequisites */}
      <section className="mb-12">
        <h2 id="prerequisites" className="mb-4 text-xl font-semibold text-foreground">
          Prerequisites
        </h2>
        <p className="mb-4 text-muted-foreground">
          Before starting, make sure you have:
        </p>
        <ul className="mb-4 list-disc pl-6 text-muted-foreground space-y-2">
          <li>
            <strong>OpenCode</strong> installed and configured with Nexus MCP
            <span className="text-xs ml-2 text-primary">(recommended)</span>
          </li>
          <li>
            <strong>Node.js 20+</strong> installed
          </li>
          <li>
            <strong>pnpm</strong> package manager (<code>npm install -g pnpm</code>)
          </li>
          <li>
            A <strong>Cloudflare account</strong> (free tier is fine)
          </li>
        </ul>
        <Callout type="warning" title="OpenCode Setup">
          <p className="text-sm">
            If you haven't set up OpenCode with Nexus yet, follow the{" "}
            <Link to="/docs/getting-started" className="text-primary hover:underline">
              Getting Started guide
            </Link>{" "}
            first. Nexus gives your AI assistant access to up-to-date documentation 
            for all the libraries we'll use.
          </p>
        </Callout>
      </section>

      {/* Phase 1: Project Setup */}
      <section className="mb-12">
        <h2 id="phase-1" className="mb-4 text-xl font-semibold text-foreground">
          Phase 1: Project Setup
        </h2>
        <p className="mb-4 text-muted-foreground">
          Let's start by creating our TanStack Start project. Open your terminal and run:
        </p>
        <CodeBlock language="bash">
{`# Create a new TanStack Start project
pnpm create @tanstack/start@latest bookmarks

# When prompted, select:
# - Framework: React
# - Add Tailwind CSS: Yes
# - Add shadcn/ui: Yes (optional but recommended)
# - Initialize git: Yes

cd bookmarks`}
        </CodeBlock>
        
        <p className="my-4 text-muted-foreground">
          Now open OpenCode in this directory and give it your first prompt:
        </p>
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm font-medium text-foreground mb-2">Prompt to OpenCode:</p>
          <p className="text-sm text-muted-foreground italic">
            "I want to deploy this TanStack Start app to Cloudflare Workers. Set up the 
            Cloudflare Vite plugin and wrangler configuration. Use wrangler.jsonc format. 
            The app name should be 'bookmarks-app'."
          </p>
        </div>

        <p className="my-4 text-muted-foreground">
          OpenCode will install the necessary dependencies and create the configuration files. 
          Verify it created these files:
        </p>
        <CodeBlock language="bash">
{`# Required files after setup:
# - wrangler.jsonc (Cloudflare configuration)
# - vite.config.ts (updated with Cloudflare plugin)

# Install dependencies if OpenCode hasn't already
pnpm install`}
        </CodeBlock>

        <Callout type="info" title="Expected wrangler.jsonc">
          <p className="text-sm">
            Your wrangler.jsonc should include <code>"nodejs_compat"</code> in compatibility_flags 
            and set <code>"main": "@tanstack/react-start/server-entry"</code>. If OpenCode 
            missed anything, ask it to fix the configuration.
          </p>
        </Callout>

        <p className="my-4 text-muted-foreground">
          Authenticate with Cloudflare:
        </p>
        <CodeBlock language="bash">
{`# Login to Cloudflare (opens browser)
pnpm wrangler login

# Verify you're logged in
pnpm wrangler whoami`}
        </CodeBlock>
      </section>

      {/* Phase 2: Database with D1 */}
      <section className="mb-12">
        <h2 id="phase-2" className="mb-4 text-xl font-semibold text-foreground">
          Phase 2: Database with D1
        </h2>
        <p className="mb-4 text-muted-foreground">
          Now let's create our D1 database for storing bookmarks.
        </p>
        <CodeBlock language="bash">
{`# Create the D1 database
pnpm wrangler d1 create bookmarks-db

# This outputs something like:
# ✅ Successfully created DB 'bookmarks-db'
# {
#   "d1_databases": [
#     {
#       "binding": "DB",
#       "database_name": "bookmarks-db",
#       "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
#     }
#   ]
# }`}
        </CodeBlock>

        <p className="my-4 text-muted-foreground">
          Now prompt OpenCode to set up the database:
        </p>
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm font-medium text-foreground mb-2">Prompt to OpenCode:</p>
          <p className="text-sm text-muted-foreground italic">
            "Add the D1 database binding to wrangler.jsonc. The database_id is [paste your ID]. 
            Use 'DB' as the binding name. Then create a database schema for a bookmarks app with 
            tables for: bookmarks (id, url, title, description, favicon_key, created_at, updated_at) 
            and tags (id, name) with a junction table bookmark_tags. Create this as a SQL migration 
            file in a 'migrations' folder."
          </p>
        </div>

        <p className="my-4 text-muted-foreground">
          After OpenCode creates the migration, apply it:
        </p>
        <CodeBlock language="bash">
{`# Apply migration locally first (for testing)
pnpm wrangler d1 execute bookmarks-db --local --file=migrations/0001_initial.sql

# Apply to production
pnpm wrangler d1 execute bookmarks-db --remote --file=migrations/0001_initial.sql`}
        </CodeBlock>

        <Callout type="warning" title="Check Your Schema">
          <p className="text-sm">
            Review the migration SQL that OpenCode generated. Make sure it includes proper 
            indexes for search queries and foreign key constraints. If something looks wrong, 
            ask OpenCode to fix it before applying.
          </p>
        </Callout>
      </section>

      {/* Phase 3: File Storage with R2 */}
      <section className="mb-12">
        <h2 id="phase-3" className="mb-4 text-xl font-semibold text-foreground">
          Phase 3: File Storage with R2
        </h2>
        <p className="mb-4 text-muted-foreground">
          R2 will store bookmark favicons and screenshots. Create the bucket:
        </p>
        <CodeBlock language="bash">
{`# Create R2 bucket for assets
pnpm wrangler r2 bucket create bookmarks-assets

# ✅ Created bucket "bookmarks-assets"`}
        </CodeBlock>

        <div className="my-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm font-medium text-foreground mb-2">Prompt to OpenCode:</p>
          <p className="text-sm text-muted-foreground italic">
            "Add the R2 bucket binding to wrangler.jsonc. The bucket name is 'bookmarks-assets' 
            and use 'ASSETS' as the binding name. Also add a preview bucket called 
            'bookmarks-assets-preview' for local development."
          </p>
        </div>
      </section>

      {/* Phase 4: Caching with KV */}
      <section className="mb-12">
        <h2 id="phase-4" className="mb-4 text-xl font-semibold text-foreground">
          Phase 4: Caching with KV
        </h2>
        <p className="mb-4 text-muted-foreground">
          KV provides fast edge caching for frequently accessed data:
        </p>
        <CodeBlock language="bash">
{`# Create KV namespace for caching
pnpm wrangler kv namespace create CACHE

# This outputs the namespace ID - copy it!
# ✅ Created namespace "CACHE"
# {
#   "kv_namespaces": [
#     {
#       "binding": "CACHE",
#       "id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
#     }
#   ]
# }

# Create a preview namespace for local dev
pnpm wrangler kv namespace create CACHE --preview`}
        </CodeBlock>

        <div className="my-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm font-medium text-foreground mb-2">Prompt to OpenCode:</p>
          <p className="text-sm text-muted-foreground italic">
            "Add the KV namespace binding to wrangler.jsonc. Use 'CACHE' as the binding name 
            with namespace ID [paste ID] and preview ID [paste preview ID]."
          </p>
        </div>

        <p className="my-4 text-muted-foreground">
          Your wrangler.jsonc should now have all three bindings:
        </p>
        <CodeBlock language="json">
{`{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "bookmarks-app",
  "compatibility_date": "2025-01-01",
  "compatibility_flags": ["nodejs_compat"],
  "main": "@tanstack/react-start/server-entry",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "bookmarks-db",
      "database_id": "your-database-id"
    }
  ],
  "r2_buckets": [
    {
      "binding": "ASSETS",
      "bucket_name": "bookmarks-assets",
      "preview_bucket_name": "bookmarks-assets-preview"
    }
  ],
  "kv_namespaces": [
    {
      "binding": "CACHE",
      "id": "your-namespace-id",
      "preview_id": "your-preview-id"
    }
  ]
}`}
        </CodeBlock>
      </section>

      {/* Phase 5: Build the App */}
      <section className="mb-12">
        <h2 id="phase-5" className="mb-4 text-xl font-semibold text-foreground">
          Phase 5: Build the App
        </h2>
        <p className="mb-4 text-muted-foreground">
          Now comes the fun part - building the actual application. This is where vibe coding 
          shines. Give OpenCode detailed prompts for each feature:
        </p>

        <h3 className="mt-6 mb-3 text-lg font-medium text-foreground">5.1 Type-Safe Bindings</h3>
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm font-medium text-foreground mb-2">Prompt to OpenCode:</p>
          <p className="text-sm text-muted-foreground italic">
            "Create TypeScript types for the Cloudflare bindings (D1, R2, KV) and make them 
            available in TanStack Start server functions. Create an 'app/env.ts' file that 
            exports typed access to these bindings from the request context."
          </p>
        </div>

        <h3 className="mt-6 mb-3 text-lg font-medium text-foreground">5.2 Database Access Layer</h3>
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm font-medium text-foreground mb-2">Prompt to OpenCode:</p>
          <p className="text-sm text-muted-foreground italic">
            "Create a data access layer in 'app/db' with functions for: creating bookmarks, 
            listing bookmarks with pagination, searching bookmarks by title/description, 
            managing tags, and getting bookmarks by tag. Use prepared statements for all 
            queries. Make sure all functions are type-safe."
          </p>
        </div>

        <h3 className="mt-6 mb-3 text-lg font-medium text-foreground">5.3 Asset Storage</h3>
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm font-medium text-foreground mb-2">Prompt to OpenCode:</p>
          <p className="text-sm text-muted-foreground italic">
            "Create R2 utility functions in 'app/storage.ts' for: uploading favicons, 
            fetching favicons by key, and generating signed URLs if needed. Also create 
            a function to fetch a favicon from a URL and store it in R2, using KV to 
            cache the R2 key for quick lookups."
          </p>
        </div>

        <h3 className="mt-6 mb-3 text-lg font-medium text-foreground">5.4 Server Functions</h3>
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm font-medium text-foreground mb-2">Prompt to OpenCode:</p>
          <p className="text-sm text-muted-foreground italic">
            "Create TanStack Start server functions in 'app/server' for: createBookmark (with 
            automatic favicon fetching), listBookmarks, searchBookmarks, deleteBookmark, 
            addTag, removeTag. Use createServerFn from '@tanstack/react-start'."
          </p>
        </div>

        <h3 className="mt-6 mb-3 text-lg font-medium text-foreground">5.5 UI Components</h3>
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm font-medium text-foreground mb-2">Prompt to OpenCode:</p>
          <p className="text-sm text-muted-foreground italic">
            "Build the UI components: a BookmarkCard component showing favicon/title/description/tags, 
            a BookmarkForm for adding new bookmarks, a SearchBar component, a TagFilter component, 
            and a BookmarkList component with infinite scroll. Use Tailwind CSS and make it 
            responsive. The design should be clean and modern with a dark mode option."
          </p>
        </div>

        <h3 className="mt-6 mb-3 text-lg font-medium text-foreground">5.6 Routes</h3>
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm font-medium text-foreground mb-2">Prompt to OpenCode:</p>
          <p className="text-sm text-muted-foreground italic">
            "Create TanStack Start routes: index route showing all bookmarks with search, 
            /add route for the bookmark form, /tags route showing all tags, and /tags/$tag 
            route showing bookmarks for a specific tag. Use loader functions to fetch data 
            on the server."
          </p>
        </div>

        <Callout type="info" title="Iterative Development">
          <p className="text-sm">
            Don't try to build everything at once. Work on one feature at a time, test it 
            locally with <code>pnpm dev</code>, and iterate. If something doesn't work, 
            show OpenCode the error and ask it to fix it.
          </p>
        </Callout>

        <p className="my-4 text-muted-foreground">
          Test your app locally:
        </p>
        <CodeBlock language="bash">
{`# Start the dev server
pnpm dev

# Open http://localhost:3000 in your browser`}
        </CodeBlock>
      </section>

      {/* Phase 6: Deploy */}
      <section className="mb-12">
        <h2 id="phase-6" className="mb-4 text-xl font-semibold text-foreground">
          Phase 6: Deploy to Cloudflare
        </h2>
        <p className="mb-4 text-muted-foreground">
          Time to go live! First, make sure everything builds:
        </p>
        <CodeBlock language="bash">
{`# Build the app
pnpm build

# If you see any TypeScript errors, ask OpenCode to fix them:
# "Fix the TypeScript errors in [file]: [paste error]"

# Run type check explicitly
pnpm tsc --noEmit`}
        </CodeBlock>

        <p className="my-4 text-muted-foreground">
          Deploy to Cloudflare Workers:
        </p>
        <CodeBlock language="bash">
{`# Deploy!
pnpm wrangler deploy

# ✅ Published bookmarks-app (x.xx sec)
# https://bookmarks-app.your-subdomain.workers.dev`}
        </CodeBlock>

        <Callout type="success" title="Congratulations!">
          <p className="text-sm">
            Your app is now live on Cloudflare's global edge network! Visit your deployment 
            URL to see it in action. Any changes you make can be deployed with the same 
            <code>wrangler deploy</code> command.
          </p>
        </Callout>

        <h3 className="mt-6 mb-3 text-lg font-medium text-foreground">Custom Domain (Optional)</h3>
        <p className="mb-4 text-muted-foreground">
          To add a custom domain:
        </p>
        <CodeBlock language="bash">
{`# Add a custom route (requires domain in Cloudflare)
# Update wrangler.jsonc:
{
  "routes": [
    {
      "pattern": "bookmarks.yourdomain.com",
      "custom_domain": true
    }
  ]
}`}
        </CodeBlock>
      </section>

      {/* Vibe Coding Tips */}
      <section className="mb-12">
        <h2 id="tips" className="mb-4 text-xl font-semibold text-foreground">
          Vibe Coding Tips
        </h2>
        <p className="mb-4 text-muted-foreground">
          Here are some tips for getting the most out of vibe coding with OpenCode and Nexus:
        </p>

        <div className="space-y-4">
          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-2 font-medium text-foreground">1. Be Specific</h3>
            <p className="text-sm text-muted-foreground">
              Instead of "add a form", say "add a form with fields for URL (required), 
              title (auto-populated from URL metadata), description (optional textarea), 
              and tags (multi-select). Include validation and loading states."
            </p>
          </div>

          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-2 font-medium text-foreground">2. Reference Documentation</h3>
            <p className="text-sm text-muted-foreground">
              Use Nexus! Ask: "Use Nexus to look up how to create server functions in 
              TanStack Start" or "Check the Cloudflare D1 docs for batch insert syntax."
            </p>
          </div>

          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-2 font-medium text-foreground">3. Show Errors Immediately</h3>
            <p className="text-sm text-muted-foreground">
              When you see an error, paste the full error message and stack trace. Say 
              "I'm getting this error when..." and include context about what you were doing.
            </p>
          </div>

          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-2 font-medium text-foreground">4. Review Before Applying</h3>
            <p className="text-sm text-muted-foreground">
              Use OpenCode's diff view to review changes before applying them. If something 
              looks wrong, ask questions before accepting the changes.
            </p>
          </div>

          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-2 font-medium text-foreground">5. Commit Often</h3>
            <p className="text-sm text-muted-foreground">
              After each working feature, ask OpenCode to commit: "Commit these changes with 
              a descriptive message." This lets you rollback if something breaks.
            </p>
          </div>

          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-2 font-medium text-foreground">6. Use Memory</h3>
            <p className="text-sm text-muted-foreground">
              Save important decisions with Nexus memory: "Save a memory about our database 
              schema design decisions." This helps maintain context across sessions.
            </p>
          </div>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="mb-12">
        <h2 id="troubleshooting" className="mb-4 text-xl font-semibold text-foreground">
          Troubleshooting
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="mb-2 font-medium text-foreground">
              "Cannot find module" errors
            </h3>
            <p className="mb-2 text-sm text-muted-foreground">
              Make sure all dependencies are installed:
            </p>
            <CodeBlock language="bash">
{`pnpm install`}
            </CodeBlock>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-foreground">
              D1 binding not found
            </h3>
            <p className="mb-2 text-sm text-muted-foreground">
              Ensure your wrangler.jsonc has the correct database_id and the binding 
              name matches what your code expects. Restart the dev server after changes.
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-foreground">
              R2 bucket access denied
            </h3>
            <p className="mb-2 text-sm text-muted-foreground">
              For local development, make sure you created a preview bucket. Check that 
              <code>preview_bucket_name</code> is set in wrangler.jsonc.
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-foreground">
              Build fails with TypeScript errors
            </h3>
            <p className="mb-2 text-sm text-muted-foreground">
              Copy the full error and paste it to OpenCode: "Fix this TypeScript error: 
              [paste error]". Most type errors are straightforward fixes.
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-foreground">
              Deployment fails
            </h3>
            <p className="mb-2 text-sm text-muted-foreground">
              Check that you're logged in with <code>wrangler whoami</code>. Verify your 
              wrangler.jsonc configuration matches the resources you created.
            </p>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Next Steps
        </h2>
        <p className="mb-4 text-muted-foreground">
          Congratulations on building and deploying your first vibe-coded app! Here are 
          some ideas for extending it:
        </p>
        <ul className="mb-4 list-disc pl-6 text-muted-foreground space-y-2">
          <li>Add authentication with Cloudflare Access or a third-party provider</li>
          <li>Implement bookmark import/export (JSON, HTML bookmarks file)</li>
          <li>Add link previews with Open Graph metadata</li>
          <li>Create a browser extension to save bookmarks quickly</li>
          <li>Add analytics with Cloudflare Analytics</li>
        </ul>
        <p className="text-muted-foreground">
          Remember: you don't need to code these yourself. Just describe what you want 
          to OpenCode and let it handle the implementation!
        </p>
      </section>
    </DocsLayout>
  );
}
