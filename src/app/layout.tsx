// src/app/layout.tsx
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "./globals.css";

import { ColorSchemeScript } from "@mantine/core";
import type { Metadata } from "next";
import React from "react";
import Providers from "./providers";

// Optional: SEO metadata
export const metadata: Metadata = {
  title: "FTL Calendar App",
  description: "Manage your team and calendar efficiently",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
