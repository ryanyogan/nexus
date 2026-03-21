import { Command } from "commander";
import chalk from "chalk";
import { logger } from "../utils/logger.js";
import { outputJson, isJsonOutput } from "../utils/json.js";
import { isAuthenticated, getAuth, getApiUrl, getToken } from "../services/config.js";

interface StatsOptions {
  json?: boolean;
}

/**
 * Stats command - View usage and billing information
 *
 * nexus stats
 */
export const statsCommand = new Command("stats")
  .description("View usage, billing, and subscription information")
  .action(async (options: StatsOptions) => {
    const jsonOutput = isJsonOutput(options);

    if (!isAuthenticated()) {
      if (jsonOutput) {
        outputJson({ error: "Not authenticated" });
      } else {
        logger.error("Please run 'nexus auth login' first");
      }
      return;
    }

    const auth = getAuth()!;
    const token = getToken()!;
    const apiUrl = getApiUrl();

    try {
      // Fetch stats from API
      const response = await fetch(`${apiUrl}/api/user/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const stats = await response.json();

      if (jsonOutput) {
        outputJson(stats);
        return;
      }

      // Pretty print stats
      logger.newline();
      logger.log(chalk.bold.cyan("  ╭──────────────────────────────────────────────────────╮"));
      logger.log(
        chalk.bold.cyan("  │  ") +
          chalk.bold(`Nexus Stats for ${auth.email}`.padEnd(50)) +
          chalk.bold.cyan("│")
      );
      logger.log(chalk.bold.cyan("  ╰──────────────────────────────────────────────────────╯"));
      logger.newline();

      // Plan info
      const planColor =
        stats.plan === "pro" ? chalk.green : stats.plan === "team" ? chalk.blue : chalk.gray;
      logger.log(
        `  Plan: ${planColor(stats.plan?.toUpperCase() || "FREE")}${stats.subscription?.status ? ` (${stats.subscription.status})` : ""}`
      );

      if (stats.subscription?.currentPeriodEnd) {
        const endDate = new Date(stats.subscription.currentPeriodEnd).toLocaleDateString();
        logger.log(`  Billing Period ends: ${endDate}`);
      }
      logger.newline();

      // API Usage
      logger.log(chalk.bold("  ┌─────────────────────────────────────────────────────┐"));
      logger.log(chalk.bold("  │ API Usage                                           │"));
      logger.log(chalk.bold("  ├─────────────────────────────────────────────────────┤"));

      const usageLimit = stats.apiCalls?.limit || "unlimited";
      const usageUsed = stats.apiCalls?.used || 0;
      const usagePercent = stats.apiCalls?.percentUsed || 0;

      const progressBar = createProgressBar(usagePercent, 30);
      logger.log(
        `  │ Queries this month: ${String(usageUsed).padStart(6)} / ${String(usageLimit).padEnd(10)} │`
      );
      logger.log(`  │ ${progressBar} ${usagePercent}%`.padEnd(54) + "│");
      logger.log(chalk.bold("  └─────────────────────────────────────────────────────┘"));
      logger.newline();

      // Resources
      logger.log(chalk.bold("  ┌─────────────────────────────────────────────────────┐"));
      logger.log(chalk.bold("  │ Resources                                           │"));
      logger.log(chalk.bold("  ├─────────────────────────────────────────────────────┤"));
      logger.log(
        `  │ API Keys:          ${String(stats.apiKeys?.count || 0).padStart(3)} / ${String(stats.apiKeys?.limit || 1).padEnd(14)} │`
      );
      logger.log(
        `  │ Installed Skills:  ${String(stats.skills?.installed || 0).padStart(3)}`.padEnd(54) +
          "│"
      );
      logger.log(
        `  │ Memories:          ${String(stats.memories?.count || 0).padStart(3)} / ${String(stats.memories?.limit || "∞").padEnd(14)} │`
      );
      logger.log(
        `  │ Secrets:           ${String(stats.secrets?.count || 0).padStart(3)}`.padEnd(54) + "│"
      );
      logger.log(chalk.bold("  └─────────────────────────────────────────────────────┘"));
      logger.newline();

      // Rate limit warning
      if (stats.plan === "free" && usagePercent >= 80) {
        logger.warn(`You've used ${usagePercent}% of your free tier quota.`);
        logger.info(
          `Upgrade to Pro for unlimited queries: ${chalk.cyan("https://nexus.yogan.dev/pricing")}`
        );
        logger.newline();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      if (jsonOutput) {
        outputJson({ error: message });
      } else {
        logger.error(`Failed to fetch stats: ${message}`);
      }
    }
  });

/**
 * Create a simple ASCII progress bar
 */
function createProgressBar(percent: number, width: number): string {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;

  const filledChar =
    percent >= 90 ? chalk.red("█") : percent >= 70 ? chalk.yellow("█") : chalk.green("█");
  const emptyChar = chalk.gray("░");

  return filledChar.repeat(filled) + emptyChar.repeat(empty);
}
