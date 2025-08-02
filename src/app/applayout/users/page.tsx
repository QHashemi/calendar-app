// components/UserTable.tsx
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
import { useState } from "react";
import { Pencil, Trash, UserCircle  } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  job:string;
};

const dummyUsers: User[] = Array.from({ length: 42 }, (_, i) => ({
  id: `${i + 1}`,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  job:`Project Leiter`
}));

const USERS_PER_PAGE = 15;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(dummyUsers);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const pageStart = (currentPage - 1) * USERS_PER_PAGE;
  const pageUsers = users.slice(pageStart, pageStart + USERS_PER_PAGE);

  const toggleSelectAll = () => {
    const pageIds = pageUsers.map((u) => u.id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...pageIds])]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  };

  const deleteSelected = () => {
    setUsers((prev) => prev.filter((u) => !selectedIds.includes(u.id)));
    setSelectedIds([]);
  };

const rows = pageUsers.map((user) => (
  <Table.Tr key={user.id}>
    <Table.Td>
      <Group gap="xs">
        <Checkbox
          checked={selectedIds.includes(user.id)}
          onChange={() => toggleSelect(user.id)}
        />
        <Avatar size={40} />
      </Group>
    </Table.Td>

    <Table.Td>{user.name}</Table.Td>
    <Table.Td>{user.email}</Table.Td>
    <Table.Td>{user.job}</Table.Td>

    <Table.Td>
      <Group gap="xs">
        <ActionIcon
          variant="light"
          color="blue"
          onClick={() => alert(`Edit user ${user.id}`)}
        >
          <Pencil size={15} />
        </ActionIcon>
        <ActionIcon
          variant="light"
          color="red"
          onClick={() => deleteUser(user.id)}
        >
          <Trash size={15} />
        </ActionIcon>
      </Group>
    </Table.Td>
  </Table.Tr>
));

  return (
    <>
      <Group justify="space-between" mb="sm">
        <Text size="lg" fw={600}>
          Users List
        </Text>
        {selectedIds.length > 0 && (
          <Button color="red" onClick={deleteSelected}>
            Delete Selected ({selectedIds.length})
          </Button>
        )}
      </Group>

      <ScrollArea>
        <Table striped withTableBorder withColumnBorders highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>
                <Checkbox
                  onChange={toggleSelectAll}
                  checked={pageUsers.every((u) =>
                    selectedIds.includes(u.id)
                  )}
                  indeterminate={
                    pageUsers.some((u) => selectedIds.includes(u.id)) &&
                    !pageUsers.every((u) => selectedIds.includes(u.id))
                  }
                />
              </Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Job</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </ScrollArea>

      <Group justify="right" mt="md">
        <Pagination
          total={Math.ceil(users.length / USERS_PER_PAGE)}
          value={currentPage}
          onChange={setCurrentPage}
        />
      </Group>
    </>
  );
}
