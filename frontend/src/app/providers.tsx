"use client";

import { store } from "@/Api/store";
import { MantineProvider } from "@mantine/core";
import "@mantine/notifications/styles.css";
import { ModalsProvider } from "@mantine/modals";

import { Provider } from "react-redux";
import { Notifications } from "@mantine/notifications";
interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <MantineProvider>
        <Notifications />
        <ModalsProvider>{children}</ModalsProvider>
      </MantineProvider>
    </Provider>
  );
}
