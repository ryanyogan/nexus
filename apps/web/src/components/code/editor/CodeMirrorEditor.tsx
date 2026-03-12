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
import { getEditorTheme } from "@/lib/code/editor-theme";

interface CodeMirrorEditorProps {
  content: string;
  language: string;
  isDark: boolean;
}

export default function CodeMirrorEditor({ content, language, isDark }: CodeMirrorEditorProps) {
  const extensions = [
    getLanguageExtension(language),
    CMEditorView.lineWrapping,
    CMEditorView.editable.of(false), // Read-only
  ].filter(Boolean);

  return (
    <CodeMirror
      value={content}
      height="100%"
      theme={getEditorTheme(isDark)}
      extensions={extensions as ReturnType<typeof javascript>[]}
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
