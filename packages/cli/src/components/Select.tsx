import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import figures from "figures";

export interface SelectItem<T = string> {
  label: string;
  value: T;
  description?: string;
}

export interface SelectProps<T = string> {
  items: SelectItem<T>[];
  onSelect: (value: T) => void;
  title?: string;
  hint?: string;
  maxVisible?: number;
}

export function Select<T = string>({
  items,
  onSelect,
  title,
  hint = "Use arrow keys, Enter to select",
  maxVisible = 8,
}: SelectProps<T>) {
  const [cursor, setCursor] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) {
      const newCursor = cursor > 0 ? cursor - 1 : items.length - 1;
      setCursor(newCursor);

      if (newCursor < scrollOffset) {
        setScrollOffset(newCursor);
      } else if (newCursor >= scrollOffset + maxVisible) {
        setScrollOffset(newCursor - maxVisible + 1);
      }
    }

    if (key.downArrow) {
      const newCursor = cursor < items.length - 1 ? cursor + 1 : 0;
      setCursor(newCursor);

      if (newCursor >= scrollOffset + maxVisible) {
        setScrollOffset(newCursor - maxVisible + 1);
      } else if (newCursor < scrollOffset) {
        setScrollOffset(newCursor);
      }
    }

    if (key.return) {
      onSelect(items[cursor].value);
    }
  });

  const visibleItems = items.slice(scrollOffset, scrollOffset + maxVisible);
  const showScrollUp = scrollOffset > 0;
  const showScrollDown = scrollOffset + maxVisible < items.length;

  return (
    <Box flexDirection="column">
      {title && (
        <Box marginBottom={1}>
          <Text bold color="cyan">
            {title}
          </Text>
        </Box>
      )}

      {showScrollUp && (
        <Box>
          <Text color="gray"> {figures.arrowUp} more items above</Text>
        </Box>
      )}

      {visibleItems.map((item, index) => {
        const actualIndex = index + scrollOffset;
        const isCursor = actualIndex === cursor;

        return (
          <Box key={String(item.value)} flexDirection="column">
            <Box>
              <Text color={isCursor ? "cyan" : undefined}>{isCursor ? figures.pointer : " "} </Text>
              <Text color={isCursor ? "cyan" : undefined}>{item.label}</Text>
            </Box>
            {item.description && isCursor && (
              <Box marginLeft={4}>
                <Text color="gray" dimColor>
                  {item.description}
                </Text>
              </Box>
            )}
          </Box>
        );
      })}

      {showScrollDown && (
        <Box>
          <Text color="gray"> {figures.arrowDown} more items below</Text>
        </Box>
      )}

      <Box marginTop={1}>
        <Text color="gray" dimColor>
          {hint}
        </Text>
      </Box>
    </Box>
  );
}
