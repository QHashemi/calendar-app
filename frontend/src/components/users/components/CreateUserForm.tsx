"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import {
  TextInput,
  Select,
  Group,
  Button,
  ColorInput,
  Stack,
  MultiSelect,
  Paper,
  Divider,
  Title,
  Switch,
  Collapse,
  PasswordInput,
  List,
} from "@mantine/core";
import { create_user, resetUserComponentType, selectUsersState } from "@/Api/slices/User";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/Api/store";
import useAxiosPrivate from "@/Api/useAxiosPrivate";
import { selectRoles } from "@/Api/slices/RoleSlice";
import { notifyMessage } from "@/helpers/notifyMessage";
import { FaCheckCircle } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";

type CreateUserFormProps = {
  closeModal?: () => void;
};

export default function CreateUserForm({ closeModal }: CreateUserFormProps) {
  const roles = useSelector(selectRoles);
  const { msg, componentType, error } = useSelector(selectUsersState);
  const dispatch = useDispatch<AppDispatch>();
  const axiosInstance = useAxiosPrivate();
  const [loginAccess, setLoginAccess] = useState(false);

  const form = useForm({
    initialValues: {
      title: "",
      first_name: "",
      last_name: "",
      email: "",
      gender: "",
      job: "",
      color: "",
      roles: [] as string[],
      has_personal_calendar: false,
      password: "",
      confirm_password: "",
    },
  });

  useEffect(() => {
    if (componentType !== "refresh_accocreate_user") return;
    notifyMessage({
      msg,
      error: !!error,
      componentType,
      expectedComponentType: "refresh_accocreate_user",
    });
    dispatch(resetUserComponentType(""));
    form.reset();
  }, [msg, error, componentType]);

  const handleCreateUser = async (values: typeof form.values) => {
    if (loginAccess) {
      const password = values.password;
      const confirmPassword = values.confirm_password;
      const hasMinLength = password.length >= 12;
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      const passwordsMatch = password === confirmPassword;

      if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
        return notifyMessage({ msg: "Password does not meet criteria", error: true });
      }
      if (!passwordsMatch) {
        return notifyMessage({ msg: "Passwords do not match", error: true });
      }
    }

    try {
      await dispatch(create_user({ axiosInstance, value: values, componentType: "refresh_accocreate_user" })).unwrap();
      if (closeModal) closeModal();
    } catch (err) {
      console.error("Failed to create user:", err);
    }
  };

  // password validations
  const password = form.values.password;
  const hasMinLength = password.length >= 12;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password === form.values.confirm_password;

  return (
    <Paper shadow="md" p="xl" radius="md" withBorder>
      <form onSubmit={form.onSubmit(handleCreateUser)}>
        <Stack gap="xs">
          <Title order={2} ta="center" size="md">
            Create User
          </Title>

          <Divider label="Personal Info" labelPosition="center" />

          <Group grow>
            <TextInput size="xs" label="Title" placeholder="e.g. Mr, Ms, Dr" {...form.getInputProps("title")} />
            <TextInput size="xs" label="First Name" placeholder="John" {...form.getInputProps("first_name")} required />
            <TextInput size="xs" label="Last Name" placeholder="Doe" {...form.getInputProps("last_name")} required />
          </Group>

          <TextInput size="xs" label="Email" placeholder="example@mail.com" type="email" {...form.getInputProps("email")} required />

          <Divider label="Details" labelPosition="center" />

          <Group grow>
            <ColorInput size="xs" label="Favorite Color" {...form.getInputProps("color")} />
            <Select
              size="xs"
              label="Gender"
              placeholder="Select gender"
              data={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
              ]}
              {...form.getInputProps("gender")}
              clearable
            />
            <TextInput size="xs" label="Job" placeholder="Software Engineer" {...form.getInputProps("job")} />
          </Group>

          <Switch size="xs" label="Has Personal Calendar" {...form.getInputProps("has_personal_calendar", { type: "checkbox" })} />

          <MultiSelect
            size="xs"
            label="Roles"
            placeholder="Select Roles"
            data={roles.map((role) => ({ value: String(role.id), label: role.name || "" }))}
            {...form.getInputProps("roles")}
            searchable
            clearable
          />

          {/* Login access */}
          <Switch size="xs" label="Allow Login Access" checked={loginAccess} onChange={(event) => setLoginAccess(event.currentTarget.checked)} />

          <Collapse in={loginAccess}>
            <Stack gap="xs" mt="xs">
              <PasswordInput size="xs" placeholder="Password" {...form.getInputProps("password")} required={loginAccess} />
              <PasswordInput size="xs" placeholder="Confirm Password" {...form.getInputProps("confirm_password")} required={loginAccess} />
              {/* Compact password rules */}
              <List size="xs" type="unordered" style={{ listStyleType: "disc" }}>
                <List.Item>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {hasMinLength ? <FaCheckCircle color="green" /> : <IoMdCloseCircle color="red" />} Minimum 12 characters
                  </span>
                </List.Item>
                <List.Item>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {hasUppercase ? <FaCheckCircle color="green" /> : <IoMdCloseCircle color="red" />} One uppercase character
                  </span>
                </List.Item>
                <List.Item>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {hasLowercase ? <FaCheckCircle color="green" /> : <IoMdCloseCircle color="red" />} One lowercase character
                  </span>
                </List.Item>
                <List.Item>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {hasNumber ? <FaCheckCircle color="green" /> : <IoMdCloseCircle color="red" />} One number
                  </span>
                </List.Item>
                <List.Item>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {hasSpecialChar ? <FaCheckCircle color="green" /> : <IoMdCloseCircle color="red" />} One special character
                  </span>
                </List.Item>
                <List.Item>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {passwordsMatch ? <FaCheckCircle color="green" /> : <IoMdCloseCircle color="red" />} Passwords match
                  </span>
                </List.Item>
              </List>
            </Stack>
          </Collapse>

          <Group mt="xs" justify="right">
            <Button size="xs" variant="default" onClick={closeModal}>
              Cancel
            </Button>
            <Button size="xs" type="submit">
              Save Changes
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}
