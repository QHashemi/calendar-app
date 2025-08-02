import React from "react";
import { Dayjs } from "dayjs";
import {
  Button,
  Group,
  TextInput,
  Textarea,
  Select,
  ColorInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { User } from "../Types";
import { DateTimePicker } from "@mantine/dates";

type Props = {
  user: User | undefined;
  start: Dayjs;
  end: Dayjs;
  users: { id: number; name: string }[];
};

export default function AddDetailsEventForm({ users, start, end, }: Props) {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      projectName: "",
      projectleiter: users[0]?.id?.toString() || "",
      elektriker: users[0]?.id?.toString() || "",
      projectColor: "#00aaff",
      elektrikerColor: "#ffaa00",
      startDate: start,
      endDate: end,
      location: "",
      description: "",
      comments: "",
    },
  });

  const userOptions = users.map((u) => ({
    value: u.id.toString(),
    label: u.name,
  }));

  return (
    <form onSubmit={form.onSubmit((values) => console.log(values))}>
      <TextInput
        withAsterisk
        label="Project Name"
        placeholder="Enter project name"
        key={form.key("projectName")}
        {...form.getInputProps("projectName")}
      />

      <Select
        label="Projektleiter"
        data={userOptions}
        {...form.getInputProps("projectleiter")}
      />

      <ColorInput
        label="Projekt Farbe"
        format="hex"
        {...form.getInputProps("projectColor")}
      />

      <Select
        label="Elektriker"
        data={userOptions}
        {...form.getInputProps("elektriker")}
      />

      <ColorInput
        label="Elektriker Farbe"
        format="hex"
        {...form.getInputProps("elektrikerColor")}
      />

      {/* 👇 Group start/end side-by-side */}
      <Group grow>
        <DateTimePicker
          label="Start Datum"
          valueFormat="DD-MM-YYYY, HH:mm"
          {...form.getInputProps("startDate")}
          timePickerProps={{
          withDropdown: true,
          popoverProps: { withinPortal: false },
          format: '24h',
          minutesStep:30
          }}
        />
        <DateTimePicker
          label="End Datum"
          valueFormat="DD-MM-YYYY,  HH:mm"
          {...form.getInputProps("endDate")}
          timePickerProps={{
            withDropdown: true,
            popoverProps: { withinPortal: false },
            format: '24h',
            minutesStep:30
          }}
        />
      </Group>

      <TextInput
        label="Ort"
        placeholder="Projektstandort"
        {...form.getInputProps("location")}
      />

      <Textarea
        label="Beschreibung"
        autosize
        minRows={2}
        {...form.getInputProps("description")}
      />

      <Textarea
        label="Kommentare"
        autosize
        minRows={2}
        {...form.getInputProps("comments")}
      />

      <Group justify="space-between" mt="md">
        <Button type="submit">Speichern</Button>
      </Group>
    </form>
  );
}
