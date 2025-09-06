"use client";
import React, { useEffect } from "react";
import { Tabs } from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/Api/store";
import { get_roles } from "@/Api/slices/RoleSlice";
import { get_permissions } from "@/Api/slices/PermissionSlice";
import { selectCredentialState } from "@/Api/slices/CredentialsSlice";
import useAxiosPrivate from "@/Api/useAxiosPrivate";
import RolesTab from "./Roles";
import PermissionsTab from "./Permissions";
import ComponentsTab from "./ComponentsTab";
import { get_components } from "@/Api/slices/ComponentsSlice";

export default function Settings() {
  const dispatch = useDispatch<AppDispatch>();
  const axiosInstance = useAxiosPrivate();
  const { accessToken } = useSelector(selectCredentialState);

  useEffect(() => {
    if (accessToken) {
      dispatch(get_roles({ axiosInstance, componentType: "get_roles" }));
      dispatch(get_permissions({ axiosInstance, componentType: "get_permissions" }));
      dispatch(get_components({ axiosInstance, componentType: "get_components" }));
    }
  }, [dispatch, axiosInstance, accessToken]);
  

  return (
    <Tabs defaultValue="roles">
      <Tabs.List>
        <Tabs.Tab value="roles">Roles</Tabs.Tab>
        <Tabs.Tab value="permissions">Permissions</Tabs.Tab>
        <Tabs.Tab value="components">Components</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="roles" pt="md">
        <RolesTab />
      </Tabs.Panel>
      <Tabs.Panel value="permissions" pt="md">
        <PermissionsTab />
      </Tabs.Panel>

      <Tabs.Panel value="components" pt="md">
        <ComponentsTab />
      </Tabs.Panel>
    </Tabs>
  );
}
