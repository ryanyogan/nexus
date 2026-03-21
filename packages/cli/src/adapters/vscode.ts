/**
 * VS Code MCP adapter
 *
 * Config location: .vscode/mcp.json (project-level)
 * Format: { "servers": { "name": { "type": "http", "url": "..." } } }
 *
 * Note: VS Code uses project-level config, not global
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import { BaseAdapter } from "./base.js";
import type { EditorType, McpServerConfig } from "./types.js";
import { findProjectRoot } from "../utils/paths.js";

export class VSCodeAdapter extends BaseAdapter {
  readonly type: EditorType = "vscode";
  readonly displayName = "VS Code";

  private projectRoot: string | null;

  constructor() {
    super();
    this.projectRoot = findProjectRoot();
  }

  async isInstalled(): Promise<boolean> {
    // VS Code is very common, assume it's available if we're in a project
    return this.projectRoot !== null;
  }

  getConfigPath(): string {
    if (!this.projectRoot) {
      throw new Error("Not in a project directory");
    }
    return join(this.projectRoot, ".vscode", "mcp.json");
  }

  protected getServersFromConfig(
    config: Record<string, unknown>
  ): Record<string, unknown> | undefined {
    return config.servers as Record<string, unknown> | undefined;
  }

  protected setServersInConfig(
    config: Record<string, unknown>,
    servers: Record<string, unknown>
  ): void {
    config.servers = servers;
  }

  protected formatServerConfig(config: McpServerConfig): Record<string, unknown> {
    if (config.transport === "stdio") {
      const serverConfig: Record<string, unknown> = {
        type: "stdio",
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
      type: "http",
      url: config.url,
    };
  }

  protected getDefaultConfig(): Record<string, unknown> {
    return {
      servers: {},
    };
  }
}
