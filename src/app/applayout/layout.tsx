"use client";

import { SidebarNavbar } from "@components/ui/SidebarNavbar";
import { AppShell, Burger, Group, Text } from "@mantine/core";
import React, { ReactNode, useState } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  const [opened, setOpened] = useState(true);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 240,
        breakpoint: "sm",
        collapsed: { mobile: !opened, desktop: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={() => setOpened((o) => !o)} size="sm" />
          <Text fw={600}>NICE HEADER</Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <SidebarNavbar />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
