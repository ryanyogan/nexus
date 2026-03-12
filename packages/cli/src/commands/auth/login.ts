import { Command } from "commander";
import open from "open";
import chalk from "chalk";
import { logger } from "../../utils/logger.js";
import { outputJson, outputJsonError, isJsonOutput } from "../../utils/json.js";
import {
  setAuth,
  getApiUrl,
  isAuthenticated,
  getAuth,
  type AuthConfig,
} from "../../services/config.js";

interface LoginOptions {
  token?: boolean;
  json?: boolean;
}

/**
 * Login command
 *
 * nexus auth login           - Open browser for OAuth
 * nexus auth login --token   - Manually enter API token
 */
export const loginCommand = new Command("login")
  .description("Authenticate with Nexus")
  .option("-t, --token", "Enter API token manually instead of browser auth")
  .action(async (options: LoginOptions) => {
    const jsonOutput = isJsonOutput(options);

    // Check if already authenticated
    if (isAuthenticated()) {
      const auth = getAuth()!;
      if (jsonOutput) {
        outputJson({
          status: "already_authenticated",
          email: auth.email,
        });
      } else {
        logger.info(`Already authenticated as ${chalk.cyan(auth.email)}`);
        logger.info('Use "nexus auth logout" to sign out first');
      }
      return;
    }

    if (options.token) {
      await loginWithToken(jsonOutput);
    } else {
      await loginWithBrowser(jsonOutput);
    }
  });

/**
 * Login with manual token entry
 */
async function loginWithToken(jsonOutput: boolean): Promise<void> {
  const readline = await import("node:readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    if (!jsonOutput) {
      logger.info("Enter your Nexus API token:");
      logger.info(
        `Get one from ${chalk.cyan("https://nexus.yogan.dev/dashboard/settings")}`
      );
      logger.newline();
    }

    rl.question("Token: ", async (token) => {
      rl.close();

      if (!token || !token.startsWith("nxs_")) {
        if (jsonOutput) {
          outputJsonError("INVALID_TOKEN", "Invalid token format");
        } else {
          logger.error('Invalid token format. Tokens start with "nxs_"');
        }
        resolve();
        return;
      }

      // Validate token with API
      try {
        const apiUrl = getApiUrl();
        const response = await fetch(`${apiUrl}/api/cli/auth/verify`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (jsonOutput) {
            outputJsonError("INVALID_TOKEN", "Token validation failed");
          } else {
            logger.error("Token validation failed. Please check your token.");
          }
          resolve();
          return;
        }

        const data = (await response.json()) as {
          valid: boolean;
          tokenPrefix?: string;
        };

        if (!data.valid) {
          if (jsonOutput) {
            outputJsonError("INVALID_TOKEN", "Token is invalid or revoked");
          } else {
            logger.error("Token is invalid or has been revoked.");
          }
          resolve();
          return;
        }

        // Save auth config
        const authConfig: AuthConfig = {
          token,
          tokenPrefix: data.tokenPrefix || token.slice(0, 12),
          email: "user@nexus.dev", // Will be filled by browser auth
        };

        setAuth(authConfig);

        if (jsonOutput) {
          outputJson({
            status: "authenticated",
            tokenPrefix: authConfig.tokenPrefix,
          });
        } else {
          logger.success("Authenticated successfully!");
        }
      } catch (error) {
        if (jsonOutput) {
          outputJsonError(
            "CONNECTION_ERROR",
            error instanceof Error ? error.message : "Unknown error"
          );
        } else {
          logger.error("Failed to connect to Nexus API");
          logger.error(error instanceof Error ? error.message : "Unknown error");
        }
      }

      resolve();
    });
  });
}

/**
 * Login with browser-based OAuth flow
 *
 * Flow:
 * 1. Start auth session (get code)
 * 2. Open browser to auth URL
 * 3. Poll for completion
 * 4. Save token
 */
async function loginWithBrowser(jsonOutput: boolean): Promise<void> {
  const apiUrl = getApiUrl();

  try {
    // Step 1: Start auth session
    if (!jsonOutput) {
      logger.info("Starting authentication...");
    }

    const startResponse = await fetch(`${apiUrl}/api/cli/auth/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!startResponse.ok) {
      if (jsonOutput) {
        outputJsonError("START_FAILED", "Failed to start auth session");
      } else {
        logger.error("Failed to start authentication session");
      }
      return;
    }

    const { code, authUrl, pollInterval } = (await startResponse.json()) as {
      code: string;
      authUrl: string;
      expiresIn: number;
      pollInterval: number;
    };

    // Step 2: Open browser
    if (!jsonOutput) {
      logger.newline();
      logger.log(chalk.bold("  Authentication Code:"));
      logger.log(chalk.cyan.bold(`  ${code}`));
      logger.newline();
      logger.info("Opening browser for authentication...");
      logger.info(`If the browser doesn't open, visit:`);
      logger.log(chalk.cyan(`  ${authUrl}`));
      logger.newline();
    }

    await open(authUrl);

    // Step 3: Poll for completion
    const maxAttempts = 300; // 10 minutes with 2s interval
    let attempts = 0;

    if (!jsonOutput) {
      process.stdout.write("Waiting for authentication");
    }

    while (attempts < maxAttempts) {
      await sleep(pollInterval * 1000);
      attempts++;

      if (!jsonOutput && attempts % 5 === 0) {
        process.stdout.write(".");
      }

      try {
        const pollResponse = await fetch(
          `${apiUrl}/api/cli/auth/poll?code=${code}`
        );

        if (!pollResponse.ok) {
          const status = pollResponse.status;
          if (status === 410) {
            // Expired
            if (jsonOutput) {
              outputJsonError("EXPIRED", "Authentication code expired");
            } else {
              logger.newline();
              logger.error("Authentication code expired. Please try again.");
            }
            return;
          }
          continue;
        }

        const result = (await pollResponse.json()) as {
          status: "pending" | "completed";
          token?: string;
          tokenPrefix?: string;
          userEmail?: string;
        };

        if (result.status === "completed" && result.token) {
          // Step 4: Save token
          const authConfig: AuthConfig = {
            token: result.token,
            tokenPrefix: result.tokenPrefix || result.token.slice(0, 12),
            email: result.userEmail || "user@nexus.dev",
          };

          setAuth(authConfig);

          if (jsonOutput) {
            outputJson({
              status: "authenticated",
              email: authConfig.email,
            });
          } else {
            logger.newline();
            logger.newline();
            logger.success(
              `Authenticated as ${chalk.cyan(authConfig.email)}`
            );
          }
          return;
        }
      } catch {
        // Network error, continue polling
      }
    }

    // Timeout
    if (jsonOutput) {
      outputJsonError("TIMEOUT", "Authentication timed out");
    } else {
      logger.newline();
      logger.error("Authentication timed out. Please try again.");
    }
  } catch (error) {
    if (jsonOutput) {
      outputJsonError(
        "CONNECTION_ERROR",
        error instanceof Error ? error.message : "Unknown error"
      );
    } else {
      logger.error("Failed to connect to Nexus API");
      logger.error(error instanceof Error ? error.message : "Unknown error");
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
