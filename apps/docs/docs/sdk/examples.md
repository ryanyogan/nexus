# SDK Examples

Practical code examples for common SDK use cases.

## Documentation Search

### Search for Libraries

```typescript
import { Nexus } from "@nexus/sdk";

const nexus = new Nexus({ apiKey: process.env.NEXUS_API_KEY! });

// Search for libraries by name
const results = await nexus.searchLibrary("react state management");

results.forEach(lib => {
  console.log(`${lib.name}: ${lib.description}`);
  console.log(`  ID: ${lib.id}`);
  console.log(`  Snippets: ${lib.totalSnippets}`);
});
```

### Query Library Documentation

```typescript
// First resolve the library ID
const libraryId = await nexus.resolveLibraryId("nextjs");

if (libraryId) {
  // Query documentation
  const docs = await nexus.queryDocs(libraryId, "server components data fetching", {
    limit: 5
  });

  docs.chunks.forEach(chunk => {
    console.log(`## ${chunk.title}`);
    console.log(chunk.content);
    console.log(`Source: ${chunk.sourceFile}`);
    console.log(`Score: ${chunk.score}`);
    console.log("---");
  });
}
```

### List Libraries by Category

```typescript
const frontend = await nexus.listLibraries({
  category: "frontend",
  featured: true,
  limit: 10
});

console.log(`Found ${frontend.total} frontend libraries`);
frontend.libraries.forEach(lib => {
  console.log(`- ${lib.name} (${lib.totalChunks} chunks)`);
});
```

## Memory Management

### Save Project Context

```typescript
// Save architectural context
await nexus.saveMemory({
  title: "Tech Stack Overview",
  content: `
    This project uses:
    - Next.js 14 with App Router
    - Tailwind CSS for styling
    - Drizzle ORM with PostgreSQL
    - Better Auth for authentication
    - Deployed on Vercel
  `,
  type: "project_context",
  project: "my-saas",
  tags: ["architecture", "tech-stack"],
  importance: 9
});
```

### Save Architectural Decisions

```typescript
await nexus.saveMemory({
  title: "Database Choice: PostgreSQL over MongoDB",
  content: `
    Decision: Use PostgreSQL instead of MongoDB
    
    Rationale:
    - Strong relational data model needed for user relationships
    - Better support for complex queries
    - Drizzle ORM provides excellent type safety
    - Vercel Postgres for easy deployment
    
    Trade-offs:
    - Less flexible schema, but we don't need that flexibility
    - Slightly more complex setup, but migrations are cleaner
  `,
  type: "decision",
  project: "my-saas",
  tags: ["database", "postgresql", "architecture"],
  importance: 8
});
```

### Save Corrections (Lessons Learned)

```typescript
await nexus.saveMemory({
  title: "Avoid useEffect for Server Data",
  content: `
    WRONG approach used initially:
    useEffect(() => { fetchData() }, [])
    
    CORRECT approach for Next.js App Router:
    - Use Server Components for initial data
    - Use SWR or TanStack Query for client-side fetching
    - Avoid useEffect for data that can be fetched on server
    
    This caused hydration mismatches and unnecessary loading states.
  `,
  type: "correction",
  project: "my-saas",
  tags: ["nextjs", "data-fetching", "hooks"],
  importance: 7
});
```

### Recall Memories

```typescript
// Semantic search for relevant memories
const memories = await nexus.recallMemories({
  query: "how do we handle user authentication",
  project: "my-saas",
  limit: 3
});

memories.forEach(mem => {
  console.log(`[${mem.type}] ${mem.title}`);
  console.log(mem.content);
});
```

### Load Project Context

```typescript
// Get all context at start of session
const context = await nexus.getProjectContext("my-saas");

console.log("=== Project Context ===");
context.projectContext.forEach(m => console.log(`- ${m.title}`));

console.log("\n=== Decisions ===");
context.decisions.forEach(m => console.log(`- ${m.title}`));

console.log("\n=== Corrections ===");
context.corrections.forEach(m => console.log(`- ${m.title}`));
```

## MCP Server Discovery

### Find Database Servers

```typescript
const dbServers = await nexus.discoverServers({
  query: "postgresql",
  category: "database",
  official: true
});

dbServers.forEach(server => {
  console.log(`${server.displayName || server.name}`);
  console.log(`  Package: ${server.packageName}`);
  console.log(`  Transport: ${server.transportType}`);
  console.log(`  Official: ${server.isOfficial}`);
});
```

### Get Server Configuration

```typescript
// Get config for Claude Desktop
const config = await nexus.getServerConfig("postgres", "claude-desktop");

console.log("Add this to your config:");
console.log(JSON.stringify(config.claudeDesktop, null, 2));
```

### List All Server Categories

```typescript
const servers = await nexus.discoverServers({ limit: 100 });

// Group by category
const byCategory = new Map<string, typeof servers>();
servers.forEach(server => {
  server.categories.forEach(cat => {
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(server);
  });
});

byCategory.forEach((servers, category) => {
  console.log(`\n${category.toUpperCase()} (${servers.length})`);
  servers.slice(0, 5).forEach(s => console.log(`  - ${s.name}`));
});
```

## Remote Tunnel

### Start a Tunnel

```typescript
import { NexusTunnel } from "@nexus/sdk/tunnel";

const tunnel = new NexusTunnel({
  apiKey: process.env.NEXUS_API_KEY!,
  serverUrl: "http://localhost:4096",
  sessionName: "dev-laptop"
});

// Event handlers
tunnel.on("connected", (event) => {
  const { publicUrl } = event.data as { publicUrl: string };
  console.log(`Tunnel active at: ${publicUrl}`);
});

tunnel.on("activity", (event) => {
  const { path, status } = event.data as { path: string; status: number };
  console.log(`Request: ${path} (${status})`);
});

tunnel.on("error", (event) => {
  console.error("Tunnel error:", event.data);
});

// Connect
await tunnel.connect();

// Later: disconnect
// tunnel.disconnect();
```

### Monitor Tunnel Status

```typescript
setInterval(() => {
  const status = tunnel.status;
  console.log(`
    Connected: ${status.connected}
    Public URL: ${status.publicUrl}
    Messages Relayed: ${status.messagesRelayed}
    Last Activity: ${status.lastActivity?.toISOString()}
  `);
}, 5000);
```

## Error Handling

### Handle API Errors

```typescript
import { Nexus, NexusError } from "@nexus/sdk";

const nexus = new Nexus({ apiKey: process.env.NEXUS_API_KEY! });

try {
  const docs = await nexus.queryDocs("nonexistent-library", "query");
} catch (error) {
  if (error instanceof NexusError) {
    switch (error.statusCode) {
      case 404:
        console.log("Library not found");
        break;
      case 429:
        console.log("Rate limited, retrying in 60s...");
        await new Promise(r => setTimeout(r, 60000));
        break;
      case 401:
        console.log("Invalid API key");
        break;
      default:
        console.error(`API error: ${error.message}`);
    }
  } else {
    throw error;
  }
}
```

### Retry with Exponential Backoff

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (error instanceof NexusError && error.statusCode === 429) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Rate limited, waiting ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
}

// Usage
const docs = await withRetry(() => 
  nexus.queryDocs("react", "hooks")
);
```

## Full Application Example

### AI Coding Assistant Helper

```typescript
import { Nexus } from "@nexus/sdk";

class AIAssistant {
  private nexus: Nexus;
  private project: string;

  constructor(apiKey: string, project: string) {
    this.nexus = new Nexus({ apiKey });
    this.project = project;
  }

  async loadContext(): Promise<string> {
    const context = await this.nexus.getProjectContext(this.project);
    
    let prompt = "# Project Context\n\n";
    
    if (context.projectContext.length > 0) {
      prompt += "## Architecture\n";
      context.projectContext.forEach(m => {
        prompt += `### ${m.title}\n${m.content}\n\n`;
      });
    }
    
    if (context.corrections.length > 0) {
      prompt += "## Things to Avoid\n";
      context.corrections.forEach(m => {
        prompt += `- ${m.title}: ${m.content}\n`;
      });
    }
    
    return prompt;
  }

  async searchDocs(library: string, query: string): Promise<string> {
    const libraryId = await this.nexus.resolveLibraryId(library);
    if (!libraryId) return `Library "${library}" not found`;
    
    const docs = await this.nexus.queryDocs(libraryId, query, { limit: 3 });
    
    let result = `# ${library} Documentation\n\n`;
    docs.chunks.forEach(chunk => {
      result += `## ${chunk.title}\n${chunk.content}\n\n`;
    });
    
    return result;
  }

  async saveDecision(title: string, content: string): Promise<void> {
    await this.nexus.saveMemory({
      title,
      content,
      type: "decision",
      project: this.project,
      importance: 7
    });
  }

  async recall(query: string): Promise<string> {
    const memories = await this.nexus.recallMemories({
      query,
      project: this.project,
      limit: 5
    });
    
    if (memories.length === 0) return "No relevant memories found";
    
    let result = "# Relevant Context\n\n";
    memories.forEach(m => {
      result += `## ${m.title} (${m.type})\n${m.content}\n\n`;
    });
    
    return result;
  }
}

// Usage
const assistant = new AIAssistant(process.env.NEXUS_API_KEY!, "my-saas");

// At start of session
const context = await assistant.loadContext();
console.log(context);

// When user asks about a library
const docs = await assistant.searchDocs("drizzle", "migrations");
console.log(docs);

// When making a decision
await assistant.saveDecision(
  "Use React Server Components for data fetching",
  "Decided to fetch all initial page data in Server Components..."
);
```
