# OpenCode Configuration

Configure Nexus with OpenCode using native remote mode - the simplest setup.

<script setup>
import Callout from '../.vitepress/theme/components/Callout.vue'
import Terminal from '../.vitepress/theme/components/Terminal.vue'
</script>

## Prerequisites

You need an API key to use Nexus. Get one by running:

<Terminal title="Terminal">
<span class="terminal-line prompt">npx @nexus/cli auth login</span>
</Terminal>

Or create one at [nexus.yogan.dev/dashboard/keys](https://nexus.yogan.dev/dashboard/keys).

## Configuration File

OpenCode uses `~/.config/opencode/config.json` on Linux/macOS.

## Native Remote Mode (Recommended)

OpenCode supports native remote MCP connections - no bridge packages needed:

```json
{
  "mcp": {
    "nexus": {
      "type": "remote",
      "url": "https://mcp.nexus.yogan.dev/sse",
      "enabled": true,
      "headers": {
        "NEXUS_API_KEY": "nxs_your_api_key_here"
      }
    }
  }
}
```

That's it! Just paste your API key and you're ready to go.

<Callout type="tip" title="Why Native Remote?">
Native remote mode is simpler, faster, and uses less memory than running a local bridge process. OpenCode connects directly to Nexus over HTTP/SSE.
</Callout>

## Local Mode (Alternative)

Run the Nexus CLI locally (useful for offline access or development):

```json
{
  "mcp": {
    "nexus": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "@nexus/cli", "serve"],
      "enabled": true,
      "env": {
        "NEXUS_API_KEY": "nxs_your_api_key_here"
      }
    }
  }
}
```

<Callout type="info" title="Using CLI Login?">
If you authenticated with `npx @nexus/cli auth login`, the CLI automatically uses your stored key. You can omit the `env` section in local mode.
</Callout>

## Verification

1. Restart OpenCode
2. Ask: "What Nexus tools do you have available?"
3. You should see tools like `query-docs`, `save-memory`, etc.

## Troubleshooting

### "API key required" Error

Make sure your API key is configured correctly in the `headers` section (native remote) or `env` section (local mode).

### Testing Your Connection

You can test the remote endpoint directly:

<Terminal title="Terminal">
<span class="terminal-line prompt">curl -H "NEXUS_API_KEY: nxs_your_key" https://mcp.nexus.yogan.dev/sse</span>
</Terminal>
