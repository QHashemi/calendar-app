"use client";

import { Container, Title, Text, Button, Stack, Group, Image } from "@mantine/core";
import { IconCalendarStats, IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";
import welcomeImage from "@/assets/images/welcome-page.png";

export default function WelcomePage() {

  return (
    <Container size="lg" py="xl">
      <Stack align="center" gap="xl">
        <Image src={welcomeImage}alt="Calendar App" maw={400} radius="md" fit="contain" />

        <Title order={1} ta="center" fw={700}>
          Welcome to Forstenlechner Calendar
        </Title>

        <Text ta="center" size="lg" c="dimmed" maw={600}>
          Manage your team’s projects, tasks, and schedules in one unified calendar system. Built for productivity and clarity.
        </Text>

        <Group>
          <Button size="md" component={Link} href="/login" leftSection={<IconCalendarStats size={18} />}>
            Get Started
          </Button>

          <Button variant="light" size="md" component={Link} href="/register" rightSection={<IconArrowRight size={18} />}>
            Register
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}
