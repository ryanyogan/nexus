/**
 * Base adapter with shared functionality
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type {
  EditorAdapter,
  EditorType,
  InstallStatus,
  OperationResult,
  McpServerConfig,
} from "./types.js";

/**
 * Abstract base class for editor adapters
 */
export abstract class BaseAdapter implements EditorAdapter {
  abstract readonly type: EditorType;
  abstract readonly displayName: string;

  abstract isInstalled(): Promise<boolean>;
  abstract getConfigPath(): string;

  /**
   * Read the MCP config file
   */
  protected readConfig(): Record<string, unknown> | null {
    const configPath = this.getConfigPath();
    if (!existsSync(configPath)) {
      return null;
    }

    try {
      const content = readFileSync(configPath, "utf-8");
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Write the MCP config file
   */
  protected writeConfig(config: Record<string, unknown>): boolean {
    const configPath = this.getConfigPath();
    try {
      const dir = dirname(configPath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(configPath, JSON.stringify(config, null, 2));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the servers object from config (path varies by editor)
   */
  protected abstract getServersFromConfig(
    config: Record<string, unknown>
  ): Record<string, unknown> | undefined;

  /**
   * Set the servers object in config (path varies by editor)
   */
  protected abstract setServersInConfig(
    config: Record<string, unknown>,
    servers: Record<string, unknown>
  ): void;

  /**
   * Format a server config for this editor's format
   */
  protected abstract formatServerConfig(config: McpServerConfig): Record<string, unknown>;

  async isServerInstalled(serverId: string): Promise<InstallStatus> {
    const config = this.readConfig();
    if (!config) {
      return { installed: false };
    }

    const servers = this.getServersFromConfig(config);
    if (!servers || !(serverId in servers)) {
      return { installed: false };
    }

    return {
      installed: true,
      configPath: this.getConfigPath(),
    };
  }

  async listServers(): Promise<string[]> {
    const config = this.readConfig();
    if (!config) {
      return [];
    }

    const servers = this.getServersFromConfig(config);
    if (!servers) {
      return [];
    }

    return Object.keys(servers);
  }

  async addServer(serverConfig: McpServerConfig): Promise<OperationResult> {
    let config = this.readConfig() || this.getDefaultConfig();

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

  async removeServer(serverId: string): Promise<OperationResult> {
    const config = this.readConfig();
    if (!config) {
      return {
        success: false,
        message: `No config file found`,
        error: "Config not found",
      };
    }

    const servers = this.getServersFromConfig(config);
    if (!servers || !(serverId in servers)) {
      return {
        success: false,
        message: `Server "${serverId}" is not configured`,
        error: "Server not found",
      };
    }

    // Remove the server
    delete servers[serverId];
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
      message: `Removed "${serverId}" from ${this.displayName}`,
      configPath: this.getConfigPath(),
    };
  }

  async updateServer(serverConfig: McpServerConfig): Promise<OperationResult> {
    const config = this.readConfig();
    if (!config) {
      return {
        success: false,
        message: `No config file found`,
        error: "Config not found",
      };
    }

    const servers = this.getServersFromConfig(config);
    if (!servers || !(serverConfig.serverId in servers)) {
      return {
        success: false,
        message: `Server "${serverConfig.serverId}" is not configured`,
        error: "Server not found",
      };
    }

    // Update the server
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
      message: `Updated "${serverConfig.name}" in ${this.displayName}`,
      configPath: this.getConfigPath(),
    };
  }

  /**
   * Get default config structure for this editor
   */
  protected abstract getDefaultConfig(): Record<string, unknown>;
}
