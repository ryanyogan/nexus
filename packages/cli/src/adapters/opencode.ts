/**
 * OpenCode MCP adapter
 *
 * Config location: opencode.json (project-level)
 * Format: { "mcp": { "name": { "type": "remote", "url": "...", "enabled": true } } }
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import { BaseAdapter } from "./base.js";
import type { EditorType, McpServerConfig } from "./types.js";
import { findProjectRoot } from "../utils/paths.js";

export class OpenCodeAdapter extends BaseAdapter {
  readonly type: EditorType = "opencode";
  readonly displayName = "OpenCode";

  private projectRoot: string | null;

  constructor() {
    super();
    this.projectRoot = findProjectRoot();
  }

  async isInstalled(): Promise<boolean> {
    // Check if opencode.json exists or if we're in a project
    if (!this.projectRoot) {
      return false;
    }

    // OpenCode uses opencode.json
    const configPath = join(this.projectRoot, "opencode.json");
    return existsSync(configPath);
  }

  getConfigPath(): string {
    if (!this.projectRoot) {
      throw new Error("Not in a project directory");
    }
    return join(this.projectRoot, "opencode.json");
  }

  protected getServersFromConfig(
    config: Record<string, unknown>
  ): Record<string, unknown> | undefined {
    return config.mcp as Record<string, unknown> | undefined;
  }

  protected setServersInConfig(
    config: Record<string, unknown>,
    servers: Record<string, unknown>
  ): void {
    config.mcp = servers;
  }

  protected formatServerConfig(
    config: McpServerConfig
  ): Record<string, unknown> {
    if (config.transport === "stdio") {
      const serverConfig: Record<string, unknown> = {
        type: "local",
        command: config.command,
        enabled: true,
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
      type: "remote",
      url: config.url,
      enabled: true,
    };
  }

  protected getDefaultConfig(): Record<string, unknown> {
    return {
      mcp: {},
    };
  }
}
