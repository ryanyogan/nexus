# nexus auth

Manage authentication for Nexus. An API key is required to use Nexus MCP tools.

<script setup>
import Terminal from '../.vitepress/theme/components/Terminal.vue'
import Callout from '../.vitepress/theme/components/Callout.vue'
</script>

## Usage

```bash
nexus auth <command>
```

## Commands

| Command | Description |
|---------|-------------|
| `login` | Authenticate with Nexus and get an API key |
| `logout` | Remove stored authentication |
| `status` | Check authentication status |

## Login

Authenticate with Nexus using your browser:

<Terminal title="Terminal">
<span class="terminal-line prompt">npx @nexus/cli auth login</span>
<span class="terminal-line output"></span>
<span class="terminal-line output"><span class="text-muted">Opening browser for authentication...</span></span>
<span class="terminal-line output"><span class="text-muted">Verification code:</span> <span class="text-bold">ABCD-1234</span></span>
<span class="terminal-line output"></span>
<span class="terminal-line output"><span class="text-green">Authenticated successfully!</span></span>
<span class="terminal-line output">API key saved to ~/.nexus/config.json</span>
</Terminal>

### How It Works

1. The CLI generates a verification code and opens your browser
2. Sign in with GitHub or Google
3. The CLI automatically receives your API key
4. Your key is stored locally and used by `nexus serve`

<Callout type="tip" title="Automatic Key Usage">
Once logged in, you don't need to manually configure `NEXUS_API_KEY` in your MCP client configs. The CLI automatically uses the stored key.
</Callout>

## Status

Check your authentication status:

<Terminal title="Terminal">
<span class="terminal-line prompt">npx @nexus/cli auth status</span>
<span class="terminal-line output"></span>
<span class="terminal-line output"><span class="text-green">Authenticated</span></span>
<span class="terminal-line output">User: ryan@example.com</span>
<span class="terminal-line output">Plan: Pro</span>
<span class="terminal-line output">API calls this month: 1,234 / unlimited</span>
</Terminal>

## Logout

Remove stored credentials:

<Terminal title="Terminal">
<span class="terminal-line prompt">npx @nexus/cli auth logout</span>
<span class="terminal-line output"><span class="text-green">Logged out successfully</span></span>
</Terminal>

## Token Storage

Credentials are stored in `~/.nexus/config.json`:

```json
{
  "apiKey": "nxs_your_api_key_here",
  "userId": "user_123"
}
```

<Callout type="warning" title="Security">
Keep this file secure. Don't commit it to version control. Add `~/.nexus/` to your global gitignore.
</Callout>

## Manual API Key

If you prefer to manage your API key manually:

1. Create a key at [nexus.yogan.dev/dashboard/keys](https://nexus.yogan.dev/dashboard/keys)
2. Set it as an environment variable:

```bash
export NEXUS_API_KEY=nxs_your_api_key_here
```

Or add it directly to your MCP client config:

```json
{
  "mcpServers": {
    "nexus": {
      "command": "npx",
      "args": ["-y", "@nexus/cli", "serve"],
      "env": {
        "NEXUS_API_KEY": "nxs_your_api_key_here"
      }
    }
  }
}
```

## Troubleshooting

### Browser Doesn't Open

If the browser doesn't open automatically, copy the URL from the terminal and open it manually.

### Authentication Timeout

The verification code expires after 10 minutes. Run `nexus auth login` again to get a new code.

### API Key Not Working

1. Check `npx @nexus/cli auth status`
2. Try logging out and back in: `npx @nexus/cli auth logout && npx @nexus/cli auth login`
3. Verify your key at [nexus.yogan.dev/dashboard/keys](https://nexus.yogan.dev/dashboard/keys)
