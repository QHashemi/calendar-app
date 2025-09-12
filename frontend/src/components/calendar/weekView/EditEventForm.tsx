"use client";

import React from "react";
import dayjs from "dayjs";
import {
  Button,
  Group,
  TextInput,
  Textarea,
  ColorInput,
  MultiSelect,
  Paper,
  Stack,
  Divider,
  Title,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useSelector, useDispatch } from "react-redux";
import { selectUsers } from "@/Api/slices/User";
import { AppDispatch, RootState } from "@/Api/store";
import { update_event, selectEventByEventId } from "@/Api/slices/EventSlice";
import { selectCredentialState } from "@/Api/slices/CredentialsSlice";
import useAxiosPrivate from "@/Api/useAxiosPrivate";
import Editor from "@components/globalComponents/TextEditor";

type Props = {
  eventId: number;
  closeModal: () => void;
};

export default function EditEventForm({ eventId, closeModal }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector(selectUsers);
  const { user } = useSelector(selectCredentialState);
  const event = useSelector((state: RootState) =>
    selectEventByEventId(state, eventId)
  );
  const axiosInstance = useAxiosPrivate();

  const form = useForm({
    initialValues: {
      event_name: event?.title || "",
      event_color: event?.color || "",
      event_start: event?.start ? dayjs(event.start).toDate() : null,
      event_end: event?.end ? dayjs(event.end).toDate() : null,
      event_note: event?.note || "",
      event_description: event?.description || "",
      event_location: event?.location || "",
      event_helpers: event?.helpers?.map((u) => String(u.id)) || [],
    },
  });

  const handleEditEvent = async (values: typeof form.values) => {
    const data = {
      id: event?.id,
      title: values.event_name,
      color: values.event_color,
      start: values.event_start
        ? dayjs(values.event_start).toISOString()
        : null,
      end: values.event_end ? dayjs(values.event_end).toISOString() : null,
      creatorId: user.id,
      helpers: values.event_helpers.map((id) => parseInt(id, 10)),
      note: values.event_note,
      description: values.event_description,
      location: values.event_location,
    };

    try {
      await dispatch(
        update_event({
          axiosInstance,
          value: data,
          componentType: "update_event_modal",
        })
      ).unwrap();
      closeModal();
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Termins", error);
    }
  };

  return (
    <Paper shadow="sm" p="sm" radius="sm" withBorder>
      <form onSubmit={form.onSubmit(handleEditEvent)}>
        <Stack gap="sm">
          <Title order={4} ta="center" mb="xs">
            Termin bearbeiten
          </Title>

          <Divider label="Termin Informationen" labelPosition="center" my="xs" />

          <TextInput
            label="Terminname"
            placeholder="Geben Sie den Terminname ein"
            withAsterisk
            size="xs"
            {...form.getInputProps("event_name")}
          />

          <ColorInput
            label="Farbe"
            placeholder="Farbe auswählen"
            size="xs"
            {...form.getInputProps("event_color")}
            required
          />

          <MultiSelect
            label="Hilfspersonen"
            placeholder="Hilfspersonen auswählen"
            size="xs"
            data={users.map((u) => ({
              value: String(u.id),
              label: u.display_name,
            }))}
            {...form.getInputProps("event_helpers")}
            searchable
            clearable
          />

          <Divider label="Zeitplan" labelPosition="center" my="xs" />

          <Group grow gap="xs">
            <DateTimePicker
              label="Startdatum"
              placeholder="Start auswählen"
              valueFormat="DD.MM.YYYY, HH:mm"
              size="xs"
              {...form.getInputProps("event_start")}
              timePickerProps={{
                withDropdown: true,
                popoverProps: { withinPortal: false },
                format: "24h",
                minutesStep: 30,
              }}
            />
            <DateTimePicker
              label="Enddatum"
              placeholder="Ende auswählen"
              valueFormat="DD.MM.YYYY, HH:mm"
              size="xs"
              {...form.getInputProps("event_end")}
              timePickerProps={{
                withDropdown: true,
                popoverProps: { withinPortal: false },
                format: "24h",
                minutesStep: 30,
              }}
            />
          </Group>

          <TextInput
            label="Ort"
            placeholder="Ort des Termins"
            size="xs"
            {...form.getInputProps("event_location")}
          />

          <Editor
            value={form.values.event_description}
            onChange={(content) =>
              form.setFieldValue("event_description", content)
            }
            height={150}
            placeholder="Beschreibung eingeben..."
          />

          <Textarea
            label="Notizen"
            placeholder="Zusätzliche Notizen"
            size="xs"
            autosize
            minRows={2}
            {...form.getInputProps("event_note")}
          />

          <Group mt="sm" gap="xs" justify="right">
            <Button size="xs" variant="default" onClick={closeModal}>
              Abbrechen
            </Button>
            <Button size="xs" type="submit">
              Termin aktualisieren
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}
