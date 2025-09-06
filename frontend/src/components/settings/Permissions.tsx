"use client";
import React, { useState } from "react";
import { Table, Button, Modal, TextInput, Group, Stack, Paper, Divider, Title, Pagination } from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/Api/store";
import { create_permission, update_permission, delete_permission, selectPermissions } from "@/Api/slices/PermissionSlice";
import useAxiosPrivate from "@/Api/useAxiosPrivate";
import { selectCredentialState } from "@/Api/slices/CredentialsSlice";
import { can } from "@/helpers/policy";

const PermissionsTab = () => {
  const dispatch = useDispatch<AppDispatch>();
  const axiosInstance = useAxiosPrivate();
  const permissions = useSelector(selectPermissions);
  const { user } = useSelector(selectCredentialState);

  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<any>(null);
  const [newPermissionName, setNewPermissionName] = useState("");

  // Pagination state
  const [activePage, setActivePage] = useState(1);
  const pageSize = 15; // Number of items per page
  const totalPages = Math.ceil(permissions.length / pageSize);

  const handleAddPermission = async () => {
    if (!newPermissionName.trim()) return alert("Permission name is required!");
    if (editingPermission) {
      await dispatch(
        update_permission({
          axiosInstance,
          value: { ...editingPermission, name: newPermissionName },
          componentType: "edit_permission",
        })
      ).unwrap();
      setEditingPermission(null);
    } else {
      await dispatch(
        create_permission({
          axiosInstance,
          value: { name: newPermissionName, created_by: user.id },
          componentType: "permission_modal",
        })
      ).unwrap();
    }
    setNewPermissionName("");
    setPermissionModalOpen(false);
  };

  const handleEditPermission = (permission: any) => {
    setEditingPermission(permission);
    setNewPermissionName(permission.name);
    setPermissionModalOpen(true);
  };

  const canAdd = can(user, "delete:permission", {});

  // Slice permissions for current page
  const paginatedPermissions = permissions.slice((activePage - 1) * pageSize, activePage * pageSize);

  return (
    <>
      <Group mb="xs" justify="space-between">
        <Title order={4}>Permission Table</Title>
        <Button size="xs" onClick={() => setPermissionModalOpen(true)} disabled={!canAdd}>
          Add Permission
        </Button>
      </Group>

      <Table striped withTableBorder withColumnBorders highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {paginatedPermissions.map((perm) => {
            const canEdit = can(user, "edit:permission", perm);
            const canDelete = can(user, "delete:permission", perm);
            return (
              <Table.Tr key={perm.id}>
                <Table.Td>{perm.name}</Table.Td>
                <Table.Td>
                  <Button size="xs" variant="outline" onClick={() => handleEditPermission(perm)} disabled={!canEdit}>
                    Edit
                  </Button>
                  <Button
                    size="xs"
                    color="red"
                    variant="outline"
                    ml="xs"
                    onClick={() =>
                      dispatch(
                        delete_permission({
                          axiosInstance,
                          value: perm.id,
                          componentType: "delete_permission",
                        })
                      )
                    }
                    disabled={!canDelete}
                  >
                    Delete
                  </Button>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>

      {/* Pagination */}
      <Group justify="right" mt="xs">
        <Pagination
          size={"xs"}
          total={totalPages}
          value={activePage} // <-- use `value` instead of `page`
          onChange={setActivePage} // <-- stays the same
          withEdges
        />
      </Group>
      <Modal
        opened={permissionModalOpen}
        onClose={() => {
          setPermissionModalOpen(false);
          setEditingPermission(null);
          setNewPermissionName("");
        }}
        size="xs"
        centered
      >
        <Paper shadow="xs" p="xs" radius="xs" withBorder>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddPermission();
            }}
          >
            <Stack gap="xs">
              <Title order={3} ta="center" size="xs">
                {editingPermission ? "Edit Permission" : "Create Permission"}
              </Title>

              <Divider label="Permission Info" labelPosition="center" />

              <TextInput size="xs" label="Permission Name" value={newPermissionName} onChange={(e) => setNewPermissionName(e.currentTarget.value)} required />

              <Group mt="xs" justify="right">
                <Button size="xs" variant="default" onClick={() => setPermissionModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="xs" type="submit">
                  {editingPermission ? "Update Permission" : "Save Permission"}
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>
      </Modal>
    </>
  );
};

export default PermissionsTab;
