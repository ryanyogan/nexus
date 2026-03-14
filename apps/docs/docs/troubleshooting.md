# Troubleshooting

Common issues and solutions when using Nexus.

## MCP Connection Issues

### Server Not Appearing in Client

**Symptom:** You've added Nexus to your config but it doesn't show as connected.

**Solutions:**

1. **Restart your client** — Claude Desktop, VS Code, and other clients need a restart after config changes.

2. **Check config syntax:**
   ```bash
   # Validate your JSON config
   cat ~/.config/Claude/claude_desktop_config.json | jq .
   ```

3. **Verify the URL:**
   ```json
   {
     "mcpServers": {
       "nexus": {
         "url": "https://mcp.nexus.yogan.dev/sse"
       }
     }
   }
   ```
   
   :::warning Common mistake
   Make sure you're using `url` for remote servers, not `command`. The Nexus server is remote, not a local process.
   :::

4. **Check network connectivity:**
   ```bash
   curl -I https://mcp.nexus.yogan.dev/sse
   # Should return 200 OK
   ```

### Connection Timeouts

**Symptom:** "Connection timed out" or server connects then disconnects.

**Solutions:**

1. **Check your internet connection** — Remote MCP servers require stable internet.

2. **Firewall/VPN issues:**
   - Try disabling VPN temporarily
   - Check if your firewall blocks outgoing SSE connections
   - Corporate networks may block non-standard connections

3. **Proxy configuration:**
   ```bash
   # If behind a proxy, ensure it's configured
   export HTTPS_PROXY=http://proxy.example.com:8080
   ```

### "Invalid server configuration"

**Symptom:** Client reports invalid configuration.

**Solutions:**

1. **Check JSON syntax** — Missing commas, extra commas, or mismatched braces:
   ```json
   // Wrong - trailing comma
   {
     "mcpServers": {
       "nexus": { "url": "..." },  // ← Remove this comma
     }
   }
   
   // Correct
   {
     "mcpServers": {
       "nexus": { "url": "..." }
     }
   }
   ```

2. **Ensure correct structure:**
   ```json
   // Wrong - missing mcpServers wrapper
   {
     "nexus": { "url": "..." }
   }
   
   // Correct
   {
     "mcpServers": {
       "nexus": { "url": "..." }
     }
   }
   ```

## Authentication Problems

### "Unauthorized" or 401 Errors

**Symptom:** Memory or protected operations fail with authentication errors.

**Solutions:**

1. **Check API key configuration:**
   ```json
   {
     "mcpServers": {
       "nexus": {
         "url": "https://mcp.nexus.yogan.dev/sse",
         "headers": {
           "Authorization": "Bearer your-api-key-here"
         }
       }
     }
   }
   ```

2. **Verify your API key:**
   ```bash
   curl -H "Authorization: Bearer your-api-key" \
     https://api.nexus.yogan.dev/api/memories
   ```

3. **Generate a new key** — If your key was compromised or expired, generate a new one at https://nexus.yogan.dev/settings

### "Forbidden" or 403 Errors

**Symptom:** Certain operations are blocked.

**Solutions:**

1. **Check permissions** — Some operations require specific permissions:
   - Reading docs: No auth required
   - Reading memories: Requires auth
   - Writing memories: Requires auth

2. **Plan limitations** — Free tier has restrictions:
   - Limited memory storage
   - Rate limits on queries

### Session Expired

**Symptom:** Authentication worked before but now fails.

**Solution:** API keys don't expire, but sessions do. If using session-based auth:

1. Re-authenticate through the web UI
2. Or use a persistent API key instead

## Rate Limiting

### "Rate limit exceeded" (429 Errors)

**Symptom:** Requests are rejected with rate limit errors.

**Understanding limits:**

| Tier | Requests/minute | Daily limit |
|------|-----------------|-------------|
| Free | 30 | 1,000 |
| Pro | 120 | 10,000 |
| Team | 300 | Unlimited |

**Solutions:**

1. **Wait and retry** — Rate limits reset after the time window passes.

2. **Reduce query frequency:**
   ```typescript
   // Instead of many small queries
   query-docs x 10 times
   
   // Batch your questions
   query-docs: { query: "authentication and session management patterns" }
   ```

3. **Cache results** — If you're querying the same information repeatedly, consider saving to memory:
   ```typescript
   // Query once
   const result = await queryDocs(...)
   
   // Save for later
   await saveMemory({ content: result, ... })
   ```

4. **Upgrade your plan** — If you consistently hit limits, consider upgrading.

### How to Check Your Usage

```bash
# Check current usage via API
curl -H "Authorization: Bearer your-api-key" \
  https://api.nexus.yogan.dev/api/usage
```

Or check the dashboard at https://nexus.yogan.dev/usage

## CLI Issues

### "Command not found: nexus"

**Symptom:** CLI command isn't recognized.

**Solutions:**

1. **Install globally:**
   ```bash
   npm install -g @nexus/cli
   # or
   pnpm add -g @nexus/cli
   ```

2. **Check PATH:**
   ```bash
   echo $PATH
   # Ensure npm global bin is included
   npm bin -g
   ```

3. **Use npx instead:**
   ```bash
   npx @nexus/cli serve
   ```

### CLI Authentication Failed

**Symptom:** `nexus auth` fails or credentials not saved.

**Solutions:**

1. **Try browser auth:**
   ```bash
   nexus auth login
   # Opens browser for OAuth flow
   ```

2. **Use API key directly:**
   ```bash
   nexus auth login --token your-api-key
   ```

3. **Check credentials file:**
   ```bash
   cat ~/.nexus/credentials.json
   ```

4. **Reset credentials:**
   ```bash
   rm -rf ~/.nexus
   nexus auth login
   ```

### CLI "Cannot find module" Errors

**Symptom:** Module resolution errors when running CLI.

**Solutions:**

1. **Reinstall:**
   ```bash
   npm uninstall -g @nexus/cli
   npm cache clean --force
   npm install -g @nexus/cli
   ```

2. **Check Node version:**
   ```bash
   node --version
   # Requires Node.js 18+
   ```

3. **Update Node.js:**
   ```bash
   # Using fnm
   fnm install --lts
   fnm use lts
   ```

## Query Issues

### "Library not found"

**Symptom:** `resolve-library` returns no results.

**Solutions:**

1. **Check spelling:**
   ```typescript
   // Wrong
   resolve-library: { libraryName: "next.js" }
   
   // Correct - try variations
   resolve-library: { libraryName: "nextjs" }
   resolve-library: { libraryName: "next" }
   ```

2. **Use search query:**
   ```typescript
   resolve-library: { 
     libraryName: "react query",
     query: "data fetching state management"
   }
   ```

3. **List available libraries:**
   ```typescript
   list-libraries: { limit: 50 }
   ```

4. **Request indexing** — If the library isn't indexed, [submit a request](/guides/submitting).

### Poor Query Results

**Symptom:** Search returns irrelevant results.

**Solutions:**

1. **Be more specific:**
   ```typescript
   // Vague
   query-docs: { query: "routing" }
   
   // Specific
   query-docs: { 
     query: "dynamic route parameters with TypeScript in Next.js App Router" 
   }
   ```

2. **Include context:**
   ```typescript
   query-docs: {
     query: "how to implement authentication middleware that checks JWT tokens and handles refresh"
   }
   ```

3. **Use the right library:**
   ```typescript
   // First resolve the correct library
   resolve-library: { libraryName: "hono" }
   // Then query that specific library
   query-docs: { libraryId: "/honojs/hono", query: "..." }
   ```

### No Results for Recent Features

**Symptom:** Queries about new features return nothing.

**Explanation:** Libraries are re-indexed periodically. Very recent features may not be indexed yet.

**Workarounds:**

1. **Check when indexed:**
   ```typescript
   get-library-info: { libraryId: "nextjs" }
   // Shows last indexed date
   ```

2. **Request re-index** — Open an issue for priority re-indexing.

## Memory Issues

### "Memory not found"

**Symptom:** Cannot recall or update a memory.

**Solutions:**

1. **Check memory ID** — Memory IDs are prefixed with `mem_`:
   ```typescript
   // Correct
   update-memory: { memoryId: "mem_abc123def456" }
   ```

2. **Verify ownership** — You can only access your own memories.

3. **Check project filter:**
   ```typescript
   // Try without project filter first
   recall-memories: { query: "authentication" }
   
   // Then add project if needed
   recall-memories: { query: "authentication", project: "my-project" }
   ```

### Memories Not Appearing in Recall

**Symptom:** Saved memories don't show up in search results.

**Solutions:**

1. **Check embedding delay** — New memories may take a few seconds to be searchable.

2. **Adjust your query:**
   ```typescript
   // Too specific
   recall-memories: { query: "JWT httpOnly cookie auth in Express" }
   
   // Broader
   recall-memories: { query: "authentication approach" }
   ```

3. **Use list instead:**
   ```typescript
   // Bypass semantic search
   list-memories: { project: "my-project", type: "decision" }
   ```

## Getting More Help

If you're still stuck:

1. **Check GitHub Issues** — Your problem may already be reported
2. **Open an Issue** — Include:
   - What you're trying to do
   - Error messages (full text)
   - Your configuration (redact secrets)
   - Steps to reproduce

3. **Community Discussions** — Ask questions in GitHub Discussions

:::tip Before opening an issue
1. Update to the latest version
2. Try in a clean environment
3. Check this troubleshooting guide
4. Search existing issues
:::
