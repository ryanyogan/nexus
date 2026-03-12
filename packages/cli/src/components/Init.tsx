import React, { useState } from "react";
import { Box, Text, render } from "ink";
import figures from "figures";
import { MultiSelect, type MultiSelectItem } from "./MultiSelect.js";
import { Confirm } from "./Confirm.js";
import { Spinner } from "./Spinner.js";
import type { EditorId } from "../utils/paths.js";
import {
  setEditors,
  isAuthenticated,
  getAuth,
} from "../services/config.js";
import { createAdapter } from "../adapters/index.js";

type Step = "welcome" | "editors" | "configure" | "complete";

interface EditorOption {
  id: EditorId;
  name: string;
  description: string;
}

const EDITORS: EditorOption[] = [
  {
    id: "claude-code",
    name: "Claude Code",
    description: "Anthropic's official CLI for Claude",
  },
  {
    id: "cursor",
    name: "Cursor",
    description: "The AI-first code editor",
  },
  {
    id: "opencode",
    name: "OpenCode",
    description: "Open-source AI code editor",
  },
  {
    id: "vscode",
    name: "VS Code",
    description: "Visual Studio Code with Copilot",
  },
  {
    id: "zed",
    name: "Zed",
    description: "High-performance code editor",
  },
];

export interface InitProps {
  onComplete: (editors: EditorId[]) => void;
}

export function Init({ onComplete }: InitProps) {
  const [step, setStep] = useState<Step>("welcome");
  const [selectedEditors, setSelectedEditors] = useState<EditorId[]>([]);
  const [configuring, setConfiguring] = useState(false);
  const [configuredEditors, setConfiguredEditors] = useState<string[]>([]);
  const [configErrors, setConfigErrors] = useState<string[]>([]);

  const auth = getAuth();
  const authenticated = isAuthenticated();

  // Welcome step - auto-advance after a moment
  React.useEffect(() => {
    if (step === "welcome") {
      const timer = setTimeout(() => setStep("editors"), 100);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleEditorsSubmit = (editors: EditorId[]) => {
    setSelectedEditors(editors);
    setEditors(editors);

    if (editors.length === 0) {
      setStep("complete");
    } else {
      setStep("configure");
    }
  };

  const handleConfigureConfirm = async (confirmed: boolean) => {
    if (!confirmed) {
      setStep("complete");
      return;
    }

    setConfiguring(true);
    const configured: string[] = [];
    const errors: string[] = [];

    for (const editorId of selectedEditors) {
      try {
        const adapter = createAdapter(editorId);
        if (adapter) {
          // For now, just log what would be configured
          // In real usage, this would call adapter.configure()
          configured.push(adapter.displayName);
        }
      } catch (err) {
        errors.push(`${editorId}: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }

    setConfiguredEditors(configured);
    setConfigErrors(errors);
    setConfiguring(false);
    setStep("complete");
  };

  const editorItems: MultiSelectItem<EditorId>[] = EDITORS.map((e) => ({
    label: e.name,
    value: e.id,
    description: e.description,
  }));

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box flexDirection="column" marginBottom={1}>
        <Text bold color="cyan">
          {figures.star} Welcome to Nexus!
        </Text>
        <Text color="gray">The AI Documentation & Skills Hub</Text>
      </Box>

      {/* Auth status */}
      <Box marginBottom={1}>
        {authenticated ? (
          <Text color="green">
            {figures.tick} Authenticated as {auth?.email}
          </Text>
        ) : (
          <Text color="yellow">
            {figures.warning} Not logged in - run `nexus auth login` to authenticate
          </Text>
        )}
      </Box>

      {/* Step: Editor Selection */}
      {step === "editors" && (
        <Box flexDirection="column">
          <MultiSelect<EditorId>
            items={editorItems}
            onSubmit={handleEditorsSubmit}
            initialSelected={["claude-code", "cursor"]}
            title="Select your editors:"
            hint="Space to toggle, Enter to confirm"
          />
        </Box>
      )}

      {/* Step: Configure */}
      {step === "configure" && !configuring && (
        <Box flexDirection="column">
          <Text color="cyan" bold>Selected Editors:</Text>
          {selectedEditors.map((id) => {
            const editor = EDITORS.find((e) => e.id === id);
            return (
              <Text key={id} color="gray">
                {"  "}{figures.pointer} {editor?.name}
              </Text>
            );
          })}
          <Box marginTop={1}>
            <Confirm
              message="Configure MCP server in these editors now?"
              onConfirm={handleConfigureConfirm}
              defaultValue={true}
            />
          </Box>
        </Box>
      )}

      {step === "configure" && configuring && (
        <Box flexDirection="column">
          <Spinner label="Configuring editors..." />
        </Box>
      )}

      {/* Step: Complete */}
      {step === "complete" && (
        <Box flexDirection="column">
          <Text color="green" bold>
            {figures.tick} Nexus is ready!
          </Text>

          {configuredEditors.length > 0 && (
            <Box flexDirection="column" marginTop={1}>
              <Text color="cyan">Configured:</Text>
              {configuredEditors.map((name) => (
                <Text key={name} color="gray">
                  {"  "}{figures.tick} {name}
                </Text>
              ))}
            </Box>
          )}

          {configErrors.length > 0 && (
            <Box flexDirection="column" marginTop={1}>
              <Text color="red">Errors:</Text>
              {configErrors.map((err, i) => (
                <Text key={i} color="red">
                  {"  "}{figures.cross} {err}
                </Text>
              ))}
            </Box>
          )}

          <Box flexDirection="column" marginTop={1}>
            <Text color="gray" dimColor>Quick commands:</Text>
            <Text color="cyan">  nexus docs search react hooks</Text>
            <Text color="cyan">  nexus skills list</Text>
            <Text color="cyan">  nexus servers list</Text>
            <Text color="cyan">  nexus stats</Text>
          </Box>

          {/* Auto-exit after showing complete */}
          <ExitOnComplete onComplete={() => onComplete(selectedEditors)} />
        </Box>
      )}
    </Box>
  );
}

// Helper component to exit after a short delay
function ExitOnComplete({ onComplete }: { onComplete: () => void }) {
  React.useEffect(() => {
    const timer = setTimeout(onComplete, 500);
    return () => clearTimeout(timer);
  }, [onComplete]);
  return null;
}

// Helper to run the Init component
export function runInit(): Promise<EditorId[]> {
  return new Promise((resolve) => {
    const { unmount } = render(
      <Init
        onComplete={(editors) => {
          unmount();
          resolve(editors);
        }}
      />
    );
  });
}
