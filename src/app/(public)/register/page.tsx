"use client";

import { Container, Paper, TextInput, PasswordInput, Button, Title, Text, Anchor, Stack, Center } from "@mantine/core";
import { useForm } from "@mantine/form";

export default function RegisterPage() {
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },

    validate: {
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : "Ungültige E-Mail-Adresse"),
      password: (value) => (value.length >= 6 ? null : "Das Passwort muss mindestens 6 Zeichen lang sein"),
      confirmPassword: (value, values) => (value === values.password ? null : "Die Passwörter stimmen nicht überein"),
      firstName: (value) => (value.trim().length > 0 ? null : "Vorname ist erforderlich"),
      lastName: (value) => (value.trim().length > 0 ? null : "Nachname ist erforderlich"),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    alert(`Registrierung:\nE-Mail: ${values.email}\nVorname: ${values.firstName}\nNachname: ${values.lastName}`);
  };

  return (
    <Container size={420} my={40}>
      <Paper radius="md" p="xl" withBorder shadow="sm" ms={{ backgroundColor: "#fff" }}>
     <Title
        order={2}
        style={{
          fontWeight: 900,
          fontFamily: 'Greycliff CF, sans-serif',
          textAlign: 'center',
          marginBottom: 24,
        }}
      >
        Willkommen
      </Title>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput label="E-Mail (Benutzername)" placeholder="du@example.com" required {...form.getInputProps("email")} />

            <PasswordInput label="Passwort" placeholder="Passwort erstellen" required {...form.getInputProps("password")} />

            <PasswordInput label="Passwort bestätigen" placeholder="Passwort wiederholen" required {...form.getInputProps("confirmPassword")} />

            <TextInput label="Vorname" placeholder="Max" required {...form.getInputProps("firstName")} />

            <TextInput label="Nachname" placeholder="Mustermann" required {...form.getInputProps("lastName")} />

            <Button type="submit" fullWidth mt="xl" size="md">
              Registrieren
            </Button>
          </Stack>
        </form>

        <Center mt="md">
          <Text size="sm" color="dimmed">
            Hast du bereits ein Konto?{" "}
            <Anchor href="/login" size="sm">
              Einloggen
            </Anchor>
          </Text>
        </Center>
      </Paper>
    </Container>
  );
}
