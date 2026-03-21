import React, { useState, useCallback } from "react";
import { Box, Text, useInput } from "ink";
import figures from "figures";

export interface MultiSelectItem<T = string> {
  label: string;
  value: T;
  description?: string;
}

export interface MultiSelectProps<T = string> {
  items: MultiSelectItem<T>[];
  onSubmit: (selected: T[]) => void;
  initialSelected?: T[];
  title?: string;
  hint?: string;
  maxVisible?: number;
}

export function MultiSelect<T = string>({
  items,
  onSubmit,
  initialSelected = [],
  title,
  hint = "Space to toggle, Enter to confirm",
  maxVisible = 8,
}: MultiSelectProps<T>) {
  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState<Set<T>>(new Set(initialSelected));
  const [scrollOffset, setScrollOffset] = useState(0);

  const toggle = useCallback((value: T) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }, []);

  useInput((input, key) => {
    if (key.upArrow) {
      const newCursor = cursor > 0 ? cursor - 1 : items.length - 1;
      setCursor(newCursor);

      // Adjust scroll
      if (newCursor < scrollOffset) {
        setScrollOffset(newCursor);
      } else if (newCursor >= scrollOffset + maxVisible) {
        setScrollOffset(newCursor - maxVisible + 1);
      }
    }

    if (key.downArrow) {
      const newCursor = cursor < items.length - 1 ? cursor + 1 : 0;
      setCursor(newCursor);

      // Adjust scroll
      if (newCursor >= scrollOffset + maxVisible) {
        setScrollOffset(newCursor - maxVisible + 1);
      } else if (newCursor < scrollOffset) {
        setScrollOffset(newCursor);
      }
    }

    if (input === " ") {
      toggle(items[cursor].value);
    }

    if (key.return) {
      onSubmit(Array.from(selected));
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
        const isSelected = selected.has(item.value);
        const isCursor = actualIndex === cursor;

        return (
          <Box key={String(item.value)} flexDirection="column">
            <Box>
              <Text color={isCursor ? "cyan" : undefined}>{isCursor ? figures.pointer : " "} </Text>
              <Text color={isSelected ? "green" : "gray"}>
                {isSelected ? figures.checkboxOn : figures.checkboxOff}
              </Text>
              <Text color={isCursor ? "cyan" : undefined}> {item.label}</Text>
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

      <Box marginTop={1}>
        <Text color="gray">
          Selected: {selected.size} / {items.length}
        </Text>
      </Box>
    </Box>
  );
}
