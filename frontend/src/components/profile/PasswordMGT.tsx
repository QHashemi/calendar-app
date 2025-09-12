import { useForm } from "@mantine/form";
import React, { useState, useEffect } from "react";
import { TextInput, Button, Divider, List, Box, Stack, Title } from "@mantine/core";
import { IoMdCloseCircle } from "react-icons/io";
import { FaCheckCircle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import useAxiosPrivate from "@/Api/useAxiosPrivate";
import { AppDispatch } from "@/Api/store";
import {
  resetCredentialComponentType,
  selectCredentialState,
  update_password,
} from "@/Api/slices/CredentialsSlice";
import { notifyMessage } from "@/helpers/notifyMessage";

export default function PasswordMGT({ userId }: { userId: number }) {
  const dispatch = useDispatch<AppDispatch>();
  const axiosInstance = useAxiosPrivate();

  const { componentType, msg, error } = useSelector(selectCredentialState);

  const form = useForm({
    initialValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const [password, setPassword] = useState("");

  // Passwortvalidierung
  const hasMinLength = password.length >= 12;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  useEffect(() => {
    setPassword(form.values.new_password);
  }, [form.values.new_password]);

  useEffect(() => {
    if (componentType !== "update_password_form") return;
    notifyMessage({
      msg,
      error: !!error,
      componentType,
      expectedComponentType: "update_password_form",
    });
    form.reset();
    dispatch(resetCredentialComponentType(""));
  }, [msg, error, componentType]);

  const handleUpdateCredential = async (values: typeof form.values) => {
    try {
      if (hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar) {
        await dispatch(
          update_password({
            axiosInstance,
            value: values,
            id: userId,
            componentType: "update_password_form",
          })
        );
      }
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Passworts", error);
    }
  };

  return (
    <Box>
      <form onSubmit={form.onSubmit(handleUpdateCredential)}>
        <Stack>
          <Title order={3}>Passwort ändern</Title>
          <Divider />

          <TextInput
            label="Aktuelles Passwort"
            type="password"
            autoComplete="current_password"
            required
            {...form.getInputProps("current_password")}
          />

          <TextInput
            label="Neues Passwort"
            type="password"
            required
            autoComplete="new_password"
            {...form.getInputProps("new_password")}
          />

          <List
            size="sm"
            withPadding
            type="unordered"
            spacing="xs"
            style={{ listStyleType: "disc" }}
          >
            <List.Item>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                {hasMinLength ? <FaCheckCircle color="green" /> : <IoMdCloseCircle color="red" />} 
                Mindestens 12 Zeichen
              </span>
            </List.Item>
            <List.Item>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                {hasUppercase ? <FaCheckCircle color="green" /> : <IoMdCloseCircle color="red" />} 
                Mindestens ein Großbuchstabe
              </span>
            </List.Item>
            <List.Item>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                {hasLowercase ? <FaCheckCircle color="green" /> : <IoMdCloseCircle color="red" />} 
                Mindestens ein Kleinbuchstabe
              </span>
            </List.Item>
            <List.Item>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                {hasSpecialChar ? <FaCheckCircle color="green" /> : <IoMdCloseCircle color="red" />} 
                Mindestens ein Sonderzeichen
              </span>
            </List.Item>
            <List.Item>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                {hasNumber ? <FaCheckCircle color="green" /> : <IoMdCloseCircle color="red" />} 
                Mindestens eine Zahl
              </span>
            </List.Item>
          </List>

          <TextInput
            label="Passwort bestätigen"
            type="password"
            required
            autoComplete="confirm_password"
            {...form.getInputProps("confirm_password")}
          />

          <Button fullWidth type="submit">
            Passwort aktualisieren
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
