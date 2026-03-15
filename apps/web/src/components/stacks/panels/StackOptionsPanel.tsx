import { useState } from "react";
import {
  Settings,
  Zap,
  Code2,
  FileCode,
  TestTube,
  FileText,
  MessageSquare,
  Boxes,
  ChevronDown,
  ChevronRight,
  Info,
} from "lucide-react";

// Matches StackPreferences from packages/db/src/schema.ts
export interface StackPreferences {
  // Generation
  useOfficialCLIs?: boolean;
  preferredPackageManager?: "npm" | "pnpm" | "bun" | "yarn" | "cargo" | "mix" | "bundler" | "go";

  // Code Style
  useTypeScript?: boolean;
  strictMode?: boolean;
  preferFunctionalComponents?: boolean;

  // Formatting
  usePrettier?: boolean;
  useESLint?: boolean;
  useBiome?: boolean;

  // Testing
  includeTests?: boolean;
  testingFramework?: "vitest" | "jest" | "playwright" | "rspec" | "exunit";

  // Documentation
  generateReadme?: boolean;
  inlineComments?: "minimal" | "standard" | "verbose";

  // AI Behavior
  verbosity?: "concise" | "balanced" | "detailed";
  codeBlockStyle?: "full-file" | "diff-only" | "snippet";
  explainDecisions?: boolean;

  // Project Structure
  monorepoReady?: boolean;
  preferTurborepo?: boolean;

  // Custom Rules
  customRules?: string[];
}

export type TokenBudget = "minimal" | "standard" | "comprehensive";

export interface StackOptionsPanelProps {
  preferences: StackPreferences;
  tokenBudget: TokenBudget;
  onPreferencesChange: (preferences: StackPreferences) => void;
  onTokenBudgetChange: (budget: TokenBudget) => void;
  readOnly?: boolean;
}

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function Toggle({ label, description, checked, onChange, disabled }: ToggleProps) {
  return (
    <label
      className={`flex items-start gap-3 py-2 ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative mt-0.5 h-5 w-9 shrink-0 border transition-colors ${
          checked
            ? "border-accent bg-accent"
            : "border-border bg-muted"
        } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`absolute top-0.5 h-3.5 w-3.5 bg-background transition-transform ${
            checked ? "left-[18px]" : "left-0.5"
          }`}
        />
      </button>
      <div className="flex-1 min-w-0">
        <div className="font-mono text-xs font-bold uppercase tracking-wide text-foreground">
          {label}
        </div>
        {description && (
          <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
            {description}
          </div>
        )}
      </div>
    </label>
  );
}

interface SelectProps {
  label: string;
  description?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

function Select({ label, description, value, options, onChange, disabled }: SelectProps) {
  return (
    <div className="py-2">
      <div className="font-mono text-xs font-bold uppercase tracking-wide text-foreground mb-1">
        {label}
      </div>
      {description && (
        <div className="font-mono text-[10px] text-muted-foreground mb-2">
          {description}
        </div>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full border border-border bg-background px-3 py-2 font-mono text-xs focus:border-foreground focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, icon, children, defaultOpen = true }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="text-muted-foreground">{icon}</span>
        <span className="flex-1 text-left">{title}</span>
        {isOpen ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
      </button>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

const TOKEN_BUDGET_INFO = {
  minimal: {
    tokens: "~2K",
    description: "Essential patterns only. Best for simple projects or when context is limited.",
    color: "text-green-500",
  },
  standard: {
    tokens: "~5K",
    description: "Balanced coverage with key APIs and patterns. Recommended for most projects.",
    color: "text-amber-500",
  },
  comprehensive: {
    tokens: "~10K",
    description: "Full documentation, examples, and edge cases. Best for complex implementations.",
    color: "text-red-500",
  },
};

export function StackOptionsPanel({
  preferences,
  tokenBudget,
  onPreferencesChange,
  onTokenBudgetChange,
  readOnly = false,
}: StackOptionsPanelProps) {
  const updatePreference = <K extends keyof StackPreferences>(
    key: K,
    value: StackPreferences[K]
  ) => {
    onPreferencesChange({ ...preferences, [key]: value });
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Settings className="h-4 w-4 text-muted-foreground" />
        <span className="font-mono text-xs font-bold uppercase tracking-wider">
          Stack Options
        </span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Token Budget Section */}
        <Section title="Token Budget" icon={<Zap className="h-3.5 w-3.5" />}>
          <div className="space-y-3">
            {(["minimal", "standard", "comprehensive"] as TokenBudget[]).map((budget) => {
              const info = TOKEN_BUDGET_INFO[budget];
              const isSelected = tokenBudget === budget;
              return (
                <button
                  key={budget}
                  onClick={() => !readOnly && onTokenBudgetChange(budget)}
                  disabled={readOnly}
                  className={`w-full border p-3 text-left transition-all ${
                    isSelected
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-foreground/50"
                  } ${readOnly ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold uppercase tracking-wide">
                      {budget}
                    </span>
                    <span className={`font-mono text-xs font-bold ${info.color}`}>
                      {info.tokens}
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {info.description}
                  </p>
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-start gap-2 p-2 border border-border bg-muted/30">
            <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="font-mono text-[10px] text-muted-foreground">
              Token budget affects how much documentation and context is included in the compiled prompt.
              Higher budgets provide more detail but use more context window.
            </p>
          </div>
        </Section>

        {/* Generation Section */}
        <Section title="Generation" icon={<Code2 className="h-3.5 w-3.5" />}>
          <Toggle
            label="Use Official CLIs"
            description="Prefer official CLI tools (create-next-app, cargo new, etc.) over manual setup"
            checked={preferences.useOfficialCLIs ?? true}
            onChange={(v) => updatePreference("useOfficialCLIs", v)}
            disabled={readOnly}
          />
          <Select
            label="Package Manager"
            description="Preferred package manager for dependencies"
            value={preferences.preferredPackageManager ?? "pnpm"}
            options={[
              { value: "npm", label: "npm" },
              { value: "pnpm", label: "pnpm" },
              { value: "bun", label: "Bun" },
              { value: "yarn", label: "Yarn" },
              { value: "cargo", label: "Cargo (Rust)" },
              { value: "mix", label: "Mix (Elixir)" },
              { value: "bundler", label: "Bundler (Ruby)" },
              { value: "go", label: "Go Modules" },
            ]}
            onChange={(v) => updatePreference("preferredPackageManager", v as any)}
            disabled={readOnly}
          />
        </Section>

        {/* Code Style Section */}
        <Section title="Code Style" icon={<FileCode className="h-3.5 w-3.5" />}>
          <Toggle
            label="Use TypeScript"
            description="Generate TypeScript code with type definitions"
            checked={preferences.useTypeScript ?? true}
            onChange={(v) => updatePreference("useTypeScript", v)}
            disabled={readOnly}
          />
          <Toggle
            label="Strict Mode"
            description="Enable strict TypeScript/linting configuration"
            checked={preferences.strictMode ?? true}
            onChange={(v) => updatePreference("strictMode", v)}
            disabled={readOnly}
          />
          <Toggle
            label="Functional Components"
            description="Prefer functional components over class-based"
            checked={preferences.preferFunctionalComponents ?? true}
            onChange={(v) => updatePreference("preferFunctionalComponents", v)}
            disabled={readOnly}
          />
        </Section>

        {/* Formatting Section */}
        <Section title="Formatting" icon={<FileCode className="h-3.5 w-3.5" />} defaultOpen={false}>
          <Toggle
            label="Prettier"
            description="Include Prettier configuration"
            checked={preferences.usePrettier ?? false}
            onChange={(v) => updatePreference("usePrettier", v)}
            disabled={readOnly}
          />
          <Toggle
            label="ESLint"
            description="Include ESLint configuration"
            checked={preferences.useESLint ?? true}
            onChange={(v) => updatePreference("useESLint", v)}
            disabled={readOnly}
          />
          <Toggle
            label="Biome"
            description="Use Biome instead of ESLint + Prettier"
            checked={preferences.useBiome ?? false}
            onChange={(v) => updatePreference("useBiome", v)}
            disabled={readOnly}
          />
        </Section>

        {/* Testing Section */}
        <Section title="Testing" icon={<TestTube className="h-3.5 w-3.5" />} defaultOpen={false}>
          <Toggle
            label="Include Tests"
            description="Generate test files and testing setup"
            checked={preferences.includeTests ?? true}
            onChange={(v) => updatePreference("includeTests", v)}
            disabled={readOnly}
          />
          <Select
            label="Testing Framework"
            description="Preferred testing framework"
            value={preferences.testingFramework ?? "vitest"}
            options={[
              { value: "vitest", label: "Vitest" },
              { value: "jest", label: "Jest" },
              { value: "playwright", label: "Playwright" },
              { value: "rspec", label: "RSpec (Ruby)" },
              { value: "exunit", label: "ExUnit (Elixir)" },
            ]}
            onChange={(v) => updatePreference("testingFramework", v as any)}
            disabled={readOnly}
          />
        </Section>

        {/* Documentation Section */}
        <Section title="Documentation" icon={<FileText className="h-3.5 w-3.5" />} defaultOpen={false}>
          <Toggle
            label="Generate README"
            description="Include README.md with setup instructions"
            checked={preferences.generateReadme ?? true}
            onChange={(v) => updatePreference("generateReadme", v)}
            disabled={readOnly}
          />
          <Select
            label="Inline Comments"
            description="Level of code comments"
            value={preferences.inlineComments ?? "standard"}
            options={[
              { value: "minimal", label: "Minimal - Only complex logic" },
              { value: "standard", label: "Standard - Key sections" },
              { value: "verbose", label: "Verbose - Detailed explanations" },
            ]}
            onChange={(v) => updatePreference("inlineComments", v as any)}
            disabled={readOnly}
          />
        </Section>

        {/* AI Behavior Section */}
        <Section title="AI Behavior" icon={<MessageSquare className="h-3.5 w-3.5" />} defaultOpen={false}>
          <Select
            label="Verbosity"
            description="How verbose AI responses should be"
            value={preferences.verbosity ?? "balanced"}
            options={[
              { value: "concise", label: "Concise - Brief, to the point" },
              { value: "balanced", label: "Balanced - Clear explanations" },
              { value: "detailed", label: "Detailed - Thorough explanations" },
            ]}
            onChange={(v) => updatePreference("verbosity", v as any)}
            disabled={readOnly}
          />
          <Select
            label="Code Block Style"
            description="How code should be presented"
            value={preferences.codeBlockStyle ?? "full-file"}
            options={[
              { value: "full-file", label: "Full File - Complete file contents" },
              { value: "diff-only", label: "Diff Only - Show changes only" },
              { value: "snippet", label: "Snippet - Relevant sections only" },
            ]}
            onChange={(v) => updatePreference("codeBlockStyle", v as any)}
            disabled={readOnly}
          />
          <Toggle
            label="Explain Decisions"
            description="Include explanations for architectural choices"
            checked={preferences.explainDecisions ?? true}
            onChange={(v) => updatePreference("explainDecisions", v)}
            disabled={readOnly}
          />
        </Section>

        {/* Project Structure Section */}
        <Section title="Project Structure" icon={<Boxes className="h-3.5 w-3.5" />} defaultOpen={false}>
          <Toggle
            label="Monorepo Ready"
            description="Structure code for monorepo compatibility"
            checked={preferences.monorepoReady ?? false}
            onChange={(v) => updatePreference("monorepoReady", v)}
            disabled={readOnly}
          />
          <Toggle
            label="Prefer Turborepo"
            description="Use Turborepo for monorepo orchestration"
            checked={preferences.preferTurborepo ?? false}
            onChange={(v) => updatePreference("preferTurborepo", v)}
            disabled={readOnly}
          />
        </Section>
      </div>

      {/* Footer */}
      <div className="border-t border-border p-3">
        <p className="font-mono text-[10px] text-muted-foreground">
          These preferences are included in the compiled prompt to guide AI behavior.
        </p>
      </div>
    </div>
  );
}

export default StackOptionsPanel;
