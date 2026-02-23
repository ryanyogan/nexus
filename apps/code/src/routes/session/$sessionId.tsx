import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useCallback } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { MobileLayout } from "@/components/layout/MobileLayout";
// import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

export const Route = createFileRoute("/session/$sessionId")({
  component: SessionPage,
});

function SessionPage() {
  const { sessionId } = Route.useParams();
  const navigate = useNavigate();
  // const isTablet = useMediaQuery("(min-width: 768px)"); // TODO: Use for tablet layout
  
  const {
    connectionStatus,
    activeSessionId,
    selectSession,
    client,
  } = useEditorStore();

  // Redirect if not connected
  useEffect(() => {
    if (connectionStatus !== "connected") {
      navigate({ to: "/" });
    }
  }, [connectionStatus, navigate]);

  // Load session if not already active
  useEffect(() => {
    if (connectionStatus === "connected" && sessionId !== activeSessionId) {
      selectSession(sessionId);
    }
  }, [connectionStatus, sessionId, activeSessionId, selectSession]);

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
  }, [client, connectionStatus]);

  const handleEvent = useCallback((event: { type: string; properties?: unknown }) => {
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
          todos: { id: string; content: string; status: string; priority: string }[];
        };
        
        if (props.sessionID === sessionId) {
          store.updateTodos(props.todos as any);
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
  }, [sessionId]);

  // For now, always use mobile layout
  // TODO: Add TabletLayout when isTablet
  return <MobileLayout sessionId={sessionId} />;
}
