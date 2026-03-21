/**
 * Claude Code MCP adapter
 *
 * Claude Code uses the `claude mcp add` CLI command to manage MCP servers.
 * It doesn't use a config file that we can directly manipulate.
 *
 * Commands:
 * - Add: claude mcp add <name> <command> [args...]
 * - Add remote: claude mcp add --transport http <name> <url>
 * - Remove: claude mcp remove <name>
 * - List: claude mcp list
 */

import { execSync, spawnSync } from "node:child_process";
import type {
  EditorAdapter,
  EditorType,
  InstallStatus,
  OperationResult,
  McpServerConfig,
} from "./types.js";

export class ClaudeCodeAdapter implements EditorAdapter {
  readonly type: EditorType = "claude-code";
  readonly displayName = "Claude Code";

  async isInstalled(): Promise<boolean> {
    try {
      execSync("claude --version", { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  }

  getConfigPath(): string {
    // Claude Code doesn't use a config file we can access directly
    return "~/.claude/ (managed by claude CLI)";
  }

  async isServerInstalled(serverId: string): Promise<InstallStatus> {
    const servers = await this.listServers();
    const installed = servers.includes(serverId);

    return {
      installed,
      configPath: installed ? this.getConfigPath() : undefined,
    };
  }

  async listServers(): Promise<string[]> {
    try {
      const result = spawnSync("claude", ["mcp", "list"], {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      });

      if (result.status !== 0) {
        return [];
      }

      // Parse the output - format may vary, but typically lists server names
      const output = result.stdout.trim();
      if (!output) {
        return [];
      }

      // Each line should be a server entry
      return output
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => {
          // Extract server name (first word or quoted string)
          const match = line.match(/^["']?([^"'\s]+)/);
          return match ? match[1] : line;
        });
    } catch {
      return [];
    }
  }

  async addServer(config: McpServerConfig): Promise<OperationResult> {
    try {
      let args: string[];

      if (config.transport === "stdio") {
        // stdio transport: claude mcp add <name> <command> [args...]
        args = ["mcp", "add", config.serverId];
        if (config.command) {
          args.push(config.command);
        }
        if (config.args && config.args.length > 0) {
          args.push("--", ...config.args);
        }
      } else {
        // HTTP/SSE transport: claude mcp add --transport http <name> <url>
        args = ["mcp", "add", "--transport", config.transport, config.serverId];
        if (config.url) {
          args.push(config.url);
        }
      }

      // Add environment variables if present
      if (config.env && Object.keys(config.env).length > 0) {
        for (const [key, value] of Object.entries(config.env)) {
          args.push("--env", `${key}=${value}`);
        }
      }

      const result = spawnSync("claude", args, {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      });

      if (result.status !== 0) {
        return {
          success: false,
          message: `Failed to add server to Claude Code`,
          error: result.stderr || "Unknown error",
        };
      }

      return {
        success: true,
        message: `Added "${config.name}" to Claude Code`,
        configPath: this.getConfigPath(),
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to add server to Claude Code`,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async removeServer(serverId: string): Promise<OperationResult> {
    try {
      const result = spawnSync("claude", ["mcp", "remove", serverId], {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      });

      if (result.status !== 0) {
        return {
          success: false,
          message: `Failed to remove server from Claude Code`,
          error: result.stderr || "Unknown error",
        };
      }

      return {
        success: true,
        message: `Removed "${serverId}" from Claude Code`,
        configPath: this.getConfigPath(),
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to remove server from Claude Code`,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async updateServer(config: McpServerConfig): Promise<OperationResult> {
    // Claude Code doesn't have an update command, so we remove and re-add
    const removeResult = await this.removeServer(config.serverId);
    if (!removeResult.success) {
      // Server might not exist, try adding anyway
    }

    return this.addServer(config);
  }
}
