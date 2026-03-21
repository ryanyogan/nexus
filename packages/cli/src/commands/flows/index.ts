import { Command } from "commander";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import { logger } from "../../utils/logger.js";
import { outputJson, isJsonOutput } from "../../utils/json.js";
import { getClient } from "../../services/api.js";
import { isAuthenticated } from "../../services/config.js";
import type { Flow } from "@nexus/sdk";

interface ListOptions {
  starter?: boolean;
  my?: boolean;
  category?: string;
  search?: string;
  json?: boolean;
}

interface GetOptions {
  json?: boolean;
}

interface ActivateOptions {
  project?: string;
  json?: boolean;
}

interface DeactivateOptions {
  all?: boolean;
  json?: boolean;
}

interface DownloadOptions {
  output?: string;
  json?: boolean;
}

/**
 * Flows command group
 */
export const flowsCommand = new Command("flow")
  .description("Manage AI flows - pre-configured working environments")
  .addCommand(createListCommand())
  .addCommand(createGetCommand())
  .addCommand(createActiveCommand())
  .addCommand(createActivateCommand())
  .addCommand(createDeactivateCommand())
  .addCommand(createDownloadCommand())
  .addCommand(createCreateCommand());

// Default action
flowsCommand.action(() => {
  flowsCommand.help();
});

/**
 * nexus flow list
 */
function createListCommand(): Command {
  return new Command("list")
    .description("List available flows")
    .option("-s, --starter", "Show only starter pack flows")
    .option("-m, --my", "Show only flows you created")
    .option("-c, --category <category>", "Filter by category")
    .option("--search <query>", "Search flows")
    .action(async (options: ListOptions) => {
      const jsonOutput = isJsonOutput(options);

      if (!isAuthenticated()) {
        if (jsonOutput) {
          outputJson({ error: "Not authenticated" });
        } else {
          logger.error("Please run 'nexus auth login' first");
        }
        return;
      }

      try {
        const client = getClient();
        const result = await client.listFlows({
          starter: options.starter,
          my: options.my,
          category: options.category,
          search: options.search,
        });

        if (jsonOutput) {
          outputJson(result);
        } else {
          logger.log(chalk.bold("\nAvailable Flows\n"));

          if (result.flows.length === 0) {
            logger.info("No flows found");
            return;
          }

          // Group by starter vs custom
          const starterFlows = result.flows.filter((f) => f.isStarterPack);
          const customFlows = result.flows.filter((f) => !f.isStarterPack);

          if (starterFlows.length > 0 && !options.my) {
            logger.log(chalk.bold.cyan("  Starter Packs"));
            for (const flow of starterFlows) {
              const status = getFlowStatus(flow);
              logger.log(`    ${status} ${chalk.cyan(flow.name)} ${chalk.gray(`(${flow.id})`)}`);
              if (flow.description) {
                logger.log(`      ${chalk.gray(flow.description)}`);
              }
            }
            logger.newline();
          }

          if (customFlows.length > 0) {
            logger.log(chalk.bold.green("  Your Flows"));
            for (const flow of customFlows) {
              const status = getFlowStatus(flow);
              logger.log(`    ${status} ${chalk.green(flow.name)} ${chalk.gray(`(${flow.id})`)}`);
              if (flow.description) {
                logger.log(`      ${chalk.gray(flow.description)}`);
              }
            }
            logger.newline();
          }

          logger.log(chalk.gray(`  Total: ${result.total} flows`));
          logger.newline();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        if (jsonOutput) {
          outputJson({ error: message });
        } else {
          logger.error(`Failed to list flows: ${message}`);
        }
      }
    });
}

function getFlowStatus(flow: Flow): string {
  if (flow.isActive) return chalk.green("●");
  if (flow.isInstalled) return chalk.yellow("○");
  return chalk.gray("○");
}

/**
 * nexus flow get <id>
 */
function createGetCommand(): Command {
  return new Command("get")
    .description("Get detailed information about a flow")
    .argument("<id>", "Flow ID")
    .action(async (id: string, options: GetOptions) => {
      const jsonOutput = isJsonOutput(options);

      if (!isAuthenticated()) {
        if (jsonOutput) {
          outputJson({ error: "Not authenticated" });
        } else {
          logger.error("Please run 'nexus auth login' first");
        }
        return;
      }

      try {
        const client = getClient();
        const result = await client.getFlow(id);
        const flow = result.flow;

        if (jsonOutput) {
          outputJson(result);
        } else {
          logger.log(chalk.bold(`\n${flow.name}\n`));

          if (flow.description) {
            logger.log(chalk.gray(flow.description));
            logger.newline();
          }

          logger.log(chalk.bold("Status:"));
          logger.log(`  Active: ${flow.isActive ? chalk.green("Yes") : chalk.gray("No")}`);
          logger.log(`  Installed: ${flow.isInstalled ? chalk.green("Yes") : chalk.gray("No")}`);
          logger.log(`  Category: ${chalk.cyan(flow.category)}`);
          logger.newline();

          if (flow.libraries.length > 0) {
            logger.log(chalk.bold("Libraries:"));
            logger.log(`  ${flow.libraries.join(", ")}`);
            logger.newline();
          }

          if (flow.skills.length > 0) {
            logger.log(chalk.bold("Skills:"));
            logger.log(`  ${flow.skills.join(", ")}`);
            logger.newline();
          }

          logger.log(chalk.bold("System Prompt:"));
          logger.log(chalk.gray("─".repeat(60)));
          logger.log(flow.systemPrompt);
          logger.log(chalk.gray("─".repeat(60)));
          logger.newline();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        if (jsonOutput) {
          outputJson({ error: message });
        } else {
          logger.error(`Failed to get flow: ${message}`);
        }
      }
    });
}

/**
 * nexus flow active
 */
function createActiveCommand(): Command {
  return new Command("active")
    .description("Show currently active flows")
    .action(async (options: GetOptions) => {
      const jsonOutput = isJsonOutput(options);

      if (!isAuthenticated()) {
        if (jsonOutput) {
          outputJson({ error: "Not authenticated" });
        } else {
          logger.error("Please run 'nexus auth login' first");
        }
        return;
      }

      try {
        const client = getClient();
        const result = await client.getActiveFlows();

        if (jsonOutput) {
          outputJson(result);
        } else {
          if (result.flows.length === 0) {
            logger.info("No active flows");
            logger.log(chalk.gray("  Use 'nexus flow activate <id>' to activate a flow"));
            return;
          }

          logger.log(chalk.bold("\nActive Flows\n"));

          for (const flow of result.flows) {
            logger.log(
              `  ${chalk.green("●")} ${chalk.bold(flow.name)} ${chalk.gray(`(${flow.id})`)}`
            );
            if (flow.description) {
              logger.log(`    ${chalk.gray(flow.description)}`);
            }
          }
          logger.newline();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        if (jsonOutput) {
          outputJson({ error: message });
        } else {
          logger.error(`Failed to get active flows: ${message}`);
        }
      }
    });
}

/**
 * nexus flow activate <id>
 */
function createActivateCommand(): Command {
  return new Command("activate")
    .description("Activate a flow")
    .argument("<id>", "Flow ID to activate")
    .option("-p, --project <name>", "Project name to associate")
    .action(async (id: string, options: ActivateOptions) => {
      const jsonOutput = isJsonOutput(options);

      if (!isAuthenticated()) {
        if (jsonOutput) {
          outputJson({ error: "Not authenticated" });
        } else {
          logger.error("Please run 'nexus auth login' first");
        }
        return;
      }

      try {
        const client = getClient();

        // Install first if needed
        try {
          await client.installFlow(id);
        } catch {
          // Ignore if already installed
        }

        const result = await client.activateFlow(id, { project: options.project });

        if (jsonOutput) {
          outputJson(result);
        } else {
          logger.success(`Flow "${result.flow.name}" activated!`);
          logger.log(chalk.gray(`  Session ID: ${result.sessionId}`));
          if (options.project) {
            logger.log(chalk.gray(`  Project: ${options.project}`));
          }
          logger.newline();
          logger.log(chalk.bold("System Prompt:"));
          logger.log(chalk.gray("─".repeat(60)));
          logger.log(
            result.flow.systemPrompt.slice(0, 500) +
              (result.flow.systemPrompt.length > 500 ? "..." : "")
          );
          logger.log(chalk.gray("─".repeat(60)));
          logger.newline();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        if (jsonOutput) {
          outputJson({ error: message });
        } else {
          logger.error(`Failed to activate flow: ${message}`);
        }
      }
    });
}

/**
 * nexus flow deactivate [id]
 */
function createDeactivateCommand(): Command {
  return new Command("deactivate")
    .description("Deactivate a flow (or all flows)")
    .argument("[id]", "Flow ID to deactivate (omit to deactivate all)")
    .option("-a, --all", "Deactivate all active flows")
    .action(async (id: string | undefined, options: DeactivateOptions) => {
      const jsonOutput = isJsonOutput(options);

      if (!isAuthenticated()) {
        if (jsonOutput) {
          outputJson({ error: "Not authenticated" });
        } else {
          logger.error("Please run 'nexus auth login' first");
        }
        return;
      }

      try {
        const client = getClient();

        if (id && !options.all) {
          await client.deactivateFlow(id);
          if (jsonOutput) {
            outputJson({ success: true, deactivated: id });
          } else {
            logger.success(`Flow ${id} deactivated`);
          }
        } else {
          await client.deactivateAllFlows();
          if (jsonOutput) {
            outputJson({ success: true, deactivated: "all" });
          } else {
            logger.success("All flows deactivated");
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        if (jsonOutput) {
          outputJson({ error: message });
        } else {
          logger.error(`Failed to deactivate flow: ${message}`);
        }
      }
    });
}

/**
 * nexus flow download <id>
 */
function createDownloadCommand(): Command {
  return new Command("download")
    .description("Download a flow as FLOW.md")
    .argument("<id>", "Flow ID to download")
    .option("-o, --output <path>", "Output path (default: ./FLOW.md)")
    .action(async (id: string, options: DownloadOptions) => {
      const jsonOutput = isJsonOutput(options);

      if (!isAuthenticated()) {
        if (jsonOutput) {
          outputJson({ error: "Not authenticated" });
        } else {
          logger.error("Please run 'nexus auth login' first");
        }
        return;
      }

      try {
        const client = getClient();
        const result = await client.downloadFlow(id);

        const outputPath = options.output || "./FLOW.md";
        const absolutePath = path.resolve(outputPath);

        fs.writeFileSync(absolutePath, result.content, "utf-8");

        if (jsonOutput) {
          outputJson({ success: true, path: absolutePath });
        } else {
          logger.success(`Flow downloaded to ${chalk.cyan(absolutePath)}`);
          logger.newline();
          logger.log(chalk.gray("Add this to your CLAUDE.md or project instructions:"));
          logger.log(chalk.cyan("  Read FLOW.md first and follow its instructions."));
          logger.newline();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        if (jsonOutput) {
          outputJson({ error: message });
        } else {
          logger.error(`Failed to download flow: ${message}`);
        }
      }
    });
}

/**
 * nexus flow create
 */
function createCreateCommand(): Command {
  return new Command("create")
    .description("Create a new flow")
    .option("-n, --name <name>", "Flow name")
    .option("-d, --description <description>", "Flow description")
    .option("-p, --prompt <prompt>", "System prompt")
    .option("-c, --category <category>", "Category")
    .option("--parent <id>", "Parent flow ID to extend")
    .action(async (options: any) => {
      const jsonOutput = isJsonOutput(options);

      if (!isAuthenticated()) {
        if (jsonOutput) {
          outputJson({ error: "Not authenticated" });
        } else {
          logger.error("Please run 'nexus auth login' first");
        }
        return;
      }

      // For now, just show instructions
      // Full interactive creation would be better but requires more setup
      if (!options.name || !options.prompt) {
        if (jsonOutput) {
          outputJson({ error: "Missing required options: --name and --prompt" });
        } else {
          logger.log(chalk.bold("\nCreate a Flow\n"));
          logger.log("Required options:");
          logger.log("  --name <name>       Flow name");
          logger.log("  --prompt <prompt>   System prompt instructions");
          logger.newline();
          logger.log("Optional:");
          logger.log("  --description <desc>  Description");
          logger.log("  --category <cat>      Category (frontend, backend, etc.)");
          logger.log("  --parent <id>         Parent flow to extend");
          logger.newline();
          logger.log(chalk.gray("Example:"));
          logger.log(
            chalk.cyan(`  nexus flow create --name "My Flow" --prompt "You are an expert..."`)
          );
          logger.newline();
          logger.log(
            chalk.gray(
              "Tip: For complex flows, use the dashboard at nexus.yogan.dev/dashboard/flows"
            )
          );
          logger.newline();
        }
        return;
      }

      try {
        const client = getClient();
        const result = await client.createFlow({
          name: options.name,
          description: options.description,
          systemPrompt: options.prompt,
          category: options.category,
          parentFlowId: options.parent,
        });

        if (jsonOutput) {
          outputJson(result);
        } else {
          logger.success(`Flow "${options.name}" created!`);
          logger.log(chalk.gray(`  ID: ${result.flowId}`));
          logger.log(chalk.gray(`  Slug: ${result.slug}`));
          logger.newline();
          logger.log(`Activate it with: ${chalk.cyan(`nexus flow activate ${result.flowId}`)}`);
          logger.newline();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        if (jsonOutput) {
          outputJson({ error: message });
        } else {
          logger.error(`Failed to create flow: ${message}`);
        }
      }
    });
}
