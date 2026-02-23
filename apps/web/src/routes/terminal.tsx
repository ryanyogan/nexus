import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Terminal as TerminalIcon,
  Send,
  Loader2,
  ChevronUp,
  ChevronDown,
  Trash2,
  Settings,
  X,
  Wifi,
  WifiOff,
  Plus,
  ExternalLink,
  MessageSquare,
  FolderOpen,
  AlertCircle,
  CheckCircle,
  FileEdit,
  Square,
  Clock,
  GitBranch,
} from "lucide-react";

export const Route = createFileRoute("/terminal")({
  component: TerminalPage,
});

interface OpenCodeSession {
  id: string;
  title?: string;
  createdAt: string;
  updatedAt?: string;
  messageCount?: number;
}

interface OpenCodeMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  parts?: Array<{
    type: string;
    text?: string;
    toolName?: string;
    toolInput?: unknown;
    result?: unknown;
  }>;
}

interface ConnectionConfig {
  serverUrl: string;
  username?: string;
  password?: string;
}

interface TerminalSettings {
  fontSize: "sm" | "base" | "lg";
  theme: "dark" | "light" | "dracula";
  autoReconnect: boolean;
}

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

type EventType =
  | "session.created"
  | "session.status"
  | "message.updated"
  | "message.part.updated"
  | "file.edited"
  | "permission.updated"
  | "todo.updated"
  | "error";

interface StreamEvent {
  id: string;
  type: EventType;
  timestamp: Date;
  content: string;
  data?: unknown;
}

const DEFAULT_SETTINGS: TerminalSettings = {
  fontSize: "base",
  theme: "dracula",
  autoReconnect: true,
};

const WELCOME_MESSAGE = `
 ___                    ___          _      
/ _ \\ _ __   ___ _ __  / __\\___   __| | ___ 
| | | | '_ \\ / _ \\ '_ \\| |  / _ \\ / _\` |/ _ \\
| |_| | |_) |  __/ | | | |_| (_) | (_| |  __/
\\___/| .__/ \\___|_| |_\\____\\___/ \\__,_|\\___|
     |_|                                     
                                             
OpenCode Remote Terminal
========================
Connect to your OpenCode session from anywhere.

Enter your OpenCode server URL to get started.
Default: http://localhost:4096
`;

function TerminalPage() {
  // Connection state
  const [config, setConfig] = useState<ConnectionConfig>({ serverUrl: "" });
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [projectInfo, setProjectInfo] = useState<{
    path: string;
    branch?: string;
  } | null>(null);

  // Session state
  const [sessions, setSessions] = useState<OpenCodeSession[]>([]);
  const [activeSession, setActiveSession] = useState<OpenCodeSession | null>(null);
  const [messages, setMessages] = useState<OpenCodeMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // UI state
  const [input, setInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showConnect, setShowConnect] = useState(true);
  const [settings, setSettings] = useState<TerminalSettings>(DEFAULT_SETTINGS);
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("opencode-terminal-settings");
      if (saved) {
        try {
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
        } catch {
          // ignore
        }
      }

      const savedConfig = localStorage.getItem("opencode-terminal-config");
      if (savedConfig) {
        try {
          setConfig(JSON.parse(savedConfig));
        } catch {
          // ignore
        }
      }

      const savedHistory = localStorage.getItem("opencode-terminal-history");
      if (savedHistory) {
        try {
          setCommandHistory(JSON.parse(savedHistory));
        } catch {
          // ignore
        }
      }
    }
  }, []);

  // Save settings
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("opencode-terminal-settings", JSON.stringify(settings));
    }
  }, [settings]);

  // Save config
  useEffect(() => {
    if (typeof window !== "undefined" && config.serverUrl) {
      localStorage.setItem("opencode-terminal-config", JSON.stringify(config));
    }
  }, [config]);

  // Save history
  useEffect(() => {
    if (typeof window !== "undefined" && commandHistory.length > 0) {
      localStorage.setItem(
        "opencode-terminal-history",
        JSON.stringify(commandHistory.slice(-50))
      );
    }
  }, [commandHistory]);

  // Auto-scroll
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [messages, events]);

  // Focus input when connected
  useEffect(() => {
    if (status === "connected" && activeSession) {
      inputRef.current?.focus();
    }
  }, [status, activeSession]);

  // Cleanup SSE on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const getAuthHeaders = useCallback((): HeadersInit => {
    if (config.username && config.password) {
      const credentials = btoa(`${config.username}:${config.password}`);
      return { Authorization: `Basic ${credentials}` };
    }
    return {};
  }, [config.username, config.password]);

  const addEvent = useCallback((type: EventType, content: string, data?: unknown) => {
    setEvents((prev) => [
      ...prev.slice(-100), // Keep last 100 events
      {
        id: crypto.randomUUID(),
        type,
        timestamp: new Date(),
        content,
        data,
      },
    ]);
  }, []);

  const connect = useCallback(async () => {
    if (!config.serverUrl) {
      setErrorMessage("Please enter a server URL");
      return;
    }

    setStatus("connecting");
    setErrorMessage(null);

    try {
      // Test connection and get project info
      const res = await fetch(`${config.serverUrl}/project`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Authentication required. Please enter username and password.");
        }
        throw new Error(`Connection failed: ${res.statusText}`);
      }

      const data = (await res.json()) as { path?: string; worktree?: string; branch?: string };
      setProjectInfo({
        path: data.path || data.worktree || "",
        branch: data.branch,
      });

      // Fetch sessions
      const sessionsRes = await fetch(`${config.serverUrl}/session`, {
        headers: getAuthHeaders(),
      });

      if (sessionsRes.ok) {
        const sessionsData = (await sessionsRes.json()) as { sessions?: OpenCodeSession[] } | OpenCodeSession[];
        const sessionsList = Array.isArray(sessionsData) ? sessionsData : sessionsData.sessions || [];
        setSessions(sessionsList);
      }

      // Set up SSE for real-time events
      setupEventStream();

      setStatus("connected");
      setShowConnect(false);
      addEvent("session.created", "Connected to OpenCode server");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Connection failed");
    }
  }, [config.serverUrl, getAuthHeaders, addEvent]);

  const setupEventStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = new URL(`${config.serverUrl}/event`);
    // Note: EventSource doesn't support custom headers, so auth needs to be handled differently
    // For now, we'll just connect without auth for SSE
    const eventSource = new EventSource(url.toString());

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleServerEvent(data);
      } catch {
        // ignore parse errors
      }
    };

    eventSource.onerror = () => {
      if (settings.autoReconnect && status === "connected") {
        setTimeout(() => setupEventStream(), 5000);
      }
    };

    eventSourceRef.current = eventSource;
  }, [config.serverUrl, settings.autoReconnect, status]);

  const handleServerEvent = useCallback(
    (event: { 
      type: EventType; 
      properties?: {
        info?: { title?: string };
        sessionID?: string;
        status?: { type?: string };
        part?: { type?: string };
        delta?: string;
        file?: string;
        title?: string;
      };
    }) => {
      switch (event.type) {
        case "session.created":
          addEvent("session.created", `New session: ${event.properties?.info?.title || "Untitled"}`);
          break;
        case "session.status":
          addEvent(
            "session.status",
            `Session ${event.properties?.sessionID || "unknown"}: ${event.properties?.status?.type || "unknown"}`
          );
          break;
        case "message.updated":
          addEvent("message.updated", "Message updated");
          // Refresh messages if this is for our active session
          if (activeSession) {
            fetchMessages(activeSession.id);
          }
          break;
        case "message.part.updated":
          if (event.properties?.part?.type === "text" && event.properties?.delta) {
            // Handle streaming text
            const delta = event.properties.delta;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return [
                  ...prev.slice(0, -1),
                  { ...last, content: last.content + delta },
                ];
              }
              return prev;
            });
          }
          break;
        case "file.edited":
          addEvent("file.edited", `File changed: ${event.properties?.file || "unknown"}`);
          break;
        case "permission.updated":
          addEvent("permission.updated", `Permission requested: ${event.properties?.title || "unknown"}`);
          break;
        case "todo.updated":
          addEvent("todo.updated", "Todos updated");
          break;
        default:
          addEvent(event.type, `Event: ${event.type}`);
      }
    },
    [activeSession, addEvent]
  );

  const fetchMessages = useCallback(
    async (sessionId: string) => {
      try {
        const res = await fetch(`${config.serverUrl}/session/${sessionId}/message`, {
          headers: getAuthHeaders(),
        });

        if (res.ok) {
          const data = (await res.json()) as { messages?: OpenCodeMessage[] } | OpenCodeMessage[];
          const messagesList = Array.isArray(data) ? data : data.messages || [];
          setMessages(messagesList);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    },
    [config.serverUrl, getAuthHeaders]
  );

  const selectSession = useCallback(
    async (session: OpenCodeSession) => {
      setActiveSession(session);
      setIsLoading(true);

      try {
        await fetchMessages(session.id);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchMessages]
  );

  const createSession = useCallback(async () => {
    setIsLoading(true);

    try {
      const res = await fetch(`${config.serverUrl}/session`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const newSession = (await res.json()) as OpenCodeSession;
        setSessions((prev) => [newSession, ...prev]);
        setActiveSession(newSession);
        setMessages([]);
        addEvent("session.created", `Created new session: ${newSession.id}`);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to create session");
    } finally {
      setIsLoading(false);
    }
  }, [config.serverUrl, getAuthHeaders, addEvent]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !activeSession || isStreaming) return;

    const userMessage = input.trim();
    setInput("");
    setCommandHistory((prev) => [...prev.filter((c) => c !== userMessage), userMessage]);
    setHistoryIndex(-1);
    setIsStreaming(true);

    // Add user message immediately
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: userMessage,
        timestamp: new Date().toISOString(),
      },
    ]);

    // Add placeholder for assistant response
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      },
    ]);

    try {
      const res = await fetch(`${config.serverUrl}/session/${activeSession.id}/message`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parts: [{ type: "text", text: userMessage }],
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to send message: ${res.statusText}`);
      }

      // The response might stream, so we'll rely on SSE for updates
      // But also parse the final response
      const data = (await res.json()) as { parts?: Array<{ type: string; text?: string }> };

      // Update the last assistant message with the full response
      if (data.parts) {
        const textContent = data.parts
          .filter((p) => p.type === "text")
          .map((p) => p.text || "")
          .join("\n");

        setMessages((prev) => {
          const lastIdx = prev.length - 1;
          if (prev[lastIdx]?.role === "assistant") {
            return [...prev.slice(0, lastIdx), { ...prev[lastIdx], content: textContent }];
          }
          return prev;
        });
      }
    } catch (error) {
      setMessages((prev) => {
        const lastIdx = prev.length - 1;
        if (prev[lastIdx]?.role === "assistant") {
          return [
            ...prev.slice(0, lastIdx),
            {
              ...prev[lastIdx],
              content: `Error: ${error instanceof Error ? error.message : "Failed to send message"}`,
            },
          ];
        }
        return prev;
      });
    } finally {
      setIsStreaming(false);
    }
  }, [input, activeSession, isStreaming, config.serverUrl, getAuthHeaders]);

  const abortSession = useCallback(async () => {
    if (!activeSession) return;

    try {
      await fetch(`${config.serverUrl}/session/${activeSession.id}/abort`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      addEvent("session.status", "Session aborted");
      setIsStreaming(false);
    } catch (error) {
      console.error("Failed to abort:", error);
    }
  }, [activeSession, config.serverUrl, getAuthHeaders, addEvent]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setStatus("disconnected");
    setActiveSession(null);
    setSessions([]);
    setMessages([]);
    setProjectInfo(null);
    setShowConnect(true);
    addEvent("session.status", "Disconnected from server");
  }, [addEvent]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isStreaming) {
      sendMessage();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex =
          historyIndex === -1
            ? commandHistory.length - 1
            : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput("");
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    } else if (e.key === "Escape" && isStreaming) {
      abortSession();
    }
  };

  const fontSizeClass = {
    sm: "text-xs",
    base: "text-sm",
    lg: "text-base",
  }[settings.fontSize];

  const themeClass = {
    dark: "bg-zinc-950 text-zinc-100",
    light: "bg-white text-zinc-900 border border-zinc-200",
    dracula: "bg-[#282a36] text-[#f8f8f2]",
  }[settings.theme];

  const statusColor = {
    disconnected: "text-zinc-400",
    connecting: "text-yellow-400",
    connected: "text-green-400",
    error: "text-red-400",
  }[status];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <TerminalIcon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">OpenCode Remote</h1>
            <div className="flex items-center gap-2 text-xs">
              <span className={statusColor}>
                {status === "connected" ? (
                  <Wifi className="inline h-3 w-3 mr-1" />
                ) : (
                  <WifiOff className="inline h-3 w-3 mr-1" />
                )}
                {status}
              </span>
              {projectInfo && (
                <>
                  <span className="text-muted-foreground">|</span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <FolderOpen className="h-3 w-3" />
                    {projectInfo.path.split("/").pop()}
                  </span>
                  {projectInfo.branch && (
                    <span className="text-muted-foreground flex items-center gap-1">
                      <GitBranch className="h-3 w-3" />
                      {projectInfo.branch}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status === "connected" && (
            <>
              <button
                onClick={createSession}
                disabled={isLoading}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                title="New session"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setMessages([]);
                  setEvents([]);
                }}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                title="Clear output"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
          {status === "connected" && (
            <button
              onClick={disconnect}
              className="rounded-lg p-2 text-red-400 hover:bg-red-500/10"
              title="Disconnect"
            >
              <WifiOff className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-b border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Settings</span>
            <button
              onClick={() => setShowSettings(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Font Size</label>
              <div className="flex gap-2">
                {(["sm", "base", "lg"] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSettings((s) => ({ ...s, fontSize: size }))}
                    className={`rounded px-3 py-1 text-xs ${
                      settings.fontSize === size
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {size.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Theme</label>
              <div className="flex gap-2">
                {(["dark", "dracula", "light"] as const).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => setSettings((s) => ({ ...s, theme }))}
                    className={`rounded px-3 py-1 text-xs capitalize ${
                      settings.theme === theme
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoReconnect"
                checked={settings.autoReconnect}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, autoReconnect: e.target.checked }))
                }
                className="rounded"
              />
              <label htmlFor="autoReconnect" className="text-xs text-muted-foreground">
                Auto-reconnect on disconnect
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Connection Panel */}
      {showConnect && (
        <div className="border-b border-border bg-card p-4">
          <div className="mx-auto max-w-md space-y-4">
            <pre className={`font-mono text-xs ${fontSizeClass} text-green-400 whitespace-pre`}>
              {WELCOME_MESSAGE}
            </pre>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  OpenCode Server URL
                </label>
                <input
                  type="text"
                  value={config.serverUrl}
                  onChange={(e) => setConfig((c) => ({ ...c, serverUrl: e.target.value }))}
                  placeholder="http://localhost:4096"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <details className="text-xs text-muted-foreground">
                <summary className="cursor-pointer hover:text-foreground">
                  Authentication (optional)
                </summary>
                <div className="mt-2 space-y-2">
                  <input
                    type="text"
                    value={config.username || ""}
                    onChange={(e) => setConfig((c) => ({ ...c, username: e.target.value }))}
                    placeholder="Username"
                    className="w-full rounded border border-border bg-background px-2 py-1 text-sm"
                  />
                  <input
                    type="password"
                    value={config.password || ""}
                    onChange={(e) => setConfig((c) => ({ ...c, password: e.target.value }))}
                    placeholder="Password"
                    className="w-full rounded border border-border bg-background px-2 py-1 text-sm"
                  />
                </div>
              </details>

              {errorMessage && (
                <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-2 text-xs text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  {errorMessage}
                </div>
              )}

              <button
                onClick={connect}
                disabled={status === "connecting"}
                className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {status === "connecting" ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting...
                  </span>
                ) : (
                  "Connect"
                )}
              </button>

              <p className="text-center text-xs text-muted-foreground">
                Start OpenCode with:{" "}
                <code className="rounded bg-muted px-1 py-0.5">opencode serve --cors {typeof window !== "undefined" ? window.location.origin : "https://nexus.yogan.dev"}</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Session Selector */}
      {status === "connected" && sessions.length > 0 && (
        <div className="border-b border-border bg-muted/30 px-4 py-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Sessions:</span>
            {sessions.slice(0, 5).map((session) => (
              <button
                key={session.id}
                onClick={() => selectSession(session)}
                className={`flex items-center gap-1 rounded px-2 py-1 text-xs whitespace-nowrap ${
                  activeSession?.id === session.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <MessageSquare className="h-3 w-3" />
                {session.title || session.id.slice(0, 8)}
              </button>
            ))}
            {sessions.length > 5 && (
              <span className="text-xs text-muted-foreground">
                +{sessions.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Messages Panel */}
        <div
          ref={outputRef}
          className={`flex-1 overflow-y-auto p-4 font-mono ${fontSizeClass} ${themeClass}`}
          style={{ minHeight: "calc(100vh - 12rem)" }}
        >
          {!activeSession && status === "connected" && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                  Select a session or create a new one
                </p>
                <button
                  onClick={createSession}
                  className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="mr-2 inline h-4 w-4" />
                  New Session
                </button>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {activeSession && !isLoading && (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-1">
                  <div
                    className={`flex items-start gap-2 ${
                      msg.role === "user" ? "text-green-400" : "text-inherit"
                    }`}
                  >
                    <span className="font-bold shrink-0">
                      {msg.role === "user" ? ">" : "<"}
                    </span>
                    <div className="whitespace-pre-wrap break-words flex-1">
                      {msg.content || (
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Thinking...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Real-time Events */}
              {events.length > 0 && (
                <div className="mt-4 border-t border-border/50 pt-4">
                  <p className="mb-2 text-xs text-muted-foreground">Recent Events:</p>
                  {events.slice(-5).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      {event.type === "file.edited" && <FileEdit className="h-3 w-3 text-yellow-400" />}
                      {event.type === "session.status" && <Clock className="h-3 w-3 text-blue-400" />}
                      {event.type.includes("message") && <MessageSquare className="h-3 w-3 text-green-400" />}
                      {!["file.edited", "session.status"].includes(event.type) &&
                        !event.type.includes("message") && (
                          <CheckCircle className="h-3 w-3 text-zinc-400" />
                        )}
                      <span>{event.content}</span>
                      <span className="text-zinc-500">
                        {event.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      {status === "connected" && activeSession && (
        <div className="sticky bottom-0 border-t border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-green-500">&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send a message to OpenCode..."
              disabled={isStreaming}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {isStreaming ? (
              <button
                onClick={abortSession}
                className="rounded-lg bg-red-500 p-2 text-white hover:bg-red-600"
                title="Stop (Esc)"
              >
                <Square className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="rounded-lg bg-primary p-2 text-primary-foreground disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ChevronUp className="h-3 w-3" />
              <ChevronDown className="h-3 w-3" />
              history
              {isStreaming && (
                <>
                  <span className="mx-2">|</span>
                  <span className="text-yellow-400">Esc to stop</span>
                </>
              )}
            </span>
            <span className="flex items-center gap-2">
              {activeSession && (
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {activeSession.title || activeSession.id.slice(0, 8)}
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Docs Link */}
      <div className="border-t border-border bg-muted/30 p-2 text-center">
        <Link
          to="/docs/mobile-terminal"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
        >
          <ExternalLink className="h-3 w-3" />
          View Documentation
        </Link>
      </div>
    </div>
  );
}
