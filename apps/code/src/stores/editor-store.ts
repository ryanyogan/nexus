import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OpenCodeClient, Session, Message, FileNode, Todo } from "@/lib/opencode/types";
import { createOpenCodeClient } from "@/lib/opencode/client";

export interface SavedConnection {
  url: string;
  projectName: string;
  lastUsed: number;
  passwordHint?: string;
}

interface EditorState {
  // Connection state
  serverUrl: string | null;
  connectionStatus: "disconnected" | "connecting" | "connected" | "error";
  connectionError: string | null;
  client: OpenCodeClient | null;
  projectName: string | null;

  // Recent connections (persisted locally, synced to cloud)
  recentConnections: SavedConnection[];

  // Session state
  activeSessionId: string | null;
  sessions: Session[];
  messages: Message[];
  todos: Todo[];

  // UI state
  activeView: "chat" | "editor" | "files";
  activeFilePath: string | null;

  // File state
  fileTree: FileNode[] | null;
  expandedFolders: Set<string>;
  openFiles: Map<string, { content: string; language: string }>;

  // Streaming state
  streamingContent: string;
  isStreaming: boolean;

  // Actions
  connect: (url: string, password?: string) => Promise<void>;
  disconnect: () => void;
  loadRecentConnections: () => Promise<void>;
  saveConnection: (conn: SavedConnection) => Promise<void>;

  // Session actions
  loadSessions: () => Promise<void>;
  selectSession: (sessionId: string) => Promise<void>;
  createSession: (title?: string) => Promise<Session>;
  loadMessages: (sessionId: string) => Promise<void>;

  // Message actions
  sendMessage: (text: string) => Promise<void>;
  abortSession: () => Promise<void>;

  // File actions
  loadFileTree: (path?: string) => Promise<void>;
  toggleFolder: (path: string) => void;
  openFile: (path: string) => Promise<void>;
  closeFile: (path: string) => void;

  // UI actions
  setActiveView: (view: "chat" | "editor" | "files") => void;
  setStreamingContent: (content: string) => void;
  appendStreamingContent: (delta: string) => void;
  setIsStreaming: (streaming: boolean) => void;
  updateTodos: (todos: Todo[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (message: Message) => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      // Initial state
      serverUrl: null,
      connectionStatus: "disconnected",
      connectionError: null,
      client: null,
      projectName: null,
      recentConnections: [],
      activeSessionId: null,
      sessions: [],
      messages: [],
      todos: [],
      activeView: "chat",
      activeFilePath: null,
      fileTree: null,
      expandedFolders: new Set(),
      openFiles: new Map(),
      streamingContent: "",
      isStreaming: false,

      // Connection actions
      connect: async (url: string, password?: string) => {
        set({ connectionStatus: "connecting", connectionError: null });

        try {
          const client = createOpenCodeClient(url, password);
          
          // Test connection
          const health = await client.health();
          if (!health.healthy) {
            throw new Error("Server is not healthy");
          }

          // Get project info
          const project = await client.project.current();

          set({
            serverUrl: url,
            connectionStatus: "connected",
            client,
            projectName: project?.name || "Unknown",
          });

          // Save to recent connections
          const conn: SavedConnection = {
            url,
            projectName: project?.name || "Unknown",
            lastUsed: Date.now(),
            passwordHint: password ? "••••" : undefined,
          };
          await get().saveConnection(conn);
        } catch (error) {
          set({
            connectionStatus: "error",
            connectionError: error instanceof Error ? error.message : "Connection failed",
          });
          throw error;
        }
      },

      disconnect: () => {
        set({
          serverUrl: null,
          connectionStatus: "disconnected",
          connectionError: null,
          client: null,
          projectName: null,
          activeSessionId: null,
          sessions: [],
          messages: [],
          fileTree: null,
          openFiles: new Map(),
        });
      },

      loadRecentConnections: async () => {
        // For now, use local storage via zustand persist
        // TODO: Sync with cloud via Nexus API
      },

      saveConnection: async (conn: SavedConnection) => {
        const { recentConnections } = get();
        
        // Remove existing entry for same URL
        const filtered = recentConnections.filter((c) => c.url !== conn.url);
        
        // Add new connection at the start, limit to 10
        const updated = [conn, ...filtered].slice(0, 10);
        
        set({ recentConnections: updated });
        
        // TODO: Sync to cloud via Nexus API
      },

      // Session actions
      loadSessions: async () => {
        const { client } = get();
        if (!client) return;

        const sessions = await client.session.list();
        set({ sessions });
      },

      selectSession: async (sessionId: string) => {
        const { client } = get();
        if (!client) return;

        set({ activeSessionId: sessionId, messages: [], todos: [] });
        
        // Load messages and todos
        await get().loadMessages(sessionId);
        
        // Load file tree
        await get().loadFileTree();
      },

      createSession: async (title?: string) => {
        const { client } = get();
        if (!client) throw new Error("Not connected");

        const session = await client.session.create({ title });
        
        // Add to sessions list
        set((state) => ({
          sessions: [session, ...state.sessions],
        }));

        return session;
      },

      loadMessages: async (sessionId: string) => {
        const { client } = get();
        if (!client) return;

        const result = await client.session.messages(sessionId);
        const todos = await client.session.todos(sessionId);
        
        set({ messages: result, todos });
      },

      // Message actions
      sendMessage: async (text: string) => {
        const { client, activeSessionId } = get();
        if (!client || !activeSessionId) return;

        set({ isStreaming: true, streamingContent: "" });

        try {
          // Use async prompt to allow streaming via SSE
          await client.session.promptAsync(activeSessionId, {
            parts: [{ type: "text", text }],
          });
        } catch (error) {
          set({ isStreaming: false });
          throw error;
        }
      },

      abortSession: async () => {
        const { client, activeSessionId } = get();
        if (!client || !activeSessionId) return;

        await client.session.abort(activeSessionId);
        set({ isStreaming: false });
      },

      // File actions
      loadFileTree: async (path?: string) => {
        const { client } = get();
        if (!client) return;

        const files = await client.file.list(path);
        set({ fileTree: files });
      },

      toggleFolder: (path: string) => {
        set((state) => {
          const newExpanded = new Set(state.expandedFolders);
          if (newExpanded.has(path)) {
            newExpanded.delete(path);
          } else {
            newExpanded.add(path);
          }
          return { expandedFolders: newExpanded };
        });
      },

      openFile: async (path: string) => {
        const { client, openFiles } = get();
        if (!client) return;

        // Check if already open
        if (openFiles.has(path)) {
          set({ activeFilePath: path, activeView: "editor" });
          return;
        }

        // Fetch file content
        const result = await client.file.read(path);
        const language = getLanguageFromPath(path);

        set((state) => ({
          openFiles: new Map(state.openFiles).set(path, {
            content: result.content,
            language,
          }),
          activeFilePath: path,
          activeView: "editor",
        }));
      },

      closeFile: (path: string) => {
        set((state) => {
          const newOpenFiles = new Map(state.openFiles);
          newOpenFiles.delete(path);
          
          // If closing active file, switch to another or to chat
          let newActivePath = state.activeFilePath;
          if (state.activeFilePath === path) {
            const paths = Array.from(newOpenFiles.keys());
            newActivePath = paths.length > 0 ? paths[0] : null;
          }
          
          return {
            openFiles: newOpenFiles,
            activeFilePath: newActivePath,
            activeView: newActivePath ? "editor" : "chat",
          };
        });
      },

      // UI actions
      setActiveView: (view) => set({ activeView: view }),
      
      setStreamingContent: (content) => set({ streamingContent: content }),
      
      appendStreamingContent: (delta) =>
        set((state) => ({ streamingContent: state.streamingContent + delta })),
      
      setIsStreaming: (streaming) => set({ isStreaming: streaming }),
      
      updateTodos: (todos) => set({ todos }),
      
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      
      updateMessage: (message) =>
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === message.id ? message : m
          ),
        })),
    }),
    {
      name: "nexus-code-editor",
      partialize: (state) => ({
        recentConnections: state.recentConnections,
      }),
    }
  )
);

// Helper to detect language from file path
function getLanguageFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  
  const langMap: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    json: "json",
    html: "html",
    css: "css",
    scss: "css",
    md: "markdown",
    py: "python",
    rs: "rust",
    go: "go",
    java: "java",
    yaml: "yaml",
    yml: "yaml",
    toml: "toml",
    sh: "shell",
    bash: "shell",
    zsh: "shell",
  };
  
  return langMap[ext || ""] || "text";
}
