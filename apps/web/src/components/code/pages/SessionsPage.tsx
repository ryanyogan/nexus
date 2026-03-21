import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@nexus/ui/components/button";
import { ArrowLeft, Plus, MessageSquare, Clock, Loader2, CheckCircle, Circle } from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";
import type { Session } from "@/lib/code/opencode-types";

export function SessionsPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const {
    connectionStatus,
    projectName,
    sessions,
    loadSessions,
    selectSession,
    createSession,
    disconnect,
  } = useEditorStore();

  // Redirect if not connected
  useEffect(() => {
    if (connectionStatus !== "connected") {
      navigate({ to: "/code" });
    }
  }, [connectionStatus, navigate]);

  // Load sessions on mount
  useEffect(() => {
    if (connectionStatus === "connected") {
      loadSessions().finally(() => setIsLoading(false));
    }
  }, [connectionStatus, loadSessions]);

  const handleSelectSession = async (session: Session) => {
    await selectSession(session.id);
    navigate({ to: "/code/session/$sessionId", params: { sessionId: session.id } });
  };

  const handleCreateSession = async () => {
    setIsCreating(true);
    try {
      const session = await createSession();
      await selectSession(session.id);
      navigate({ to: "/code/session/$sessionId", params: { sessionId: session.id } });
    } finally {
      setIsCreating(false);
    }
  };

  const handleBack = () => {
    disconnect();
    navigate({ to: "/code" as const });
  };

  // Group sessions by status
  const activeSessions = sessions.filter((s) => !s.title?.includes("[Completed]"));
  const recentSessions = sessions.filter((s) => s.title?.includes("[Completed]"));

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 border-b border-border">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold truncate">Select Session</h1>
          <p className="text-sm text-muted-foreground truncate">{projectName}</p>
        </div>
        <Button size="sm" onClick={handleCreateSession} disabled={isCreating}>
          {isCreating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1" />
              New
            </>
          )}
        </Button>
      </header>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium mb-2">No sessions yet</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Create a new session to start coding
            </p>
            <Button onClick={handleCreateSession} disabled={isCreating}>
              {isCreating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              New Session
            </Button>
          </div>
        ) : (
          <>
            {/* Active Sessions */}
            {activeSessions.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-muted-foreground mb-3">Active Sessions</h2>
                <div className="space-y-2">
                  {activeSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onClick={() => handleSelectSession(session)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Sessions */}
            {recentSessions.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-muted-foreground mb-3">Recent</h2>
                <div className="space-y-2">
                  {recentSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onClick={() => handleSelectSession(session)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Sessions (if no categorization) */}
            {activeSessions.length === 0 && recentSessions.length === 0 && (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onClick={() => handleSelectSession(session)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SessionCard({ session, onClick }: { session: Session; onClick: () => void }) {
  const isCompleted = session.title?.includes("[Completed]");
  const displayTitle = session.title?.replace("[Completed]", "").trim() || "Untitled Session";

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {isCompleted ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <Circle className="h-5 w-5 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{displayTitle}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
            <Clock className="h-3 w-3" />
            <span>{formatDate(session.updatedAt || session.createdAt)}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString();
}
