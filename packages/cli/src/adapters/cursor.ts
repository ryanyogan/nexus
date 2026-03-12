/**
 * Cursor MCP adapter
 *
 * Config location: ~/.cursor/mcp.json
 * Format: { "mcpServers": { "name": { ... } } }
 */

import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { BaseAdapter } from "./base.js";
import type { EditorType, McpServerConfig } from "./types.js";

export class CursorAdapter extends BaseAdapter {
  readonly type: EditorType = "cursor";
  readonly displayName = "Cursor";

  private configPath: string;

  constructor() {
    super();
    this.configPath = join(homedir(), ".cursor", "mcp.json");
  }

  async isInstalled(): Promise<boolean> {
    // Check for Cursor installation
    const cursorDir = join(homedir(), ".cursor");
    return existsSync(cursorDir);
  }

  getConfigPath(): string {
    return this.configPath;
  }

  protected getServersFromConfig(
    config: Record<string, unknown>
  ): Record<string, unknown> | undefined {
    return config.mcpServers as Record<string, unknown> | undefined;
  }

  protected setServersInConfig(
    config: Record<string, unknown>,
    servers: Record<string, unknown>
  ): void {
    config.mcpServers = servers;
  }

  protected formatServerConfig(
    config: McpServerConfig
  ): Record<string, unknown> {
    if (config.transport === "stdio") {
      const serverConfig: Record<string, unknown> = {
        command: config.command,
      };
      if (config.args && config.args.length > 0) {
        serverConfig.args = config.args;
      }
      if (config.env && Object.keys(config.env).length > 0) {
        serverConfig.env = config.env;
      }
      return serverConfig;
    }

    // HTTP/SSE transport
    return {
      url: config.url,
    };
  }

  protected getDefaultConfig(): Record<string, unknown> {
    return {
      mcpServers: {},
    };
  }
}
