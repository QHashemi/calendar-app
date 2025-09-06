"use client";

import { useEffect, useRef, useState } from "react";
import { Container, TextInput, PasswordInput, Button, Title, Text, Anchor, Stack, List, Paper } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/Api/store";
import { register_user, selectCredentialState } from "@/Api/slices/CredentialsSlice";
import { IconUserPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { FaCheckCircle } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";
import { notifyMessage } from "@/helpers/notifyMessage";
import showcaseImg from "@/assets/images/register.jpg";
export default function RegisterPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { componentType, msg, error } = useSelector(selectCredentialState);

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
      confirm_password: "",
      first_name: "",
      last_name: "",
    },
  });

  const emailRef = useRef<HTMLInputElement>(null);
  const [password, setPassword] = useState("");

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  useEffect(() => {
    setPassword(form.values.password);
  }, [form.values.password]);

  const hasMinLength = password.length >= 12;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = form.values.password === form.values.confirm_password;

  useEffect(() => {
    notifyMessage({
      msg,
      error: !!error,
      componentType,
      expectedComponentType: "register_user",
    });
    if (componentType === "register_user" && !error) {
      router.push("/login");
    }
  }, [componentType, msg, error]);

  const handleSubmit = async (values: typeof form.values) => {
    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
      return notifyMessage({
        msg: "Password does not meet the required criteria.",
        error: true,
      });
    }

    if (!passwordsMatch) {
      return notifyMessage({
        msg: "Passwords do not match.",
        error: true,
      });
    }

    await dispatch(register_user({ value: values, componentType: "register_user" }));
  };

  return (
    <Container
      fluid
      style={{
        minHeight: "100vh",
        backgroundColor: "#e0f2ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
      }}
    >
      {/* Card */}
      <Paper
        style={{
          width: "80%",
          maxWidth: 800,
          display: "flex",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        {/* Left column: illustration */}
        <div
          style={{
            flex: 1,
            backgroundImage: `url(${showcaseImg.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: "500px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              color: "#fff",
              fontSize: "1.5rem",
              fontWeight: 700,
              textAlign: "center",
              padding: "1rem",
              backgroundColor: "rgba(0,0,0,0.3)",
              borderRadius: 12,
            }}
          >
            <h2 style={{ marginBottom: "0.5rem" }}>Welcome to Calendar</h2>
            <p style={{ fontWeight: 400, fontSize: "15px", margin: 0 }}>
              Sign in and continue to access!
            </p>
          </div>
        </div>

        {/* Right column: form */}
        <div style={{ flex: 1, backgroundColor: "#fff", padding: "1.5rem" }}>
          <Title order={3} style={{ fontWeight: 900, textAlign: "left", marginBottom: 12 }}>
            Sign Up
          </Title>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="xs">
              <TextInput size="xs" placeholder="E-Mail (Benutzername)" required ref={emailRef} {...form.getInputProps("email")} />
              <PasswordInput size="xs" placeholder="Passwort" required {...form.getInputProps("password")} />

              {/* Compact password rules */}
              <List size="xs" type="unordered" style={{ listStyleType: "disc" }}>
                <List.Item>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>{hasMinLength ? <FaCheckCircle color="green" /> : <IoMdCloseCircle color="red" />} Minimum 12 characters</span>
                </List.Item>
                <List.Item>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    {hasUppercase ? <FaCheckCircle color="green" /> : <IoMdCloseCircle color="red" />} One uppercase character
                  </span>
                </List.Item>
                <List.Item>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    {hasLowercase ? <FaCheckCircle color="green" /> : <IoMdCloseCircle color="red" />} One lowercase character
                  </span>
                </List.Item>
                <List.Item>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>{hasNumber ? <FaCheckCircle color="green" /> : <IoMdCloseCircle color="red" />} One number</span>
                </List.Item>
                <List.Item>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    {hasSpecialChar ? <FaCheckCircle color="green" /> : <IoMdCloseCircle color="red" />} One special character
                  </span>
                </List.Item>
                <List.Item>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>{passwordsMatch ? <FaCheckCircle color="green" /> : <IoMdCloseCircle color="red" />} Passwords match</span>
                </List.Item>
              </List>

              <PasswordInput size="xs" placeholder="Passwort bestätigen" required {...form.getInputProps("confirm_password")} />
              <TextInput size="xs" placeholder="Vorname" required {...form.getInputProps("first_name")} />
              <TextInput size="xs" placeholder="Nachname" required {...form.getInputProps("last_name")} />

              <Button size="xs" type="submit" fullWidth mt="xs">
                Registrieren
              </Button>
            </Stack>
          </form>

          <Text size="xs" mt="xs" color="dimmed">
            Hast du bereits ein Konto?
            <Anchor href="/login" size="xs">
              Einloggen
            </Anchor>
          </Text>
        </div>
      </Paper>
    </Container>
  );
}
