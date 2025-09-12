"use client";

import { useEffect, useRef } from "react";
import { Container, Paper, TextInput, PasswordInput, Button, Title, Text, Anchor, Stack, Center } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/Api/store";
import { login_user, selectCredentialState } from "@/Api/slices/CredentialsSlice";
import { useRouter } from "next/navigation";
import { notifyMessage } from "@/helpers/notifyMessage";
import showcaseImg from "@/assets/images/register.jpg";

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isLoggedIn, componentType, msg, error } = useSelector(selectCredentialState);
  const from = "/applayout/profile";
  const form = useForm({
    initialValues: { email: "", password: "" },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Ungültige E-Mail"),
      password: (value) => (value.length < 6 ? "Mindestens 6 Zeichen" : null),
    },
  });

  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  useEffect(() => {
    notifyMessage({ msg, error: !!error, componentType, expectedComponentType: "login_user" });
    if (isLoggedIn && componentType === "login_user") {
      router.push(from);
    }
  }, [componentType, msg, error, isLoggedIn, from, router]);

  const handleSubmit = async (values: typeof form.values) => {
    await dispatch(login_user({ value: values, componentType: "login_user"}));
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
      <Paper
        style={{
          width: "90%",
          maxWidth: 900,
          display: "flex",
          flexWrap: "wrap",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        {/* Linke Illustration */}
        <div
          style={{
            flex: "1 1 300px",
            minHeight: 300,
            backgroundImage: `url(${showcaseImg.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(0,0,0,0.3)",
              color: "#fff",
              textAlign: "center",
              padding: "1rem",
              borderRadius: 12,
            }}
          >
            <h2 style={{ marginBottom: 4 }}>Willkommen zurück</h2>
            <p style={{ fontSize: "14px", margin: 0 }}>Melde dich an, um fortzufahren!</p>
          </div>
        </div>

        {/* Rechtes Formular */}
        <div
          style={{
            flex: "1 1 300px",
            backgroundColor: "#fff",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Title order={3} style={{ fontWeight: 900, marginBottom: 12 }}>
            Login
          </Title>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="xs">
              <TextInput
                size="xs"
                placeholder="E-Mail"
                required
                autoFocus
                ref={emailRef}
                {...form.getInputProps("email")}
              />
              <PasswordInput
                size="xs"
                placeholder="Passwort"
                required
                {...form.getInputProps("password")}
              />

              <Button size="xs" type="submit" fullWidth mt="xs">
                Einloggen
              </Button>
            </Stack>
          </form>

          <Center mt="sm">
            <Text size="xs" color="dimmed">
              Noch keinen Account?{" "}
              <Anchor href="/register" size="xs">
                Registrieren
              </Anchor>
            </Text>
          </Center>
        </div>
      </Paper>
    </Container>
  );
}
