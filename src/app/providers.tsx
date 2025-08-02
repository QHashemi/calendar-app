"use client";

import { MantineProvider } from '@mantine/core';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <MantineProvider>
      {children}
    </MantineProvider>
  );
}
