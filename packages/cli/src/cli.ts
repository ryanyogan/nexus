import { Command } from "commander";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Read package.json for version info
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(
  readFileSync(join(__dirname, "..", "package.json"), "utf-8")
);
const { version, description } = pkg;

// Import command modules
import { authCommand } from "./commands/auth/index.js";
import { skillsCommand } from "./commands/skills/index.js";
import { flowsCommand } from "./commands/flows/index.js";
import { serversCommand } from "./commands/servers/index.js";
import { docsCommand } from "./commands/docs/index.js";
import { brainCommand } from "./commands/brain/index.js";
import { reposCommand } from "./commands/repos/index.js";
import { initCommand } from "./commands/init.js";
import { statsCommand } from "./commands/stats.js";
import { serveCommand } from "./commands/serve.js";

/**
 * Main CLI program
 */
export const program = new Command()
  .name("nexus")
  .description(description)
  .version(version, "-v, --version", "Display the current version")
  .option("--json", "Output results as JSON")
  .option("--verbose", "Enable verbose logging")
  .option("--no-color", "Disable colored output")
  .configureHelp({
    sortSubcommands: true,
    sortOptions: true,
  });

// Register commands
program.addCommand(initCommand);
program.addCommand(authCommand);
program.addCommand(skillsCommand);
program.addCommand(flowsCommand);
program.addCommand(serversCommand);
program.addCommand(docsCommand);
program.addCommand(brainCommand);
program.addCommand(reposCommand);
program.addCommand(statsCommand);
program.addCommand(serveCommand);

// Global error handling
program.exitOverride((err) => {
  if (err.code === "commander.help") {
    process.exit(0);
  }
  throw err;
});

// Show help when no command provided
program.action(() => {
  program.help();
});
