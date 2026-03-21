import { Command } from "commander";
import chalk from "chalk";
import { logger } from "../../utils/logger.js";
import { outputJson, isJsonOutput } from "../../utils/json.js";
import { getClient } from "../../services/api.js";
import { isAuthenticated, getMergedEditors } from "../../services/config.js";
import {
  createAdapter,
  installToEditors,
  removeFromEditors,
  parseEditorType,
  EDITOR_NAMES,
  type EditorType,
  type McpServerConfig,
} from "../../adapters/index.js";

interface ListOptions {
  installed?: boolean;
  category?: string;
  json?: boolean;
}

interface SearchOptions {
  json?: boolean;
}

interface AddOptions {
  json?: boolean;
  force?: boolean;
}

interface InfoOptions {
  json?: boolean;
}

interface RemoveOptions {
  json?: boolean;
}

interface InstalledOptions {
  json?: boolean;
}

/**
 * Servers command group
 */
export const serversCommand = new Command("servers")
  .description("Manage MCP servers")
  .addCommand(createListCommand())
  .addCommand(createSearchCommand())
  .addCommand(createAddCommand())
  .addCommand(createInfoCommand())
  .addCommand(createRemoveCommand())
  .addCommand(createInstalledCommand());

// Default action
serversCommand.action(() => {
  serversCommand.help();
});

/**
 * nexus servers list
 */
function createListCommand(): Command {
  return new Command("list")
    .description("List available MCP servers")
    .option("-i, --installed", "Show only installed servers")
    .option("-c, --category <category>", "Filter by category")
    .action(async (options: ListOptions) => {
      const jsonOutput = isJsonOutput(options);

      try {
        const client = getClient();
        const servers = await client.discoverServers({
          category: options.category,
          limit: 50,
        });

        if (jsonOutput) {
          outputJson({ servers });
          return;
        }

        logger.log(chalk.bold("\nAvailable MCP Servers\n"));

        if (servers.length === 0) {
          logger.info("No servers found");
          return;
        }

        for (const server of servers) {
          const officialBadge = server.isOfficial ? chalk.green(" [official]") : "";
          logger.log(`  ${chalk.cyan(server.name)}${officialBadge}`);
          if (server.description) {
            logger.log(`    ${chalk.gray(server.description)}`);
          }
          if (server.categories && server.categories.length > 0) {
            logger.log(`    Category: ${chalk.yellow(server.categories[0])}`);
          }
        }
        logger.newline();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        if (jsonOutput) {
          outputJson({ error: message });
        } else {
          logger.error(`Failed to list servers: ${message}`);
        }
      }
    });
}

/**
 * nexus servers search [query]
 */
function createSearchCommand(): Command {
  return new Command("search")
    .description("Search MCP servers by capability")
    .argument("<query>", "Search query")
    .action(async (query: string, options: SearchOptions) => {
      const jsonOutput = isJsonOutput(options);

      try {
        const client = getClient();
        const servers = await client.discoverServers({
          query,
          limit: 20,
        });

        if (jsonOutput) {
          outputJson({ servers, query });
          return;
        }

        logger.log(chalk.bold(`\nSearch results for "${query}"\n`));

        if (servers.length === 0) {
          logger.info("No servers found matching your query");
          return;
        }

        for (const server of servers) {
          const officialBadge = server.isOfficial ? chalk.green(" [official]") : "";
          logger.log(`  ${chalk.cyan(server.name)}${officialBadge}`);
          if (server.description) {
            logger.log(`    ${chalk.gray(server.description)}`);
          }
        }
        logger.newline();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        if (jsonOutput) {
          outputJson({ error: message });
        } else {
          logger.error(`Search failed: ${message}`);
        }
      }
    });
}

/**
 * nexus servers add [name]
 */
function createAddCommand(): Command {
  return new Command("add")
    .description("Install an MCP server to your editors")
    .argument("<name>", "Server name to install")
    .option("-f, --force", "Skip security warnings")
    .option("-e, --editor <editor>", "Install to specific editor only")
    .action(async (name: string, options: AddOptions & { editor?: string }) => {
      const jsonOutput = isJsonOutput(options);

      if (!isAuthenticated()) {
        if (jsonOutput) {
          outputJson({ error: "Not authenticated" });
        } else {
          logger.error("Please run 'nexus auth login' first");
        }
        return;
      }

      // Get target editors
      let targetEditors: EditorType[];
      if (options.editor) {
        const parsed = parseEditorType(options.editor);
        if (!parsed) {
          if (jsonOutput) {
            outputJson({ error: `Unknown editor: ${options.editor}` });
          } else {
            logger.error(`Unknown editor: ${options.editor}`);
          }
          return;
        }
        targetEditors = [parsed];
      } else {
        const configuredEditors = getMergedEditors();
        targetEditors = configuredEditors
          .map(parseEditorType)
          .filter((e): e is EditorType => e !== null);
      }

      if (targetEditors.length === 0) {
        if (jsonOutput) {
          outputJson({ error: "No editors configured" });
        } else {
          logger.error("No editors configured. Run 'nexus init' first.");
        }
        return;
      }

      try {
        const client = getClient();
        const server = await client.getServer(name);

        if (!server) {
          if (jsonOutput) {
            outputJson({ error: "Server not found" });
          } else {
            logger.error(`Server "${name}" not found`);
          }
          return;
        }

        // Get server installation config
        const serverConfig = await client.getServerConfig(name);

        // Build adapter config
        const config: McpServerConfig = {
          serverId: server.id,
          name: server.displayName || server.name,
          transport: server.transportType,
        };

        // Extract config from the server config (prefer generic format)
        const genericConfig = serverConfig.generic as Record<string, unknown>;
        if (server.transportType === "stdio") {
          config.command = genericConfig?.command as string;
          config.args = genericConfig?.args as string[];
          config.env = genericConfig?.env as Record<string, string>;
        } else {
          config.url = genericConfig?.url as string;
        }

        if (!jsonOutput) {
          logger.info(`Installing ${chalk.cyan(server.displayName || server.name)} to editors...`);
          if (server.description) {
            logger.log(`  ${chalk.gray(server.description)}`);
          }
          logger.newline();
        }

        // Install to each editor
        const results = await installToEditors(config, targetEditors);

        if (jsonOutput) {
          outputJson({
            server: name,
            results: results.map((r) => ({
              editor: r.editor,
              success: r.success,
              message: r.message,
              error: r.error,
            })),
          });
          return;
        }

        // Display results
        for (const result of results) {
          const editorName = EDITOR_NAMES[result.editor];
          if (result.success) {
            logger.log(`  ${chalk.green("✓")} ${editorName}`);
          } else {
            logger.log(`  ${chalk.red("✗")} ${editorName}: ${result.error || "Failed"}`);
          }
        }

        logger.newline();
        const successCount = results.filter((r) => r.success).length;
        if (successCount === results.length) {
          logger.success(`Installed to ${successCount} editor(s)`);
        } else if (successCount > 0) {
          logger.warn(`Installed to ${successCount}/${results.length} editor(s)`);
        } else {
          logger.error("Failed to install to any editors");
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        if (jsonOutput) {
          outputJson({ error: message });
        } else {
          logger.error(`Failed to install server: ${message}`);
        }
      }
    });
}

/**
 * nexus servers info [name]
 */
function createInfoCommand(): Command {
  return new Command("info")
    .description("Show detailed information about an MCP server")
    .argument("<name>", "Server name")
    .action(async (name: string, options: InfoOptions) => {
      const jsonOutput = isJsonOutput(options);

      try {
        const client = getClient();
        const server = await client.getServer(name);

        if (!server) {
          if (jsonOutput) {
            outputJson({ error: "Server not found" });
          } else {
            logger.error(`Server "${name}" not found`);
          }
          return;
        }

        if (jsonOutput) {
          outputJson({ server });
          return;
        }

        logger.newline();
        logger.log(chalk.bold(server.displayName || server.name));
        logger.log(chalk.gray("─".repeat(40)));
        logger.newline();

        if (server.description) {
          logger.log(`  ${server.description}`);
          logger.newline();
        }

        // Server metadata
        logger.log(`  ID: ${chalk.cyan(server.id)}`);
        logger.log(`  Namespace: ${server.namespace}`);
        if (server.version) {
          logger.log(`  Version: ${server.version}`);
        }
        logger.log(`  Transport: ${server.transportType}`);
        logger.log(
          `  Package: ${server.packageType}${server.packageName ? ` (${server.packageName})` : ""}`
        );

        // Badges
        const badges: string[] = [];
        if (server.isOfficial) badges.push(chalk.green("official"));
        if (server.isFeatured) badges.push(chalk.yellow("featured"));
        if (badges.length > 0) {
          logger.log(`  Status: ${badges.join(", ")}`);
        }

        // Categories
        if (server.categories && server.categories.length > 0) {
          logger.newline();
          logger.log("  Categories:");
          for (const cat of server.categories) {
            logger.log(`    • ${cat}`);
          }
        }

        logger.newline();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        if (jsonOutput) {
          outputJson({ error: message });
        } else {
          logger.error(`Failed to get server info: ${message}`);
        }
      }
    });
}

/**
 * nexus servers remove [name]
 */
function createRemoveCommand(): Command {
  return new Command("remove")
    .description("Remove an MCP server from your editors")
    .argument("<name>", "Server name to remove")
    .option("-e, --editor <editor>", "Remove from specific editor only")
    .action(async (name: string, options: RemoveOptions & { editor?: string }) => {
      const jsonOutput = isJsonOutput(options);

      // Get target editors
      let targetEditors: EditorType[];
      if (options.editor) {
        const parsed = parseEditorType(options.editor);
        if (!parsed) {
          if (jsonOutput) {
            outputJson({ error: `Unknown editor: ${options.editor}` });
          } else {
            logger.error(`Unknown editor: ${options.editor}`);
          }
          return;
        }
        targetEditors = [parsed];
      } else {
        const configuredEditors = getMergedEditors();
        targetEditors = configuredEditors
          .map(parseEditorType)
          .filter((e): e is EditorType => e !== null);
      }

      if (targetEditors.length === 0) {
        if (jsonOutput) {
          outputJson({ error: "No editors configured" });
        } else {
          logger.error("No editors configured");
        }
        return;
      }

      if (!jsonOutput) {
        logger.info(`Removing ${chalk.cyan(name)} from editors...`);
        logger.newline();
      }

      // Remove from each editor
      const results = await removeFromEditors(name, targetEditors);

      if (jsonOutput) {
        outputJson({
          server: name,
          results: results.map((r) => ({
            editor: r.editor,
            success: r.success,
            message: r.message,
            error: r.error,
          })),
        });
        return;
      }

      // Display results
      for (const result of results) {
        const editorName = EDITOR_NAMES[result.editor];
        if (result.success) {
          logger.log(`  ${chalk.green("✓")} ${editorName}`);
        } else {
          logger.log(`  ${chalk.red("✗")} ${editorName}: ${result.error || "Failed"}`);
        }
      }

      logger.newline();
      const successCount = results.filter((r) => r.success).length;
      if (successCount === results.length) {
        logger.success(`Removed from ${successCount} editor(s)`);
      } else if (successCount > 0) {
        logger.warn(`Removed from ${successCount}/${results.length} editor(s)`);
      } else {
        logger.error("Failed to remove from any editors");
      }
    });
}

/**
 * nexus servers installed
 */
function createInstalledCommand(): Command {
  return new Command("installed")
    .description("List MCP servers installed in your editors")
    .option("-e, --editor <editor>", "Show only specific editor")
    .action(async (options: InstalledOptions & { editor?: string }) => {
      const jsonOutput = isJsonOutput(options);

      // Get target editors
      let targetEditors: EditorType[];
      if (options.editor) {
        const parsed = parseEditorType(options.editor);
        if (!parsed) {
          if (jsonOutput) {
            outputJson({ error: `Unknown editor: ${options.editor}` });
          } else {
            logger.error(`Unknown editor: ${options.editor}`);
          }
          return;
        }
        targetEditors = [parsed];
      } else {
        const configuredEditors = getMergedEditors();
        targetEditors = configuredEditors
          .map(parseEditorType)
          .filter((e): e is EditorType => e !== null);
      }

      if (targetEditors.length === 0) {
        if (jsonOutput) {
          outputJson({ error: "No editors configured" });
        } else {
          logger.error("No editors configured. Run 'nexus init' first.");
        }
        return;
      }

      const results: Record<string, string[]> = {};

      for (const editorType of targetEditors) {
        const adapter = createAdapter(editorType);
        const servers = await adapter.listServers();
        results[editorType] = servers;
      }

      if (jsonOutput) {
        outputJson({ installed: results });
        return;
      }

      logger.log(chalk.bold("\nInstalled MCP Servers\n"));

      let hasAny = false;
      for (const editorType of targetEditors) {
        const editorName = EDITOR_NAMES[editorType];
        const servers = results[editorType];

        logger.log(chalk.cyan.bold(editorName));

        if (servers.length === 0) {
          logger.log(chalk.gray("  No servers installed"));
        } else {
          hasAny = true;
          for (const server of servers) {
            logger.log(`  • ${server}`);
          }
        }
        logger.newline();
      }

      if (!hasAny) {
        logger.info(`Use ${chalk.cyan("nexus servers add <name>")} to install a server`);
      }
    });
}
