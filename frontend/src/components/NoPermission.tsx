"use client";

import { Center, Text, Title, Paper } from "@mantine/core";
import { IoWarningOutline } from "react-icons/io5";

export default function NoPermission() {
  return (
    <Center className="h-[100vh] bg-gray-50">
      <Paper shadow="md" radius="lg" p="xl" withBorder className="max-w-lg w-full text-center bg-white">
        {/* Icon */}
        <IoWarningOutline size={90} className="mx-auto mb-4 text-red-500" />

        {/* Heading */}
        <Title order={2} className="mb-2">
          Access Denied
        </Title>
        <br />

        {/* Description */}
        <Text size="sm" c="dimmed" className="mb-6">
          You don’t have enough permissions to view this page. Please contact your administrator if you believe this is a mistake.
        </Text>
        <br />

        {/* Actions */}
        {/* <Stack align="center" gap="sm">
          <Button
            component={Link}
            href="/applayout/profile"
            variant="filled"
            color="blue"
            fullWidth
          >
            Go Back Home
          </Button>
          <Button
            component={Link}
            href="/support"
            variant="light"
            color="gray"
            fullWidth
          >
            Contact Support
          </Button>
        </Stack> */}
      </Paper>
    </Center>
  );
}
