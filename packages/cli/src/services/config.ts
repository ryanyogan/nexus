import Conf from "conf";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import {
  getGlobalConfigPath,
  getProjectConfigPath,
  getGlobalConfigDir,
  getProjectConfigDir,
  findProjectRoot,
  type EditorId,
} from "../utils/paths.js";

/**
 * Authentication data stored in config
 */
export interface AuthConfig {
  token: string;
  tokenPrefix?: string;
  userId?: string;
  email: string;
  name?: string;
  expiresAt?: string;
}

/**
 * User preferences
 */
export interface PreferencesConfig {
  defaultResponseFormat?: "full" | "compact" | "code-only" | "summary";
  warnOnRateLimit?: boolean;
}

/**
 * Global config schema
 */
export interface GlobalConfig {
  auth?: AuthConfig;
  editors?: EditorId[];
  preferences?: PreferencesConfig;
  apiUrl?: string;
}

/**
 * Project-local config schema
 */
export interface ProjectConfig {
  editors?: EditorId[];
  cachedLibraries?: string[];
}

/**
 * Default API URL
 */
export const DEFAULT_API_URL = "https://api.nexus.yogan.dev";

/**
 * Global config store using Conf
 */
const globalStore = new Conf<GlobalConfig>({
  projectName: "nexus",
  cwd: getGlobalConfigDir(),
  configName: "config",
  defaults: {
    preferences: {
      warnOnRateLimit: true,
    },
  },
});

/**
 * Get the global config
 */
export function getGlobalConfig(): GlobalConfig {
  return globalStore.store;
}

/**
 * Set a value in global config
 */
export function setGlobalConfig<K extends keyof GlobalConfig>(
  key: K,
  value: GlobalConfig[K]
): void {
  globalStore.set(key, value);
}

/**
 * Get auth config
 */
export function getAuth(): AuthConfig | undefined {
  return globalStore.get("auth");
}

/**
 * Set auth config
 */
export function setAuth(auth: AuthConfig): void {
  globalStore.set("auth", auth);
}

/**
 * Clear auth config
 */
export function clearAuth(): void {
  globalStore.delete("auth");
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const auth = getAuth();
  if (!auth?.token) return false;

  // Check expiry if set
  if (auth.expiresAt) {
    const expiryDate = new Date(auth.expiresAt);
    if (expiryDate < new Date()) {
      return false;
    }
  }

  return true;
}

/**
 * Get the API token
 */
export function getToken(): string | undefined {
  return getAuth()?.token;
}

/**
 * Get configured editors
 */
export function getEditors(): EditorId[] {
  return globalStore.get("editors") || [];
}

/**
 * Set configured editors
 */
export function setEditors(editors: EditorId[]): void {
  globalStore.set("editors", editors);
}

/**
 * Get API URL
 */
export function getApiUrl(): string {
  return globalStore.get("apiUrl") || DEFAULT_API_URL;
}

/**
 * Set API URL (for development)
 */
export function setApiUrl(url: string): void {
  globalStore.set("apiUrl", url);
}

// ============================================================================
// Project-local config
// ============================================================================

/**
 * Read project config
 */
export function getProjectConfig(projectRoot?: string): ProjectConfig | null {
  const root = projectRoot || findProjectRoot();
  if (!root) return null;

  const configPath = getProjectConfigPath(root);
  if (!existsSync(configPath)) return null;

  try {
    const content = readFileSync(configPath, "utf-8");
    return JSON.parse(content) as ProjectConfig;
  } catch {
    return null;
  }
}

/**
 * Write project config
 */
export function setProjectConfig(config: ProjectConfig, projectRoot?: string): void {
  const root = projectRoot || findProjectRoot() || process.cwd();
  const configPath = getProjectConfigPath(root);
  const configDir = getProjectConfigDir(root);

  // Ensure directory exists
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }

  writeFileSync(configPath, JSON.stringify(config, null, 2));
}

/**
 * Update project config (merge with existing)
 */
export function updateProjectConfig(updates: Partial<ProjectConfig>, projectRoot?: string): void {
  const existing = getProjectConfig(projectRoot) || {};
  setProjectConfig({ ...existing, ...updates }, projectRoot);
}

/**
 * Get merged config (project config overrides global)
 */
export function getMergedEditors(projectRoot?: string): EditorId[] {
  const projectConfig = getProjectConfig(projectRoot);
  if (projectConfig?.editors) {
    return projectConfig.editors;
  }
  return getEditors();
}
