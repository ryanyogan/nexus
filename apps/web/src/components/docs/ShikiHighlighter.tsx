import { createHighlighterCoreSync } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

// Import languages
import langJson from "shiki/langs/json.mjs";
import langTypescript from "shiki/langs/typescript.mjs";
import langJavascript from "shiki/langs/javascript.mjs";
import langTsx from "shiki/langs/tsx.mjs";
import langBash from "shiki/langs/bash.mjs";
import langHttp from "shiki/langs/http.mjs";

// Import theme
import themeDracula from "shiki/themes/dracula.mjs";

// Create highlighter synchronously
const highlighter = createHighlighterCoreSync({
  themes: [themeDracula],
  langs: [langJson, langTypescript, langJavascript, langTsx, langBash, langHttp],
  engine: createJavaScriptRegexEngine(),
});

interface ShikiHighlighterProps {
  code: string;
  language: "json" | "typescript" | "javascript" | "tsx" | "bash" | "http" | "text";
}

export default function ShikiHighlighter({ code, language }: ShikiHighlighterProps) {
  if (language === "text") {
    return (
      <pre className="shiki">
        <code>{code}</code>
      </pre>
    );
  }

  try {
    const html = highlighter.codeToHtml(code, {
      lang: language,
      theme: "dracula",
    });

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  } catch {
    // Fallback for unsupported languages
    return (
      <pre className="shiki">
        <code>{code}</code>
      </pre>
    );
  }
}
