import React, { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Button, Checkbox, ColorInput, Group, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { MdDateRange } from "react-icons/md";
import { IoTimeOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/Api/store";
import { create_event } from "@/Api/slices/EventSlice";
import { selectCredentialState } from "@/Api/slices/CredentialsSlice";
import useAxiosPrivate from "@/Api/useAxiosPrivate";
import styles from "../Calendar.module.scss";

type Props = {
  userId: number;
  start: Dayjs;
  end: Dayjs;
  handleOpenDetailsForm: (start: Dayjs, end: Dayjs, userId: number) => void;
  closePopover: () => void;
};

export default function AddEvent({ userId, start, end, handleOpenDetailsForm, closePopover }: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector(selectCredentialState);
  const axiosInstance = useAxiosPrivate();

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
      start: start.toISOString(),
      end: end.toISOString(),
      organizerId: user.id,
      ownerId: userId,
      helpers: [],
    };

    await dispatch(create_event({ axiosInstance, value: data, componentType: "add_event_simple_modal" })).unwrap();

    if (closePopover) closePopover();
  };

  return (
    <form onSubmit={form.onSubmit(handleAddEventSimple)} className={styles.smallAddForm}>
      <TextInput withAsterisk placeholder="Event Name" {...form.getInputProps("event_name")} size="xs" style={{ marginBottom: "5px" }} required />

      <ColorInput {...form.getInputProps("event_color")} placeholder="Select color" size="xs" mb="xs" required />

      <div className={styles.detailRow}>
        <span className={styles.label}>
          <MdDateRange />
        </span>
        <span className={styles.value}>{dayjs(start).format("dddd, D, MMM YYYY")}</span>
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
        <Button size="xs" variant="default" onClick={() => handleOpenDetailsForm(start, end, userId)}>
          More Details
        </Button>
        <Button size="xs" type="submit">
          Submit
        </Button>
      </Group>
    </form>
  );
}
