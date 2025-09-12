"use client";

import React, { useEffect } from "react";
import { useForm } from "@mantine/form";
import {
  TextInput,
  Select,
  Group,
  Button,
  ColorInput,
  MultiSelect,
  Stack,
  Paper,
  Divider,
  Title,
  Switch,
} from "@mantine/core";
import { UserType } from "@/types/UserTypes";
import { resetUserComponentType, selectUsersState, update_user } from "@/Api/slices/User";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/Api/store";
import useAxiosPrivate from "@/Api/useAxiosPrivate";
import { refresh_account } from "@/Api/slices/CredentialsSlice";
import { selectRoles } from "@/Api/slices/RoleSlice";
import { selectPermissions } from "@/Api/slices/PermissionSlice";
import { notifyMessage } from "@/helpers/notifyMessage";

type UpdateUserFormProps = {
  closeModal?: () => void;
  user: UserType;
};

export default function UpdateUserForm({ closeModal, user }: UpdateUserFormProps) {
  const roles = useSelector(selectRoles);
  const permissions = useSelector(selectPermissions);
  const dispatch = useDispatch<AppDispatch>();
  const axiosInstance = useAxiosPrivate();
  const { msg, componentType, error } = useSelector(selectUsersState);

  const form = useForm({
    initialValues: {
      title: user.title || "",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      gender: user.gender || "",
      job: user.job || "",
      color: user.color || "",
      has_personal_calendar: user.has_personal_calendar || false,
      roles: user.roles?.map((role) => String(role.id)) || [],
      extra_permissions: user.extra_permissions?.map((perm) => String(perm.id)) || [],
    },
  });

  useEffect(() => {
    if (componentType !== "update_user_modal") return;
    notifyMessage({
      msg,
      error: !!error,
      componentType,
      expectedComponentType: "update_user_modal",
    });
    dispatch(resetUserComponentType(""));
    form.reset();
  }, [msg, error, componentType]);

  const handleUpdateUser = async (values: typeof form.values) => {
    try {
      await dispatch(
        update_user({
          axiosInstance,
          value: values,
          id: user.id,
          componentType: "update_user_modal",
        })
      ).unwrap();

      await dispatch(refresh_account({ axiosInstance, componentType: "refresh_account" })).unwrap();

      if (closeModal) closeModal();
    } catch (err) {
      console.error("Benutzeraktualisierung fehlgeschlagen:", err);
    }
  };

  return (
    <Paper shadow="md" p="xl" radius="md" withBorder>
      <form onSubmit={form.onSubmit(handleUpdateUser)}>
        <Stack gap="xs">
          <Title order={3} ta="center" size="xs">
            Benutzer bearbeiten
          </Title>

          <Divider label="Persönliche Informationen" labelPosition="center" />
          <Group grow>
            <TextInput size="xs" label="Anrede" placeholder="z.B. Herr, Frau, Dr" {...form.getInputProps("title")} />
            <TextInput size="xs" label="Vorname" placeholder="Max" {...form.getInputProps("first_name")} required />
            <TextInput size="xs" label="Nachname" placeholder="Mustermann" {...form.getInputProps("last_name")} required />
          </Group>

          <TextInput size="xs" label="E-Mail" placeholder="beispiel@mail.de" type="email" {...form.getInputProps("email")} required />

          <Divider label="Details" labelPosition="center" />
          <Group grow>
            <ColorInput size="xs" label="Lieblingsfarbe" {...form.getInputProps("color")} />
            <Select
              size="xs"
              label="Geschlecht"
              placeholder="Geschlecht auswählen"
              data={[
                { value: "male", label: "Männlich" },
                { value: "female", label: "Weiblich" },
                { value: "other", label: "Andere" },
              ]}
              {...form.getInputProps("gender")}
              clearable
            />
            <TextInput size="xs" label="Beruf" placeholder="Softwareentwickler" {...form.getInputProps("job")} />
          </Group>

          <Switch size="xs" label="Persönlicher Kalender aktiviert" {...form.getInputProps("has_personal_calendar", { type: "checkbox" })} />

          <Divider label="Zugriffsrechte" labelPosition="center" />
          {roles.length > 0 && permissions.length > 0 && (
            <>
              <MultiSelect
                size="xs"
                label="Rollen"
                placeholder="Rollen auswählen"
                data={roles.map((role) => ({ value: String(role.id), label: role.name }))}
                value={form.values.roles}
                onChange={(val) => form.setFieldValue("roles", val)}
                searchable
                clearable
              />

              <MultiSelect
                size="xs"
                label="Zusätzliche Berechtigungen"
                placeholder="Berechtigungen auswählen"
                data={permissions.map((perm) => ({ value: String(perm.id), label: perm.name }))}
                value={form.values.extra_permissions}
                onChange={(val) => form.setFieldValue("extra_permissions", val)}
                searchable
                clearable
              />
            </>
          )}

          <Group mt="xs" justify="right">
            <Button size="xs" variant="default" onClick={closeModal}>
              Abbrechen
            </Button>
            <Button size="xs" type="submit">
              Änderungen speichern
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}
