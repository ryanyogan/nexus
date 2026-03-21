import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Square, FileCode, CheckCircle, Circle, Clock } from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";
import { Button } from "@nexus/ui/components/button";
import type { Message, Todo } from "@/lib/code/opencode-types";

interface ChatViewProps {
  sessionId: string;
}

export function ChatView({ sessionId: _sessionId }: ChatViewProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, todos, isStreaming, streamingContent, sendMessage, abortSession, openFile } =
    useEditorStore();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const text = input.trim();
    setInput("");

    try {
      await sendMessage(text);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} onFileClick={openFile} />
        ))}

        {/* Streaming message */}
        {isStreaming && streamingContent && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-medium text-primary">AI</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="bg-muted rounded-lg px-4 py-3">
                <p className="whitespace-pre-wrap break-words">{streamingContent}</p>
                <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
              </div>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isStreaming && !streamingContent && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-medium text-primary">AI</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="bg-muted rounded-lg px-4 py-3">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Todos */}
      {todos.length > 0 && (
        <div className="px-4 py-2 border-t border-border bg-muted/30">
          <div className="text-xs font-medium text-muted-foreground mb-2">Tasks</div>
          <div className="space-y-1">
            {todos.slice(0, 3).map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
            {todos.length > 3 && (
              <div className="text-xs text-muted-foreground">+{todos.length - 3} more</div>
            )}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border bg-background">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask OpenCode..."
              disabled={isStreaming}
              rows={1}
              className="w-full resize-none rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              style={{ minHeight: "44px", maxHeight: "120px" }}
            />
          </div>

          {isStreaming ? (
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={abortSession}
              className="shrink-0 h-11 w-11"
            >
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim()}
              className="shrink-0 h-11 w-11"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  onFileClick,
}: {
  message: Message;
  onFileClick: (path: string) => void;
}) {
  const isUser = message.role === "user";

  // Extract text content
  const textParts = message.parts.filter(
    (p): p is { type: "text"; text: string } => p.type === "text"
  );
  const text = textParts.map((p) => p.text).join("\n");

  // Extract file references from tool calls
  const fileParts = message.parts.filter(
    (p) =>
      (p.type === "tool-call" || p.type === "tool-result") &&
      ((p as { name?: string }).name?.includes("file") ||
        (p as { name?: string }).name?.includes("edit") ||
        (p as { name?: string }).name?.includes("read"))
  );

  // Extract unique file paths mentioned
  const filePaths = new Set<string>();
  fileParts.forEach((p) => {
    if (p.type === "tool-call") {
      const toolCall = p as { type: "tool-call"; args?: Record<string, unknown> };
      if (toolCall.args) {
        const path =
          (toolCall.args as Record<string, unknown>).path ||
          (toolCall.args as Record<string, unknown>).filePath;
        if (typeof path === "string") filePaths.add(path);
      }
    }
  });

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser ? "bg-primary text-primary-foreground" : "bg-primary/10"
        }`}
      >
        <span className="text-xs font-medium">{isUser ? "You" : "AI"}</span>
      </div>

      <div className={`flex-1 min-w-0 ${isUser ? "text-right" : ""}`}>
        <div
          className={`inline-block rounded-lg px-4 py-3 max-w-full ${
            isUser ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}
        >
          {text && <p className="whitespace-pre-wrap break-words text-left">{text}</p>}

          {/* File pills */}
          {filePaths.size > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {Array.from(filePaths).map((path) => (
                <button
                  key={path}
                  onClick={() => onFileClick(path)}
                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono ${
                    isUser
                      ? "bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground"
                      : "bg-background hover:bg-background/80 text-foreground border border-border"
                  } transition-colors`}
                >
                  <FileCode className="h-3 w-3" />
                  <span className="truncate max-w-[150px]">{path.split("/").pop()}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TodoItem({ todo }: { todo: Todo }) {
  const statusIcon = {
    completed: <CheckCircle className="h-3.5 w-3.5 text-green-500" />,
    in_progress: <Clock className="h-3.5 w-3.5 text-primary animate-pulse" />,
    pending: <Circle className="h-3.5 w-3.5 text-muted-foreground" />,
    cancelled: <Circle className="h-3.5 w-3.5 text-muted-foreground line-through" />,
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      {statusIcon[todo.status]}
      <span className={todo.status === "completed" ? "line-through text-muted-foreground" : ""}>
        {todo.content}
      </span>
    </div>
  );
}
