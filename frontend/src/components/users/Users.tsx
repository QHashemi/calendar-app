"use client";

import { Table, Checkbox, Button, Group, Pagination, ScrollArea, Text, ActionIcon, Avatar } from "@mantine/core";
import { useEffect, useState } from "react";
import { Pencil, Trash } from "lucide-react";
import CreateUserForm from "./components/CreateUserForm";
import GlobalModal from "@components/globalComponents/GlobalModal";
import { useDisclosure } from "@mantine/hooks";
import { useSelector, useDispatch } from "react-redux";
import { delete_user, get_user, resetUserComponentType, selectUsers, selectUsersState } from "@/Api/slices/User";
import { AppDispatch } from "@/Api/store";
import UpdateUserForm from "./components/UpdateUserForm";
import useAxiosPrivate from "@/Api/useAxiosPrivate";
import DeleteButton from "@components/globalComponents/DeleteModal";
import { selectCredentialState } from "@/Api/slices/CredentialsSlice";
import { get_permissions } from "@/Api/slices/PermissionSlice";
import { get_roles } from "@/Api/slices/RoleSlice";
import { notifyMessage } from "@/helpers/notifyMessage";
import { can } from "@/helpers/policy";
import { uploadsUrl } from "@config/coreConfig";

const USERS_PER_PAGE = 15;

export default function Users() {
  const dispatch = useDispatch<AppDispatch>();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const axiosInstance = useAxiosPrivate();
  const { accessToken, user: loggedUser } = useSelector(selectCredentialState);
  const { msg, componentType, error } = useSelector(selectUsersState);

  useEffect(() => {
    if (accessToken) {
      dispatch(get_user({ axiosInstance, componentType: "UsersPage" }));
      dispatch(get_roles({ axiosInstance, componentType: "get_roles" }));
      dispatch(get_permissions({ axiosInstance, componentType: "get_permissions" }));
    }
  }, [dispatch, axiosInstance, accessToken]);

  const users = useSelector(selectUsers);

  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);

  useEffect(() => {
    if (componentType !== "delete_user_page") return;
    notifyMessage({
      msg,
      error: !!error,
      componentType,
      expectedComponentType: "delete_user_page",
    });
    dispatch(resetUserComponentType(""));
  }, [msg, error, componentType]);

  const handleDeleteUser = async (user_id: number) => {
    await dispatch(delete_user({ axiosInstance, value: user_id, componentType: "delete_user_page" }));
  };

  const handleCreateUser = () => {
    setModalContent(<CreateUserForm closeModal={closeModal} />);
    openModal();
  };

  const handleUpdateUser = (user_id: number) => {
    const userToUpdate = users.find((user) => user.id === user_id);
    if (!userToUpdate) return;
    setModalContent(<UpdateUserForm closeModal={closeModal} user={userToUpdate} />);
    openModal();
  };

  // Modal open state
  const [isModalOpen, { open: openModal, close: closeModal }] = useDisclosure(false);

  const pageStart = (currentPage - 1) * USERS_PER_PAGE;
  const pageUsers = users.slice(pageStart, pageStart + USERS_PER_PAGE);

  const toggleSelectAll = () => {
    const pageIds = pageUsers.map((u) => u.id.toString());
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...pageIds])]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // const deleteUser = (id: string) => {
  //   setUsers((prev) => prev.filter((u) => u.id.toString() !== id));
  //   setSelectedIds((prev) => prev.filter((x) => x !== id));
  // };

  // const deleteSelected = () => {
  //   setUsers((prev) => prev.filter((u) => !selectedIds.includes(u.id.toString())));
  //   setSelectedIds([]);
  // };

  const rows = pageUsers.map((user) => {
    const canEdit = can(loggedUser, "edit:user", user);
    const canDelete = can(loggedUser, "delete:user", user);
    return (
      <Table.Tr key={user.id}>
        <Table.Td>
          <Group gap="xs">
            <Checkbox checked={selectedIds.includes(user.id.toString())} onChange={() => toggleSelect(user.id.toString())} />
            <Avatar
              src={user?.image ? `${uploadsUrl}${user.image}` : undefined} // only use src if image exists
              color={user.color}
              alt="Profile Image"
              radius="50%"
              size={40}
              name={user.display_name} // will be displayed if src is undefined
            />
          </Group>
        </Table.Td>

        <Table.Td>{`${user.first_name} ${user.last_name}`}</Table.Td>

        <Table.Td>{user.email}</Table.Td>
        <Table.Td>{user.has_personal_calendar ? "Yes" : "No"}</Table.Td>
        <Table.Td>{user.job}</Table.Td>

        <Table.Td>
          <Group gap="xs">
            {/* <ActionIcon variant="light" color="blue" disabled={!canEdit}> */}
            <Button variant="outline" size="xs" onClick={() => handleUpdateUser(Number(user.id))} disabled={!canEdit}>
              Edit
            </Button>
            {/* </ActionIcon> */}

            {canDelete ? (
              <DeleteButton
                isButton={true}
                size="xs"
                title="Delete User!"
                buttonTitle="Delete"
                deleteText="Are you sure you want to delete this user? This action is destructive and you will have to contact support to restore your data."
                onConfirm={() => handleDeleteUser(user.id)}
              ></DeleteButton>
            ) : (
              <ActionIcon variant="outline" disabled={!canDelete} color="red">
                <Trash size={15} />
              </ActionIcon>
            )}
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });
  const canAdd = can(loggedUser, "add:user", {});
  return (
    <>
      <GlobalModal isModalOpen={isModalOpen} title="Create User Modal" closeModal={closeModal} modalContent={modalContent} size="lg" />

      <Group justify="space-between" mb="sm">
        <Text size="lg" fw={600}>
          Users List
        </Text>
        <Group>
          {selectedIds.length > 0 && <Button color="red">Delete Selected ({selectedIds.length})</Button>}
          <Button size="xs" onClick={handleCreateUser} disabled={!canAdd}>
            Create User
          </Button>
        </Group>
      </Group>

      <ScrollArea>
        <Table striped withTableBorder withColumnBorders highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>
                <Checkbox
                  onChange={toggleSelectAll}
                  // checked={
                  //   pageUsers.length > 0 &&
                  //   pageUsers.every((u) => selectedIds.includes(u.id.toString()))
                  // }
                  // indeterminate={
                  //   pageUsers.some((u) => selectedIds.includes(u.id.toString())) &&
                  //   !pageUsers.every((u) => selectedIds.includes(u.id.toString()))
                  // }
                />
              </Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Own Calendar</Table.Th>
              <Table.Th>Job</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </ScrollArea>

      <Group justify="right" mt="md">
        <Pagination total={Math.ceil(users.length / USERS_PER_PAGE) || 1} value={currentPage} onChange={setCurrentPage} />
      </Group>
    </>
  );
}
