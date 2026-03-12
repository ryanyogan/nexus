import chalk from "chalk";

export type LogLevel = "debug" | "info" | "warn" | "error";

let verboseMode = false;

export function setVerbose(verbose: boolean): void {
  verboseMode = verbose;
}

export function isVerbose(): boolean {
  return verboseMode;
}

export const logger = {
  debug: (message: string, ...args: unknown[]): void => {
    if (verboseMode) {
      console.log(chalk.gray(`[debug] ${message}`), ...args);
    }
  },

  info: (message: string, ...args: unknown[]): void => {
    console.log(chalk.blue("i"), message, ...args);
  },

  success: (message: string, ...args: unknown[]): void => {
    console.log(chalk.green("✓"), message, ...args);
  },

  warn: (message: string, ...args: unknown[]): void => {
    console.log(chalk.yellow("⚠"), message, ...args);
  },

  error: (message: string, ...args: unknown[]): void => {
    console.error(chalk.red("✗"), message, ...args);
  },

  // Raw output without prefixes
  log: (message: string, ...args: unknown[]): void => {
    console.log(message, ...args);
  },

  // Blank line
  newline: (): void => {
    console.log();
  },
};
