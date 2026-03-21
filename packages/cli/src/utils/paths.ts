import { homedir } from "node:os";
import { join } from "node:path";
import { existsSync } from "node:fs";

/**
 * Get the global Nexus config directory
 * ~/.nexus/
 */
export function getGlobalConfigDir(): string {
  return join(homedir(), ".nexus");
}

/**
 * Get the global config file path
 * ~/.nexus/config.json
 */
export function getGlobalConfigPath(): string {
  return join(getGlobalConfigDir(), "config.json");
}

/**
 * Get the project-local Nexus directory
 * .nexus/
 */
export function getProjectConfigDir(projectRoot?: string): string {
  const root = projectRoot || process.cwd();
  return join(root, ".nexus");
}

/**
 * Get the project-local config file path
 * .nexus/config.json
 */
export function getProjectConfigPath(projectRoot?: string): string {
  return join(getProjectConfigDir(projectRoot), "config.json");
}

/**
 * Get the project-local cache directory
 * .nexus/cache/
 */
export function getProjectCacheDir(projectRoot?: string): string {
  return join(getProjectConfigDir(projectRoot), "cache");
}

/**
 * Get the docs cache directory
 * .nexus/cache/docs/
 */
export function getDocsCacheDir(projectRoot?: string): string {
  return join(getProjectCacheDir(projectRoot), "docs");
}

/**
 * Get the skills cache directory
 * .nexus/cache/skills/
 */
export function getSkillsCacheDir(projectRoot?: string): string {
  return join(getProjectCacheDir(projectRoot), "skills");
}

/**
 * Get the servers cache directory
 * .nexus/cache/servers/
 */
export function getServersCacheDir(projectRoot?: string): string {
  return join(getProjectCacheDir(projectRoot), "servers");
}

/**
 * Find the project root by looking for package.json or .git
 */
export function findProjectRoot(startDir?: string): string | null {
  let dir = startDir || process.cwd();

  while (dir !== "/") {
    if (existsSync(join(dir, "package.json")) || existsSync(join(dir, ".git"))) {
      return dir;
    }
    dir = join(dir, "..");
  }

  return null;
}

/**
 * Editor config file paths
 */
export const editorConfigPaths = {
  cursor: {
    global: join(homedir(), ".cursor", "mcp.json"),
    local: ".cursor/mcp.json",
  },
  opencode: {
    global: join(homedir(), ".config", "opencode", "opencode.json"),
    local: "opencode.json",
  },
  vscode: {
    global: join(homedir(), ".vscode", "mcp.json"),
    local: ".vscode/mcp.json",
  },
  zed: {
    global: join(homedir(), ".config", "zed", "settings.json"),
    local: ".zed/settings.json",
  },
} as const;

export type EditorId = keyof typeof editorConfigPaths | "claude-code";
