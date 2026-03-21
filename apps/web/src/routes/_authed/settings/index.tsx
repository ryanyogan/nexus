import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { FileText, Code, Zap, Save, Check, AlertCircle, Loader2 } from "lucide-react";
import {
  usePreferences,
  useUpdatePreferences,
  type ResponseFormat,
  type UserPreferences,
} from "../../../hooks/use-dashboard-queries";

export const Route = createFileRoute("/_authed/settings/")({
  component: SettingsPage,
});

const RESPONSE_FORMAT_OPTIONS: {
  value: ResponseFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "full",
    label: "Full",
    description: "Complete documentation with all metadata and context",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    value: "compact",
    label: "Compact",
    description: "Essential data only, minimal formatting",
    icon: <Zap className="h-5 w-5" />,
  },
  {
    value: "code-only",
    label: "Code Only",
    description: "Only code blocks and essential context",
    icon: <Code className="h-5 w-5" />,
  },
  {
    value: "summary",
    label: "Summary",
    description: "Brief summary with key points",
    icon: <FileText className="h-5 w-5" />,
  },
];

const CODE_LANGUAGES = [
  { value: "", label: "Auto-detect" },
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "ruby", label: "Ruby" },
  { value: "php", label: "PHP" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
];

function SettingsPage() {
  const [saved, setSaved] = useState(false);

  // Query
  const { data: serverPreferences, isPending, isError, error } = usePreferences();

  // Local state for editing (initialized from query)
  const [preferences, setPreferences] = useState<UserPreferences>({
    defaultResponseFormat: "full",
    defaultTokenBudget: null,
    showCodeLineNumbers: true,
    preferredCodeLanguage: "",
    emailNotifications: true,
    emailWeeklyDigest: false,
  });

  // Sync local state when server data loads
  useEffect(() => {
    if (serverPreferences) {
      setPreferences(serverPreferences);
    }
  }, [serverPreferences]);

  // Mutation
  const updateMutation = useUpdatePreferences();

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(preferences);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // Error handled by mutation state
    }
  };

  // Get the current error message
  const errorMessage =
    updateMutation.error?.message || (isError ? (error as Error)?.message : null);

  if (isPending) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">Settings</h1>
        <p className="mt-1 text-stone-600">Customize your Nexus experience</p>
      </div>

      {/* Response Format Section */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-stone-900">Default Response Format</h2>
        <p className="mb-4 text-sm text-stone-600">
          Choose how documentation is returned when using the MCP tools
        </p>

        <div className="space-y-2">
          {RESPONSE_FORMAT_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                preferences.defaultResponseFormat === option.value
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-stone-200 hover:border-stone-300 hover:bg-stone-50"
              }`}
            >
              <input
                type="radio"
                name="responseFormat"
                value={option.value}
                checked={preferences.defaultResponseFormat === option.value}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    defaultResponseFormat: e.target.value as ResponseFormat,
                  })
                }
                className="sr-only"
              />
              <div
                className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                  preferences.defaultResponseFormat === option.value
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-stone-300"
                }`}
              >
                {preferences.defaultResponseFormat === option.value && (
                  <div className="h-2 w-2 rounded-full bg-white" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`${
                      preferences.defaultResponseFormat === option.value
                        ? "text-emerald-700"
                        : "text-stone-500"
                    }`}
                  >
                    {option.icon}
                  </span>
                  <span className="font-medium text-stone-900">{option.label}</span>
                </div>
                <p className="mt-0.5 text-sm text-stone-600">{option.description}</p>
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* Token Budget Section */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-stone-900">Token Budget</h2>
        <p className="mb-4 text-sm text-stone-600">
          Limit the maximum tokens returned per query (leave empty for no limit)
        </p>

        <div className="flex items-center gap-4">
          <input
            type="number"
            value={preferences.defaultTokenBudget ?? ""}
            onChange={(e) =>
              setPreferences({
                ...preferences,
                defaultTokenBudget: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            placeholder="No limit"
            min={100}
            max={100000}
            step={100}
            className="w-40 rounded-lg border border-stone-300 px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <span className="text-sm text-stone-600">tokens</span>
        </div>
      </section>

      {/* Code Preferences Section */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-stone-900">Code Preferences</h2>

        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={preferences.showCodeLineNumbers}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  showCodeLineNumbers: e.target.checked,
                })
              }
              className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-stone-900">Show line numbers in code blocks</span>
          </label>

          <div>
            <label className="mb-2 block text-sm text-stone-700">Preferred code language</label>
            <select
              value={preferences.preferredCodeLanguage}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  preferredCodeLanguage: e.target.value,
                })
              }
              className="w-48 rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {CODE_LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Email Preferences Section */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-stone-900">Email Preferences</h2>

        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={preferences.emailNotifications}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  emailNotifications: e.target.checked,
                })
              }
              className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
            />
            <div>
              <span className="text-stone-900">Email notifications</span>
              <p className="text-sm text-stone-600">
                Receive updates about your account and submissions
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={preferences.emailWeeklyDigest}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  emailWeeklyDigest: e.target.checked,
                })
              }
              className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
            />
            <div>
              <span className="text-stone-900">Weekly digest</span>
              <p className="text-sm text-stone-600">Get a summary of new libraries and features</p>
            </div>
          </label>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-4 border-t border-stone-200 pt-6">
        {errorMessage && (
          <span className="flex items-center gap-1 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {errorMessage}
          </span>
        )}
        {saved && (
          <span className="flex items-center gap-1 text-sm text-emerald-600">
            <Check className="h-4 w-4" />
            Saved
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
