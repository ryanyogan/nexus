import { Command } from "commander";
import chalk from "chalk";
import { logger } from "../../utils/logger.js";
import { outputJson, isJsonOutput } from "../../utils/json.js";
import {
  isAuthenticated,
  getAuth,
  getEditors,
  getApiUrl,
} from "../../services/config.js";
import { checkConnection } from "../../services/api.js";

interface StatusOptions {
  json?: boolean;
}

/**
 * Status command
 *
 * nexus auth status - Show current auth state
 */
export const statusCommand = new Command("status")
  .description("Show current authentication status")
  .action(async (options: StatusOptions) => {
    const jsonOutput = isJsonOutput(options);

    const authenticated = isAuthenticated();
    const auth = getAuth();
    const editors = getEditors();
    const apiUrl = getApiUrl();

    // Check API connection
    const connection = await checkConnection();

    if (jsonOutput) {
      outputJson({
        authenticated,
        user: authenticated
          ? {
              email: auth?.email,
              userId: auth?.userId,
              name: auth?.name,
            }
          : null,
        editors,
        apiUrl,
        connection: {
          connected: connection.connected,
          error: connection.error,
        },
      });
      return;
    }

    // Pretty print status
    logger.newline();
    logger.log(chalk.bold("Nexus CLI Status"));
    logger.log(chalk.gray("─".repeat(40)));
    logger.newline();

    // Auth status
    if (authenticated && auth) {
      logger.log(`  ${chalk.green("●")} Authenticated`);
      logger.log(`    Email: ${chalk.cyan(auth.email)}`);
      if (auth.name) {
        logger.log(`    Name:  ${auth.name}`);
      }
      logger.log(`    User:  ${chalk.gray(auth.userId)}`);
    } else {
      logger.log(`  ${chalk.red("○")} Not authenticated`);
      logger.log(`    Run ${chalk.cyan("nexus auth login")} to sign in`);
    }

    logger.newline();

    // Connection status
    if (connection.connected) {
      logger.log(`  ${chalk.green("●")} API Connected`);
    } else {
      logger.log(`  ${chalk.red("○")} API Disconnected`);
      if (connection.error) {
        logger.log(`    Error: ${chalk.red(connection.error)}`);
      }
    }
    logger.log(`    URL: ${chalk.gray(apiUrl)}`);

    logger.newline();

    // Editors
    if (editors.length > 0) {
      logger.log(`  Configured editors:`);
      for (const editor of editors) {
        logger.log(`    ${chalk.cyan("•")} ${editor}`);
      }
    } else {
      logger.log(`  No editors configured`);
      logger.log(`    Run ${chalk.cyan("nexus init")} to set up editors`);
    }

    logger.newline();
  });
