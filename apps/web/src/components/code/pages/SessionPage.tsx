import { useEffect, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useEditorStore } from "@/stores/editor-store";
import { MobileLayout } from "@/components/code/layout/MobileLayout";

interface SessionPageProps {
  sessionId: string;
}

export function SessionPage({ sessionId }: SessionPageProps) {
  const navigate = useNavigate();

  const { connectionStatus, activeSessionId, selectSession, client } = useEditorStore();

  // Redirect if not connected
  useEffect(() => {
    if (connectionStatus !== "connected") {
      navigate({ to: "/code" as const });
    }
  }, [connectionStatus, navigate]);

  // Load session if not already active
  useEffect(() => {
    if (connectionStatus === "connected" && sessionId !== activeSessionId) {
      selectSession(sessionId);
    }
  }, [connectionStatus, sessionId, activeSessionId, selectSession]);

  // Handle SSE events
  const handleEvent = useCallback(
    (event: { type: string; properties?: unknown }) => {
      const store = useEditorStore.getState();

      switch (event.type) {
        case "message.part.updated": {
          const props = event.properties as {
            sessionID: string;
            messageID: string;
            part: { type: string; text?: string };
            delta?: string;
          };

          if (props.sessionID === sessionId && props.part.type === "text" && props.delta) {
            store.appendStreamingContent(props.delta);
          }
          break;
        }

        case "message.updated":
        case "message.created": {
          const props = event.properties as {
            info: { id: string; sessionID: string };
            parts: unknown[];
          };

          if (props.info.sessionID === sessionId) {
            // Reload messages to get the latest
            store.loadMessages(sessionId);
            store.setIsStreaming(false);
            store.setStreamingContent("");
          }
          break;
        }

        case "todo.updated": {
          const props = event.properties as {
            sessionID: string;
            todos: {
              id: string;
              content: string;
              status: string;
              priority: string;
            }[];
          };

          if (props.sessionID === sessionId) {
            store.updateTodos(
              props.todos as {
                id: string;
                content: string;
                status: "pending" | "in_progress" | "completed" | "cancelled";
                priority: "high" | "medium" | "low";
              }[]
            );
          }
          break;
        }

        case "file.edited": {
          const props = event.properties as { file: string };
          // Refresh file if it's open
          const openFiles = store.openFiles;
          if (openFiles.has(props.file)) {
            store.openFile(props.file);
          }
          break;
        }

        case "session.status": {
          const props = event.properties as {
            sessionID: string;
            status: { type: string };
          };

          if (props.sessionID === sessionId) {
            if (props.status.type === "idle") {
              store.setIsStreaming(false);
            }
          }
          break;
        }
      }
    },
    [sessionId]
  );

  // Subscribe to SSE events
  useEffect(() => {
    if (!client || connectionStatus !== "connected") return;

    let eventSource: EventSource | null = null;

    const setupEvents = async () => {
      try {
        eventSource = await client.events.subscribe();

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            handleEvent(data);
          } catch (e) {
            console.error("Failed to parse event:", e);
          }
        };

        eventSource.onerror = (error) => {
          console.error("SSE error:", error);
          // Reconnect after a delay
          setTimeout(setupEvents, 3000);
        };
      } catch (error) {
        console.error("Failed to subscribe to events:", error);
      }
    };

    setupEvents();

    return () => {
      eventSource?.close();
    };
  }, [client, connectionStatus, handleEvent]);

  // For now, always use mobile layout
  // TODO: Add TabletLayout when isTablet
  return <MobileLayout sessionId={sessionId} />;
}
