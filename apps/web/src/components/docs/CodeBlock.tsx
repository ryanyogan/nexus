import { Copy, Check } from "lucide-react";
import { useState, Suspense, lazy } from "react";

// Lazy load the Shiki highlighter - only loads when CodeBlock is rendered
const ShikiHighlighter = lazy(() => import("./ShikiHighlighter"));

interface CodeBlockProps {
  children: string;
  language?: "json" | "typescript" | "javascript" | "bash" | "http" | "text";
  filename?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  children,
  language = "typescript",
  filename,
  showLineNumbers = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const code = children.trim();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative my-4 overflow-hidden rounded-lg border border-border">
      {/* Header with filename */}
      {filename && (
        <div className="flex items-center justify-between border-b border-border bg-muted px-4 py-2">
          <span className="text-xs font-medium text-muted-foreground">
            {filename}
          </span>
        </div>
      )}

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>

      {/* Code content */}
      <div
        className={`overflow-x-auto bg-[#282a36] p-4 text-sm ${
          showLineNumbers ? "line-numbers" : ""
        }`}
      >
        <Suspense
          fallback={
            <pre className="text-neutral-400">
              <code>{code}</code>
            </pre>
          }
        >
          <ShikiHighlighter code={code} language={language} />
        </Suspense>
      </div>

      <style>{`
        .shiki {
          background: transparent !important;
          margin: 0;
        }
        .shiki code {
          counter-reset: line;
          display: block;
        }
        ${
          showLineNumbers
            ? `
          .line-numbers .shiki code .line::before {
            counter-increment: line;
            content: counter(line);
            display: inline-block;
            width: 2rem;
            margin-right: 1rem;
            text-align: right;
            color: #6272a4;
          }
        `
            : ""
        }
      `}</style>
    </div>
  );
}

// Inline code component for smaller code snippets
export function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-md bg-primary/10 px-1.5 py-0.5 text-sm font-mono text-primary">
      {children}
    </code>
  );
}
