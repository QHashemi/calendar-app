"use client";

import {
  Table,
  Checkbox,
  Button,
  Group,
  Pagination,
  ScrollArea,
  Text,
  ActionIcon,
  Avatar,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { Trash } from "lucide-react";
import CreateUserForm from "./components/CreateUserForm";
import UpdateUserForm from "./components/UpdateUserForm";
import GlobalModal from "@components/globalComponents/GlobalModal";
import DeleteButton from "@components/globalComponents/DeleteModal";
import { useDisclosure } from "@mantine/hooks";
import { useSelector, useDispatch } from "react-redux";
import {
  delete_user,
  get_user,
  resetUserComponentType,
  selectUsers,
  selectUsersState,
  update_user_order,
} from "@/Api/slices/User";
import { AppDispatch } from "@/Api/store";
import useAxiosPrivate from "@/Api/useAxiosPrivate";
import { selectCredentialState } from "@/Api/slices/CredentialsSlice";
import { get_permissions } from "@/Api/slices/PermissionSlice";
import { get_roles } from "@/Api/slices/RoleSlice";
import { notifyMessage } from "@/helpers/notifyMessage";
import { can } from "@/helpers/policy";
import { uploadsUrl } from "@config/coreConfig";

// dnd-kit
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { UserType } from "../../types/UserTypes";

const USERS_PER_PAGE = 15;

// ---------- SORTABLE ROW ----------
function SortableRow({
  user,
  selectedIds,
  toggleSelect,
  handleUpdateUser,
  handleDeleteUser,
  loggedUser,
}: any) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: user.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const canEdit = can(loggedUser, "edit:user", user);
  const canDelete = can(loggedUser, "delete:user", user);
  
  return (
    <Table.Tr ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Table.Td>
        <Group gap="xs">
          <Checkbox
            checked={selectedIds.includes(user.id.toString())}
            onChange={() => toggleSelect(user.id.toString())}
          />
          <Avatar
            src={user?.image ? `${uploadsUrl}${user.image}` : undefined}
            color={user.color}
            alt="Profile Image"
            radius="50%"
            size={40}
            name={user.display_name}
          />
        </Group>
      </Table.Td>

      <Table.Td>{`${user.first_name} ${user.last_name}`}</Table.Td>
      <Table.Td>{user.email}</Table.Td>
      <Table.Td>{user.has_personal_calendar ? "Yes" : "No"}</Table.Td>
      <Table.Td>{user.sort_order}</Table.Td>
      <Table.Td>{user.job}</Table.Td>

      <Table.Td>
        <Group gap="xs">
          <Button
            variant="outline"
            size="xs"
            onClick={() => handleUpdateUser(user.id)}
            disabled={!canEdit}
            onPointerDown={(e) => e.stopPropagation()}

          >
            Edit
          </Button>

          {canDelete ? (
            <DeleteButton
              isButton
              size="xs"
              title="Delete User!"
              buttonTitle="Delete"
              deleteText="Are you sure you want to delete this user?"
              onConfirm={() => handleDeleteUser(user.id)}
             
            />
          ) : (
            <ActionIcon variant="outline" disabled={!canDelete} color="red">
              <Trash size={15} />
            </ActionIcon>
          )}
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}

// ---------- USERS COMPONENT ----------
export default function Users() {
  const dispatch = useDispatch<AppDispatch>();
  const { accessToken, user: loggedUser } = useSelector(selectCredentialState);
  const axiosInstance = useAxiosPrivate();
  const { msg, componentType, error } = useSelector(selectUsersState);
  const users = useSelector(selectUsers);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(
    null
  );
  const [isModalOpen, { open: openModal, close: closeModal }] =
    useDisclosure(false);

  // local users state for drag & drop
  const [localUsers, setLocalUsers] = useState<UserType[]>([]);

  // sync localUsers with redux
  useEffect(() => {
    setLocalUsers([...users].sort((a, b) => a.sort_order - b.sort_order));
  }, [users]);

  // fetch users, roles, permissions
  useEffect(() => {
    if (!accessToken) return;
    dispatch(get_user({ axiosInstance, componentType: "UsersPage" }));
    dispatch(get_roles({ axiosInstance, componentType: "get_roles" }));
    dispatch(get_permissions({ axiosInstance, componentType: "get_permissions" }));
  }, [dispatch, axiosInstance, accessToken]);

  // notify on delete
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

  const pageStart = (currentPage - 1) * USERS_PER_PAGE;
  const pageUsers = localUsers.slice(pageStart, pageStart + USERS_PER_PAGE);

  const toggleSelectAll = () => {
    const pageIds = pageUsers.map((u) => u.id.toString());
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : pageIds);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };


  const handleDeleteUser = async (user_id: number) => {
    await dispatch( delete_user({ axiosInstance, value: user_id, componentType: "delete_user_page" }) );
  };

  const handleCreateUser = () => {
    setModalContent(<CreateUserForm closeModal={closeModal} />);
    openModal();
  };

  const handleUpdateUser = (user_id: number) => {
    console.log(user_id)
    const userToUpdate = users.find((u) => u.id === user_id);
    if (!userToUpdate) return;
    setModalContent(<UpdateUserForm closeModal={closeModal} user={userToUpdate} />);
    openModal();
  };

  // dnd-kit
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = pageUsers.findIndex((u) => u.id === active.id);
    const newIndex = pageUsers.findIndex((u) => u.id === over.id);

    const reordered = Array.from(localUsers);
    const [moved] = reordered.splice(oldIndex + pageStart, 1);
    reordered.splice(newIndex + pageStart, 0, moved);

    const updatedLocal = reordered.map((u, idx) => ({ ...u, sort_order: idx + 1 }));
    setLocalUsers(updatedLocal);

    const payload = updatedLocal.map((u) => ({ id: u.id, sort_order: u.sort_order }));

    try {
      await dispatch(
        update_user_order({
          axiosInstance,
          id: loggedUser.id,
          value: { reorderedUsers: payload },
          componentType: "update_user_order",
        })
      ).unwrap();
    } catch (err) {
      console.error("Failed to update user order:", err);
      setLocalUsers(users); // rollback
    }
  };

  const canAdd = can(loggedUser, "add:user", {});

  return (
    <>
      <GlobalModal
        isModalOpen={isModalOpen}
        title="Create / Update User"
        closeModal={closeModal}
        modalContent={modalContent}
        size="lg"
      />

      <Group justify="space-between" mb="sm">
        <Text size="lg" fw={600}>
          Users List
        </Text>
        <Group>
          {selectedIds.length > 0 && (
            <Button color="red">Delete Selected ({selectedIds.length})</Button>
          )}
          <Button size="xs" onClick={handleCreateUser} disabled={!canAdd}>
            Create User
          </Button>
        </Group>
      </Group>

      <ScrollArea>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={pageUsers.map((u) => u.id)}
            strategy={verticalListSortingStrategy}
          >
            <Table striped withTableBorder withColumnBorders highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>
                    <Checkbox onChange={toggleSelectAll} />
                  </Table.Th>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Own Calendar</Table.Th>
                  <Table.Th>Order</Table.Th>
                  <Table.Th>Job</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {pageUsers.map((user) => (
                  <SortableRow
                    key={user.id}
                    user={user}
                    selectedIds={selectedIds}
                    toggleSelect={toggleSelect}
                    handleUpdateUser={handleUpdateUser}
                    handleDeleteUser={handleDeleteUser}
                    loggedUser={loggedUser}
                  />
                ))}
              </Table.Tbody>
            </Table>
          </SortableContext>
        </DndContext>
      </ScrollArea>

      <Group justify="right" mt="md">
        <Pagination
          total={Math.ceil(localUsers.length / USERS_PER_PAGE) || 1}
          value={currentPage}
          onChange={setCurrentPage}
        />
      </Group>
    </>
  );
}
