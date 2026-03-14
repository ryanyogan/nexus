import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Drawer } from "vaul";
import { 
  FolderOpen, 
  MessageSquare, 
  MoreVertical,
  ArrowLeft,
  X
} from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";
import { ChatView } from "@/components/code/chat/ChatView";
import { EditorView } from "@/components/code/editor/EditorView";
import { FileExplorer } from "@/components/code/files/FileExplorer";


interface MobileLayoutProps {
  sessionId: string;
}

export function MobileLayout({ sessionId }: MobileLayoutProps) {
  const navigate = useNavigate();
  const [isFilesOpen, setIsFilesOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const {
    activeView,
    activeFilePath,
    projectName,
    sessions,
    setActiveView,
    closeFile,
    disconnect,
  } = useEditorStore();

  const activeSession = sessions.find((s) => s.id === sessionId);
  const sessionTitle = activeSession?.title || "Untitled Session";

  const handleBack = () => {
    if (activeView === "editor" && activeFilePath) {
      closeFile(activeFilePath);
      setActiveView("chat");
    } else {
      navigate({ to: "/code/sessions" });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    navigate({ to: "/code" as const });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center gap-2 px-3 py-2 border-b border-border bg-background shrink-0">
        <button
          onClick={handleBack}
          className="p-2 -ml-1 rounded-lg hover:bg-muted transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex-1 min-w-0">
          {activeView === "editor" && activeFilePath ? (
            <div className="font-mono text-sm truncate">
              {activeFilePath.split("/").pop()}
            </div>
          ) : (
            <>
              <div className="font-medium text-sm truncate">{sessionTitle}</div>
              <div className="text-xs text-muted-foreground truncate">
                {projectName}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Files button */}
          <button
            onClick={() => setIsFilesOpen(true)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Open files"
          >
            <FolderOpen className="h-5 w-5" />
          </button>

          {/* Chat/Editor toggle */}
          {activeView === "editor" ? (
            <button
              onClick={() => setActiveView("chat")}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Open chat"
            >
              <MessageSquare className="h-5 w-5" />
            </button>
          ) : null}

          {/* Menu */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Menu"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        {activeView === "chat" ? (
          <ChatView sessionId={sessionId} />
        ) : (
          <EditorView />
        )}
      </div>

      {/* Files Drawer */}
      <Drawer.Root open={isFilesOpen} onOpenChange={setIsFilesOpen}>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl outline-none max-h-[85vh] flex flex-col">
          <div className="p-4 border-b border-border shrink-0">
            <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between">
              <Drawer.Title className="font-semibold">Files</Drawer.Title>
              <button
                onClick={() => setIsFilesOpen(false)}
                className="p-2 -mr-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <FileExplorer onFileSelect={() => setIsFilesOpen(false)} />
          </div>
        </Drawer.Content>
      </Drawer.Root>

      {/* Menu Dropdown */}
      {isMenuOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsMenuOpen(false)} 
          />
          <div className="absolute top-14 right-3 z-50 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[160px]">
            <button
              onClick={() => {
                setIsMenuOpen(false);
                navigate({ to: "/code/sessions" });
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors"
            >
              Switch Session
            </button>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                handleDisconnect();
              }}
              className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors"
            >
              Disconnect
            </button>
          </div>
        </>
      )}
    </div>
  );
}
