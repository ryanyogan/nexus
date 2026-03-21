import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@nexus/ui/components/button";
import { Input } from "@nexus/ui/components/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nexus/ui/components/card";
import { Monitor, Clock, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";
import type { SessionData } from "@/server/auth";

interface ConnectionPageProps {
  session: SessionData | null;
}

export function ConnectionPage({ session }: ConnectionPageProps) {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [password, setPassword] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { recentConnections, connect, loadRecentConnections } = useEditorStore();

  // Load recent connections on mount
  useEffect(() => {
    if (session?.user) {
      loadRecentConnections();
    }
  }, [session?.user, loadRecentConnections]);

  // Check for server URL in query params (from dashboard link)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const serverUrl = params.get("server");
    if (serverUrl) {
      setUrl(serverUrl);
    }
  }, []);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!session?.user) {
      navigate({ to: "/sign-in", search: { redirect: "/code" } });
    }
  }, [session, navigate]);

  const handleConnect = async (serverUrl: string, serverPassword?: string) => {
    setIsConnecting(true);
    setError(null);

    try {
      await connect(serverUrl, serverPassword);
      navigate({ to: "/code/sessions" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    handleConnect(url.trim(), password || undefined);
  };

  // Don't render if not authenticated (will redirect)
  if (!session?.user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-8 pt-4">
        <h1 className="text-2xl font-bold mb-2">Nexus Code</h1>
        <p className="text-muted-foreground text-sm">Connect to your OpenCode server</p>
      </div>

      {/* Connection Form */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Server Connection</CardTitle>
          <CardDescription>Enter the URL of your OpenCode server</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="url" className="text-sm font-medium">
                Server URL
              </label>
              <Input
                id="url"
                type="url"
                placeholder="http://192.168.1.5:4096"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isConnecting}
                autoComplete="url"
                autoCapitalize="none"
                autoCorrect="off"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password <span className="text-muted-foreground">(optional)</span>
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter server password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isConnecting}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={!url.trim() || isConnecting}>
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Connections */}
      {recentConnections.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Recent Connections</h2>
          {recentConnections.map((conn) => (
            <button
              key={conn.url}
              onClick={() => handleConnect(conn.url, undefined)}
              disabled={isConnecting}
              className="w-full text-left p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors disabled:opacity-50"
            >
              <div className="flex items-start gap-3">
                <Monitor className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{conn.url}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <span className="truncate">{conn.projectName || "Unknown project"}</span>
                    <span className="text-border">-</span>
                    <Clock className="h-3 w-3" />
                    <span>{formatRelativeTime(conn.lastUsed)}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Help Section */}
      <div className="mt-auto pt-6 pb-4">
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>Run this command on your machine:</p>
          <code className="block bg-muted px-3 py-2 rounded text-xs font-mono">
            opencode web --hostname 0.0.0.0
          </code>
          <a
            href="https://opencode.ai/docs/web/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            Learn more
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;

  return new Date(timestamp).toLocaleDateString();
}
