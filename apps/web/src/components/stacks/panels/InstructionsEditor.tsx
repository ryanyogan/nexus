import { useState, useCallback } from "react";
import { FileText, Copy, Check, Maximize2, Minimize2 } from "lucide-react";

export interface InstructionsEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

export function InstructionsEditor({
  value,
  onChange,
  readOnly = false,
  placeholder = "Enter your stack instructions here...\n\nYou can include:\n- Project setup guidelines\n- Coding conventions\n- Architecture decisions\n- Tool preferences\n- Any other context for AI assistants",
}: InstructionsEditorProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [value]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // Line numbers
  const lineCount = value.split("\n").length || 1;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 20) }, (_, i) => i + 1);

  return (
    <div
      className={`flex flex-col border border-border bg-background ${
        isFullscreen ? "fixed inset-4 z-50 shadow-2xl" : "h-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider">
            Instructions
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            ({value.length} chars, {lineCount} lines)
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            title="Copy"
          >
            {isCopied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            onClick={toggleFullscreen}
            className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex flex-1 overflow-hidden">
        {/* Line numbers */}
        <div className="flex-shrink-0 select-none border-r border-border bg-muted/30 px-3 py-3 text-right">
          {lineNumbers.map((num) => (
            <div
              key={num}
              className="font-mono text-[11px] leading-[1.6] text-muted-foreground/50"
            >
              {num}
            </div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          placeholder={placeholder}
          className="flex-1 resize-none bg-transparent p-3 font-mono text-[11px] leading-[1.6] text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          spellCheck={false}
        />
      </div>

      {/* Footer hints */}
      <div className="border-t border-border px-4 py-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-muted-foreground">
            Markdown supported. Instructions will be included in the compiled prompt.
          </span>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-muted-foreground">
              Token estimate: ~{Math.ceil(value.length / 4)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstructionsEditor;
