"use client";

import React, { useRef, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import {
  Button,
  Group,
  TextInput,
  ColorInput,
  MultiSelect,
  Paper,
  Divider,
  Title,
  Stack,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { DateTimePicker } from "@mantine/dates";
import { useSelector, useDispatch } from "react-redux";
import { selectUsers } from "@/Api/slices/User";
import { AppDispatch } from "@/Api/store";
import { create_event } from "@/Api/slices/EventSlice";
import { selectCredentialState } from "@/Api/slices/CredentialsSlice";
import useAxiosPrivate from "@/Api/useAxiosPrivate";

import JoditEditor from "jodit-react";
import Editor from "@components/globalComponents/TextEditor";

type Props = {
  userId: number;
  start: Dayjs;
  end: Dayjs;
  closeModal: () => void;
};

export default function AddDetailsEventForm({
  userId,
  start,
  end,
  closeModal,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector(selectUsers);
  const { user } = useSelector(selectCredentialState);
  const axiosInstance = useAxiosPrivate();

  const [description, setDescription] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const form = useForm({
    initialValues: {
      event_name: "",
      event_start: start,
      event_color: user.color || "",
      event_end: end,
      event_helpers: [] as string[],
      event_location: "",
    },
  });

  const handleAddEventDetails = async (values: typeof form.values) => {
    const data = {
      title: values.event_name,
      color: values.event_color,
      start: dayjs(values.event_start).toISOString(),
      end: dayjs(values.event_end).toISOString(),
      organizerId: user.id,
      ownerId: userId,
      helpers: values.event_helpers.map((ids: string) => parseInt(ids)),
      note,
      description,
      location: values.event_location,
    };

    try {
      await dispatch(
        create_event({
          axiosInstance,
          value: data,
          componentType: "add_event_details_modal",
        })
      ).unwrap();
      closeModal();
    } catch (error) {
      console.error("Failed to create event", error);
    }
  };

  return (
    <Paper shadow="sm" p="sm" radius="sm" withBorder>
      <form onSubmit={form.onSubmit(handleAddEventDetails)}>
        <Stack gap="sm">
          <Title order={4} ta="center" mb="xs">
            Create Event
          </Title>

          <Divider label="Event Info" labelPosition="center" my="xs" />

         <TextInput
            label="Eventname"
            placeholder="Geben Sie den Eventnamen ein"
            withAsterisk
            size="xs"
            {...form.getInputProps("event_name")}
          />

          <ColorInput
            label="Eventfarbe"
            placeholder="Farbe auswählen"
            size="xs"
            {...form.getInputProps("event_color")}
            required
          />

      
          <MultiSelect
            label="Helfer"
            placeholder="Helfer auswählen"
            size="xs"
            data={users.map((u) => ({
              value: String(u.id),
              label: u.display_name,
            }))}
            {...form.getInputProps("event_helpers")}
            searchable
            clearable
          />

          <Group grow gap="xs">
           <DateTimePicker
              label="Startdatum"
              placeholder="Start auswählen"
              valueFormat="DD-MM-YYYY, HH:mm"
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
              valueFormat="DD-MM-YYYY, HH:mm"
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
            placeholder="Eventort"
            size="xs"
            {...form.getInputProps("event_location")}
          />
          {/* Jodit Editor for Description */}
          <div>
            <label style={{ fontSize: 12 }}>Beschreibung</label>
            <Editor
              value={description}
              onChange={setDescription}
              height={100}
              placeholder="Beschreibung eingeben..."
            />
          </div>

          {/* Jodit Editor for Notes */}
          <div>
           <Textarea
              label="Notizen"
              placeholder="Zusätzliche Notizen"
              size="xs"
              autosize
              minRows={2}
              {...form.getInputProps("event_note")}
            />
          </div>

          <Group mt="sm" gap="xs" justify="right">
            <Button size="xs" variant="default" onClick={closeModal}>
              Abbrechen
            </Button>
            <Button size="xs" type="submit">
              Event speichern
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}
