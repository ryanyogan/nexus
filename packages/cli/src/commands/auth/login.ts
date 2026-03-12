import { Command } from "commander";
import { createServer } from "node:http";
import { URL } from "node:url";
import open from "open";
import getPort from "get-port";
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
        const response = await fetch(`${apiUrl}/api/user/stats`, {
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

        // Get user info
        const userResponse = await fetch(`${apiUrl}/api/auth/get-session`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        let email = "user@nexus.dev";
        let userId = "unknown";
        let name: string | undefined;

        if (userResponse.ok) {
          const userData = await userResponse.json();
          email = userData.user?.email || email;
          userId = userData.user?.id || userId;
          name = userData.user?.name;
        }

        const authConfig: AuthConfig = {
          token,
          userId,
          email,
          name,
        };

        setAuth(authConfig);

        if (jsonOutput) {
          outputJson({
            status: "authenticated",
            email,
          });
        } else {
          logger.success(`Authenticated as ${chalk.cyan(email)}`);
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
 */
async function loginWithBrowser(jsonOutput: boolean): Promise<void> {
  const apiUrl = getApiUrl();

  // Get an available port for the callback server
  const port = await getPort({ port: [9876, 9877, 9878, 9879, 9880] });
  const callbackUrl = `http://localhost:${port}/callback`;

  // Generate a random state for security
  const state = Math.random().toString(36).substring(2, 15);

  // Start local server to receive the callback
  const server = createServer(async (req, res) => {
    const url = new URL(req.url || "/", `http://localhost:${port}`);

    if (url.pathname === "/callback") {
      const token = url.searchParams.get("token");
      const error = url.searchParams.get("error");
      const returnedState = url.searchParams.get("state");

      // Set CORS headers
      res.setHeader("Content-Type", "text/html");

      if (error) {
        res.writeHead(400);
        res.end(`
          <html>
            <body style="font-family: system-ui; padding: 40px; text-align: center;">
              <h1>Authentication Failed</h1>
              <p>${error}</p>
              <p>You can close this window.</p>
            </body>
          </html>
        `);
        server.close();

        if (jsonOutput) {
          outputJsonError("AUTH_FAILED", error);
        } else {
          logger.error(`Authentication failed: ${error}`);
        }
        return;
      }

      if (returnedState !== state) {
        res.writeHead(400);
        res.end(`
          <html>
            <body style="font-family: system-ui; padding: 40px; text-align: center;">
              <h1>Authentication Failed</h1>
              <p>Invalid state parameter. This may be a security issue.</p>
              <p>You can close this window.</p>
            </body>
          </html>
        `);
        server.close();

        if (jsonOutput) {
          outputJsonError("INVALID_STATE", "State mismatch - possible CSRF attack");
        } else {
          logger.error("Invalid state parameter. Please try again.");
        }
        return;
      }

      if (token) {
        // Validate and get user info
        try {
          const userResponse = await fetch(`${apiUrl}/api/auth/get-session`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          let email = "user@nexus.dev";
          let userId = "unknown";
          let name: string | undefined;

          if (userResponse.ok) {
            const userData = await userResponse.json();
            email = userData.user?.email || email;
            userId = userData.user?.id || userId;
            name = userData.user?.name;
          }

          const authConfig: AuthConfig = {
            token,
            userId,
            email,
            name,
          };

          setAuth(authConfig);

          res.writeHead(200);
          res.end(`
            <html>
              <body style="font-family: system-ui; padding: 40px; text-align: center;">
                <h1 style="color: #10b981;">Authentication Successful!</h1>
                <p>You are now logged in as <strong>${email}</strong></p>
                <p>You can close this window and return to your terminal.</p>
              </body>
            </html>
          `);

          server.close();

          if (jsonOutput) {
            outputJson({
              status: "authenticated",
              email,
            });
          } else {
            logger.newline();
            logger.success(`Authenticated as ${chalk.cyan(email)}`);
          }
        } catch {
          res.writeHead(500);
          res.end(`
            <html>
              <body style="font-family: system-ui; padding: 40px; text-align: center;">
                <h1>Authentication Failed</h1>
                <p>Failed to validate token.</p>
                <p>You can close this window.</p>
              </body>
            </html>
          `);
          server.close();

          if (jsonOutput) {
            outputJsonError("VALIDATION_FAILED", "Failed to validate token");
          } else {
            logger.error("Failed to validate token");
          }
        }
      }
    }
  });

  server.listen(port, () => {
    // Build the auth URL
    const authUrl = new URL(`${apiUrl}/auth/cli`);
    authUrl.searchParams.set("callback", callbackUrl);
    authUrl.searchParams.set("state", state);

    if (!jsonOutput) {
      logger.info("Opening browser for authentication...");
      logger.info(`If the browser doesn't open, visit:`);
      logger.log(chalk.cyan(authUrl.toString()));
      logger.newline();
    }

    // Open the browser
    open(authUrl.toString());
  });

  // Timeout after 5 minutes
  setTimeout(() => {
    server.close();
    if (!jsonOutput) {
      logger.error("Authentication timed out. Please try again.");
    }
  }, 5 * 60 * 1000);
}
