-- Add security profile fields to MCP servers
-- These help users understand what access/permissions each server requires

-- Risk level: low (read-only/sandboxed), medium (writes to specific locations), high (system access), critical (full system/network)
ALTER TABLE mcp_servers ADD COLUMN security_risk_level TEXT DEFAULT 'medium';

-- Access capabilities (JSON array)
-- Examples: "filesystem:read", "filesystem:write", "network:outbound", "shell:execute", "database:read", "database:write"
ALTER TABLE mcp_servers ADD COLUMN security_capabilities TEXT DEFAULT '[]';

-- Human-readable security notes
ALTER TABLE mcp_servers ADD COLUMN security_notes TEXT;

-- Security audit tracking
ALTER TABLE mcp_servers ADD COLUMN is_security_audited INTEGER DEFAULT 0;
ALTER TABLE mcp_servers ADD COLUMN security_audited_at TEXT;

-- Update existing servers with sensible defaults based on their category/type
-- Filesystem servers: high risk (can read/write files)
UPDATE mcp_servers 
SET security_risk_level = 'high',
    security_capabilities = '["filesystem:read", "filesystem:write"]',
    security_notes = 'Can read and write files on your system. Only grant access to directories you trust.'
WHERE id LIKE '%filesystem%' OR name LIKE '%filesystem%';

-- Database servers: medium-high risk
UPDATE mcp_servers 
SET security_risk_level = 'high',
    security_capabilities = '["database:read", "database:write", "network:outbound"]',
    security_notes = 'Can read and modify database contents. Ensure proper access controls are in place.'
WHERE id LIKE '%postgres%' OR id LIKE '%sqlite%' OR id LIKE '%mysql%' OR id LIKE '%database%'
   OR name LIKE '%postgres%' OR name LIKE '%sqlite%' OR name LIKE '%mysql%';

-- GitHub/Git servers: medium risk
UPDATE mcp_servers 
SET security_risk_level = 'medium',
    security_capabilities = '["network:outbound", "api:github"]',
    security_notes = 'Connects to GitHub API. Requires authentication token with appropriate scopes.'
WHERE id LIKE '%github%' OR id LIKE '%git%' OR name LIKE '%github%';

-- Browser/puppeteer servers: high risk
UPDATE mcp_servers 
SET security_risk_level = 'high',
    security_capabilities = '["network:outbound", "browser:control"]',
    security_notes = 'Can browse the web and execute JavaScript. Be cautious with sensitive sessions.'
WHERE id LIKE '%browser%' OR id LIKE '%puppeteer%' OR id LIKE '%playwright%'
   OR name LIKE '%browser%' OR name LIKE '%puppeteer%';

-- Shell/terminal servers: critical risk
UPDATE mcp_servers 
SET security_risk_level = 'critical',
    security_capabilities = '["shell:execute", "filesystem:read", "filesystem:write", "network:outbound"]',
    security_notes = 'Can execute arbitrary shell commands. Use with extreme caution.'
WHERE id LIKE '%shell%' OR id LIKE '%terminal%' OR id LIKE '%exec%'
   OR name LIKE '%shell%' OR name LIKE '%terminal%';

-- Memory/knowledge servers: low risk
UPDATE mcp_servers 
SET security_risk_level = 'low',
    security_capabilities = '["memory:read", "memory:write"]',
    security_notes = 'Stores and retrieves information. No system access required.'
WHERE id LIKE '%memory%' OR id LIKE '%knowledge%' OR name LIKE '%memory%';

-- Fetch/web servers: medium risk  
UPDATE mcp_servers 
SET security_risk_level = 'medium',
    security_capabilities = '["network:outbound"]',
    security_notes = 'Can make HTTP requests to external URLs.'
WHERE id LIKE '%fetch%' OR id LIKE '%web%' OR id LIKE '%http%'
   OR name LIKE '%fetch%';

-- AI servers: low-medium risk
UPDATE mcp_servers 
SET security_risk_level = 'low',
    security_capabilities = '["network:outbound", "api:ai"]',
    security_notes = 'Connects to AI APIs for inference. May send data to external services.'
WHERE id LIKE '%openai%' OR id LIKE '%anthropic%' OR id LIKE '%ai%' OR id LIKE '%llm%'
   OR name LIKE '%openai%' OR name LIKE '%anthropic%';
