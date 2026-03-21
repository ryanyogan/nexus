import { useEffect, useState, lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";

// Lazy load CodeMirror to keep initial bundle small
const CodeMirrorEditor = lazy(() => import("./CodeMirrorEditor"));

export function EditorView() {
  const [isDark, setIsDark] = useState(false);

  const { activeFilePath, openFiles } = useEditorStore();

  // Detect dark mode
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    checkDarkMode();

    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  if (!activeFilePath) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>Select a file to view</p>
      </div>
    );
  }

  const file = openFiles.get(activeFilePath);

  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <CodeMirrorEditor content={file.content} language={file.language} isDark={isDark} />
      </Suspense>
    </div>
  );
}
