"use client";

import { Container, Title, Text, Center, Loader, Stack, Paper } from "@mantine/core";

export default function Dashboard() {
  return (
    <Container size="sm" py="xl">
      <Center style={{ minHeight: "70vh" }}>
        <Paper
          shadow="md"
          radius="md"
          p="xl"
          withBorder
          style={{ textAlign: "center", maxWidth: 500 }}
        >
          <Stack align="center" gap="sm">
            <Loader size="lg" color="blue" type="oval" />

            <Title order={2} c="blue">
              We are working on this page 🚧
            </Title>

            <Text c="dimmed" size="sm">
              The Dashboard feature is under construction.  
              Please check back later — exciting updates are coming soon!
            </Text>
          </Stack>
        </Paper>
      </Center>
    </Container>
  );
}
