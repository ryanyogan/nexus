/**
 * Zed MCP adapter
 *
 * Config location: ~/.config/zed/settings.json
 * Format: { "context_servers": { "name": { "settings": { "command": ... } } } }
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { BaseAdapter } from "./base.js";
import type { EditorType, McpServerConfig, OperationResult } from "./types.js";

export class ZedAdapter extends BaseAdapter {
  readonly type: EditorType = "zed";
  readonly displayName = "Zed";

  private configPath: string;

  constructor() {
    super();
    this.configPath = join(homedir(), ".config", "zed", "settings.json");
  }

  async isInstalled(): Promise<boolean> {
    // Check for Zed config directory
    const zedConfigDir = join(homedir(), ".config", "zed");
    return existsSync(zedConfigDir);
  }

  getConfigPath(): string {
    return this.configPath;
  }

  /**
   * Override readConfig to handle Zed's full settings file
   * We need to be careful not to overwrite other settings
   */
  protected readConfig(): Record<string, unknown> | null {
    if (!existsSync(this.configPath)) {
      return null;
    }

    try {
      const content = readFileSync(this.configPath, "utf-8");
      // Handle JSONC (JSON with comments) - strip comments
      const jsonContent = content
        .replace(/\/\/.*$/gm, "") // Remove single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, ""); // Remove multi-line comments
      return JSON.parse(jsonContent);
    } catch {
      return null;
    }
  }

  protected getServersFromConfig(
    config: Record<string, unknown>
  ): Record<string, unknown> | undefined {
    return config.context_servers as Record<string, unknown> | undefined;
  }

  protected setServersInConfig(
    config: Record<string, unknown>,
    servers: Record<string, unknown>
  ): void {
    config.context_servers = servers;
  }

  protected formatServerConfig(config: McpServerConfig): Record<string, unknown> {
    if (config.transport === "stdio") {
      const settings: Record<string, unknown> = {
        command: config.command,
      };
      if (config.args && config.args.length > 0) {
        settings.args = config.args;
      }
      if (config.env && Object.keys(config.env).length > 0) {
        settings.env = config.env;
      }
      return { settings };
    }

    // HTTP/SSE transport - Zed may not fully support this yet
    return {
      settings: {
        url: config.url,
      },
    };
  }

  protected getDefaultConfig(): Record<string, unknown> {
    // For Zed, we need to preserve existing settings
    const existing = this.readConfig();
    if (existing) {
      return existing;
    }
    return {
      context_servers: {},
    };
  }

  /**
   * Override addServer to preserve existing Zed settings
   */
  async addServer(serverConfig: McpServerConfig): Promise<OperationResult> {
    let config = this.readConfig() || { context_servers: {} };

    const servers = this.getServersFromConfig(config) || {};

    // Check if already exists
    if (serverConfig.serverId in servers) {
      return {
        success: false,
        message: `Server "${serverConfig.serverId}" is already configured`,
        error: "Server already exists",
      };
    }

    // Add the server
    servers[serverConfig.serverId] = this.formatServerConfig(serverConfig);
    this.setServersInConfig(config, servers);

    // Write config
    if (!this.writeConfig(config)) {
      return {
        success: false,
        message: `Failed to write config file`,
        error: "Write failed",
      };
    }

    return {
      success: true,
      message: `Added "${serverConfig.name}" to ${this.displayName}`,
      configPath: this.getConfigPath(),
    };
  }
}
