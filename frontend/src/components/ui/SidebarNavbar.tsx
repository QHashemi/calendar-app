"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Avatar, Group, Stack, Text, Divider } from "@mantine/core";
import { IconUser, IconLayoutDashboard, IconUsers, IconCalendar, IconCalendarEvent, IconSettings, IconLogout } from "@tabler/icons-react";
import { useSelector, useDispatch } from "react-redux";
import { logout_user, selectCredentialState } from "@/Api/slices/CredentialsSlice";
import { AppDispatch } from "@/Api/store";
import useAxiosPrivate from "@/Api/useAxiosPrivate";
import { uploadsUrl } from "@config/coreConfig";
import classes from "./Sidebar.module.scss";
import PersistLogin from "@/components/PersistLogin";
import { get_components, selectComponents } from "@/Api/slices/ComponentsSlice";

export function SidebarNavbar() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const axiosInstance = useAxiosPrivate();
  const { user } = useSelector(selectCredentialState);
  const components = useSelector(selectComponents);

  const pathname = usePathname();
  const [active, setActive] = useState<string>("");

  // Load components
  useEffect(() => {
    dispatch(get_components({ axiosInstance, componentType: "get_components" }));
  }, [dispatch, axiosInstance]);

  // Update active link
  useEffect(() => {
    const current = components.find((c) => `/applayout/${c.name.toLowerCase()}` === pathname);
    setActive(current ? current.name : "");
  }, [components, pathname]);

  // Logout
  const handleLogoutUser = async () => {
    try {
      await dispatch(logout_user({ componentType: "logout_user" })).unwrap();
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      router.replace("/login");
    }
  };

  // Map component names to icons
  const iconMap: Record<string, any> = {
    profile: IconUser,
    dashboard: IconLayoutDashboard,
    users: IconUsers,
    calendar: IconCalendar,
    events: IconCalendarEvent,
    settings: IconSettings,
  };

  // Render menu links
  const menus = useMemo(() => {
    if (!user || !user.roles) return [];

    return [...components]
      .sort((a, b) => a.order - b.order)
      .map((component) => {
        const allowedRoles = component.roles.map((role) => role.name);
        const hasAccess = allowedRoles.length === 0 || user.roles.some((r) => allowedRoles.includes(r.name));

        if (!hasAccess) return null;

        const Icon = iconMap[component.name.toLowerCase()] || IconLayoutDashboard;

        return (
          <Link key={component.id} href={`/applayout/${component.name.toLowerCase()}`} className={classes.link} data-active={component.name === active || undefined} prefetch={false}>
            <Icon className={classes.linkIcon} stroke={1.5} />
            <span>{component.name}</span>
          </Link>
        );
      });
  }, [components, user, active]);

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Group className={classes.header} justify="space-arround">
          <Avatar
            src={user?.image ? `${uploadsUrl}${user.image}` : undefined} // only use src if image exists
            color={user?.color}
            alt="Profile Image"
            radius="50%"
            size={35}
            name={user?.display_name} // will be displayed if src is undefined
          />
          <Stack gap={0} justify="center">
            <Text c="white" size="sm">
              {user ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() : "Guest User"}
            </Text>
            <Text c="white" size="xs">
              {user?.job}
            </Text>
          </Stack>
        </Group>

        <PersistLogin>
          <Divider my="md" label={<h1 style={{ color: "white" }}>Main</h1>} />
          {menus}

          <Divider my="md" label={<h1 style={{ color: "white" }}>Extra</h1>} />

          <button onClick={handleLogoutUser} className={classes.link} style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            <IconLogout className={classes.linkIcon} stroke={1.5} />
            <span>Logout</span>
          </button>
        </PersistLogin>
      </div>
    </nav>
  );
}
