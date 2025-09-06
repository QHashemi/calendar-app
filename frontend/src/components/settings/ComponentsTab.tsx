"use client";

import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Group, Stack, Paper, Divider, Title, TextInput, Checkbox } from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/Api/store";
import useAxiosPrivate from "@/Api/useAxiosPrivate";
import { create_component, get_components, update_component, delete_component, selectComponents } from "../../Api/slices/ComponentsSlice";
import { selectRoles } from "@/Api/slices/RoleSlice";
import { selectPermissions } from "@/Api/slices/PermissionSlice";
import { selectCredentialState } from "@/Api/slices/CredentialsSlice";
import { can } from "@/helpers/policy";

export default function ComponentsTab() {
  const dispatch = useDispatch<AppDispatch>();
  const axiosInstance = useAxiosPrivate();
  const { user } = useSelector(selectCredentialState);
  const components = useSelector(selectComponents);
  const roles = useSelector(selectRoles);
  const permissions = useSelector(selectPermissions);

  const [editingComponent, setEditingComponent] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch components on mount
  useEffect(() => {
    dispatch(get_components({ axiosInstance, componentType: "get_components" }));
  }, [dispatch, axiosInstance]);

  const handleEditComponent = (component: any) => {
    setEditingComponent({
      ...component,
      roleIds: component.roles?.map((r: any) => String(r.id)) || [],
      permissionIds: component.permissions?.map((p: any) => String(p.id)) || [],
    });
    setModalOpen(true);
  };

  const handleAddComponent = () => {
    setEditingComponent({
      name: "",
      roleIds: [],
      permissionIds: [],
      created_by: user.id,
    });
    setModalOpen(true);
  };

  const handleSaveComponent = () => {
    if (!editingComponent.name.trim()) return;

    const payload = {
      ...editingComponent,
      roles: editingComponent.roleIds,
      permissions: editingComponent.permissionIds,
      created_by: user.id,
    };
    if (editingComponent.id) {
      dispatch(
        update_component({
          axiosInstance,
          value: payload,
          componentType: "update_component",
        })
      );
    } else {
      dispatch(
        create_component({
          axiosInstance,
          value: payload,
          componentType: "create_component",
        })
      );
    }

    setEditingComponent(null);
    setModalOpen(false);
  };

  const handleDeleteComponent = (id: number) => {
    dispatch(
      delete_component({
        axiosInstance,
        value: id,
        componentType: "delete_component",
      })
    );
  };
  const canAdd = can(user, "delete:component", {});
  return (
    <>
      <Group mb="xs" justify="space-between">
        <Title order={4}>Components Access Control</Title>
        <Button size="xs" onClick={handleAddComponent} disabled={!canAdd}>
          Add Component
        </Button>
      </Group>

      <Table striped withTableBorder withColumnBorders highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Needed Roles</Table.Th>
            <Table.Th>Needed Permissions</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {components.map((comp) => {
            const canEdit = can(user, "edit:component", comp);
            const canDelete = can(user, "delete:component", comp);

            return (
              <Table.Tr key={comp.id}>
                <Table.Td>{comp.name}</Table.Td>
                <Table.Td>{comp.roles?.map((role) => role.name).join(", ")}</Table.Td>
                <Table.Td>{comp.permissions?.map((per) => per.name).join(", ")}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Button size="xs" variant="outline" onClick={() => handleEditComponent(comp)} disabled={!canEdit}>
                      Edit
                    </Button>
                    <Button size="xs" color="red" variant="outline" onClick={() => handleDeleteComponent(comp.id)} disabled={!canDelete}>
                      Delete
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>

      <Modal
        opened={modalOpen}
        onClose={() => {
          setEditingComponent(null);
          setModalOpen(false);
        }}
        size="lg"
        centered
      >
        <Paper shadow="md" p="md" radius="md" withBorder>
          {editingComponent && (
            <Stack gap="xs">
              <Title order={4} ta="center" size="xs">
                {editingComponent.id ? "Edit Component" : "Add Component"}
              </Title>

              <Divider label="Component Info" labelPosition="center" />

              <TextInput
                size="xs"
                label="Component Name"
                placeholder="Enter component name"
                value={editingComponent.name}
                onChange={(e) => setEditingComponent({ ...editingComponent, name: e.currentTarget.value })}
                required
              />

              <Divider label="Roles" labelPosition="center" />
              <Checkbox.Group value={editingComponent.roleIds || []} onChange={(val) => setEditingComponent({ ...editingComponent, roleIds: val })}>
                <Stack gap="xs">
                  {roles.map((role) => (
                    <Checkbox key={role.id} size="xs" value={String(role.id)} label={role.name} />
                  ))}
                </Stack>
              </Checkbox.Group>

              <Divider label="Permissions" labelPosition="center" />
              <Checkbox.Group value={editingComponent.permissionIds || []} onChange={(val) => setEditingComponent({ ...editingComponent, permissionIds: val })}>
                <Stack gap="xs">
                  {permissions.map((p) => (
                    <Checkbox key={p.id} size="xs" value={String(p.id)} label={p.name} />
                  ))}
                </Stack>
              </Checkbox.Group>

              <Group mt="xs" justify="right">
                <Button size="xs" variant="default" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="xs" onClick={handleSaveComponent}>
                  Save
                </Button>
              </Group>
            </Stack>
          )}
        </Paper>
      </Modal>
    </>
  );
}
