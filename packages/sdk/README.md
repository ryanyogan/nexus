# @nexus/sdk

Official SDK for the Nexus AI Coding Platform. Provides documentation search, persistent memory, MCP server discovery, and OpenCode remote tunnel capabilities.

## Installation

```bash
npm install @nexus/sdk
# or
pnpm add @nexus/sdk
# or
yarn add @nexus/sdk
```

## Quick Start

```typescript
import { Nexus } from "@nexus/sdk";

const nexus = new Nexus({
  apiKey: "your-api-key", // Get from https://nexus.yogan.dev/dashboard/keys
});

// Search for libraries
const libraries = await nexus.searchLibrary("react hooks");
console.log(libraries[0].id); // "react"

// Query documentation
const docs = await nexus.queryDocs("react", "how to use useState");
docs.chunks.forEach((chunk) => {
  console.log(chunk.title, chunk.content);
});

// Save a memory
await nexus.saveMemory({
  title: "Auth decision",
  content: "We chose JWT tokens in httpOnly cookies...",
  type: "decision",
  project: "my-app",
});

// Recall memories
const memories = await nexus.recallMemories({
  query: "authentication",
  project: "my-app",
});
```

## Features

### Documentation Search

```typescript
// Search for libraries
const results = await nexus.searchLibrary("state management");

// Resolve library name to ID
const libraryId = await nexus.resolveLibraryId("nextjs");

// Query documentation
const docs = await nexus.queryDocs("react", "server components", {
  limit: 10,
});

// Get library info
const library = await nexus.getLibrary("react");

// List all libraries
const { libraries, total } = await nexus.listLibraries({
  category: "frontend",
  featured: true,
});
```

### Persistent Memory

```typescript
// Save different types of memories
await nexus.saveMemory({
  title: "Project architecture",
  content: "This project uses a monorepo structure with...",
  type: "project_context",
  project: "my-app",
  tags: ["architecture", "monorepo"],
  importance: 8,
});

// Recall memories with semantic search
const memories = await nexus.recallMemories({
  query: "how does authentication work",
  project: "my-app",
  type: "decision",
  limit: 5,
});

// Get all project context
const context = await nexus.getProjectContext("my-app");
console.log(context.decisions);
console.log(context.projectContext);

// Update a memory
await nexus.updateMemory("memory-id", {
  content: "Updated content...",
  importance: 9,
});

// Delete a memory
await nexus.deleteMemory("memory-id");
```

### MCP Server Discovery

```typescript
// Discover servers
const servers = await nexus.discoverServers({
  query: "database",
  category: "database",
  official: true,
});

// Get server details
const server = await nexus.getServer("postgres");

// Get installation config
const config = await nexus.getServerConfig("postgres");
console.log(JSON.stringify(config.claudeDesktop, null, 2));
```

## OpenCode Remote Tunnel

Connect to your local OpenCode session from anywhere using the Nexus tunnel.

### Programmatic Usage

```typescript
import { NexusTunnel } from "@nexus/sdk/tunnel";

const tunnel = new NexusTunnel({
  apiKey: "your-api-key",
  serverUrl: "http://localhost:4096", // Your local OpenCode server
});

// Connect to tunnel service
await tunnel.connect();
console.log(`Public URL: ${tunnel.status.publicUrl}`);

// Listen for events
tunnel.on("connected", (event) => {
  console.log("Tunnel connected:", event.data);
});

tunnel.on("activity", (event) => {
  console.log("Request relayed:", event.data);
});

// Disconnect when done
tunnel.disconnect();
```

### CLI Usage

```bash
# Using npx
npx @nexus/sdk tunnel --api-key=YOUR_KEY

# Or with environment variable
export NEXUS_API_KEY=your-api-key
npx @nexus/sdk tunnel

# Specify local server
npx @nexus/sdk tunnel --api-key=YOUR_KEY --server=http://localhost:4096
```

### How It Works

1. Start your local OpenCode server (default: `http://localhost:4096`)
2. Run the tunnel to get a public URL
3. Open the URL at `https://nexus.yogan.dev/terminal`
4. Control your OpenCode session remotely from any device

## API Reference

### `new Nexus(config)`

Create a new Nexus client.

| Option    | Type   | Default                       | Description          |
| --------- | ------ | ----------------------------- | -------------------- |
| `apiKey`  | string | required                      | Your Nexus API key   |
| `baseUrl` | string | `https://api.nexus.yogan.dev` | API base URL         |
| `timeout` | number | `30000`                       | Request timeout (ms) |

### `new NexusTunnel(config)`

Create a new tunnel client.

| Option           | Type    | Default                        | Description            |
| ---------------- | ------- | ------------------------------ | ---------------------- |
| `apiKey`         | string  | required                       | Your Nexus API key     |
| `serverUrl`      | string  | `http://localhost:4096`        | Local OpenCode server  |
| `tunnelUrl`      | string  | `wss://tunnel.nexus.yogan.dev` | Nexus tunnel service   |
| `autoReconnect`  | boolean | `true`                         | Auto-reconnect on drop |
| `reconnectDelay` | number  | `3000`                         | Reconnect delay (ms)   |
| `sessionName`    | string  | hostname                       | Session identifier     |

## Error Handling

```typescript
import { Nexus, NexusError } from "@nexus/sdk";

try {
  const docs = await nexus.queryDocs("unknown-lib", "query");
} catch (error) {
  if (error instanceof NexusError) {
    console.error(`API Error (${error.statusCode}): ${error.message}`);
  }
}
```

## License

MIT
