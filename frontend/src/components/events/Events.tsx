"use client";
import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Group, ScrollArea, Paper, Title, Badge, Collapse, Text, TextInput, ColorInput, Textarea, MultiSelect, Select, Divider, Stack } from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "@mantine/form";
import { DateTimePicker } from "@mantine/dates";
import dayjs from "dayjs";
import { Search } from "lucide-react";

import { get_event, create_event, update_event, delete_event, selectEvents } from "../../Api/slices/EventSlice";
import { selectUsers, get_user } from "@/Api/slices/User";
import { selectCredentialState } from "@/Api/slices/CredentialsSlice";
import { AppDispatch } from "@/Api/store";
import useAxiosPrivate from "@/Api/useAxiosPrivate";
import { UserType } from "../../types/UserTypes";
import { can } from "@/helpers/policy";

export const Events = () => {
  const dispatch = useDispatch<AppDispatch>();
  const events = useSelector(selectEvents);
  const users = useSelector(selectUsers);


  const { user, accessToken } = useSelector(selectCredentialState);
  const axiosInstance = useAxiosPrivate();

  const [opened, setOpened] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [search, setSearch] = useState(""); // 🔹 search state

  useEffect(() => {
    if (accessToken) {
      dispatch(get_event({ axiosInstance, componentType: "event_table" }));
      dispatch(get_user({ axiosInstance, componentType: "get_user" })); // <-- make sure users are fetched
    }
  }, []);

  const form = useForm({
    initialValues: {
      event_name: "",
      event_color: user?.color || "",
      event_start: dayjs(),
      event_end: dayjs(),
      event_location: "",
      event_description: "",
      event_note: "",
      event_helpers: [] as string[],
      event_owner: "",
      event_all_day: false, // <-- added
    },
  });

  const handleAdd = () => {
    setEditingEvent(null);
    form.reset();
    setOpened(true);
  };

  const handleEdit = (event: any) => {
    setEditingEvent(event);
    form.setValues({
      event_name: event.title,
      event_color: event.color || user?.color || "",
      event_start: dayjs(event.start),
      event_end: dayjs(event.end),
      event_location: event.location || "",
      event_description: event.description || "",
      event_note: event.note || "",
      event_owner: String(event.owner?.id) || "",
      event_helpers: event.helpers.map((helper: UserType) => String(helper.id)),
    });
    setOpened(true);
  };

  const handleDelete = (id: number) => {
    dispatch(delete_event({ axiosInstance, value: id, componentType: "event_table" }));
  };

  const handleSubmit = async (values: typeof form.values) => {
    const data = {
      title: values.event_name,
      color: values.event_color,
      start: dayjs(values.event_start).toISOString(),
      end: dayjs(values.event_end).toISOString(),
      organizerId: user.id,
      ownerId: parseInt(values.event_owner),
      helpers: values.event_helpers.map((ids: string) => parseInt(ids)),
      note: values.event_note,
      description: values.event_description,
      location: values.event_location,
    };

    if (editingEvent) {
      await dispatch(
        update_event({
          axiosInstance,
          value: { ...data, id: editingEvent.id },
          componentType: "event_table",
        })
      );
    } else {
      await dispatch(create_event({ axiosInstance, value: data, componentType: "event_table" }));
    }

    setOpened(false);
  };

  // 🔹 Filter events by search term
  const filteredEvents = events.filter((event) => {
    const term = search.toLowerCase();
    return (
      event.title.toLowerCase().includes(term) ||
      event.location?.toLowerCase().includes(term) ||
      event.organizer?.display_name?.toLowerCase().includes(term) ||
      event.owner?.display_name?.toLowerCase().includes(term) ||
      event.helpers?.some((h: UserType) => (h.display_name || h.first_name || "").toLowerCase().includes(term))
    );
  });

  const rows = filteredEvents.filter(event=> event.event_type === "work_event").map((event) => {
    const canEdit = can(user, "edit:event", event);
    const canDelete = can(user, "delete:event", event);

    return (
      <React.Fragment key={event.id}>
        <Table.Tr>
          <Table.Td>
            <Badge color={event.color}>{event.color}</Badge>
          </Table.Td>
          <Table.Td>{event.title}</Table.Td>
          <Table.Td>{dayjs(event.start).format("DD MMM YYYY ,HH:mm")}</Table.Td>
          <Table.Td>{dayjs(event.end).format("DD MMM YYYY ,HH:mm")}</Table.Td>
          <Table.Td>{event.location || "-"}</Table.Td>
          <Table.Td>{event.organizer.display_name}</Table.Td>
          <Table.Td>{event.owner.display_name}</Table.Td>

          <Table.Td>
            <Group>
              <Button size="xs" variant="light" onClick={() => setExpandedRow(expandedRow === event.id ? null : event.id)}>
                {expandedRow === event.id ? "Hide Helpers" : "Show Helpers"}
              </Button>
              <Button size="xs" variant="outline" onClick={() => handleEdit(event)} disabled={!canEdit}>
                Edit
              </Button>
              <Button size="xs" color="red" variant="outline" onClick={() => handleDelete(event.id)} disabled={!canDelete}>
                Delete
              </Button>
            </Group>
          </Table.Td>
        </Table.Tr>

        {/* Collapse row */}
        <Table.Tr>
          <Table.Td colSpan={8} style={{ padding: 0, border: "none" }}>
            <Collapse in={expandedRow === event.id}>
              <Paper p="sm" withBorder shadow="xs">
                {event.helpers && event.helpers.length > 0 ? (
                  <Group>
                    {event.helpers.map((helper: UserType) => (
                      <Badge key={helper.id} color="blue" variant="light">
                        {helper.display_name || helper.first_name}
                      </Badge>
                    ))}
                  </Group>
                ) : (
                  <Text size="sm" c="dimmed">
                    No helpers assigned
                  </Text>
                )}
              </Paper>
            </Collapse>
          </Table.Td>
        </Table.Tr>
      </React.Fragment>
    );
  });

  const canAdd = can(user, "add:event", {});
  return (
    <ScrollArea p="md">
      <Group mb="xs" justify="space-between">
        <Title order={3}>Events</Title>
        <Group>
          {/* 🔹 Search bar */}
          <TextInput size="xs" placeholder="Search events..." value={search} onChange={(e) => setSearch(e.currentTarget.value)} leftSection={<Search size={14} />} />
          <Button size="xs" onClick={handleAdd} disabled={!canAdd}>
            Add Event
          </Button>
        </Group>
      </Group>

      <ScrollArea>
        <Table striped withTableBorder withColumnBorders highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Color</Table.Th>
              <Table.Th>Title</Table.Th>
              <Table.Th>Start</Table.Th>
              <Table.Th>End</Table.Th>
              <Table.Th>Location</Table.Th>
              <Table.Th>Organizer</Table.Th>
              <Table.Th>Employee</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </ScrollArea>

      {/* Modal for Add/Edit */}
      <Modal opened={opened} onClose={() => setOpened(false)} title={editingEvent ? "Edit Event" : "Add Event"} size="lg">
        <Paper shadow="md" p="md" radius="md" withBorder>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="xs">
              <Title order={3} ta="center" >
                {editingEvent ? "Edit Event" : "Add New Event"}
              </Title>

              <Divider label="Event Info" labelPosition="center" />

              <TextInput size="xs" label="Event Name" placeholder="Enter event name" withAsterisk {...form.getInputProps("event_name")} />

              <Group grow>
                <Select
                  size="xs"
                  label="Owner"
                  placeholder="Select owner"
                  data={users.map((u) => ({
                    value: String(u.id),
                    label: u.display_name || u.first_name,
                  }))}
                  {...form.getInputProps("event_owner")}
                />
                <ColorInput size="xs" label="Event Color" placeholder="Select color" {...form.getInputProps("event_color")} />
              </Group>

              <MultiSelect
                size="xs"
                label="Helpers"
                placeholder="Select helpers"
                data={users.map((u) => ({
                  value: String(u.id),
                  label: u.display_name || u.first_name,
                }))}
                {...form.getInputProps("event_helpers")}
                searchable
                clearable
              />

              <Divider label="Timing" labelPosition="center" />

              <Group grow>
                <DateTimePicker
                  size="xs"
                  label="Start Date"
                  placeholder="Pick start date"
                  valueFormat="DD-MM-YYYY, HH:mm"
                  {...form.getInputProps("event_start")}
                  timePickerProps={{
                    withDropdown: true,
                    popoverProps: { withinPortal: false },
                    format: "24h",
                    minutesStep: 30,
                  }}
                />
                <DateTimePicker
                  size="xs"
                  label="End Date"
                  placeholder="Pick end date"
                  valueFormat="DD-MM-YYYY, HH:mm"
                  {...form.getInputProps("event_end")}
                  timePickerProps={{
                    withDropdown: true,
                    popoverProps: { withinPortal: false },
                    format: "24h",
                    minutesStep: 30,
                  }}
                />
              </Group>

              <TextInput size="xs" label="Location" placeholder="Event location" {...form.getInputProps("event_location")} />

              <Textarea size="xs" label="Description" placeholder="Enter description" autosize minRows={2} {...form.getInputProps("event_description")} />

              <Textarea size="xs" label="Notes" placeholder="Additional notes" autosize minRows={2} {...form.getInputProps("event_note")} />

              <Group justify="right" mt="xs">
                <Button size="xs" variant="default" onClick={() => setOpened(false)}>
                  Cancel
                </Button>
                <Button size="xs" type="submit">
                  {editingEvent ? "Update Event" : "Create Event"}
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>
      </Modal>
    </ScrollArea>
  );
};
