import { Command } from "commander";
import { loginCommand } from "./login.js";
import { logoutCommand } from "./logout.js";
import { statusCommand } from "./status.js";

/**
 * Auth command group
 *
 * nexus auth login   - Authenticate with Nexus
 * nexus auth logout  - Clear stored credentials
 * nexus auth status  - Show current auth state
 */
export const authCommand = new Command("auth")
  .description("Manage authentication")
  .addCommand(loginCommand)
  .addCommand(logoutCommand)
  .addCommand(statusCommand);

// Default action shows status
authCommand.action(() => {
  authCommand.help();
});
