"use client";

import dynamic from "next/dynamic";
import ReturnComponent from "@config/componentList";
import React from "react";
import Loading from "@components/Loader";

// Dynamically import Events
const Events = dynamic(() => import("@components/events/Events").then((mod) => mod.Events), {
  ssr: false,
  loading: () => <Loading />,
});

export default function EventPage() {
  return (
    <div>
      <ReturnComponent componentName="events" component={<Events />} />
    </div>
  );
}
