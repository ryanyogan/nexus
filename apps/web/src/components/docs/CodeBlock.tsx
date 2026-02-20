import { createHighlighterCoreSync } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

// Import languages
import langJson from "shiki/langs/json.mjs";
import langTypescript from "shiki/langs/typescript.mjs";
import langJavascript from "shiki/langs/javascript.mjs";
import langBash from "shiki/langs/bash.mjs";
import langHttp from "shiki/langs/http.mjs";

// Import theme
import themeDracula from "shiki/themes/dracula.mjs";

// Create highlighter synchronously for SSR
const highlighter = createHighlighterCoreSync({
  themes: [themeDracula],
  langs: [langJson, langTypescript, langJavascript, langBash, langHttp],
  engine: createJavaScriptRegexEngine(),
});

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

  // Generate highlighted HTML
  let highlightedHtml: string;
  try {
    if (language === "text") {
      highlightedHtml = `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`;
    } else {
      highlightedHtml = highlighter.codeToHtml(code, {
        lang: language,
        theme: "dracula",
      });
    }
  } catch {
    // Fallback for unsupported languages
    highlightedHtml = `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`;
  }

  return (
    <div
      className="group relative my-4 overflow-hidden rounded-lg border border-border/50"
      style={{
        boxShadow: "inset 0 0 30px rgba(139, 92, 246, 0.05)",
      }}
    >
      {/* Header with filename */}
      {filename && (
        <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-4 py-2">
          <span className="text-xs font-medium text-muted-foreground">
            {filename}
          </span>
        </div>
      )}

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-md border border-border/50 bg-card/80 text-muted-foreground opacity-0 transition-all hover:border-primary/50 hover:text-foreground group-hover:opacity-100"
        style={copied ? { boxShadow: "0 0 15px rgba(34, 197, 94, 0.3)" } : {}}
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-400" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>

      {/* Code content */}
      <div
        className={`overflow-x-auto bg-[#282a36] p-4 text-sm ${
          showLineNumbers ? "line-numbers" : ""
        }`}
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />

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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
