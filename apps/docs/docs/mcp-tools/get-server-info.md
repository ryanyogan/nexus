# get-server-info

Get detailed information about a specific MCP server including its tools, resources, prompts, installation instructions, and documentation links.

## Description

The `get-server-info` tool retrieves comprehensive information about an MCP server. Use it after `discover-servers` to learn exactly what a server provides, what environment variables it needs, and how to install it.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `serverId` | string | Yes | The server ID (e.g., 'filesystem', 'postgres', 'github') |

## Response

Returns an object containing:

- `serverId` — Server identifier
- `name` — Display name
- `namespace` — Package namespace
- `description` — Full description
- `version` — Server version
- `installation` — Installation details:
  - `transport` — Transport type (stdio, http, sse)
  - `packageType` — Package type (npm, pip, binary)
  - `package` — Package name
  - `command` — Installation command
  - `args` — Command arguments
  - `requiredEnvVars` — Required environment variables
- `capabilities` — Server capabilities:
  - `hasTools` — Whether server provides tools
  - `hasResources` — Whether server provides resources
  - `hasPrompts` — Whether server provides prompts
  - `tools` — List of available tools
  - `resources` — List of available resources
  - `prompts` — List of available prompts
- `links` — Related links:
  - `repository` — Source code repository
  - `documentation` — Documentation URL
  - `homepage` — Project homepage
- `metadata` — Additional info:
  - `author` — Package author
  - `license` — License type
  - `categories` — Server categories
  - `keywords` — Search keywords
- `stats` — Usage statistics:
  - `githubStars` — GitHub stars
  - `weeklyDownloads` — npm weekly downloads
- `security` — Security information:
  - `riskLevel` — Risk level (low, medium, high)
  - `capabilities` — Security-relevant capabilities
  - `notes` — Security notes
  - `isAudited` — Whether security audited
  - `auditedAt` — Audit timestamp
- `badges` — Trust badges (official, verified, featured, security-audited)
- `hint` — Suggested next step

## Example Usage

### Get Server Details

```json
{
  "name": "get-server-info",
  "arguments": {
    "serverId": "github"
  }
}
```

**Response:**
```json
{
  "serverId": "github",
  "name": "GitHub",
  "namespace": "modelcontextprotocol",
  "description": "Interact with GitHub repositories, issues, pull requests, and more",
  "version": "1.0.0",
  
  "installation": {
    "transport": "stdio",
    "packageType": "npm",
    "package": "@modelcontextprotocol/server-github",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "requiredEnvVars": {
      "GITHUB_TOKEN": "Your GitHub personal access token"
    }
  },
  
  "capabilities": {
    "hasTools": true,
    "hasResources": true,
    "hasPrompts": false,
    "tools": [
      "create_issue",
      "list_issues", 
      "create_pull_request",
      "get_file_contents",
      "push_files",
      "search_code"
    ],
    "resources": [
      "repository",
      "issue",
      "pull_request"
    ],
    "prompts": []
  },
  
  "links": {
    "repository": "https://github.com/modelcontextprotocol/servers",
    "documentation": "https://modelcontextprotocol.io/docs/servers/github",
    "homepage": null
  },
  
  "metadata": {
    "author": "Anthropic",
    "license": "MIT",
    "categories": ["devtools", "vcs"],
    "keywords": ["github", "git", "version-control", "issues", "pull-requests"]
  },
  
  "stats": {
    "githubStars": 15000,
    "weeklyDownloads": 12500
  },
  
  "security": {
    "riskLevel": "medium",
    "capabilities": ["repository_access", "code_execution"],
    "notes": "Requires GitHub token with appropriate scopes",
    "isAudited": true,
    "auditedAt": "2024-01-15T00:00:00Z"
  },
  
  "badges": ["official", "security-audited"],
  
  "hint": "Use get-server-config with serverId \"github\" to get ready-to-use installation config."
}
```

## AI Conversation Example

```
User: What can the GitHub MCP server do?

AI: Let me get the details on the GitHub MCP server.

[Calls get-server-info with serverId: "github"]

The **GitHub MCP Server** (official) provides:

**Tools:**
- `create_issue` — Create new issues
- `list_issues` — List and filter issues
- `create_pull_request` — Create PRs
- `get_file_contents` — Read files from repos
- `push_files` — Push file changes
- `search_code` — Search across repositories

**Resources:**
- Repository information
- Issue details
- Pull request data

**Requirements:**
- `GITHUB_TOKEN` — Personal access token with repo scope

**Security:**
- Risk level: Medium (repository access)
- Security audited

Would you like me to generate the installation config?
```

## Use Cases

1. **Capability review** — See exactly what tools/resources a server provides
2. **Setup planning** — Check required environment variables
3. **Security assessment** — Review security implications
4. **Documentation lookup** — Find official docs and repository

## Notes

- Tool/resource lists may be empty if not fully documented
- Environment variables show what's needed but values must be provided
- Security risk levels reflect capability scope (filesystem, network, etc.)

## Related Tools

- [discover-servers](/mcp-tools/discover-servers) — Find servers by capability
- [get-server-config](/mcp-tools/get-server-config) — Get installation configuration
