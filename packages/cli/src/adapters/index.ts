/**
 * Editor adapter registry
 *
 * Provides factory functions for creating editor adapters and
 * utilities for working with multiple editors.
 */

import type { EditorAdapter, EditorType } from "./types.js";
import { ClaudeCodeAdapter } from "./claude-code.js";
import { CursorAdapter } from "./cursor.js";
import { VSCodeAdapter } from "./vscode.js";
import { OpenCodeAdapter } from "./opencode.js";
import { ZedAdapter } from "./zed.js";

// Re-export types
export * from "./types.js";

/**
 * Map of editor type to display name
 */
export const EDITOR_NAMES: Record<EditorType, string> = {
  "claude-code": "Claude Code",
  cursor: "Cursor",
  vscode: "VS Code",
  opencode: "OpenCode",
  zed: "Zed",
};

/**
 * All supported editor types
 */
export const SUPPORTED_EDITORS: EditorType[] = [
  "claude-code",
  "cursor",
  "vscode",
  "opencode",
  "zed",
];

/**
 * Create an adapter for the specified editor
 */
export function createAdapter(type: EditorType): EditorAdapter {
  switch (type) {
    case "claude-code":
      return new ClaudeCodeAdapter();
    case "cursor":
      return new CursorAdapter();
    case "vscode":
      return new VSCodeAdapter();
    case "opencode":
      return new OpenCodeAdapter();
    case "zed":
      return new ZedAdapter();
    default:
      throw new Error(`Unsupported editor: ${type}`);
  }
}

/**
 * Create adapters for multiple editors
 */
export function createAdapters(types: EditorType[]): EditorAdapter[] {
  return types.map(createAdapter);
}

/**
 * Detect which editors are installed on the system
 */
export async function detectInstalledEditors(): Promise<EditorType[]> {
  const installed: EditorType[] = [];

  for (const type of SUPPORTED_EDITORS) {
    const adapter = createAdapter(type);
    if (await adapter.isInstalled()) {
      installed.push(type);
    }
  }

  return installed;
}

/**
 * Get editor type from string (case-insensitive)
 */
export function parseEditorType(value: string): EditorType | null {
  const normalized = value.toLowerCase().trim();

  const aliases: Record<string, EditorType> = {
    "claude-code": "claude-code",
    claudecode: "claude-code",
    claude: "claude-code",
    cursor: "cursor",
    vscode: "vscode",
    "vs-code": "vscode",
    code: "vscode",
    opencode: "opencode",
    "open-code": "opencode",
    zed: "zed",
  };

  return aliases[normalized] || null;
}

/**
 * Result of installing a server to multiple editors
 */
export interface MultiEditorResult {
  editor: EditorType;
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Install a server configuration to multiple editors
 */
export async function installToEditors(
  config: import("./types.js").McpServerConfig,
  editors: EditorType[]
): Promise<MultiEditorResult[]> {
  const results: MultiEditorResult[] = [];

  for (const editorType of editors) {
    const adapter = createAdapter(editorType);
    const result = await adapter.addServer(config);

    results.push({
      editor: editorType,
      success: result.success,
      message: result.message,
      error: result.error,
    });
  }

  return results;
}

/**
 * Remove a server from multiple editors
 */
export async function removeFromEditors(
  serverId: string,
  editors: EditorType[]
): Promise<MultiEditorResult[]> {
  const results: MultiEditorResult[] = [];

  for (const editorType of editors) {
    const adapter = createAdapter(editorType);
    const result = await adapter.removeServer(serverId);

    results.push({
      editor: editorType,
      success: result.success,
      message: result.message,
      error: result.error,
    });
  }

  return results;
}
