/**
 * @nexus/sdk/tunnel - OpenCode Remote Tunnel
 *
 * Enables remote connections between OpenCode sessions and the Nexus web terminal.
 * This creates a secure tunnel that allows you to control your local OpenCode
 * instance from https://nexus.yogan.dev/terminal on any device.
 *
 * @example
 * ```typescript
 * import { NexusTunnel } from "@nexus/sdk/tunnel";
 *
 * const tunnel = new NexusTunnel({
 *   apiKey: "your-api-key",
 *   serverUrl: "http://localhost:4096", // Your local OpenCode server
 * });
 *
 * await tunnel.connect();
 * console.log(`Tunnel active: ${tunnel.publicUrl}`);
 *
 * // Later...
 * tunnel.disconnect();
 * ```
 */

// ============================================================================
// Types
// ============================================================================

export interface TunnelConfig {
  /** API key from https://nexus.yogan.dev/dashboard/keys */
  apiKey: string;
  /** Local OpenCode server URL (default: http://localhost:4096) */
  serverUrl?: string;
  /** Nexus tunnel service URL (default: wss://tunnel.nexus.yogan.dev) */
  tunnelUrl?: string;
  /** Auto-reconnect on disconnect (default: true) */
  autoReconnect?: boolean;
  /** Reconnect delay in ms (default: 3000) */
  reconnectDelay?: number;
  /** Session name for identification (default: hostname or "opencode-session") */
  sessionName?: string;
}

export interface TunnelStatus {
  connected: boolean;
  publicUrl: string | null;
  sessionId: string | null;
  connectedAt: Date | null;
  lastActivity: Date | null;
  messagesRelayed: number;
}

export type TunnelEventType =
  | "connected"
  | "disconnected"
  | "error"
  | "message"
  | "activity";

export interface TunnelEvent {
  type: TunnelEventType;
  timestamp: Date;
  data?: unknown;
}

type TunnelEventHandler = (event: TunnelEvent) => void;

// ============================================================================
// Tunnel Client
// ============================================================================

export class NexusTunnel {
  private apiKey: string;
  private serverUrl: string;
  private tunnelUrl: string;
  private autoReconnect: boolean;
  private reconnectDelay: number;
  private sessionName: string;

  private ws: WebSocket | null = null;
  private sessionId: string | null = null;
  private publicUrl: string | null = null;
  private connectedAt: Date | null = null;
  private lastActivity: Date | null = null;
  private messagesRelayed = 0;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private eventHandlers: Map<TunnelEventType, Set<TunnelEventHandler>> =
    new Map();

  constructor(config: TunnelConfig) {
    this.apiKey = config.apiKey;
    this.serverUrl = config.serverUrl || "http://localhost:4096";
    this.tunnelUrl = config.tunnelUrl || "wss://tunnel.nexus.yogan.dev";
    this.autoReconnect = config.autoReconnect ?? true;
    this.reconnectDelay = config.reconnectDelay || 3000;
    this.sessionName = config.sessionName || this.getDefaultSessionName();
  }

  private getDefaultSessionName(): string {
    if (typeof process !== "undefined" && process.env?.HOSTNAME) {
      return process.env.HOSTNAME;
    }
    return "opencode-session";
  }

  /**
   * Get current tunnel status
   */
  get status(): TunnelStatus {
    return {
      connected: this.ws?.readyState === WebSocket.OPEN,
      publicUrl: this.publicUrl,
      sessionId: this.sessionId,
      connectedAt: this.connectedAt,
      lastActivity: this.lastActivity,
      messagesRelayed: this.messagesRelayed,
    };
  }

  /**
   * Check if tunnel is connected
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Connect to the Nexus tunnel service
   */
  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log("[NexusTunnel] Already connected");
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        // Connect to Nexus tunnel service
        const wsUrl = `${this.tunnelUrl}/register?apiKey=${encodeURIComponent(this.apiKey)}&name=${encodeURIComponent(this.sessionName)}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.connectedAt = new Date();
          this.lastActivity = new Date();

          // Send registration with local server info
          this.send({
            type: "register",
            serverUrl: this.serverUrl,
            sessionName: this.sessionName,
            timestamp: new Date().toISOString(),
          });
        };

        this.ws.onmessage = async (event) => {
          this.lastActivity = new Date();

          try {
            const message = JSON.parse(event.data);
            await this.handleMessage(message, resolve);
          } catch (err) {
            console.error("[NexusTunnel] Failed to parse message:", err);
          }
        };

        this.ws.onclose = (event) => {
          const wasConnected = this.connectedAt !== null;
          this.sessionId = null;
          this.publicUrl = null;
          this.connectedAt = null;

          this.emit("disconnected", { code: event.code, reason: event.reason });

          if (wasConnected && this.autoReconnect && event.code !== 1000) {
            console.log(
              `[NexusTunnel] Connection lost, reconnecting in ${this.reconnectDelay}ms...`
            );
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          this.emit("error", error);
          reject(new TunnelError("WebSocket connection failed"));
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Disconnect from the tunnel
   */
  disconnect(): void {
    this.autoReconnect = false;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close(1000, "Client disconnect");
      this.ws = null;
    }

    this.sessionId = null;
    this.publicUrl = null;
    this.connectedAt = null;
  }

  /**
   * Add event listener
   */
  on(event: TunnelEventType, handler: TunnelEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  /**
   * Remove event listener
   */
  off(event: TunnelEventType, handler: TunnelEventHandler): void {
    this.eventHandlers.get(event)?.delete(handler);
  }

  private emit(type: TunnelEventType, data?: unknown): void {
    const event: TunnelEvent = {
      type,
      timestamp: new Date(),
      data,
    };

    this.eventHandlers.get(type)?.forEach((handler) => {
      try {
        handler(event);
      } catch (err) {
        console.error(`[NexusTunnel] Event handler error:`, err);
      }
    });
  }

  private send(message: object): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private async handleMessage(
    message: {
      type: string;
      sessionId?: string;
      publicUrl?: string;
      requestId?: string;
      method?: string;
      path?: string;
      headers?: Record<string, string>;
      body?: string;
      error?: string;
    },
    resolveConnect?: (value: void) => void
  ): Promise<void> {
    switch (message.type) {
      case "registered":
        // Successfully registered with tunnel service
        this.sessionId = message.sessionId || null;
        this.publicUrl = message.publicUrl || null;
        console.log(`[NexusTunnel] Connected! Public URL: ${this.publicUrl}`);
        this.emit("connected", {
          sessionId: this.sessionId,
          publicUrl: this.publicUrl,
        });
        resolveConnect?.();
        break;

      case "request":
        // Incoming request from web client - relay to local OpenCode server
        await this.relayRequest(message);
        break;

      case "ping":
        this.send({ type: "pong", timestamp: new Date().toISOString() });
        break;

      case "error":
        console.error(`[NexusTunnel] Error: ${message.error}`);
        this.emit("error", { message: message.error });
        break;
    }

    this.emit("message", message);
  }

  private async relayRequest(message: {
    requestId?: string;
    method?: string;
    path?: string;
    headers?: Record<string, string>;
    body?: string;
  }): Promise<void> {
    const { requestId, method, path, headers, body } = message;

    try {
      // Make request to local OpenCode server
      const response = await fetch(`${this.serverUrl}${path}`, {
        method: method || "GET",
        headers: headers || {},
        body: body ? body : undefined,
      });

      // Get response data
      const responseBody = await response.text();
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Send response back through tunnel
      this.send({
        type: "response",
        requestId,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body: responseBody,
      });

      this.messagesRelayed++;
      this.emit("activity", { type: "request", path, status: response.status });
    } catch (err) {
      // Send error response
      this.send({
        type: "response",
        requestId,
        status: 502,
        statusText: "Bad Gateway",
        body: JSON.stringify({
          error: "Failed to connect to local OpenCode server",
          details: err instanceof Error ? err.message : String(err),
        }),
      });
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(async () => {
      try {
        await this.connect();
      } catch (err) {
        console.error("[NexusTunnel] Reconnect failed:", err);
        this.scheduleReconnect();
      }
    }, this.reconnectDelay);
  }
}

// ============================================================================
// Error Class
// ============================================================================

export class TunnelError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TunnelError";
  }
}

// ============================================================================
// CLI Helper
// ============================================================================

/**
 * Start a tunnel from the command line
 *
 * @example
 * ```bash
 * npx @nexus/sdk tunnel --api-key=your-key --server=http://localhost:4096
 * ```
 */
export async function startTunnelCLI(args: string[]): Promise<void> {
  const options: TunnelConfig = {
    apiKey: "",
  };

  // Parse CLI arguments
  for (const arg of args) {
    if (arg.startsWith("--api-key=")) {
      options.apiKey = arg.split("=")[1];
    } else if (arg.startsWith("--server=")) {
      options.serverUrl = arg.split("=")[1];
    } else if (arg.startsWith("--tunnel=")) {
      options.tunnelUrl = arg.split("=")[1];
    } else if (arg.startsWith("--name=")) {
      options.sessionName = arg.split("=")[1];
    }
  }

  // Check for API key in environment
  if (!options.apiKey && typeof process !== "undefined") {
    options.apiKey = process.env.NEXUS_API_KEY || "";
  }

  if (!options.apiKey) {
    console.error("Error: API key is required");
    console.error("Usage: npx @nexus/sdk tunnel --api-key=YOUR_KEY");
    console.error("Or set NEXUS_API_KEY environment variable");
    process.exit(1);
  }

  const tunnel = new NexusTunnel(options);

  tunnel.on("connected", (event) => {
    const data = event.data as { publicUrl: string };
    console.log("\n  Nexus Tunnel Active!");
    console.log(`  Public URL: ${data.publicUrl}`);
    console.log(`  Local server: ${options.serverUrl || "http://localhost:4096"}`);
    console.log("\n  Open the URL above in your browser to connect remotely.");
    console.log("  Press Ctrl+C to disconnect.\n");
  });

  tunnel.on("disconnected", () => {
    console.log("[Tunnel] Disconnected");
  });

  tunnel.on("error", (event) => {
    console.error("[Tunnel] Error:", event.data);
  });

  tunnel.on("activity", (event) => {
    const data = event.data as { type: string; path: string; status: number };
    console.log(`[Tunnel] ${data.type}: ${data.path} (${data.status})`);
  });

  // Handle shutdown
  if (typeof process !== "undefined") {
    process.on("SIGINT", () => {
      console.log("\nShutting down tunnel...");
      tunnel.disconnect();
      process.exit(0);
    });
  }

  try {
    await tunnel.connect();
  } catch (err) {
    console.error("Failed to connect:", err);
    process.exit(1);
  }
}

export default NexusTunnel;
