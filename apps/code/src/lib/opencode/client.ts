import type {
  OpenCodeClient,
  HealthResponse,
  Project,
  Session,
  Message,
  Todo,
  AssistantMessage,
  PromptBody,
  FileDiff,
  FileNode,
  FileContent,
  FileStatus,
  TextMatch,
  FindFilesOptions,
  Symbol,
  Config,
  VcsInfo,
} from "./types";

interface ClientOptions {
  baseUrl: string;
  username?: string;
  password?: string;
}

export function createOpenCodeClient(
  baseUrl: string,
  password?: string
): OpenCodeClient {
  const opts: ClientOptions = {
    baseUrl: baseUrl.replace(/\/$/, ""), // Remove trailing slash
    username: "opencode",
    password,
  };

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Add basic auth if password provided
  if (opts.password) {
    const auth = btoa(`${opts.username}:${opts.password}`);
    headers["Authorization"] = `Basic ${auth}`;
  }

  async function request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${opts.baseUrl}${path}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    // Handle empty responses
    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return response.text() as unknown as T;
    }

    return response.json();
  }

  return {
    async health(): Promise<HealthResponse> {
      return request("/global/health");
    },

    project: {
      async list(): Promise<Project[]> {
        return request("/project");
      },

      async current(): Promise<Project | null> {
        try {
          return await request("/project/current");
        } catch {
          return null;
        }
      },
    },

    session: {
      async list(): Promise<Session[]> {
        return request("/session");
      },

      async get(id: string): Promise<Session> {
        return request(`/session/${id}`);
      },

      async create(opts?: { title?: string; parentID?: string }): Promise<Session> {
        return request("/session", {
          method: "POST",
          body: JSON.stringify(opts || {}),
        });
      },

      async delete(id: string): Promise<boolean> {
        return request(`/session/${id}`, { method: "DELETE" });
      },

      async update(id: string, opts: { title?: string }): Promise<Session> {
        return request(`/session/${id}`, {
          method: "PATCH",
          body: JSON.stringify(opts),
        });
      },

      async abort(id: string): Promise<boolean> {
        return request(`/session/${id}/abort`, { method: "POST" });
      },

      async messages(id: string, limit?: number): Promise<Message[]> {
        const params = limit ? `?limit=${limit}` : "";
        const result = await request<{ info: Message; parts: unknown[] }[]>(
          `/session/${id}/message${params}`
        );
        // Flatten the response format
        return result.map((m) => ({
          ...m.info,
          parts: m.parts as Message["parts"],
        }));
      },

      async todos(id: string): Promise<Todo[]> {
        return request(`/session/${id}/todo`);
      },

      async prompt(id: string, body: PromptBody): Promise<AssistantMessage> {
        const result = await request<{ info: Message; parts: unknown[] }>(
          `/session/${id}/message`,
          {
            method: "POST",
            body: JSON.stringify(body),
          }
        );
        return {
          ...result.info,
          parts: result.parts as Message["parts"],
          role: "assistant",
        };
      },

      async promptAsync(id: string, body: PromptBody): Promise<void> {
        await request(`/session/${id}/prompt_async`, {
          method: "POST",
          body: JSON.stringify(body),
        });
      },

      async diff(id: string, messageID?: string): Promise<FileDiff[]> {
        const params = messageID ? `?messageID=${messageID}` : "";
        return request(`/session/${id}/diff${params}`);
      },

      async revert(id: string, messageID: string, partID?: string): Promise<boolean> {
        return request(`/session/${id}/revert`, {
          method: "POST",
          body: JSON.stringify({ messageID, partID }),
        });
      },
    },

    file: {
      async list(path?: string): Promise<FileNode[]> {
        const params = path ? `?path=${encodeURIComponent(path)}` : "";
        return request(`/file${params}`);
      },

      async read(path: string): Promise<FileContent> {
        return request(`/file/content?path=${encodeURIComponent(path)}`);
      },

      async status(): Promise<FileStatus[]> {
        return request("/file/status");
      },
    },

    find: {
      async text(pattern: string): Promise<TextMatch[]> {
        return request(`/find?pattern=${encodeURIComponent(pattern)}`);
      },

      async files(query: string, opts?: FindFilesOptions): Promise<string[]> {
        const params = new URLSearchParams({ query });
        if (opts?.type) params.set("type", opts.type);
        if (opts?.directory) params.set("directory", opts.directory);
        if (opts?.limit) params.set("limit", String(opts.limit));
        return request(`/find/file?${params}`);
      },

      async symbols(query: string): Promise<Symbol[]> {
        return request(`/find/symbol?query=${encodeURIComponent(query)}`);
      },
    },

    events: {
      async subscribe(): Promise<EventSource> {
        const url = `${opts.baseUrl}/event`;
        const eventSource = new EventSource(url, {
          // Note: EventSource doesn't support custom headers in browsers
          // For auth, we'd need to use query params or cookies
        });
        return eventSource;
      },
    },

    config: {
      async get(): Promise<Config> {
        return request("/config");
      },
    },

    vcs: {
      async get(): Promise<VcsInfo> {
        return request("/vcs");
      },
    },
  };
}
