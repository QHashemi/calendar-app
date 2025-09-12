"use client";

import React, { useState, useMemo, useEffect } from "react";
import Week from "./weekView/Week";
import styles from "./Calendar.module.scss";
import Header from "./Header";
import dayjs from "dayjs";
import DayView from "./dayView/DayView";
import { useDispatch, useSelector } from "react-redux";
import useAxiosPrivate from "@/Api/useAxiosPrivate";
import { AppDispatch } from "@/Api/store";
import { selectCredentialState } from "@/Api/slices/CredentialsSlice";
import { get_event } from "@/Api/slices/EventSlice";
import { get_user } from "@/Api/slices/User";

import "dayjs/locale/de"; // import German locale

dayjs.locale("de");

export default function Calendar() {
  const dispatch = useDispatch<AppDispatch>();
  const axiosInstance = useAxiosPrivate();
  const { accessToken } = useSelector(selectCredentialState);

  const [showWeekend, setShowWeekend] = useState(false);
  const [calendarType, setCalendarType] = useState<string>("week");
  const [weekStartDate, setWeekStartDate] = useState(dayjs().startOf("week"));

  useEffect(() => {
    if (accessToken) {
      dispatch(
        get_event({ axiosInstance, componentType: "calendar_week_page" })
      );
      dispatch(
        get_user({ axiosInstance, componentType: "calendar_week_user" })
      );
    }
  }, [dispatch, accessToken]);

  const daysOfWeek = useMemo(() => {
    const allDays = Array.from({ length: 7 }, (_, i) =>
      weekStartDate.add(i, "day")
    );
    // Filter weekends if showWeekend is false
    if (!showWeekend) {
      return allDays.filter((d) => d.day() !== 0 && d.day() !== 6); // 0=Sunday, 6=Saturday
    }
    return allDays;
  }, [weekStartDate, showWeekend]);

  return (
    <div className={styles.container}>
      <Header
        weekStartDate={weekStartDate}
        calendarType={calendarType}
        setCalendarType={setCalendarType}
        setWeekStartDate={setWeekStartDate}
        showWeekend={showWeekend}
        setShowWeekend={setShowWeekend}
      />
      {calendarType === "day" && <DayView day={daysOfWeek[0]} />}
      {calendarType === "week" && <Week daysOfWeek={daysOfWeek} />}
      {calendarType === "month" && <div>Month</div>}
      {calendarType === "year" && <div>Year</div>}
    </div>
  );
}
