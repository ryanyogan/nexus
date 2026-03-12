/**
 * Nexus CLI
 *
 * The official CLI for Nexus - Documentation search, skills,
 * MCP servers, and more for AI assistants.
 *
 * Commands:
 *   nexus init              Interactive setup wizard
 *   nexus auth              Authentication management
 *   nexus skills            Skill management
 *   nexus servers           MCP server management
 *   nexus docs              Documentation search and caching
 *   nexus stats             View usage and billing
 *   nexus serve             Run as MCP server
 */

import { program } from "./cli.js";

// Run the CLI
program.parseAsync(process.argv).catch((error) => {
  console.error("Fatal error:", error.message);
  process.exit(1);
});
