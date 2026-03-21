import { Command } from "commander";
import chalk from "chalk";
import { logger } from "../../utils/logger.js";
import { outputJson, isJsonOutput } from "../../utils/json.js";
import { getClient } from "../../services/api.js";
import { isAuthenticated } from "../../services/config.js";

interface ListOptions {
  type?: string;
  scope?: string;
  project?: string;
  search?: string;
  json?: boolean;
}

interface AddOptions {
  type?: string;
  scope?: string;
  project?: string;
  library?: string;
  flow?: string;
  json?: boolean;
}

interface ScoreOptions {
  json?: boolean;
}

interface LeaderboardOptions {
  limit?: number;
  json?: boolean;
}

// Type for learning
interface Learning {
  id: string;
  type: "correction" | "pattern" | "preference" | "skill";
  trigger: string;
  response: string;
  context: string | null;
  scope: string;
  project: string | null;
  usageCount: number;
  isActive: boolean;
}

/**
 * Brain command group - Learnings & Intelligence Score
 */
export const brainCommand = new Command("brain")
  .description("Manage your Nexus Brain - learnings, intelligence score, and projects")
  .addCommand(createScoreCommand())
  .addCommand(createListCommand())
  .addCommand(createAddCommand())
  .addCommand(createRemoveCommand())
  .addCommand(createLeaderboardCommand());

// Default action
brainCommand.action(() => {
  brainCommand.help();
});

/**
 * nexus brain score
 */
function createScoreCommand(): Command {
  return new Command("score")
    .description("View your Intelligence Score and stats")
    .action(async (options: ScoreOptions) => {
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
        const { score } = await client.getIntelligenceScore();

        if (jsonOutput) {
          outputJson({ score });
        } else {
          logger.log(chalk.bold("\nNexus Intelligence Score\n"));

          // Level and XP
          const progress = Math.round((score.currentLevelXp / score.xpToNextLevel) * 20);
          const progressBar =
            chalk.cyan("█".repeat(progress)) + chalk.gray("░".repeat(20 - progress));

          logger.log(
            `  ${chalk.bold.cyan(`Level ${score.level}`)} - ${chalk.white(score.totalXp.toLocaleString())} XP`
          );
          logger.log(`  ${progressBar} ${score.currentLevelXp}/${score.xpToNextLevel}`);
          logger.newline();

          // Streak
          logger.log(
            `  ${chalk.bold("Streak:")} ${chalk.yellow(score.currentStreak)} days ${chalk.gray(`(best: ${score.longestStreak})`)}`
          );
          logger.newline();

          // Stats
          logger.log(chalk.bold("  Stats"));
          logger.log(`    Queries:       ${score.stats.totalQueries}`);
          logger.log(`    Memories:      ${score.stats.totalMemories}`);
          logger.log(`    Learnings:     ${score.stats.totalLearnings}`);
          logger.log(`    Flows Created: ${score.stats.totalFlowsCreated}`);
          logger.log(`    Repos Indexed: ${score.stats.totalReposIndexed}`);
          logger.newline();

          // Achievements
          if (score.achievements.length > 0) {
            logger.log(chalk.bold("  Achievements"));
            logger.log(`    ${score.achievements.join(", ")}`);
            logger.newline();
          }

          logger.log(chalk.gray("  View more at https://nexus.yogan.dev/dashboard/brain"));
          logger.newline();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        if (jsonOutput) {
          outputJson({ error: message });
        } else {
          logger.error(`Failed to get score: ${message}`);
        }
      }
    });
}

/**
 * nexus brain list
 */
function createListCommand(): Command {
  return new Command("list")
    .description("List your learnings")
    .option("-t, --type <type>", "Filter by type: correction, pattern, preference, skill")
    .option("-s, --scope <scope>", "Filter by scope: global, project, library, flow")
    .option("-p, --project <project>", "Filter by project")
    .option("--search <query>", "Search learnings")
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
        const result = await client.listLearnings({
          type: options.type as any,
          scope: options.scope as any,
          project: options.project,
          search: options.search,
          limit: 50,
        });

        if (jsonOutput) {
          outputJson(result);
        } else {
          logger.log(chalk.bold("\nYour Learnings\n"));

          if (result.learnings.length === 0) {
            logger.info("No learnings found");
            logger.log(chalk.gray("  Add learnings with 'nexus brain add'"));
            logger.newline();
            return;
          }

          // Group by type
          const byType: Record<string, Learning[]> = {};
          for (const l of result.learnings as Learning[]) {
            if (!byType[l.type]) byType[l.type] = [];
            byType[l.type].push(l);
          }

          const typeColors: Record<string, typeof chalk.red> = {
            correction: chalk.red,
            pattern: chalk.blue,
            preference: chalk.green,
            skill: chalk.magenta,
          };

          for (const [type, learnings] of Object.entries(byType)) {
            const color = typeColors[type] || chalk.white;
            logger.log(
              color.bold(`  ${type.charAt(0).toUpperCase() + type.slice(1)}s (${learnings.length})`)
            );

            for (const l of learnings) {
              const scopeTag =
                l.scope !== "global"
                  ? chalk.gray(` [${l.scope}${l.project ? `:${l.project}` : ""}]`)
                  : "";
              const activeIcon = l.isActive ? chalk.green("●") : chalk.gray("○");

              logger.log(`    ${activeIcon} ${chalk.white(l.trigger)}${scopeTag}`);
              logger.log(`      ${chalk.gray("→")} ${l.response}`);
              if (l.usageCount > 0) {
                logger.log(`      ${chalk.gray(`Used ${l.usageCount} times`)}`);
              }
            }
            logger.newline();
          }

          logger.log(chalk.gray(`  Total: ${result.total} learnings`));
          logger.newline();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        if (jsonOutput) {
          outputJson({ error: message });
        } else {
          logger.error(`Failed to list learnings: ${message}`);
        }
      }
    });
}

/**
 * nexus brain add
 */
function createAddCommand(): Command {
  return new Command("add")
    .description("Add a new learning")
    .argument("<trigger>", "What triggers this learning (e.g., 'When writing React components')")
    .argument("<response>", "The correct response/behavior (e.g., 'Always use TypeScript')")
    .option("-t, --type <type>", "Type: correction, pattern, preference, skill", "correction")
    .option("-s, --scope <scope>", "Scope: global, project, library, flow", "global")
    .option("-p, --project <project>", "Project name (when scope=project)")
    .option("-l, --library <library>", "Library ID (when scope=library)")
    .option("-f, --flow <flow>", "Flow ID (when scope=flow)")
    .action(async (trigger: string, response: string, options: AddOptions) => {
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
        const result = await client.createLearning({
          type: (options.type as any) || "correction",
          trigger,
          response,
          scope: (options.scope as any) || "global",
          project: options.project,
          libraryId: options.library,
          flowId: options.flow,
        });

        if (jsonOutput) {
          outputJson(result);
        } else {
          logger.success("Learning recorded!");
          logger.newline();
          logger.log(`  ${chalk.bold("Type:")} ${options.type || "correction"}`);
          logger.log(`  ${chalk.bold("Trigger:")} ${trigger}`);
          logger.log(`  ${chalk.bold("Response:")} ${response}`);
          logger.log(`  ${chalk.bold("Scope:")} ${options.scope || "global"}`);
          logger.newline();
          logger.log(chalk.cyan(`  +${result.xp.xpAwarded} XP earned!`));
          if (result.xp.leveledUp) {
            logger.log(chalk.yellow.bold(`  Level up! Now level ${result.xp.newLevel}!`));
          }
          logger.newline();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        if (jsonOutput) {
          outputJson({ error: message });
        } else {
          logger.error(`Failed to add learning: ${message}`);
        }
      }
    });
}

/**
 * nexus brain remove <id>
 */
function createRemoveCommand(): Command {
  return new Command("remove")
    .description("Remove a learning")
    .argument("<id>", "Learning ID to remove")
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
        await client.deleteLearning(id);

        if (jsonOutput) {
          outputJson({ success: true, deleted: id });
        } else {
          logger.success(`Learning ${id} removed`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        if (jsonOutput) {
          outputJson({ error: message });
        } else {
          logger.error(`Failed to remove learning: ${message}`);
        }
      }
    });
}

/**
 * nexus brain leaderboard
 */
function createLeaderboardCommand(): Command {
  return new Command("leaderboard")
    .description("View the global XP leaderboard")
    .option("-l, --limit <number>", "Number of entries to show", "10")
    .action(async (options: LeaderboardOptions) => {
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
        const result = await client.getLeaderboard({ limit: Number(options.limit) || 10 });

        if (jsonOutput) {
          outputJson(result);
        } else {
          logger.log(chalk.bold("\nGlobal Leaderboard\n"));

          if (result.leaderboard.length === 0) {
            logger.info("No entries yet");
            return;
          }

          const medals = ["🥇", "🥈", "🥉"];

          result.leaderboard.forEach(
            (
              entry: { userId: string; totalXp: number; level: number; currentStreak: number },
              i: number
            ) => {
              const rank = i < 3 ? medals[i] : chalk.gray(`${i + 1}.`);
              const streakIcon =
                entry.currentStreak > 0 ? chalk.yellow(`🔥${entry.currentStreak}`) : "";

              logger.log(
                `  ${rank} ${chalk.bold(`Level ${entry.level}`)} - ${entry.totalXp.toLocaleString()} XP ${streakIcon}`
              );
              logger.log(`     ${chalk.gray(entry.userId.slice(0, 8) + "...")}`);
            }
          );

          logger.newline();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        if (jsonOutput) {
          outputJson({ error: message });
        } else {
          logger.error(`Failed to get leaderboard: ${message}`);
        }
      }
    });
}
