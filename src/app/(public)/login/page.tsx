"use client";

import { Container, Paper, TextInput, PasswordInput, Button, Title, Text, Anchor, Stack, Center } from "@mantine/core";
import { useForm } from "@mantine/form";

export default function LoginPage() {
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },

    validate: {
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : "Ungültige E-Mail-Adresse"),
      password: (value) => (value.length > 0 ? null : "Passwort darf nicht leer sein"),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    alert(`Einloggen mit E-Mail: ${values.email}`);
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
        Willkommen zurück!
      </Title>


        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput label="E-Mail" placeholder="du@example.com" required {...form.getInputProps("email")} />

            <PasswordInput label="Passwort" placeholder="Dein Passwort" required {...form.getInputProps("password")} />

            <Button type="submit" fullWidth mt="xl" size="md">
              Einloggen
            </Button>
          </Stack>
        </form>

        <Center mt="md">
          <Text size="sm" color="dimmed">
            Noch keinen Account?{" "}
            <Anchor href="/register" size="sm">
              Registrieren
            </Anchor>
          </Text>
        </Center>
      </Paper>
    </Container>
  );
}
