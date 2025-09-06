"use client";

import dynamic from "next/dynamic";
import ReturnComponent from "@config/componentList";
import React from "react";
import Loading from "@components/Loader";

// Dynamically import Profile
const Profile = dynamic(() => import("@components/profile/Profile").then((mod) => mod.default), {
  ssr: false,
  loading: () => <Loading />,
});

export default function ProfilePage() {
  return (
    <div>
      <ReturnComponent componentName="profile" component={<Profile />} />
    </div>
  );
}
