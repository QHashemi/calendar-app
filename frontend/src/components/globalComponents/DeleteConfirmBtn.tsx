"use client";

import { Popover, Button, Text, Group } from "@mantine/core";
import { useState, ReactNode } from "react";

type ConfirmDeleteProps = {
  target: ReactNode; // The button or element that triggers the popover
  message?: string;
  onConfirm: () => void;
  popoverWidth?: number;
};

export default function ConfirmDelete({
  target,
  message,
  onConfirm,
  popoverWidth = 220,
}: ConfirmDeleteProps) {
  const [opened, setOpened] = useState(false);

  return (
    <Popover opened={opened} onClose={() => setOpened(false)} width={popoverWidth} position="bottom" withArrow>
      <Popover.Target>
        <span onClick={() => setOpened((o) => !o)}>{target}</span>
      </Popover.Target>

      <Popover.Dropdown>
        <Text size="sm" mb="xs">
          {message || "Are you sure you want to delete this item?"}
        </Text>
        <Group justify="right">
          <Button size="xs" variant="default" onClick={() => setOpened(false)}>
            Cancel
          </Button>
          <Button
            size="xs"
            color="red"
            onClick={() => {
              onConfirm();
              setOpened(false);
            }}
          >
            Delete
          </Button>
        </Group>
      </Popover.Dropdown>
    </Popover>
  );
}
