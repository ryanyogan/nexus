import { Command } from "commander";
import chalk from "chalk";
import { logger } from "../utils/logger.js";
import { outputJson, isJsonOutput } from "../utils/json.js";
import { isAuthenticated, getEditors } from "../services/config.js";
import { runInit } from "../components/index.js";

interface InitOptions {
  json?: boolean;
  simple?: boolean;
}

/**
 * Init command - Interactive setup wizard
 *
 * nexus init
 * nexus init --simple  # Non-interactive mode
 */
export const initCommand = new Command("init")
  .description("Interactive setup wizard for Nexus")
  .option("--simple", "Use simple non-interactive mode")
  .action(async (options: InitOptions) => {
    const jsonOutput = isJsonOutput(options);

    if (jsonOutput) {
      // JSON mode - just output current state
      outputJson({
        authenticated: isAuthenticated(),
        editors: getEditors(),
        message: "Interactive mode not available with --json flag",
      });
      return;
    }

    // Check if we should use simple mode (e.g., when not in TTY)
    const isTTY = process.stdout.isTTY;
    const useSimpleMode = options.simple || !isTTY;

    if (useSimpleMode) {
      showSimpleInit();
      return;
    }

    // Run interactive Ink-based UI
    try {
      const selectedEditors = await runInit();
      logger.newline();
      logger.success(`Setup complete! Configured ${selectedEditors.length} editor(s).`);
    } catch (error) {
      // Fall back to simple mode if Ink fails
      logger.warn("Interactive mode failed, falling back to simple mode.");
      showSimpleInit();
    }
  });

/**
 * Simple non-interactive init display
 */
function showSimpleInit() {
  logger.newline();
  logger.log(chalk.bold.cyan("  ╭──────────────────────────────────────────╮"));
  logger.log(chalk.bold.cyan("  │                                          │"));
  logger.log(
    chalk.bold.cyan("  │   Welcome to ") +
      chalk.bold.white("Nexus") +
      chalk.bold.cyan("!                      │")
  );
  logger.log(
    chalk.bold.cyan("  │   ") +
      chalk.gray("The AI Documentation & Skills Hub") +
      chalk.bold.cyan("     │")
  );
  logger.log(chalk.bold.cyan("  │                                          │"));
  logger.log(chalk.bold.cyan("  ╰──────────────────────────────────────────╯"));
  logger.newline();

  if (!isAuthenticated()) {
    logger.info("You're not logged in yet.");
    logger.info(`Run ${chalk.cyan("nexus auth login")} to authenticate.`);
    logger.newline();
  }

  logger.log(chalk.bold("Configure MCP server in your editors:"));
  logger.log(chalk.gray("─".repeat(40)));
  logger.newline();

  logger.log(`  ${chalk.cyan("Claude Code")}:`);
  logger.log(chalk.gray(`  claude mcp add nexus --transport http https://mcp.nexus.yogan.dev`));
  logger.newline();

  logger.log(`  ${chalk.cyan("Cursor")} (add to ~/.cursor/mcp.json):`);
  logger.log(
    chalk.gray(`  { "mcpServers": { "nexus": { "url": "https://mcp.nexus.yogan.dev" } } }`)
  );
  logger.newline();

  logger.log(`  ${chalk.cyan("OpenCode")} (add to opencode.json):`);
  logger.log(
    chalk.gray(
      `  { "mcp": { "nexus": { "type": "remote", "url": "https://mcp.nexus.yogan.dev", "enabled": true } } }`
    )
  );
  logger.newline();

  logger.log(chalk.gray("─".repeat(40)));
  logger.newline();
  logger.success("Run with --interactive flag for full setup wizard.");
  logger.newline();

  logger.log("  Quick commands:");
  logger.log(`    ${chalk.cyan("nexus docs search react hooks")}`);
  logger.log(`    ${chalk.cyan("nexus skills list")}`);
  logger.log(`    ${chalk.cyan("nexus servers list")}`);
  logger.newline();
}
