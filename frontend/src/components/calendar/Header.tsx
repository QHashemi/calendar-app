"use client";

import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import styles from "./Calendar.module.scss";
import { Button, Switch } from "@mantine/core";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

type Props = {
  setWeekStartDate: React.Dispatch<React.SetStateAction<dayjs.Dayjs>>;
  weekStartDate: dayjs.Dayjs;
  calendarType: string;
  setCalendarType: React.Dispatch<React.SetStateAction<string>>;
  showWeekend: boolean;
  setShowWeekend: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Header({
  setWeekStartDate,
  weekStartDate,
  calendarType,
  setCalendarType,
  showWeekend,
  setShowWeekend,
}: Props) {
  const handleNextWeek = () => {
    setWeekStartDate((prev) => prev.add(1, "week"));
  };

  const handlePrevWeek = () => {
    setWeekStartDate((prev) => prev.subtract(1, "week"));
  };

  const handleToday = () => {
    switch (calendarType) {
      case "month":
        break;
      case "week":
        setWeekStartDate(dayjs().startOf("week"));
        break;
      case "day":
        break;
    }
  };

  const [titleValue, setTitleValue] = useState<string>(
    `Woche ${weekStartDate.isoWeek()}`
  );

  const calendarButtonRef = useRef<HTMLDivElement>(null);

  const handleWeekCalendar = (
    e: React.MouseEvent<HTMLButtonElement>,
    calendarType: string
  ) => {
    const type = calendarType.toLowerCase();
    const btnParentTarget =
      calendarButtonRef.current?.querySelectorAll<HTMLElement>("[data-title]");
    if (!btnParentTarget) return;

    btnParentTarget.forEach((el) => {
      const title = el.getAttribute("data-title")?.toLowerCase();
      el.style.background = title === type ? "#67adebff" : "#228be6";
    });

    switch (calendarType) {
      case "month":
        setTitleValue(`Monat: ${weekStartDate.format("MMMM")}`);
        setCalendarType("month");
        break;
      case "week":
        setTitleValue(`Woche ${weekStartDate.isoWeek()}`);
        setCalendarType("week");
        break;
      case "day":
        setTitleValue(`Tag: ${weekStartDate.format("dddd")}`);
        setCalendarType("day");
        break;
    }
  };

  useEffect(() => {
    setTitleValue(`Woche ${weekStartDate.isoWeek()}`);
  }, [weekStartDate]);

  return (
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        <Button
          size="xs"
          variant="filled"
          onClick={handlePrevWeek}
          rightSection={<FaChevronLeft />}
        />
        <Button
          size="xs"
          variant="filled"
          onClick={handleNextWeek}
          rightSection={<FaChevronRight />}
        />
      </div>

      <div className={styles.headerTitle}>{titleValue}</div>

      <div className={styles.headerRight} ref={calendarButtonRef}>
        <Switch
          size="sm"
          onLabel="Ja"
          offLabel="Nein"
          label="Wochenende anzeigen"
          checked={showWeekend}
          onChange={(e) => setShowWeekend(e.currentTarget.checked)}
          ml="md"
        />

        <Button variant="default" size="xs" onClick={handleToday}>
          Heute
        </Button>

        <Button
          disabled
          variant="filled"
          size="xs"
          data-title="month"
          onClick={(e) => handleWeekCalendar(e, "month")}
        >
          Monat
        </Button>
        <Button
          variant="filled"
          size="xs"
          data-title="week"
          onClick={(e) => handleWeekCalendar(e, "week")}
        >
          Woche
        </Button>
        <Button
          disabled
          variant="filled"
          size="xs"
          data-title="day"
          onClick={(e) => handleWeekCalendar(e, "day")}
        >
          Tag
        </Button>
      </div>
    </div>
  );
}
