import { Command } from "commander";
import chalk from "chalk";
import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { logger } from "../../utils/logger.js";
import { outputJson, isJsonOutput } from "../../utils/json.js";
import { getClient } from "../../services/api.js";
import { getDocsCacheDir, findProjectRoot } from "../../utils/paths.js";

interface SearchOptions {
  limit?: string;
  json?: boolean;
}

interface FetchOptions {
  tokens?: string;
  json?: boolean;
}

interface DownloadOptions {
  fromDeps?: boolean;
  json?: boolean;
}

interface CachedOptions {
  json?: boolean;
}

interface ClearOptions {
  json?: boolean;
}

/**
 * Docs command group
 */
export const docsCommand = new Command("docs")
  .description("Search and cache documentation")
  .addCommand(createSearchCommand())
  .addCommand(createFetchCommand())
  .addCommand(createDownloadCommand())
  .addCommand(createCachedCommand())
  .addCommand(createClearCommand());

// Default action
docsCommand.action(() => {
  docsCommand.help();
});

/**
 * nexus docs search [query]
 */
function createSearchCommand(): Command {
  return new Command("search")
    .description("Search documentation across libraries")
    .argument("<query>", "Search query")
    .option("-l, --limit <number>", "Maximum results", "10")
    .action(async (query: string, options: SearchOptions) => {
      const jsonOutput = isJsonOutput(options);
      const limit = parseInt(options.limit || "10", 10);

      try {
        const client = getClient();

        // First resolve the library if query looks like "library query"
        const parts = query.split(" ");
        let libraryId: string | undefined;
        let searchQuery = query;

        if (parts.length > 1) {
          // Try to resolve first word as library
          const libraries = await client.searchLibrary(parts[0], { limit: 1 });
          if (libraries.length > 0) {
            libraryId = libraries[0].id;
            searchQuery = parts.slice(1).join(" ");
          }
        }

        if (libraryId) {
          // Search within specific library
          const result = await client.queryDocs(libraryId, searchQuery, { limit });

          if (jsonOutput) {
            outputJson({ chunks: result.chunks, libraryId });
            return;
          }

          logger.log(chalk.bold(`\nResults for "${searchQuery}" in ${libraryId}\n`));

          if (result.chunks.length === 0) {
            logger.info("No results found");
            return;
          }

          for (const chunk of result.chunks) {
            logger.log(`  ${chalk.cyan(chunk.title || "Untitled")}`);
            if (chunk.content) {
              const preview = chunk.content.slice(0, 100).replace(/\n/g, " ");
              logger.log(`    ${chalk.gray(preview)}...`);
            }
          }
          logger.newline();
        } else {
          // General search - show library suggestions
          const libraries = await client.searchLibrary(query, { limit: 10 });

          if (jsonOutput) {
            outputJson({ libraries });
            return;
          }

          logger.log(chalk.bold(`\nLibraries matching "${query}"\n`));

          if (libraries.length === 0) {
            logger.info("No libraries found. Try a different search term.");
            return;
          }

          for (const lib of libraries) {
            logger.log(`  ${chalk.cyan(lib.name)} ${chalk.gray(`(${lib.id})`)}`);
            if (lib.description) {
              logger.log(`    ${chalk.gray(lib.description)}`);
            }
          }
          logger.newline();
          logger.info(`Use ${chalk.cyan("nexus docs search <library> <query>")} to search within a library`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        if (jsonOutput) {
          outputJson({ error: message });
        } else {
          logger.error(`Search failed: ${message}`);
        }
      }
    });
}

/**
 * nexus docs fetch [library] [query]
 */
function createFetchCommand(): Command {
  return new Command("fetch")
    .description("Fetch documentation for a specific library")
    .argument("<library>", "Library name or ID")
    .argument("<query>", "Search query")
    .option("-l, --limit <number>", "Maximum results", "5")
    .action(async (library: string, query: string, options: FetchOptions & { limit?: string }) => {
      const jsonOutput = isJsonOutput(options);
      const limit = parseInt(options.limit || "5", 10);

      try {
        const client = getClient();

        // Resolve library
        const libraries = await client.searchLibrary(library, { limit: 1 });
        if (libraries.length === 0) {
          if (jsonOutput) {
            outputJson({ error: "Library not found" });
          } else {
            logger.error(`Library "${library}" not found`);
          }
          return;
        }

        const libraryId = libraries[0].id;
        const result = await client.queryDocs(libraryId, query, { limit });

        if (jsonOutput) {
          outputJson({ chunks: result.chunks, libraryId, totalTokens: result.totalTokens });
          return;
        }

        logger.log(chalk.bold(`\nDocumentation from ${libraryId}\n`));

        if (result.chunks.length === 0) {
          logger.info("No results found");
          return;
        }

        for (const chunk of result.chunks) {
          logger.log(chalk.cyan.bold(chunk.title || "Untitled"));
          logger.log(chalk.gray("─".repeat(40)));
          if (chunk.content) {
            logger.log(chunk.content);
          }
          logger.newline();
        }

        logger.log(chalk.gray(`Total tokens: ${result.totalTokens}`));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        if (jsonOutput) {
          outputJson({ error: message });
        } else {
          logger.error(`Fetch failed: ${message}`);
        }
      }
    });
}

/**
 * nexus docs download [libraries...]
 */
function createDownloadCommand(): Command {
  return new Command("download")
    .description("Download documentation for offline use")
    .argument("[libraries...]", "Library names to download")
    .option("--from-deps", "Download docs for package.json dependencies")
    .action(async (libraries: string[], options: DownloadOptions) => {
      const jsonOutput = isJsonOutput(options);
      const projectRoot = findProjectRoot();

      if (!projectRoot) {
        if (jsonOutput) {
          outputJson({ error: "Not in a project directory" });
        } else {
          logger.error("Not in a project directory (no package.json or .git found)");
        }
        return;
      }

      let librariesToDownload = libraries;

      // If --from-deps, read package.json
      if (options.fromDeps) {
        try {
          const pkgPath = join(projectRoot, "package.json");
          if (!existsSync(pkgPath)) {
            if (jsonOutput) {
              outputJson({ error: "No package.json found" });
            } else {
              logger.error("No package.json found");
            }
            return;
          }

          const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
          const deps = Object.keys(pkg.dependencies || {});
          const devDeps = Object.keys(pkg.devDependencies || {});
          librariesToDownload = [...deps, ...devDeps];

          if (!jsonOutput) {
            logger.info(`Found ${librariesToDownload.length} dependencies to check`);
          }
        } catch (error) {
          if (jsonOutput) {
            outputJson({ error: "Failed to read package.json" });
          } else {
            logger.error("Failed to read package.json");
          }
          return;
        }
      }

      if (librariesToDownload.length === 0) {
        if (jsonOutput) {
          outputJson({ error: "No libraries specified" });
        } else {
          logger.error("No libraries specified");
          logger.info("Usage: nexus docs download <library1> <library2> ...");
          logger.info("   or: nexus docs download --from-deps");
        }
        return;
      }

      const cacheDir = getDocsCacheDir(projectRoot);
      if (!existsSync(cacheDir)) {
        mkdirSync(cacheDir, { recursive: true });
      }

      const client = getClient();
      const downloaded: string[] = [];
      const failed: string[] = [];
      const notFound: string[] = [];

      for (const lib of librariesToDownload) {
        try {
          // Resolve library
          const libraries = await client.searchLibrary(lib, { limit: 1 });
          if (libraries.length === 0) {
            notFound.push(lib);
            if (!jsonOutput) {
              logger.log(`  ${chalk.yellow("○")} ${lib} - not indexed`);
            }
            continue;
          }

          const libraryId = libraries[0].id;
          const libraryInfo = await client.getLibrary(libraryId);

          // Cache the library info
          const cachePath = join(cacheDir, `${libraryId.replace(/\//g, "_")}.json`);
          writeFileSync(
            cachePath,
            JSON.stringify(
              {
                id: libraryId,
                name: libraries[0].name,
                description: libraries[0].description,
                cachedAt: new Date().toISOString(),
                info: libraryInfo,
              },
              null,
              2
            )
          );

          downloaded.push(libraryId);
          if (!jsonOutput) {
            logger.log(`  ${chalk.green("✓")} ${lib} -> ${libraryId}`);
          }
        } catch (error) {
          failed.push(lib);
          if (!jsonOutput) {
            logger.log(`  ${chalk.red("✗")} ${lib} - failed`);
          }
        }
      }

      if (jsonOutput) {
        outputJson({ downloaded, failed, notFound });
      } else {
        logger.newline();
        logger.success(`Downloaded ${downloaded.length} libraries to .nexus/cache/docs/`);
        if (notFound.length > 0) {
          logger.warn(`${notFound.length} libraries not indexed`);
        }
        if (failed.length > 0) {
          logger.error(`${failed.length} downloads failed`);
        }
      }
    });
}

/**
 * nexus docs cached
 */
function createCachedCommand(): Command {
  return new Command("cached")
    .description("List cached documentation in this project")
    .action(async (options: CachedOptions) => {
      const jsonOutput = isJsonOutput(options);
      const projectRoot = findProjectRoot();

      if (!projectRoot) {
        if (jsonOutput) {
          outputJson({ error: "Not in a project directory" });
        } else {
          logger.error("Not in a project directory");
        }
        return;
      }

      const cacheDir = getDocsCacheDir(projectRoot);
      if (!existsSync(cacheDir)) {
        if (jsonOutput) {
          outputJson({ cached: [] });
        } else {
          logger.info("No cached documentation in this project");
        }
        return;
      }

      const files = readdirSync(cacheDir).filter((f) => f.endsWith(".json"));
      const cached: Array<{ id: string; name: string; cachedAt: string }> = [];

      for (const file of files) {
        try {
          const content = JSON.parse(readFileSync(join(cacheDir, file), "utf-8"));
          cached.push({
            id: content.id,
            name: content.name || content.id,
            cachedAt: content.cachedAt,
          });
        } catch {
          // Skip invalid files
        }
      }

      if (jsonOutput) {
        outputJson({ cached });
        return;
      }

      logger.log(chalk.bold("\nCached Documentation\n"));

      if (cached.length === 0) {
        logger.info("No documentation cached");
        return;
      }

      for (const lib of cached) {
        const date = new Date(lib.cachedAt).toLocaleDateString();
        logger.log(`  ${chalk.cyan(lib.name)} ${chalk.gray(`(cached ${date})`)}`);
      }
      logger.newline();
    });
}

/**
 * nexus docs cache clear
 */
function createClearCommand(): Command {
  return new Command("clear")
    .alias("cache-clear")
    .description("Clear cached documentation")
    .action(async (options: ClearOptions) => {
      const jsonOutput = isJsonOutput(options);
      const projectRoot = findProjectRoot();

      if (!projectRoot) {
        if (jsonOutput) {
          outputJson({ error: "Not in a project directory" });
        } else {
          logger.error("Not in a project directory");
        }
        return;
      }

      const cacheDir = getDocsCacheDir(projectRoot);
      if (!existsSync(cacheDir)) {
        if (jsonOutput) {
          outputJson({ cleared: 0 });
        } else {
          logger.info("No cache to clear");
        }
        return;
      }

      const files = readdirSync(cacheDir).filter((f) => f.endsWith(".json"));
      let cleared = 0;

      for (const file of files) {
        try {
          const { unlinkSync } = await import("node:fs");
          unlinkSync(join(cacheDir, file));
          cleared++;
        } catch {
          // Ignore errors
        }
      }

      if (jsonOutput) {
        outputJson({ cleared });
      } else {
        logger.success(`Cleared ${cleared} cached libraries`);
      }
    });
}
