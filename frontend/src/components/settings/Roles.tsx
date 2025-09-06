"use client";
import React, { useState } from "react";
import { Table, Button, Modal, TextInput, Textarea, MultiSelect, Group, Stack, Paper, Divider, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/Api/store";
import { create_role, update_role, delete_role, selectRoles } from "@/Api/slices/RoleSlice";
import { selectPermissions } from "@/Api/slices/PermissionSlice";
import useAxiosPrivate from "@/Api/useAxiosPrivate";
import { selectCredentialState } from "@/Api/slices/CredentialsSlice";
import { can } from "@/helpers/policy";

const RolesTab = () => {
  const dispatch = useDispatch<AppDispatch>();
  const axiosInstance = useAxiosPrivate();
  const roles = useSelector(selectRoles);
  const permissions = useSelector(selectPermissions);
  const { user } = useSelector(selectCredentialState);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);

  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      permissions: [] as string[],
    },
    validate: {
      name: (value) => (value.trim().length === 0 ? "Name is required" : null),
    },
  });

  const handleAddRole = async (values: typeof form.values) => {
    if (editingRole) {
      await dispatch(update_role({ axiosInstance, id: editingRole.id, value: values, componentType: "update_roles" })).unwrap();
      setEditingRole(null);
    } else {
      await dispatch(create_role({ axiosInstance, value: { ...values, created_by: user.id }, componentType: "role_modal" })).unwrap();
    }
    setRoleModalOpen(false);
    form.reset();
  };
  const canAdd = can(user, "add:role", {});
  const handleEditRole = (role: any) => {
    setEditingRole(role);
    form.setValues({
      name: role.name,
      description: role.description,
      permissions: role.permissions.map((p: any) => p.id.toString()),
    });
    setRoleModalOpen(true);
  };

  return (
    <>
      <Group mb="xs" justify="space-between">
        <Title order={4}>Role Access Contorl</Title>
        <Button size="xs" onClick={() => setRoleModalOpen(true)} disabled={!canAdd}>
          Add Role
        </Button>
      </Group>

      <Table striped withTableBorder withColumnBorders highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Description</Table.Th>
            <Table.Th>Permissions</Table.Th>
            <Table.Th style={{ width: "150px" }}>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {roles.map((role) => {
            const canEdit = can(user, "edit:role", role);
            const canDelete = can(user, "delete:role", role);
            return (
              <Table.Tr key={role.id}>
                <Table.Td>{role.name}</Table.Td>
                <Table.Td>{role.description}</Table.Td>
                <Table.Td>{role.permissions.map((p: any) => p.name).join(", ")}</Table.Td>
                <Table.Td>
                  <Button size="xs" variant="outline" onClick={() => handleEditRole(role)} disabled={!canEdit}>
                    Edit
                  </Button>
                  <Button size="xs" color="red" variant="outline" ml="xs" onClick={() => dispatch(delete_role({ axiosInstance, value: role.id, componentType: "delete_role" }))} disabled={!canDelete}>
                    Delete
                  </Button>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
      <Modal
        opened={roleModalOpen}
        onClose={() => {
          setRoleModalOpen(false);
          setEditingRole(null);
          form.reset();
        }}
        size="xs"
        centered
      >
        <Paper shadow="xs" p="xs" radius="xs" withBorder>
          <form onSubmit={form.onSubmit(handleAddRole)}>
            <Stack gap="xs">
              <Title order={3} ta="center" size="xs">
                {editingRole ? "Edit Role" : "Create Role"}
              </Title>

              <Divider label="Role Info" labelPosition="center" />

              <TextInput size="xs" label="Role Name" {...form.getInputProps("name")} required />
              <Textarea size="xs" label="Description" {...form.getInputProps("description")} autosize minRows={2} />

              <Divider label="Permissions" labelPosition="center" />

              <MultiSelect size="xs" label="Permissions" data={permissions.map((p) => ({ value: p.id.toString(), label: p.name }))} {...form.getInputProps("permissions")} searchable clearable />

              <Group mt="xs" justify="right">
                <Button size="xs" variant="default" onClick={() => setRoleModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="xs" type="submit">
                  {editingRole ? "Update Role" : "Save Role"}
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>
      </Modal>
    </>
  );
};

export default RolesTab;
