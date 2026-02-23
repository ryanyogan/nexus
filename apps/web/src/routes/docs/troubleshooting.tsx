import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "../../components/docs/DocsLayout";
import { CodeBlock } from "../../components/docs/CodeBlock";
import { Callout } from "../../components/docs/Callout";

export const Route = createFileRoute("/docs/troubleshooting")({
  component: TroubleshootingPage,
});

function TroubleshootingPage() {
  const toc = [
    { id: "connection-issues", title: "Connection Issues", level: 2 },
    { id: "tool-errors", title: "Tool Errors", level: 2 },
    { id: "search-problems", title: "Search Problems", level: 2 },
    { id: "memory-issues", title: "Memory Issues", level: 2 },
    { id: "performance", title: "Performance", level: 2 },
    { id: "faq", title: "FAQ", level: 2 },
    { id: "getting-help", title: "Getting Help", level: 2 },
  ];

  return (
    <DocsLayout
      title="Troubleshooting"
      description="Common issues and solutions for Nexus"
      toc={toc}
    >
      {/* Connection Issues */}
      <section className="mb-12">
        <h2 id="connection-issues" className="mb-4 text-xl font-semibold text-foreground">
          Connection Issues
        </h2>
        
        <div className="space-y-6">
          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-2 font-medium text-foreground">
              Nexus tools don't appear in my MCP client
            </h3>
            <p className="mb-3 text-muted-foreground">
              If you don't see Nexus tools after configuration:
            </p>
            <ol className="list-decimal pl-6 text-muted-foreground">
              <li className="mb-2">Verify your config file is valid JSON</li>
              <li className="mb-2">Check that the config file is in the correct location</li>
              <li className="mb-2">Restart your MCP client completely</li>
              <li className="mb-2">Check client logs for connection errors</li>
            </ol>
            <CodeBlock language="bash">
{`# Verify npx can run the server
npx -y @anthropic/nexus-mcp --version`}
            </CodeBlock>
          </div>

          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-2 font-medium text-foreground">
              "ENOENT: no such file or directory" error
            </h3>
            <p className="mb-3 text-muted-foreground">
              This usually means Node.js or npx isn't installed or isn't in your PATH.
            </p>
            <ol className="list-decimal pl-6 text-muted-foreground">
              <li className="mb-2">Install Node.js from nodejs.org (v18+ recommended)</li>
              <li className="mb-2">Verify installation: <code>node --version</code></li>
              <li className="mb-2">Restart your terminal and MCP client</li>
            </ol>
          </div>

          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-2 font-medium text-foreground">
              Timeout errors when connecting
            </h3>
            <p className="mb-3 text-muted-foreground">
              If connections are timing out:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li className="mb-2">Check your internet connection</li>
              <li className="mb-2">Verify api.nexus.yogan.dev is accessible</li>
              <li className="mb-2">Try increasing timeout in client settings if available</li>
              <li className="mb-2">Check if a firewall is blocking outbound connections</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Tool Errors */}
      <section className="mb-12">
        <h2 id="tool-errors" className="mb-4 text-xl font-semibold text-foreground">
          Tool Errors
        </h2>

        <div className="space-y-6">
          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-2 font-medium text-foreground">
              "Library not found" error
            </h3>
            <p className="mb-3 text-muted-foreground">
              When resolve-library can't find a library:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li className="mb-2">Try different name variations (e.g., "tanstack-query" vs "react-query")</li>
              <li className="mb-2">Check the <a href="/explore" className="text-primary hover:underline">Explore page</a> for available libraries</li>
              <li className="mb-2">The library might not be indexed yet - <a href="/submit" className="text-primary hover:underline">submit it</a></li>
            </ul>
          </div>

          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-2 font-medium text-foreground">
              Empty results from query-docs
            </h3>
            <p className="mb-3 text-muted-foreground">
              If semantic search returns no results:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li className="mb-2">Try a more specific query (e.g., "useQuery hook" instead of "queries")</li>
              <li className="mb-2">Use different terminology - the docs might use different words</li>
              <li className="mb-2">Check if the library was fully indexed (some have limited coverage)</li>
              <li className="mb-2">Try get-library-info to see the snippet count</li>
            </ul>
          </div>

          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-2 font-medium text-foreground">
              "Invalid parameter" errors
            </h3>
            <p className="mb-3 text-muted-foreground">
              If you're getting parameter validation errors:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li className="mb-2">Check required parameters are provided</li>
              <li className="mb-2">Verify parameter types (strings vs numbers)</li>
              <li className="mb-2">See the <a href="/docs/mcp-tools" className="text-primary hover:underline">MCP Tools docs</a> for correct usage</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Search Problems */}
      <section className="mb-12">
        <h2 id="search-problems" className="mb-4 text-xl font-semibold text-foreground">
          Search Problems
        </h2>

        <div className="space-y-6">
          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-2 font-medium text-foreground">
              Search results aren't relevant
            </h3>
            <p className="mb-3 text-muted-foreground">
              To improve search quality:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li className="mb-2">Be specific about what you're trying to accomplish</li>
              <li className="mb-2">Include context (e.g., "in React" or "with TypeScript")</li>
              <li className="mb-2">Try phrasing as a question</li>
              <li className="mb-2">Use the library's terminology when you know it</li>
            </ul>
            <Callout type="tip" title="Good vs Bad Queries">
              <p className="text-sm">
                <strong>Good:</strong> "How to set up authentication with JWT in Express.js"<br />
                <strong>Bad:</strong> "auth"
              </p>
            </Callout>
          </div>

          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-2 font-medium text-foreground">
              Missing documentation sections
            </h3>
            <p className="mb-3 text-muted-foreground">
              Some libraries have partial documentation coverage. This happens when:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li className="mb-2">The library's docs are split across multiple sources</li>
              <li className="mb-2">Some sections failed to index properly</li>
              <li className="mb-2">The documentation was recently updated</li>
            </ul>
            <p className="text-muted-foreground">
              You can request a re-index by submitting the library again.
            </p>
          </div>
        </div>
      </section>

      {/* Memory Issues */}
      <section className="mb-12">
        <h2 id="memory-issues" className="mb-4 text-xl font-semibold text-foreground">
          Memory Issues
        </h2>

        <div className="space-y-6">
          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-2 font-medium text-foreground">
              Memories not persisting
            </h3>
            <p className="mb-3 text-muted-foreground">
              If memories aren't being saved:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li className="mb-2">Verify the save-memory call succeeded (check for errors)</li>
              <li className="mb-2">Use consistent project names across sessions</li>
              <li className="mb-2">Check that required parameters (content, title, type) are provided</li>
            </ul>
          </div>

          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-2 font-medium text-foreground">
              Can't find saved memories
            </h3>
            <p className="mb-3 text-muted-foreground">
              If recall-memories isn't finding your memories:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li className="mb-2">Use get-project-context with your project name to list all</li>
              <li className="mb-2">Try different search terms - semantic search is fuzzy</li>
              <li className="mb-2">Use list-memories to browse without search</li>
              <li className="mb-2">Check if you're filtering by the correct project</li>
            </ul>
          </div>

          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-2 font-medium text-foreground">
              Memory storage limits
            </h3>
            <p className="text-muted-foreground">
              Nexus has generous storage limits, but very large memories may be truncated.
              For best results, keep individual memories focused and under 10,000 characters.
              Split large context into multiple memories with specific topics.
            </p>
          </div>
        </div>
      </section>

      {/* Performance */}
      <section className="mb-12">
        <h2 id="performance" className="mb-4 text-xl font-semibold text-foreground">
          Performance
        </h2>

        <div className="space-y-6">
          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-2 font-medium text-foreground">
              Slow response times
            </h3>
            <p className="mb-3 text-muted-foreground">
              If queries are taking too long:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li className="mb-2">Vector search typically takes 100-500ms</li>
              <li className="mb-2">First request may be slower (cold start)</li>
              <li className="mb-2">Complex queries with multiple filters take longer</li>
              <li className="mb-2">Check your network latency to Cloudflare edge</li>
            </ul>
          </div>

          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-2 font-medium text-foreground">
              Optimizing for speed
            </h3>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li className="mb-2">Use lower limit values when you only need a few results</li>
              <li className="mb-2">Filter by project or type when possible</li>
              <li className="mb-2">Use list-libraries to browse rather than searching if unsure</li>
              <li className="mb-2">Cache library IDs locally to skip resolve-library calls</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 id="faq" className="mb-4 text-xl font-semibold text-foreground">
          FAQ
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="mb-2 font-medium text-foreground">
              Is my data private?
            </h3>
            <p className="text-muted-foreground">
              Yes. Memories are stored securely and are only accessible through your
              MCP session. Documentation queries are not logged or stored.
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-foreground">
              Can I use Nexus offline?
            </h3>
            <p className="text-muted-foreground">
              No, Nexus requires an internet connection to access the documentation
              database and vector search. Consider caching frequently used documentation
              locally if you need offline access.
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-foreground">
              How often is documentation updated?
            </h3>
            <p className="text-muted-foreground">
              Documentation is re-indexed periodically or when users request updates
              through new submissions. Major library updates are typically indexed
              within a few days.
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-foreground">
              Why doesn't my library have many snippets?
            </h3>
            <p className="text-muted-foreground">
              Snippet count depends on the library's documentation size and format.
              Some libraries have extensive docs (1000+ snippets), while smaller
              libraries may have fewer. Quality matters more than quantity.
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-foreground">
              Can I use Nexus with any MCP client?
            </h3>
            <p className="text-muted-foreground">
              Yes! Nexus is a standard MCP server that works with any MCP-compatible
              client including OpenCode, Claude Desktop, Cursor, Windsurf, and others.
            </p>
          </div>
        </div>
      </section>

      {/* Getting Help */}
      <section className="mb-12">
        <h2 id="getting-help" className="mb-4 text-xl font-semibold text-foreground">
          Getting Help
        </h2>
        <p className="mb-4 text-muted-foreground">
          If you can't find a solution here:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground">
          <li className="mb-2">
            Check the{" "}
            <a 
              href="https://github.com/anthropics/nexus-mcp/issues" 
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub Issues
            </a>{" "}
            for known problems
          </li>
          <li className="mb-2">
            Open a new issue with details about your problem
          </li>
          <li className="mb-2">
            Include: MCP client name/version, error messages, and steps to reproduce
          </li>
        </ul>
        <Callout type="info" title="Submitting a Good Bug Report">
          Include: your MCP client, the tool you were using, the parameters you provided,
          the error message, and what you expected to happen.
        </Callout>
      </section>
    </DocsLayout>
  );
}
