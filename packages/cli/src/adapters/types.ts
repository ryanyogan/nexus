/**
 * Editor adapter types for MCP server management
 */

import type { McpServer, ServerConfig } from "@nexus/sdk";

/**
 * Supported editor identifiers
 */
export type EditorType = "claude-code" | "cursor" | "vscode" | "opencode" | "zed";

/**
 * Result of checking if an MCP server is installed
 */
export interface InstallStatus {
  installed: boolean;
  configPath?: string;
  version?: string;
}

/**
 * Result of an installation or removal operation
 */
export interface OperationResult {
  success: boolean;
  message: string;
  configPath?: string;
  error?: string;
}

/**
 * MCP server configuration for installation
 */
export interface McpServerConfig {
  /** Server identifier */
  serverId: string;
  /** Display name */
  name: string;
  /** Transport type */
  transport: "stdio" | "http" | "sse";
  /** For stdio: command to run */
  command?: string;
  /** For stdio: command arguments */
  args?: string[];
  /** For http/sse: URL */
  url?: string;
  /** Environment variables */
  env?: Record<string, string>;
}

/**
 * Editor adapter interface
 *
 * Each editor has different config file locations and formats.
 * Adapters abstract these differences.
 */
export interface EditorAdapter {
  /** Editor identifier */
  readonly type: EditorType;

  /** Human-readable editor name */
  readonly displayName: string;

  /**
   * Check if this editor is installed on the system
   */
  isInstalled(): Promise<boolean>;

  /**
   * Get the path to the MCP config file for this editor
   */
  getConfigPath(): string;

  /**
   * Check if a specific MCP server is configured
   */
  isServerInstalled(serverId: string): Promise<InstallStatus>;

  /**
   * List all configured MCP servers
   */
  listServers(): Promise<string[]>;

  /**
   * Add an MCP server configuration
   */
  addServer(config: McpServerConfig): Promise<OperationResult>;

  /**
   * Remove an MCP server configuration
   */
  removeServer(serverId: string): Promise<OperationResult>;

  /**
   * Update an existing MCP server configuration
   */
  updateServer(config: McpServerConfig): Promise<OperationResult>;
}

/**
 * Factory function type for creating adapters
 */
export type AdapterFactory = () => EditorAdapter;

/**
 * Convert SDK server info to adapter config format
 */
export function serverToConfig(
  server: McpServer,
  serverConfig: ServerConfig,
  format: "claudeDesktop" | "vscode" | "opencode" | "generic"
): McpServerConfig {
  const config: McpServerConfig = {
    serverId: server.id,
    name: server.displayName || server.name,
    transport: server.transportType,
  };

  // Extract from the format-specific config
  const formatConfig = serverConfig[format] as Record<string, unknown>;

  if (server.transportType === "stdio") {
    config.command = formatConfig.command as string | undefined;
    config.args = formatConfig.args as string[] | undefined;
    config.env = formatConfig.env as Record<string, string> | undefined;
  } else {
    config.url = formatConfig.url as string | undefined;
  }

  return config;
}
