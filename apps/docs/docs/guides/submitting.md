# Submitting Libraries and Servers

Help grow the Nexus ecosystem by submitting libraries for documentation indexing or MCP servers for the registry.

## Submitting a Library

Want your library's documentation indexed by Nexus? Here's how.

### Requirements

Before submitting, ensure your library meets these criteria:

- **Public documentation** — Docs must be publicly accessible
- **Maintained** — Library should be actively maintained
- **Useful to AI users** — Documentation that helps AI assistants work with your library
- **Reasonable size** — Documentation should be comprehensive but not excessive

### Submission Process

#### 1. Prepare Your Information

Gather the following:

| Field | Description | Example |
|-------|-------------|---------|
| Library name | Official package name | `@tanstack/react-query` |
| Documentation URL | Root URL of your docs | `https://tanstack.com/query/latest/docs` |
| GitHub repo | Source repository | `https://github.com/TanStack/query` |
| Category | Primary category | `frontend`, `backend`, `database`, etc. |
| Description | Short description (160 chars max) | "Powerful async state management for React" |

#### 2. Open an Issue

Create an issue in the Nexus repository:

**Title:** `[Library Request] library-name`

**Body:**
```markdown
## Library Information

- **Name:** @tanstack/react-query
- **Documentation URL:** https://tanstack.com/query/latest/docs
- **GitHub:** https://github.com/TanStack/query
- **Category:** frontend
- **Description:** Powerful async state management for React

## Why Index This Library?

<!-- Explain why this library would be valuable in the Nexus index -->

This is one of the most popular data fetching libraries for React, 
used by thousands of projects. Having accurate, up-to-date docs 
would help AI assistants provide better guidance.

## Documentation Structure

<!-- Optional: Help us understand your docs structure -->

- Main concepts: /docs/framework/react/overview
- API reference: /docs/framework/react/reference/
- Guides: /docs/framework/react/guides/
```

#### 3. What Happens Next

1. **Review** — We'll review your submission for suitability
2. **Indexing** — If approved, we'll add your library to the indexing queue
3. **Processing** — Documentation is fetched, chunked, and embedded
4. **Available** — Once processed, the library appears in Nexus

:::note Processing time
Indexing typically takes 1-7 days depending on documentation size and queue length.
:::

### Self-Hosting Documentation

If your documentation isn't publicly accessible but you still want it indexed:

1. **Host a public mirror** — Deploy docs to a public URL
2. **Provide a sitemap** — Include `sitemap.xml` for better crawling
3. **Use standard formats** — HTML, Markdown, or MDX work best

### Best Practices for Indexable Docs

Make your documentation AI-friendly:

- **Clear headings** — Use descriptive H1-H3 headings
- **Code examples** — Include runnable code snippets
- **Semantic HTML** — Use proper markup (`<code>`, `<pre>`, etc.)
- **Avoid heavy JavaScript** — Content should be server-rendered or static
- **Consistent structure** — Similar pages should have similar layouts

## Submitting an MCP Server

Add your MCP server to the Nexus registry so others can discover and use it.

### Requirements

Your MCP server should:

- **Be public** — Available on npm, GitHub, or as a hosted service
- **Follow MCP spec** — Implement the Model Context Protocol correctly
- **Include documentation** — README with setup instructions
- **Be maintained** — Actively maintained and responsive to issues

### Server Information

Prepare the following details:

| Field | Required | Description |
|-------|----------|-------------|
| Name | Yes | Server identifier (e.g., `postgres`, `my-server`) |
| Display name | Yes | Human-readable name |
| Description | Yes | What the server does (280 chars max) |
| Repository | Yes | GitHub URL |
| npm package | If applicable | Package name |
| Category | Yes | Primary category |
| Capabilities | Yes | `tools`, `resources`, `prompts` |
| Tools list | Yes | List of tools with descriptions |
| Installation | Yes | How to install and configure |
| Official | No | Is this from modelcontextprotocol org? |

### Submission Process

#### 1. Create the Server Listing

Open an issue with this template:

**Title:** `[Server Submission] server-name`

**Body:**
```markdown
## Server Information

- **Name:** my-awesome-server
- **Display Name:** My Awesome Server
- **Repository:** https://github.com/username/my-awesome-server
- **npm Package:** @username/my-awesome-server
- **Category:** devtools
- **Capabilities:** tools, resources

## Description

Brief description of what this server does and why it's useful.

## Tools

| Tool | Description |
|------|-------------|
| `do_thing` | Does a specific thing |
| `get_data` | Retrieves data from somewhere |

## Resources (if applicable)

| Resource | Description |
|----------|-------------|
| `config://settings` | Current configuration |

## Installation

### npm
```bash
npx -y @username/my-awesome-server
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `API_KEY` | Yes | Your API key |

### Claude Desktop Config

```json
{
  "mcpServers": {
    "my-awesome-server": {
      "command": "npx",
      "args": ["-y", "@username/my-awesome-server"],
      "env": {
        "API_KEY": "<your-api-key>"
      }
    }
  }
}
```

## Additional Notes

<!-- Any other relevant information -->
```

#### 2. Review Process

1. **Initial review** — We check the submission for completeness
2. **Testing** — We test the server installation and basic functionality
3. **Listing** — If approved, the server is added to the registry
4. **Verification** — Official servers get a verified badge

### Categories

Choose the most appropriate category:

| Category | Examples |
|----------|----------|
| `database` | PostgreSQL, MongoDB, Redis |
| `filesystem` | File operations, directory access |
| `devtools` | Git, build tools, testing |
| `cloud` | AWS, GCP, Cloudflare |
| `ai` | OpenAI, vector DBs, ML tools |
| `productivity` | Notion, Slack, calendars |
| `integration` | APIs, webhooks, automation |
| `security` | Auth, secrets, scanning |
| `monitoring` | Logging, metrics, alerting |

### Quality Guidelines

To ensure your server is accepted:

#### Documentation

- **Clear README** — Explain what the server does
- **Installation instructions** — Step-by-step setup
- **Configuration reference** — All env vars and options
- **Examples** — Show common use cases

#### Implementation

- **Error handling** — Return clear error messages
- **Validation** — Validate inputs before processing
- **Timeouts** — Handle long-running operations gracefully
- **Security** — Don't expose sensitive data in responses

#### Maintenance

- **Respond to issues** — Address bug reports
- **Keep dependencies updated** — Security patches especially
- **Version compatibility** — Support current MCP spec versions

## Updating Existing Submissions

### Libraries

To update documentation:

1. Open an issue: `[Library Update] library-name`
2. Describe what changed
3. We'll re-index the documentation

### Servers

To update a server listing:

1. Open an issue: `[Server Update] server-name`
2. Include the updated information
3. We'll update the registry entry

## Getting Help

Having trouble with your submission?

- **GitHub Issues** — Ask questions on the Nexus repository
- **Documentation** — Check existing docs for examples
- **Community** — Join discussions in GitHub Discussions

:::tip Faster approval
Well-documented submissions with complete information are processed faster. Take time to fill out all fields and test your installation instructions.
:::

## FAQ

### How long does indexing take?

Library indexing typically takes 1-7 days. Larger documentation sets take longer.

### Can I submit a private library?

No, documentation must be publicly accessible for indexing.

### What if my docs change frequently?

We periodically re-index popular libraries. You can also request a re-index by opening an update issue.

### Can I submit my company's internal server?

Yes, if it's publicly available (open source or hosted service). Internal-only servers can't be listed.

### What's the difference between official and community servers?

Official servers are from the modelcontextprotocol organization. Community servers are created by third parties but still reviewed for quality.
