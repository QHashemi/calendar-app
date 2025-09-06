"use client";

import dynamic from "next/dynamic";
import ReturnComponent from "@config/componentList";
import React from "react";
import Loading from "@components/Loader";

// Dynamically import Calendar (won’t block first load)
const Calendar = dynamic(() => import("@components/calendar/Calendar"), {
  ssr: false,
  loading: () => <Loading />, // fallback while loading
});

export default function CalendarPage() {
  return (
    <div>
      <ReturnComponent componentName="calendar" component={<Calendar />} />
    </div>
  );
}
