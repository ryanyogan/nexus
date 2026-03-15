import { Command } from "commander";
import chalk from "chalk";
import { logger } from "../../utils/logger.js";
import { outputJson, isJsonOutput } from "../../utils/json.js";
import { getClient } from "../../services/api.js";
import { isAuthenticated } from "../../services/config.js";

interface ListOptions {
  json?: boolean;
}

interface SyncOptions {
  json?: boolean;
}

interface StructureOptions {
  json?: boolean;
}

interface FileOptions {
  json?: boolean;
}

// Type definitions
interface ConnectedRepo {
  id: string;
  fullName: string;
  owner: string;
  name: string;
  description: string | null;
  htmlUrl: string;
  isPrivate: boolean;
  indexStatus: string;
  totalFiles: number;
  totalBytes: number;
  lastIndexedAt: string | null;
}

interface RepoFile {
  id: string;
  path: string;
  fileType: string;
  language: string | null;
  sizeBytes: number;
  summary: string | null;
  content?: string;
}

interface RepoTierLimits {
  maxRepos: number;
  maxBytesPerRepo: number;
  privateRepos: boolean;
  currentRepoCount: number;
}

interface RepoTreeNode {
  name: string;
  type: string;
  children?: RepoTreeNode[];
}

/**
 * Repos command group - GitHub Repository Integration
 */
export const reposCommand = new Command("repos")
  .description("Manage connected GitHub repositories")
  .addCommand(createListCommand())
  .addCommand(createSyncCommand())
  .addCommand(createStructureCommand())
  .addCommand(createFileCommand())
  .addCommand(createDisconnectCommand());

// Default action
reposCommand.action(() => {
  reposCommand.help();
});

/**
 * nexus repos list
 */
function createListCommand(): Command {
  return new Command("list")
    .description("List connected repositories")
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
        const result = await client.listConnectedRepos() as {
          repos: ConnectedRepo[];
          tier: string;
          limits: RepoTierLimits;
        };

        if (jsonOutput) {
          outputJson(result);
        } else {
          logger.log(chalk.bold("\nConnected Repositories\n"));

          // Show tier info
          const tierColor = result.tier === "team" ? chalk.magenta : result.tier === "pro" ? chalk.cyan : chalk.gray;
          logger.log(`  ${chalk.bold("Tier:")} ${tierColor(result.tier.toUpperCase())}`);
          logger.log(`  ${chalk.bold("Usage:")} ${result.limits.currentRepoCount}/${result.limits.maxRepos} repos`);
          logger.newline();

          if (result.repos.length === 0) {
            logger.info("No repositories connected");
            logger.log(chalk.gray("  Connect repos at https://nexus.yogan.dev/dashboard/repos"));
            logger.newline();
            return;
          }

          for (const repo of result.repos) {
            const statusIcon = getStatusIcon(repo.indexStatus);
            const privateTag = repo.isPrivate ? chalk.yellow(" [private]") : "";
            
            logger.log(`  ${statusIcon} ${chalk.bold(repo.fullName)}${privateTag}`);
            logger.log(`     ${chalk.gray(`ID: ${repo.id}`)}`);
            logger.log(`     ${chalk.gray(`${repo.totalFiles} files, ${formatBytes(repo.totalBytes)}`)}`);
            if (repo.description) {
              logger.log(`     ${chalk.gray(repo.description)}`);
            }
            logger.newline();
          }

          logger.log(chalk.gray("  Sync a repo: nexus repos sync <id>"));
          logger.log(chalk.gray("  View structure: nexus repos structure <id>"));
          logger.newline();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        if (jsonOutput) {
          outputJson({ error: message });
        } else {
          logger.error(`Failed to list repos: ${message}`);
        }
      }
    });
}

function getStatusIcon(status: string): string {
  switch (status) {
    case "indexed":
      return chalk.green("●");
    case "indexing":
      return chalk.yellow("◐");
    case "pending":
      return chalk.gray("○");
    case "failed":
      return chalk.red("●");
    default:
      return chalk.gray("○");
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * nexus repos sync <id>
 */
function createSyncCommand(): Command {
  return new Command("sync")
    .description("Trigger repository sync/indexing")
    .argument("<id>", "Repository ID")
    .action(async (id: string, options: SyncOptions) => {
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
        const result = await client.syncRepo(id);

        if (jsonOutput) {
          outputJson(result);
        } else {
          logger.success("Sync started!");
          logger.log(chalk.gray(`  ${result.message}`));
          logger.newline();
          logger.log(chalk.gray("  Check status with: nexus repos list"));
          logger.newline();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        if (jsonOutput) {
          outputJson({ error: message });
        } else {
          logger.error(`Failed to sync repo: ${message}`);
        }
      }
    });
}

/**
 * nexus repos structure <id>
 */
function createStructureCommand(): Command {
  return new Command("structure")
    .description("View repository directory structure")
    .argument("<id>", "Repository ID")
    .action(async (id: string, options: StructureOptions) => {
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
        const result = await client.getRepoStructure(id) as { structure: RepoTreeNode };

        if (jsonOutput) {
          outputJson(result);
        } else {
          logger.log(chalk.bold("\nRepository Structure\n"));
          printTree(result.structure, "  ");
          logger.newline();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        if (jsonOutput) {
          outputJson({ error: message });
        } else {
          logger.error(`Failed to get structure: ${message}`);
        }
      }
    });
}

function printTree(node: RepoTreeNode, indent: string = ""): void {
  const icon = node.type === "directory" ? chalk.blue("📁") : chalk.gray("📄");
  logger.log(`${indent}${icon} ${node.name}`);
  
  if (node.children) {
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      const isLast = i === node.children.length - 1;
      const newIndent = indent + (isLast ? "  " : "│ ");
      printTree(child, newIndent);
    }
  }
}

/**
 * nexus repos file <id> <path>
 */
function createFileCommand(): Command {
  return new Command("file")
    .description("View a file from a connected repository")
    .argument("<id>", "Repository ID")
    .argument("<path>", "File path within the repository")
    .action(async (id: string, filePath: string, options: FileOptions) => {
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
        const result = await client.getRepoFile(id, filePath) as { file: RepoFile & { content: string } };

        if (jsonOutput) {
          outputJson(result);
        } else {
          const file = result.file;
          
          logger.log(chalk.bold(`\n${file.path}\n`));
          logger.log(chalk.gray(`Type: ${file.fileType} | Language: ${file.language || "unknown"} | Size: ${formatBytes(file.sizeBytes)}`));
          
          if (file.summary) {
            logger.log(chalk.gray(`Summary: ${file.summary}`));
          }
          
          logger.newline();
          logger.log(chalk.gray("─".repeat(60)));
          logger.log(file.content);
          logger.log(chalk.gray("─".repeat(60)));
          logger.newline();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        if (jsonOutput) {
          outputJson({ error: message });
        } else {
          logger.error(`Failed to get file: ${message}`);
        }
      }
    });
}

/**
 * nexus repos disconnect <id>
 */
function createDisconnectCommand(): Command {
  return new Command("disconnect")
    .description("Disconnect a repository")
    .argument("<id>", "Repository ID")
    .action(async (id: string, options: { json?: boolean }) => {
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
        await client.disconnectRepo(id);

        if (jsonOutput) {
          outputJson({ success: true, disconnected: id });
        } else {
          logger.success(`Repository ${id} disconnected`);
          logger.log(chalk.gray("  All indexed files have been removed"));
          logger.newline();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        if (jsonOutput) {
          outputJson({ error: message });
        } else {
          logger.error(`Failed to disconnect repo: ${message}`);
        }
      }
    });
}
