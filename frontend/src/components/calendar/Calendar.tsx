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

export default function Calendar() {
  const dispatch = useDispatch<AppDispatch>();
  const axiosInstance = useAxiosPrivate();
  const { accessToken } = useSelector(selectCredentialState);

  useEffect(() => {
    if (accessToken) {
      dispatch(get_event({ axiosInstance, componentType: "calendar_week_page" }));
      dispatch(get_user({ axiosInstance, componentType: "calendar_week_user" }));
    }
  }, [dispatch, accessToken]);

  const [calendarType, setCalendarType] = useState<string>("week");
  const [weekStartDate, setWeekStartDate] = useState(dayjs().startOf("week"));

  const daysOfWeek = useMemo(() => Array.from({ length: 7 }, (_, i) => weekStartDate.add(i, "day")), [weekStartDate]);

  return (
    <div className={styles.container}>
      <Header weekStartDate={weekStartDate} calendarType={calendarType} setCalendarType={setCalendarType} setWeekStartDate={setWeekStartDate} />
      {calendarType === "day" && <DayView day={daysOfWeek[0]} />}
      {calendarType === "week" && <Week daysOfWeek={daysOfWeek} />}
      {calendarType === "month" && <div>Month</div>}
      {calendarType === "year" && <div>Year</div>}
    </div>
  );
}
