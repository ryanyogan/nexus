// OpenCode API Types
// Based on https://opencode.ai/docs/server/

export interface OpenCodeClient {
  health(): Promise<HealthResponse>;
  project: {
    list(): Promise<Project[]>;
    current(): Promise<Project | null>;
  };
  session: {
    list(): Promise<Session[]>;
    get(id: string): Promise<Session>;
    create(opts?: { title?: string; parentID?: string }): Promise<Session>;
    delete(id: string): Promise<boolean>;
    update(id: string, opts: { title?: string }): Promise<Session>;
    abort(id: string): Promise<boolean>;
    messages(id: string, limit?: number): Promise<Message[]>;
    todos(id: string): Promise<Todo[]>;
    prompt(id: string, body: PromptBody): Promise<AssistantMessage>;
    promptAsync(id: string, body: PromptBody): Promise<void>;
    diff(id: string, messageID?: string): Promise<FileDiff[]>;
    revert(id: string, messageID: string, partID?: string): Promise<boolean>;
  };
  file: {
    list(path?: string): Promise<FileNode[]>;
    read(path: string): Promise<FileContent>;
    status(): Promise<FileStatus[]>;
  };
  find: {
    text(pattern: string): Promise<TextMatch[]>;
    files(query: string, opts?: FindFilesOptions): Promise<string[]>;
    symbols(query: string): Promise<Symbol[]>;
  };
  events: {
    subscribe(): Promise<EventSource>;
  };
  config: {
    get(): Promise<Config>;
  };
  vcs: {
    get(): Promise<VcsInfo>;
  };
}

export interface HealthResponse {
  healthy: boolean;
  version: string;
}

export interface Project {
  id: string;
  name: string;
  path: string;
}

export interface Session {
  id: string;
  title?: string;
  parentID?: string;
  createdAt: string;
  updatedAt: string;
  share?: {
    id: string;
    url: string;
  };
}

export interface SessionStatus {
  type: "idle" | "running" | "error";
  error?: string;
}

export interface Message {
  id: string;
  sessionID: string;
  role: "user" | "assistant";
  createdAt: string;
  parts: Part[];
}

export interface AssistantMessage extends Message {
  role: "assistant";
}

export type Part =
  | TextPart
  | ToolCallPart
  | ToolResultPart
  | FilePart
  | ErrorPart;

export interface TextPart {
  type: "text";
  text: string;
}

export interface ToolCallPart {
  type: "tool-call";
  id: string;
  name: string;
  args: Record<string, unknown>;
}

export interface ToolResultPart {
  type: "tool-result";
  id: string;
  name: string;
  result: unknown;
  isError?: boolean;
}

export interface FilePart {
  type: "file";
  path: string;
  content?: string;
}

export interface ErrorPart {
  type: "error";
  error: string;
}

export interface PromptBody {
  messageID?: string;
  model?: {
    providerID: string;
    modelID: string;
  };
  agent?: string;
  noReply?: boolean;
  system?: string;
  tools?: string[];
  parts: PromptPart[];
}

export type PromptPart =
  | { type: "text"; text: string }
  | { type: "image"; url: string; mimeType?: string };

export interface Todo {
  id: string;
  content: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
}

export interface FileNode {
  name: string;
  type: "file" | "directory";
  path: string;
  size?: number;
}

export interface FileContent {
  type: "raw" | "patch";
  content: string;
}

export interface FileStatus {
  path: string;
  status: "modified" | "added" | "deleted" | "renamed" | "untracked";
}

export interface FileDiff {
  path: string;
  oldPath?: string;
  hunks: DiffHunk[];
}

export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: string[];
}

export interface TextMatch {
  path: string;
  lines: string;
  line_number: number;
  absolute_offset: number;
  submatches: unknown[];
}

export interface FindFilesOptions {
  type?: "file" | "directory";
  directory?: string;
  limit?: number;
}

export interface Symbol {
  name: string;
  kind: string;
  location: {
    uri: string;
    range: {
      start: { line: number; character: number };
      end: { line: number; character: number };
    };
  };
}

export interface Config {
  model?: {
    providerID: string;
    modelID: string;
  };
  [key: string]: unknown;
}

export interface VcsInfo {
  type: "git" | "none";
  branch?: string;
  commit?: string;
  dirty?: boolean;
}

// SSE Event Types
export type OpenCodeEvent =
  | { type: "server.connected" }
  | { type: "session.created"; properties: { info: Session } }
  | { type: "session.updated"; properties: { info: Session } }
  | { type: "session.status"; properties: { sessionID: string; status: SessionStatus } }
  | { type: "message.created"; properties: { info: Message; parts: Part[] } }
  | { type: "message.updated"; properties: { info: Message; parts: Part[] } }
  | { type: "message.part.updated"; properties: { sessionID: string; messageID: string; part: Part; delta?: string } }
  | { type: "file.edited"; properties: { file: string } }
  | { type: "todo.updated"; properties: { sessionID: string; todos: Todo[] } }
  | { type: "permission.updated"; properties: PermissionRequest };

export interface PermissionRequest {
  id: string;
  sessionID: string;
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
}
