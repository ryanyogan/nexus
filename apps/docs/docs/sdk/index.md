# TypeScript SDK

The official Nexus TypeScript SDK provides programmatic access to documentation search, memory management, MCP server discovery, and remote tunnel capabilities.

## Features

- **Documentation Search** - Query indexed library documentation
- **Memory Management** - Store and retrieve persistent memories
- **MCP Server Discovery** - Find and configure MCP servers
- **Remote Tunnel** - Connect local sessions to the web terminal

## Quick Start

```typescript
import { Nexus } from "@nexus/sdk";

const nexus = new Nexus({ apiKey: "your-api-key" });

// Search for libraries
const libraries = await nexus.searchLibrary("react hooks");

// Query documentation
const docs = await nexus.queryDocs("react", "how to use useState");

// Save a memory
await nexus.saveMemory({
  title: "Project architecture",
  content: "We use Next.js with App Router...",
  type: "project_context",
  project: "my-app"
});

// Recall memories
const memories = await nexus.recallMemories({
  query: "authentication flow",
  project: "my-app"
});
```

## Installation

```bash
npm install @nexus/sdk
```

See the [Installation Guide](/sdk/installation) for detailed setup instructions.

## Client Configuration

```typescript
import { Nexus } from "@nexus/sdk";

const nexus = new Nexus({
  // Required: API key from nexus.yogan.dev/dashboard/keys
  apiKey: process.env.NEXUS_API_KEY,
  
  // Optional: Custom base URL
  baseUrl: "https://api.nexus.yogan.dev",
  
  // Optional: Request timeout in ms (default: 30000)
  timeout: 30000
});
```

## Main Classes

### Nexus

The main client class for all API operations.

```typescript
class Nexus {
  constructor(config: NexusConfig);
  
  // Documentation
  searchLibrary(query: string, options?: { limit?: number }): Promise<LibrarySearchResult[]>;
  resolveLibraryId(libraryName: string): Promise<string | null>;
  queryDocs(libraryId: string, query: string, options?: { limit?: number }): Promise<QueryDocsResult>;
  getLibrary(libraryId: string): Promise<Library>;
  listLibraries(options?: ListLibrariesOptions): Promise<{ libraries: Library[]; total: number }>;
  
  // Memory
  saveMemory(options: SaveMemoryOptions): Promise<Memory>;
  recallMemories(options: RecallMemoriesOptions): Promise<Memory[]>;
  getProjectContext(project: string, options?: { limit?: number }): Promise<ProjectContext>;
  listMemories(options?: ListMemoriesOptions): Promise<{ memories: Memory[]; total: number }>;
  updateMemory(memoryId: string, updates: MemoryUpdates): Promise<Memory>;
  deleteMemory(memoryId: string): Promise<void>;
  
  // MCP Servers
  discoverServers(options?: DiscoverServersOptions): Promise<McpServer[]>;
  getServer(serverId: string): Promise<McpServer>;
  getServerConfig(serverId: string, format?: ConfigFormat): Promise<ServerConfig>;
  
  // Stats
  getStats(): Promise<PlatformStats>;
}
```

### NexusTunnel

Remote tunnel client for connecting local sessions to the web terminal.

```typescript
import { NexusTunnel } from "@nexus/sdk/tunnel";

class NexusTunnel {
  constructor(config: TunnelConfig);
  
  connect(): Promise<void>;
  disconnect(): void;
  
  get status(): TunnelStatus;
  get isConnected(): boolean;
  
  on(event: TunnelEventType, handler: TunnelEventHandler): void;
  off(event: TunnelEventType, handler: TunnelEventHandler): void;
}
```

## Error Handling

The SDK throws `NexusError` for API errors:

```typescript
import { Nexus, NexusError } from "@nexus/sdk";

try {
  const docs = await nexus.queryDocs("unknown-library", "query");
} catch (error) {
  if (error instanceof NexusError) {
    console.error(`API Error (${error.statusCode}): ${error.message}`);
    // Handle specific status codes
    if (error.statusCode === 404) {
      console.log("Library not found");
    }
  }
}
```

## TypeScript Types

All types are fully exported:

```typescript
import type {
  NexusConfig,
  Library,
  LibrarySearchResult,
  DocChunk,
  QueryDocsResult,
  Memory,
  SaveMemoryOptions,
  RecallMemoriesOptions,
  McpServer,
  ServerConfig,
} from "@nexus/sdk";
```

## Next Steps

- [Installation](/sdk/installation) - Setup and configuration
- [Examples](/sdk/examples) - Code examples for common use cases
- [API Reference](/api/) - REST API documentation
