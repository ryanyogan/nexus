import React from "react";
import { Box, Text } from "ink";
import InkSpinner from "ink-spinner";

export interface SpinnerProps {
  label?: string;
  type?: "dots" | "line" | "arc" | "circle";
}

export function Spinner({ label, type = "dots" }: SpinnerProps) {
  return (
    <Box>
      <Text color="cyan">
        <InkSpinner type={type} />
      </Text>
      {label && <Text color="gray"> {label}</Text>}
    </Box>
  );
}
