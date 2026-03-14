# nexus docs

Search and cache documentation from the Nexus library index.

## Synopsis

```bash
nexus docs <subcommand> [options]
```

## Subcommands

| Subcommand | Description |
|------------|-------------|
| `search` | Search documentation across libraries |
| `fetch` | Fetch documentation for a specific library |
| `download` | Download documentation for offline use |
| `cached` | List cached documentation in this project |
| `clear` | Clear cached documentation |

---

## nexus docs search

Search documentation across all indexed libraries, or within a specific library.

### Synopsis

```bash
nexus docs search <query> [options]
```

### Arguments

| Argument | Description |
|----------|-------------|
| `query` | Search query (can include library name) |

### Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--limit <number>` | `-l` | Maximum results (default: 10) |
| `--json` | | Output results as JSON |

### Usage Patterns

**Search for libraries:**
```bash
nexus docs search react
```

Output:
```
Libraries matching "react"

  react (react)
    A JavaScript library for building user interfaces
  react-router (react-router)
    Declarative routing for React
  react-query (@tanstack/react-query)
    Powerful asynchronous state management for React
```

**Search within a library:**
```bash
nexus docs search react hooks
```

Output:
```
Results for "hooks" in react

  Using the State Hook
    useState is a Hook that lets you add React state to function...
  Using the Effect Hook
    The Effect Hook lets you perform side effects in function...
  Rules of Hooks
    Only call Hooks at the top level. Don't call Hooks inside...
```

### Examples

```bash
# Find libraries related to databases
nexus docs search database

# Search for authentication in Next.js docs
nexus docs search nextjs authentication

# Limit results
nexus docs search typescript generics --limit 5

# JSON output for scripting
nexus docs search hono middleware --json
```

### JSON Output

Library search:
```json
{
  "libraries": [
    {
      "id": "react",
      "name": "react",
      "description": "A JavaScript library for building user interfaces",
      "categories": ["frontend"],
      "totalSnippets": 1234
    }
  ]
}
```

Documentation search:
```json
{
  "chunks": [
    {
      "title": "Using the State Hook",
      "content": "useState is a Hook that lets you add React state..."
    }
  ],
  "libraryId": "react"
}
```

---

## nexus docs fetch

Fetch documentation chunks for a specific library query.

### Synopsis

```bash
nexus docs fetch <library> <query> [options]
```

### Arguments

| Argument | Description |
|----------|-------------|
| `library` | Library name or ID |
| `query` | Search query within the library |

### Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--limit <number>` | `-l` | Maximum results (default: 5) |
| `--json` | | Output results as JSON |

### Examples

```bash
# Fetch React hooks documentation
nexus docs fetch react "useState hook"

# Fetch Next.js App Router docs
nexus docs fetch nextjs "app router middleware"

# Get more results
nexus docs fetch typescript "type guards" --limit 10
```

### Output

```bash
$ nexus docs fetch react useState

Documentation from react

Using the State Hook
────────────────────────────────────────
useState is a Hook that lets you add React state to function
components. It returns a pair: the current state value and a
function that lets you update it.

import { useState } from 'react';

function Example() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}

Total tokens: 847
```

### JSON Output

```json
{
  "chunks": [
    {
      "title": "Using the State Hook",
      "content": "useState is a Hook that lets you add React state...",
      "contentType": "markdown",
      "sourceFile": "docs/hooks-state.md",
      "sourceUrl": "https://react.dev/reference/react/useState"
    }
  ],
  "libraryId": "react",
  "totalTokens": 847
}
```

---

## nexus docs download

Download documentation for offline use. Creates cached files in `.nexus/cache/docs/`.

### Synopsis

```bash
nexus docs download [libraries...] [options]
```

### Arguments

| Argument | Description |
|----------|-------------|
| `libraries` | Library names to download (space-separated) |

### Options

| Option | Description |
|--------|-------------|
| `--from-deps` | Download docs for package.json dependencies |
| `--json` | Output results as JSON |

### Examples

```bash
# Download specific libraries
nexus docs download react typescript next

# Download docs for all project dependencies
nexus docs download --from-deps
```

### Output

```bash
$ nexus docs download react typescript next

  ✓ react -> react
  ✓ typescript -> typescript
  ✓ next -> nextjs

Downloaded 3 libraries to .nexus/cache/docs/
```

With `--from-deps`:

```bash
$ nexus docs download --from-deps

Found 24 dependencies to check
  ✓ react -> react
  ✓ next -> nextjs
  ✓ tailwindcss -> tailwindcss
  ○ @types/node - not indexed
  ○ @types/react - not indexed
  ✓ zod -> zod
  ...

Downloaded 18 libraries to .nexus/cache/docs/
6 libraries not indexed
```

### JSON Output

```json
{
  "downloaded": ["react", "nextjs", "typescript"],
  "failed": [],
  "notFound": ["@types/node", "@types/react"]
}
```

---

## nexus docs cached

List documentation cached in the current project.

### Synopsis

```bash
nexus docs cached [options]
```

### Options

| Option | Description |
|--------|-------------|
| `--json` | Output results as JSON |

### Example

```bash
nexus docs cached
```

Output:

```
Cached Documentation

  react (cached 1/15/2025)
  nextjs (cached 1/15/2025)
  typescript (cached 1/14/2025)
```

### JSON Output

```json
{
  "cached": [
    {
      "id": "react",
      "name": "react",
      "cachedAt": "2025-01-15T10:30:00.000Z"
    },
    {
      "id": "nextjs",
      "name": "nextjs",
      "cachedAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## nexus docs clear

Clear cached documentation from the project.

### Synopsis

```bash
nexus docs clear [options]
```

### Aliases

```bash
nexus docs cache-clear
```

### Options

| Option | Description |
|--------|-------------|
| `--json` | Output results as JSON |

### Example

```bash
nexus docs clear
```

Output:

```
Cleared 5 cached libraries
```

### JSON Output

```json
{
  "cleared": 5
}
```

---

## Cache Location

Documentation is cached in the project's `.nexus` directory:

```
.nexus/
  cache/
    docs/
      react.json
      nextjs.json
      typescript.json
```

Add `.nexus/cache/` to your `.gitignore`:

```gitignore
# Nexus cache
.nexus/cache/
```

## See Also

- [nexus serve](./serve.md) - Run as MCP server with local docs
- [Configuration](./configuration.md) - Cache settings
