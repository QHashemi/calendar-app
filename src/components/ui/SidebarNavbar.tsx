import { useState } from "react";
import Link from "next/link"; // or use `useNavigate` if you're using React Router

import { Avatar, Group, Stack, Text, Divider } from "@mantine/core";
import {
  IconUser,
  IconLayoutDashboard,
  IconUsers,
  IconCalendar,
  IconFolder,
  IconClock,
  IconSettings,
  IconLogout,
} from "@tabler/icons-react";

import classes from "./Sidebar.module.scss";

const mainLinks = [
  { label: "Profile", link: "/applayout/profile", icon: IconUser },
  { label: "Dashboard", link: "/applayout/dashboard", icon: IconLayoutDashboard },
  { label: "Users", link: "/applayout/users", icon: IconUsers },
];

const workLinks = [
  { label: "Calendar", link: "/applayout/calendar", icon: IconCalendar },
  { label: "Today’s Work", link: "/applayout/today", icon: IconClock },
  { label: "Projects", link: "/applayout/projects", icon: IconFolder },
];

export function SidebarNavbar() {
  const [active, setActive] = useState("Dashboard");

  const renderLinks = (links: typeof mainLinks) =>
    links.map((item) => (
      <Link
        href={item.link}
        key={item.label}
        className={classes.link}
        data-active={item.label === active || undefined}
        onClick={() => setActive(item.label)}
      >
        <item.icon className={classes.linkIcon} stroke={1.5} />
        <span>{item.label}</span>
      </Link>
    ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Group className={classes.header} justify="space-between">
          <Avatar
            src="https://cdn.vectorstock.com/i/500p/29/52/faceless-male-avatar-in-hoodie-vector-56412952.jpg"
            size="md"
            radius="xl"
          />
          <Stack gap={0} justify="center">
            <Text c="white" size="xm">
              Qasem Hashemi
            </Text>
            <Text c="white" size="xs">
              IT-Administrator
            </Text>
          </Stack>
        </Group>

        <Divider my="md" label="Main" labelPosition="center" />
        {renderLinks(mainLinks)}

        <Divider my="md" label="Work Management" labelPosition="center" />
        {renderLinks(workLinks)}
      </div>

      <div className={classes.footer}>
        <Link href="/settings" className={classes.link}>
          <IconSettings className={classes.linkIcon} stroke={1.5} />
          <span>Settings</span>
        </Link>
        <Link href="/logout" className={classes.link}>
          <IconLogout className={classes.linkIcon} stroke={1.5} />
          <span>Logout</span>
        </Link>
      </div>
    </nav>
  );
}
