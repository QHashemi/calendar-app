"use client";

import dynamic from "next/dynamic";
import ReturnComponent from "@config/componentList";
import React from "react";
import Loading from "@components/Loader";

// Dynamically import Users component
const Users = dynamic(
  () => import("@components/users/Users").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <Loading />, // fallback UI
  }
);

export default function UsersPage() {
  return (
    <div>
      <ReturnComponent componentName="users" component={<Users />} />
    </div>
  );
}


