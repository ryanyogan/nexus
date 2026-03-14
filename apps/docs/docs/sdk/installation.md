# SDK Installation

## Requirements

- Node.js 18+ or Bun 1.0+
- TypeScript 5.0+ (recommended)

## Install the Package

```bash
# npm
npm install @nexus/sdk

# pnpm
pnpm add @nexus/sdk

# yarn
yarn add @nexus/sdk

# bun
bun add @nexus/sdk
```

## Get an API Key

1. Sign in at [nexus.yogan.dev](https://nexus.yogan.dev)
2. Navigate to **Settings** > **API Tokens**
3. Click **Create Token**
4. Select the `read` scope (add `write` for memory operations)
5. Copy your token

## Basic Setup

### Environment Variable (Recommended)

Store your API key in an environment variable:

```bash
# .env
NEXUS_API_KEY=nxs_your_token_here
```

```typescript
import { Nexus } from "@nexus/sdk";

const nexus = new Nexus({
  apiKey: process.env.NEXUS_API_KEY!
});
```

### Direct Configuration

```typescript
import { Nexus } from "@nexus/sdk";

const nexus = new Nexus({
  apiKey: "nxs_your_token_here"
});
```

## Configuration Options

```typescript
interface NexusConfig {
  /** API key from nexus.yogan.dev/dashboard/keys (required) */
  apiKey: string;
  
  /** Base URL for API requests (optional) */
  baseUrl?: string; // Default: "https://api.nexus.yogan.dev"
  
  /** Request timeout in milliseconds (optional) */
  timeout?: number; // Default: 30000
}
```

## Verify Installation

Test your setup:

```typescript
import { Nexus } from "@nexus/sdk";

const nexus = new Nexus({
  apiKey: process.env.NEXUS_API_KEY!
});

// Check connection with a simple query
const libraries = await nexus.listLibraries({ limit: 5 });
console.log(`Connected! Found ${libraries.total} libraries`);
```

## Framework Integration

### Next.js

```typescript
// lib/nexus.ts
import { Nexus } from "@nexus/sdk";

export const nexus = new Nexus({
  apiKey: process.env.NEXUS_API_KEY!
});

// In a Server Component or API route
import { nexus } from "@/lib/nexus";

export async function getServerSideProps() {
  const docs = await nexus.queryDocs("nextjs", "app router");
  return { props: { docs } };
}
```

### Express / Node.js

```typescript
import express from "express";
import { Nexus } from "@nexus/sdk";

const app = express();
const nexus = new Nexus({
  apiKey: process.env.NEXUS_API_KEY!
});

app.get("/search", async (req, res) => {
  const { q } = req.query;
  const results = await nexus.searchLibrary(q as string);
  res.json(results);
});
```

### Cloudflare Workers

```typescript
import { Nexus } from "@nexus/sdk";

export default {
  async fetch(request: Request, env: Env) {
    const nexus = new Nexus({
      apiKey: env.NEXUS_API_KEY
    });
    
    const docs = await nexus.queryDocs("hono", "middleware");
    return Response.json(docs);
  }
};
```

## Tunnel Setup

For remote tunnel functionality, import from the tunnel subpath:

```typescript
import { NexusTunnel } from "@nexus/sdk/tunnel";

const tunnel = new NexusTunnel({
  apiKey: process.env.NEXUS_API_KEY!,
  serverUrl: "http://localhost:4096", // Your local OpenCode server
  sessionName: "my-session"
});

await tunnel.connect();
console.log(`Tunnel URL: ${tunnel.status.publicUrl}`);
```

## TypeScript Configuration

The SDK is fully typed. For best results, ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true
  }
}
```

## Troubleshooting

### "Cannot find module '@nexus/sdk'"

Ensure the package is installed and you're using ESM imports:

```json
// package.json
{
  "type": "module"
}
```

### "Invalid API key"

- Verify the key starts with `nxs_`
- Check the key hasn't been revoked
- Ensure no extra whitespace in the key

### Timeout Errors

Increase the timeout for slow connections:

```typescript
const nexus = new Nexus({
  apiKey: process.env.NEXUS_API_KEY!,
  timeout: 60000 // 60 seconds
});
```

### Rate Limiting

If you see 429 errors, you're hitting rate limits. Implement retry logic:

```typescript
async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof NexusError && error.statusCode === 429 && retries > 0) {
      await new Promise(r => setTimeout(r, 1000));
      return withRetry(fn, retries - 1);
    }
    throw error;
  }
}

const docs = await withRetry(() => 
  nexus.queryDocs("react", "hooks")
);
```
