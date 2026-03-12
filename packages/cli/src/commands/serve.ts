import { Command } from "commander";
import chalk from "chalk";
import { logger } from "../utils/logger.js";
import { outputJson, isJsonOutput } from "../utils/json.js";
import { getToken, isAuthenticated } from "../services/config.js";

interface ServeOptions {
  http?: boolean;
  port?: string;
  offline?: boolean;
  json?: boolean;
}

/**
 * Serve command - Run Nexus as an MCP server
 *
 * nexus serve              - Run as stdio MCP server
 * nexus serve --http       - Run as HTTP MCP server
 * nexus serve --offline    - Run in offline mode (cache only)
 */
export const serveCommand = new Command("serve")
  .description("Run Nexus as an MCP server")
  .option("--http", "Run as HTTP server instead of stdio")
  .option("-p, --port <port>", "Port for HTTP server", "3456")
  .option("--offline", "Use cached docs only (no API calls)")
  .action(async (options: ServeOptions) => {
    const jsonOutput = isJsonOutput(options);

    if (!isAuthenticated() && !options.offline) {
      if (jsonOutput) {
        outputJson({ error: "Not authenticated. Use --offline for cache-only mode." });
      } else {
        logger.warn("Not authenticated. API calls will be limited.");
        logger.info("Run 'nexus auth login' for full access, or use --offline for cache-only mode.");
        logger.newline();
      }
    }

    if (options.offline) {
      if (!jsonOutput) {
        logger.info("Running in offline mode (cache only)");
      }
    }

    if (options.http) {
      await runHttpServer(options);
    } else {
      await runStdioServer(options);
    }
  });

/**
 * Run as stdio MCP server
 */
async function runStdioServer(options: ServeOptions): Promise<void> {
  const jsonOutput = isJsonOutput(options);

  if (!jsonOutput) {
    logger.info("Starting Nexus MCP server (stdio)...");
    logger.info("Waiting for MCP client connection...");
    logger.newline();
  }

  // TODO: Implement MCP server using @modelcontextprotocol/sdk
  // For now, just output a placeholder message

  if (jsonOutput) {
    outputJson({
      status: "starting",
      transport: "stdio",
      message: "MCP server implementation coming soon",
    });
  } else {
    logger.log(chalk.yellow("MCP server implementation coming soon!"));
    logger.newline();
    logger.log("This will expose the following tools to MCP clients:");
    logger.log(`  ${chalk.cyan("•")} resolve-library - Find libraries by name`);
    logger.log(`  ${chalk.cyan("•")} query-docs - Search documentation`);
    logger.log(`  ${chalk.cyan("•")} get-library-info - Get library details`);
    logger.log(`  ${chalk.cyan("•")} list-libraries - List all indexed libraries`);
    logger.log(`  ${chalk.cyan("•")} save-memory - Store context/decisions`);
    logger.log(`  ${chalk.cyan("•")} recall-memories - Search stored memories`);
    logger.log(`  ${chalk.cyan("•")} discover-servers - Find MCP servers`);
    logger.newline();
  }
}

/**
 * Run as HTTP MCP server
 */
async function runHttpServer(options: ServeOptions): Promise<void> {
  const jsonOutput = isJsonOutput(options);
  const port = parseInt(options.port || "3456", 10);

  if (!jsonOutput) {
    logger.info(`Starting Nexus MCP server (HTTP on port ${port})...`);
  }

  // TODO: Implement HTTP MCP server
  // For now, just output a placeholder message

  if (jsonOutput) {
    outputJson({
      status: "starting",
      transport: "http",
      port,
      message: "HTTP MCP server implementation coming soon",
    });
  } else {
    logger.log(chalk.yellow("HTTP MCP server implementation coming soon!"));
    logger.newline();
    logger.log(`Would listen on: ${chalk.cyan(`http://localhost:${port}`)}`);
    logger.newline();
  }
}
