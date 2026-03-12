import { Command } from "commander";
import chalk from "chalk";
import { logger } from "../../utils/logger.js";
import { outputJson, outputJsonError, isJsonOutput } from "../../utils/json.js";
import { clearAuth, isAuthenticated, getAuth } from "../../services/config.js";

interface LogoutOptions {
  json?: boolean;
}

/**
 * Logout command
 *
 * nexus auth logout - Clear stored credentials
 */
export const logoutCommand = new Command("logout")
  .description("Clear stored credentials")
  .action(async (options: LogoutOptions) => {
    const jsonOutput = isJsonOutput(options);

    if (!isAuthenticated()) {
      if (jsonOutput) {
        outputJson({ status: "not_authenticated" });
      } else {
        logger.info("Not currently authenticated");
      }
      return;
    }

    const auth = getAuth();
    const email = auth?.email || "unknown";

    clearAuth();

    if (jsonOutput) {
      outputJson({
        status: "logged_out",
        email,
      });
    } else {
      logger.success(`Logged out from ${chalk.cyan(email)}`);
    }
  });
