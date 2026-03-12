import { Command } from "commander";
import chalk from "chalk";
import { logger } from "../utils/logger.js";
import { outputJson, isJsonOutput } from "../utils/json.js";
import {
  setEditors,
  isAuthenticated,
  getAuth,
  getEditors,
} from "../services/config.js";
import type { EditorId } from "../utils/paths.js";

interface InitOptions {
  json?: boolean;
}

/**
 * Init command - Interactive setup wizard
 *
 * nexus init
 */
export const initCommand = new Command("init")
  .description("Interactive setup wizard for Nexus")
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

    // Print welcome banner
    logger.newline();
    logger.log(chalk.bold.cyan("  ╭──────────────────────────────────────────╮"));
    logger.log(chalk.bold.cyan("  │                                          │"));
    logger.log(chalk.bold.cyan("  │   Welcome to ") + chalk.bold.white("Nexus") + chalk.bold.cyan("!                      │"));
    logger.log(chalk.bold.cyan("  │   ") + chalk.gray("The AI Documentation & Skills Hub") + chalk.bold.cyan("     │"));
    logger.log(chalk.bold.cyan("  │                                          │"));
    logger.log(chalk.bold.cyan("  ╰──────────────────────────────────────────╯"));
    logger.newline();

    // Check authentication
    if (!isAuthenticated()) {
      logger.info("You're not logged in yet.");
      logger.info(`Run ${chalk.cyan("nexus auth login")} to authenticate.`);
      logger.newline();
    } else {
      const auth = getAuth();
      logger.success(`Authenticated as ${chalk.cyan(auth?.email)}`);
      logger.newline();
    }

    // For now, show a simplified setup flow
    // TODO: Add Ink-based interactive UI
    
    logger.log(chalk.bold("Quick Setup"));
    logger.log(chalk.gray("─".repeat(40)));
    logger.newline();

    logger.log("  1. Choose your editors:");
    logger.log(`     Run ${chalk.cyan("nexus init --editors")} (coming soon)`);
    logger.newline();

    logger.log("  2. Configure MCP server in your editors:");
    logger.newline();
    
    const editors: { name: string; id: EditorId; config: string }[] = [
      {
        name: "Claude Code",
        id: "claude-code",
        config: `claude mcp add nexus --transport http https://mcp.nexus.yogan.dev`,
      },
      {
        name: "Cursor",
        id: "cursor",
        config: `Add to ~/.cursor/mcp.json:
{
  "mcpServers": {
    "nexus": {
      "url": "https://mcp.nexus.yogan.dev"
    }
  }
}`,
      },
      {
        name: "OpenCode",
        id: "opencode",
        config: `Add to opencode.json:
{
  "mcp": {
    "nexus": {
      "type": "remote",
      "url": "https://mcp.nexus.yogan.dev",
      "enabled": true
    }
  }
}`,
      },
    ];

    for (const editor of editors) {
      logger.log(`  ${chalk.cyan(editor.name)}:`);
      logger.log(chalk.gray(`  ${editor.config.split("\n").join("\n  ")}`));
      logger.newline();
    }

    // Save default editors
    const defaultEditors: EditorId[] = ["claude-code", "cursor", "opencode"];
    setEditors(defaultEditors);

    logger.log(chalk.gray("─".repeat(40)));
    logger.newline();
    logger.success("Nexus is ready!");
    logger.newline();

    logger.log("  Quick commands:");
    logger.log(`    ${chalk.cyan("nexus docs search react hooks")}`);
    logger.log(`    ${chalk.cyan("nexus skills list")}`);
    logger.log(`    ${chalk.cyan("nexus servers list")}`);
    logger.log(`    ${chalk.cyan("nexus stats")}`);
    logger.newline();
  });
