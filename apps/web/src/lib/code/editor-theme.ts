import { createTheme } from "@uiw/codemirror-themes";
import { tags as t } from "@lezer/highlight";

// Nexus Light Theme for CodeMirror
export const nexusLightTheme = createTheme({
  theme: "light",
  settings: {
    background: "#ffffff",
    foreground: "#171717",
    caret: "#f97316",
    selection: "#f9731626",
    selectionMatch: "#f9731620",
    lineHighlight: "#f5f5f5",
    gutterBackground: "#ffffff",
    gutterForeground: "#a3a3a3",
    gutterActiveForeground: "#f97316",
    gutterBorder: "transparent",
    fontFamily: '"JetBrains Mono", monospace',
  },
  styles: [
    { tag: t.comment, color: "#737373", fontStyle: "italic" },
    { tag: t.lineComment, color: "#737373", fontStyle: "italic" },
    { tag: t.blockComment, color: "#737373", fontStyle: "italic" },
    { tag: t.docComment, color: "#737373", fontStyle: "italic" },

    { tag: t.keyword, color: "#c026d3" },
    { tag: t.controlKeyword, color: "#c026d3" },
    { tag: t.operatorKeyword, color: "#c026d3" },
    { tag: t.definitionKeyword, color: "#c026d3" },
    { tag: t.moduleKeyword, color: "#c026d3" },

    { tag: t.string, color: "#16a34a" },
    { tag: t.special(t.string), color: "#16a34a" },
    { tag: t.regexp, color: "#ea580c" },

    { tag: t.number, color: "#2563eb" },
    { tag: t.bool, color: "#2563eb" },
    { tag: t.null, color: "#737373" },

    { tag: t.variableName, color: "#171717" },
    { tag: t.definition(t.variableName), color: "#171717", fontWeight: "500" },
    { tag: t.local(t.variableName), color: "#171717" },
    { tag: t.special(t.variableName), color: "#ea580c" },

    { tag: t.function(t.variableName), color: "#dc2626" },
    { tag: t.definition(t.function(t.variableName)), color: "#dc2626", fontWeight: "500" },

    { tag: t.typeName, color: "#0891b2" },
    { tag: t.className, color: "#0891b2" },
    { tag: t.namespace, color: "#0891b2" },

    { tag: t.propertyName, color: "#171717" },
    { tag: t.definition(t.propertyName), color: "#171717" },
    { tag: t.special(t.propertyName), color: "#ea580c" },

    { tag: t.operator, color: "#171717" },
    { tag: t.punctuation, color: "#737373" },
    { tag: t.bracket, color: "#737373" },
    { tag: t.paren, color: "#737373" },
    { tag: t.brace, color: "#737373" },
    { tag: t.squareBracket, color: "#737373" },

    { tag: t.tagName, color: "#dc2626" },
    { tag: t.attributeName, color: "#f97316" },
    { tag: t.attributeValue, color: "#16a34a" },

    { tag: t.heading, color: "#171717", fontWeight: "600" },
    { tag: t.heading1, color: "#171717", fontWeight: "700", fontSize: "1.5em" },
    { tag: t.heading2, color: "#171717", fontWeight: "600", fontSize: "1.3em" },
    { tag: t.heading3, color: "#171717", fontWeight: "600", fontSize: "1.1em" },

    { tag: t.link, color: "#2563eb", textDecoration: "underline" },
    { tag: t.url, color: "#2563eb" },

    { tag: t.emphasis, fontStyle: "italic" },
    { tag: t.strong, fontWeight: "bold" },
    { tag: t.strikethrough, textDecoration: "line-through" },

    { tag: t.invalid, color: "#ef4444" },
    { tag: t.meta, color: "#737373" },
  ],
});

// Nexus Dark Theme for CodeMirror
export const nexusDarkTheme = createTheme({
  theme: "dark",
  settings: {
    background: "#0a0a0a",
    foreground: "#fafafa",
    caret: "#fb923c",
    selection: "#fb923c30",
    selectionMatch: "#fb923c20",
    lineHighlight: "#171717",
    gutterBackground: "#0a0a0a",
    gutterForeground: "#525252",
    gutterActiveForeground: "#fb923c",
    gutterBorder: "transparent",
    fontFamily: '"JetBrains Mono", monospace',
  },
  styles: [
    { tag: t.comment, color: "#6b7280", fontStyle: "italic" },
    { tag: t.lineComment, color: "#6b7280", fontStyle: "italic" },
    { tag: t.blockComment, color: "#6b7280", fontStyle: "italic" },
    { tag: t.docComment, color: "#6b7280", fontStyle: "italic" },

    { tag: t.keyword, color: "#e879f9" },
    { tag: t.controlKeyword, color: "#e879f9" },
    { tag: t.operatorKeyword, color: "#e879f9" },
    { tag: t.definitionKeyword, color: "#e879f9" },
    { tag: t.moduleKeyword, color: "#e879f9" },

    { tag: t.string, color: "#4ade80" },
    { tag: t.special(t.string), color: "#4ade80" },
    { tag: t.regexp, color: "#fb923c" },

    { tag: t.number, color: "#60a5fa" },
    { tag: t.bool, color: "#60a5fa" },
    { tag: t.null, color: "#6b7280" },

    { tag: t.variableName, color: "#fafafa" },
    { tag: t.definition(t.variableName), color: "#fafafa", fontWeight: "500" },
    { tag: t.local(t.variableName), color: "#fafafa" },
    { tag: t.special(t.variableName), color: "#fb923c" },

    { tag: t.function(t.variableName), color: "#f87171" },
    { tag: t.definition(t.function(t.variableName)), color: "#f87171", fontWeight: "500" },

    { tag: t.typeName, color: "#22d3ee" },
    { tag: t.className, color: "#22d3ee" },
    { tag: t.namespace, color: "#22d3ee" },

    { tag: t.propertyName, color: "#fafafa" },
    { tag: t.definition(t.propertyName), color: "#fafafa" },
    { tag: t.special(t.propertyName), color: "#fb923c" },

    { tag: t.operator, color: "#fafafa" },
    { tag: t.punctuation, color: "#6b7280" },
    { tag: t.bracket, color: "#6b7280" },
    { tag: t.paren, color: "#6b7280" },
    { tag: t.brace, color: "#6b7280" },
    { tag: t.squareBracket, color: "#6b7280" },

    { tag: t.tagName, color: "#f87171" },
    { tag: t.attributeName, color: "#fb923c" },
    { tag: t.attributeValue, color: "#4ade80" },

    { tag: t.heading, color: "#fafafa", fontWeight: "600" },
    { tag: t.heading1, color: "#fafafa", fontWeight: "700", fontSize: "1.5em" },
    { tag: t.heading2, color: "#fafafa", fontWeight: "600", fontSize: "1.3em" },
    { tag: t.heading3, color: "#fafafa", fontWeight: "600", fontSize: "1.1em" },

    { tag: t.link, color: "#60a5fa", textDecoration: "underline" },
    { tag: t.url, color: "#60a5fa" },

    { tag: t.emphasis, fontStyle: "italic" },
    { tag: t.strong, fontWeight: "bold" },
    { tag: t.strikethrough, textDecoration: "line-through" },

    { tag: t.invalid, color: "#f87171" },
    { tag: t.meta, color: "#6b7280" },
  ],
});

// Get theme based on dark mode
export function getEditorTheme(isDark: boolean) {
  return isDark ? nexusDarkTheme : nexusLightTheme;
}
