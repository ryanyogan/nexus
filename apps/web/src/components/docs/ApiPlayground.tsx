import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Play, Copy, Check, Loader2, ChevronDown } from "lucide-react";
import { CodeBlock } from "./CodeBlock";

const API_BASE = "https://api.nexus.yogan.dev";

interface Endpoint {
  id: string;
  method: "GET" | "POST";
  path: string;
  name: string;
  parameters?: Array<{
    name: string;
    type: "string" | "number";
    default?: string;
    placeholder?: string;
  }>;
  body?: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    id: "list-libraries",
    method: "GET",
    path: "/api/libraries",
    name: "List Libraries",
    parameters: [
      { name: "category", type: "string", placeholder: "frontend" },
      { name: "search", type: "string", placeholder: "react" },
      { name: "limit", type: "number", default: "20" },
    ],
  },
  {
    id: "get-library",
    method: "GET",
    path: "/api/libraries/:id",
    name: "Get Library",
    parameters: [
      { name: "id", type: "string", default: "hono", placeholder: "hono" },
    ],
  },
  {
    id: "search-docs",
    method: "POST",
    path: "/api/libraries/search",
    name: "Search Documentation",
    body: JSON.stringify(
      {
        query: "How to create a route handler",
        libraryId: "hono",
        limit: 5,
      },
      null,
      2
    ),
  },
  {
    id: "get-stats",
    method: "GET",
    path: "/api/stats",
    name: "Global Stats",
  },
  {
    id: "get-popular",
    method: "GET",
    path: "/api/stats/popular",
    name: "Popular Libraries",
  },
  {
    id: "list-submissions",
    method: "GET",
    path: "/api/submissions",
    name: "List Submissions",
    parameters: [
      { name: "status", type: "string", placeholder: "pending" },
      { name: "limit", type: "number", default: "10" },
    ],
  },
];

export function ApiPlayground() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(ENDPOINTS[0]);
  const [params, setParams] = useState<Record<string, string>>({});
  const [body, setBody] = useState(selectedEndpoint.body || "");
  const [shouldFetch, setShouldFetch] = useState(false);
  const [copied, setCopied] = useState(false);

  // Build URL with parameters
  const buildUrl = () => {
    let url = selectedEndpoint.path;
    const queryParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (!value) continue;
      
      // Path parameter (e.g., :id)
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, value);
      } else {
        // Query parameter
        queryParams.set(key, value);
      }
    }

    const queryString = queryParams.toString();
    return `${API_BASE}${url}${queryString ? `?${queryString}` : ""}`;
  };

  // Generate cURL command
  const getCurlCommand = () => {
    const url = buildUrl();
    if (selectedEndpoint.method === "POST") {
      return `curl -X POST "${url}" \\\n  -H "Content-Type: application/json" \\\n  -d '${body}'`;
    }
    return `curl "${url}"`;
  };

  // Execute request
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["playground", selectedEndpoint.id, params, body],
    queryFn: async () => {
      const url = buildUrl();
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (selectedEndpoint.method === "POST" && body) {
        options.body = body;
      }

      const startTime = performance.now();
      const response = await fetch(url, options);
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      const json = await response.json();
      return {
        status: response.status,
        statusText: response.statusText,
        duration,
        data: json,
      };
    },
    enabled: shouldFetch,
    retry: false,
  });

  const handleEndpointChange = (endpointId: string) => {
    const endpoint = ENDPOINTS.find((e) => e.id === endpointId);
    if (endpoint) {
      setSelectedEndpoint(endpoint);
      setParams({});
      setBody(endpoint.body || "");
      setShouldFetch(false);
    }
  };

  const handleSend = () => {
    setShouldFetch(true);
    refetch();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getCurlCommand());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="my-8 rounded-xl border border-border/50 bg-card/50 overflow-hidden"
      style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}
    >
      {/* Header */}
      <div className="border-b border-border/50 bg-muted/30 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            API Playground
          </h3>
          <span className="text-xs text-muted-foreground">
            Rate limited: 100 req/min
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Endpoint selector */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <select
              value={selectedEndpoint.id}
              onChange={(e) => handleEndpointChange(e.target.value)}
              className="w-full appearance-none rounded-lg border border-border/50 bg-card/50 px-4 py-2.5 pr-10 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            >
              {ENDPOINTS.map((endpoint) => (
                <option key={endpoint.id} value={endpoint.id}>
                  {endpoint.method} - {endpoint.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>

          <button
            onClick={handleSend}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
            style={{ boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)" }}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Send Request
          </button>

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-lg border border-border/50 bg-card/50 px-4 py-2.5 text-sm text-muted-foreground transition-all hover:border-primary/50 hover:text-foreground"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            Copy cURL
          </button>
        </div>

        {/* URL preview */}
        <div className="rounded-lg border border-border/50 bg-muted/30 px-4 py-2">
          <code className="text-sm text-muted-foreground break-all">
            <span
              className={
                selectedEndpoint.method === "GET"
                  ? "text-green-400"
                  : "text-blue-400"
              }
            >
              {selectedEndpoint.method}
            </span>{" "}
            {buildUrl()}
          </code>
        </div>

        {/* Parameters */}
        {selectedEndpoint.parameters && selectedEndpoint.parameters.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-foreground">
              Parameters
            </h4>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {selectedEndpoint.parameters.map((param) => (
                <div key={param.name}>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    {param.name}
                  </label>
                  <input
                    type={param.type === "number" ? "number" : "text"}
                    value={params[param.name] || param.default || ""}
                    onChange={(e) =>
                      setParams({ ...params, [param.name]: e.target.value })
                    }
                    placeholder={param.placeholder}
                    className="w-full rounded-lg border border-border/50 bg-card/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Request body */}
        {selectedEndpoint.method === "POST" && (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-foreground">
              Request Body
            </h4>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-border/50 bg-[#282a36] px-4 py-3 font-mono text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
        )}

        {/* Response */}
        {(data || error) && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">Response</h4>
              {data && (
                <span className="text-xs text-muted-foreground">
                  <span
                    className={
                      data.status >= 200 && data.status < 300
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {data.status} {data.statusText}
                  </span>
                  {" - "}
                  {data.duration}ms
                </span>
              )}
            </div>
            {error ? (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                Error: {error instanceof Error ? error.message : "Request failed"}
              </div>
            ) : data ? (
              <CodeBlock language="json">
                {JSON.stringify(data.data, null, 2)}
              </CodeBlock>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
