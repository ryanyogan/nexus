import { useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { markdown } from "@codemirror/lang-markdown";
import { python } from "@codemirror/lang-python";
import { rust } from "@codemirror/lang-rust";
import { go } from "@codemirror/lang-go";
import { java } from "@codemirror/lang-java";
import { EditorView as CMEditorView } from "@codemirror/view";
import { Loader2 } from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";
import { getEditorTheme } from "@/lib/editor/theme";

export function EditorView() {
  const [isDark, setIsDark] = useState(false);
  
  const {
    activeFilePath,
    openFiles,
  } = useEditorStore();

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

  const extensions = [
    getLanguageExtension(file.language),
    CMEditorView.lineWrapping,
    CMEditorView.editable.of(false), // Read-only
  ].filter(Boolean);

  return (
    <div className="h-full flex flex-col">
      <CodeMirror
        value={file.content}
        height="100%"
        theme={getEditorTheme(isDark)}
        extensions={extensions as any[]}
        readOnly
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          foldGutter: true,
          drawSelection: true,
          dropCursor: false,
          allowMultipleSelections: false,
          indentOnInput: false,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: false,
          autocompletion: false,
          rectangularSelection: false,
          crosshairCursor: false,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: false,
          searchKeymap: true,
          foldKeymap: true,
          completionKeymap: false,
          lintKeymap: false,
        }}
        className="flex-1 overflow-hidden [&_.cm-editor]:h-full [&_.cm-scroller]:!overflow-auto"
      />
    </div>
  );
}

function getLanguageExtension(language: string) {
  switch (language) {
    case "javascript":
      return javascript({ jsx: true });
    case "typescript":
      return javascript({ jsx: true, typescript: true });
    case "json":
      return json();
    case "html":
      return html();
    case "css":
      return css();
    case "markdown":
      return markdown();
    case "python":
      return python();
    case "rust":
      return rust();
    case "go":
      return go();
    case "java":
      return java();
    default:
      return null;
  }
}
