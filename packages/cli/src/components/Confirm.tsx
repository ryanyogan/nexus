import React, { useState } from "react";
import { Box, Text, useInput } from "ink";

export interface ConfirmProps {
  message: string;
  onConfirm: (confirmed: boolean) => void;
  defaultValue?: boolean;
}

export function Confirm({ message, onConfirm, defaultValue = false }: ConfirmProps) {
  const [value, setValue] = useState(defaultValue);

  useInput((input, key) => {
    if (input === "y" || input === "Y") {
      setValue(true);
      onConfirm(true);
    } else if (input === "n" || input === "N") {
      setValue(false);
      onConfirm(false);
    } else if (key.leftArrow || key.rightArrow) {
      setValue(!value);
    } else if (key.return) {
      onConfirm(value);
    }
  });

  return (
    <Box>
      <Text>{message} </Text>
      <Text color={value ? "green" : "gray"} bold={value}>
        Yes
      </Text>
      <Text color="gray"> / </Text>
      <Text color={!value ? "red" : "gray"} bold={!value}>
        No
      </Text>
      <Text color="gray" dimColor>
        {" "}
        (y/n)
      </Text>
    </Box>
  );
}
