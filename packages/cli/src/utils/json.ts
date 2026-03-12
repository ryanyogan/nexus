/**
 * JSON output utilities for CLI
 *
 * Provides consistent JSON output formatting for --json flag
 */

export interface JsonOutput<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Output data as JSON
 */
export function outputJson<T>(data: T): void {
  const output: JsonOutput<T> = {
    success: true,
    data,
  };
  console.log(JSON.stringify(output, null, 2));
}

/**
 * Output error as JSON
 */
export function outputJsonError(code: string, message: string): void {
  const output: JsonOutput = {
    success: false,
    error: { code, message },
  };
  console.log(JSON.stringify(output, null, 2));
}

/**
 * Check if JSON output is enabled
 */
export function isJsonOutput(options: { json?: boolean }): boolean {
  return options.json === true;
}
