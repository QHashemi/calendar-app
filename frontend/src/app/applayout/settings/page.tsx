"use client";

import dynamic from "next/dynamic";
import ReturnComponent from "@config/componentList";
import React from "react";
import Loading from "@components/Loader";

// Dynamically import Settings
const Settings = dynamic(
  () => import("@components/settings/Settings").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <Loading />,
  }
);

export default function SettingPage() {
  return (
    <div>
      <ReturnComponent componentName="settings" component={<Settings />} />
    </div>
  );
}
