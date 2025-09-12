"use client";

import React, { useState, useRef } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Button, ColorInput, Group, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { MdDateRange } from "react-icons/md";
import { IoTimeOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/Api/store";
import { create_event } from "@/Api/slices/EventSlice";
import { selectCredentialState } from "@/Api/slices/CredentialsSlice";
import useAxiosPrivate from "@/Api/useAxiosPrivate";
import JoditEditor from "jodit-react";
import styles from "../Calendar.module.scss";
import Editor from "@components/globalComponents/TextEditor";

type Props = {
  userId: number;
  start: Dayjs;
  end: Dayjs;
  handleOpenDetailsForm: (start: Dayjs, end: Dayjs, userId: number) => void;
  closePopover: () => void;
};

export default function AddEvent({
  userId,
  start,
  end,
  handleOpenDetailsForm,
  closePopover,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector(selectCredentialState);
  const axiosInstance = useAxiosPrivate();

  const [description, setDescription] = useState("");

  const form = useForm({
    initialValues: {
      event_name: "",
      event_color: user.color || "",
    },
  });

  const handleAddEventSimple = async (values: typeof form.values) => {
    const data = {
      title: values.event_name,
      color: values.event_color,
      description,
      start: start.toISOString(),
      end: end.toISOString(),
      organizerId: user.id,
      ownerId: userId,
      helpers: [],
    };

    await dispatch(
      create_event({
        axiosInstance,
        value: data,
        componentType: "add_event_simple_modal",
      })
    ).unwrap();

    if (closePopover) closePopover();
  };

  return (
    <form
      onSubmit={form.onSubmit(handleAddEventSimple)}
      className={styles.smallAddForm}
    >
      <TextInput
        withAsterisk
        placeholder="Eventname"
        {...form.getInputProps("event_name")}
        size="xs"
        style={{ marginBottom: "5px" }}
        required
      />

      <ColorInput
        {...form.getInputProps("event_color")}
        placeholder="Farbe auswählen"
        size="xs"
        mb="xs"
        required
      />

      {/* Jodit Editor for Event Description */}
      <div style={{ marginBottom: "8px" }}>
        <Editor
          value={description}
          onChange={setDescription}
          height={100}
          placeholder="Beschreibung eingeben..."
        />
      </div>

     <div className={styles.detailRow}>
      <span className={styles.label}>
        <MdDateRange />
      </span>
      <span className={styles.value}>
        {dayjs(start).format("dddd, D. MMM YYYY")}
      </span>
    </div>

     <div className={styles.detailRow}>
      <span className={styles.label}>
        <IoTimeOutline />
      </span>
      <span className={styles.value}>
        <strong>
          {dayjs(start).format("HH:mm")} - {dayjs(end).format("HH:mm")}
        </strong>
      </span>
    </div>

      <Group justify="space-between" mt="md">
         <Button
          size="xs"
          variant="default"
          onClick={() => handleOpenDetailsForm(start, end, userId)}
        >
          Weitere Details
        </Button>
        <Button size="xs" type="submit">
          Speichern
        </Button>
      </Group>
    </form>
  );
}
