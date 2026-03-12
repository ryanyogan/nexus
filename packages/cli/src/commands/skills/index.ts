import { Command } from "commander";
import chalk from "chalk";
import { logger } from "../../utils/logger.js";
import { outputJson, isJsonOutput } from "../../utils/json.js";
import { getClient } from "../../services/api.js";
import { isAuthenticated } from "../../services/config.js";

interface ListOptions {
  installed?: boolean;
  category?: string;
  json?: boolean;
}

interface AddOptions {
  json?: boolean;
}

interface GainOptions {
  json?: boolean;
}

interface RemoveOptions {
  json?: boolean;
}

/**
 * Skills command group
 */
export const skillsCommand = new Command("skills")
  .description("Manage AI skills")
  .addCommand(createListCommand())
  .addCommand(createAddCommand())
  .addCommand(createGainCommand())
  .addCommand(createRemoveCommand());

// Default action
skillsCommand.action(() => {
  skillsCommand.help();
});

/**
 * nexus skills list
 */
function createListCommand(): Command {
  return new Command("list")
    .description("List available skills")
    .option("-i, --installed", "Show only installed skills")
    .option("-c, --category <category>", "Filter by category")
    .action(async (options: ListOptions) => {
      const jsonOutput = isJsonOutput(options);

      try {
        const client = getClient();

        if (options.installed) {
          // TODO: Get installed skills from user's profile
          if (jsonOutput) {
            outputJson({ skills: [], message: "Not yet implemented" });
          } else {
            logger.info("Installed skills: (coming soon)");
          }
          return;
        }

        // List all available skills
        const result = await client.listLibraries({ category: "skills" as any });

        if (jsonOutput) {
          outputJson({ skills: result.libraries });
        } else {
          logger.log(chalk.bold("\nAvailable Skills\n"));

          if (result.libraries.length === 0) {
            logger.info("No skills found");
            return;
          }

          for (const skill of result.libraries) {
            logger.log(`  ${chalk.cyan(skill.name)}`);
            if (skill.description) {
              logger.log(`    ${chalk.gray(skill.description)}`);
            }
          }
          logger.newline();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        if (jsonOutput) {
          outputJson({ error: message });
        } else {
          logger.error(`Failed to list skills: ${message}`);
        }
      }
    });
}

/**
 * nexus skills add [name]
 */
function createAddCommand(): Command {
  return new Command("add")
    .description("Search and install a skill")
    .argument("<name>", "Skill name to search for")
    .action(async (name: string, options: AddOptions) => {
      const jsonOutput = isJsonOutput(options);

      if (!isAuthenticated()) {
        if (jsonOutput) {
          outputJson({ error: "Not authenticated" });
        } else {
          logger.error("Please run 'nexus auth login' first");
        }
        return;
      }

      // TODO: Implement fuzzy search and installation
      if (jsonOutput) {
        outputJson({ message: "Not yet implemented", query: name });
      } else {
        logger.info(`Searching for skill: ${chalk.cyan(name)}`);
        logger.info("Skill installation coming soon!");
      }
    });
}

/**
 * nexus skills gain "[description]"
 */
function createGainCommand(): Command {
  return new Command("gain")
    .description("AI-powered skill discovery and installation")
    .argument("<description>", "Describe what you want to accomplish")
    .action(async (description: string, options: GainOptions) => {
      const jsonOutput = isJsonOutput(options);

      if (!isAuthenticated()) {
        if (jsonOutput) {
          outputJson({ error: "Not authenticated" });
        } else {
          logger.error("Please run 'nexus auth login' first");
        }
        return;
      }

      // TODO: Implement AI-powered skill search
      if (jsonOutput) {
        outputJson({ message: "Not yet implemented", description });
      } else {
        logger.info(`Analyzing: "${chalk.cyan(description)}"`);
        logger.info("AI-powered skill discovery coming soon!");
      }
    });
}

/**
 * nexus skills remove [name]
 */
function createRemoveCommand(): Command {
  return new Command("remove")
    .description("Uninstall a skill")
    .argument("<name>", "Skill name to remove")
    .action(async (name: string, options: RemoveOptions) => {
      const jsonOutput = isJsonOutput(options);

      if (!isAuthenticated()) {
        if (jsonOutput) {
          outputJson({ error: "Not authenticated" });
        } else {
          logger.error("Please run 'nexus auth login' first");
        }
        return;
      }

      // TODO: Implement skill removal
      if (jsonOutput) {
        outputJson({ message: "Not yet implemented", skill: name });
      } else {
        logger.info(`Removing skill: ${chalk.cyan(name)}`);
        logger.info("Skill removal coming soon!");
      }
    });
}
