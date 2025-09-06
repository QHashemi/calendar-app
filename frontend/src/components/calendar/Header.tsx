import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import styles from "./Calendar.module.scss";
import { Button } from "@mantine/core";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

type props = {
  setWeekStartDate: React.Dispatch<React.SetStateAction<dayjs.Dayjs>>;
  weekStartDate: dayjs.Dayjs;
  calendarType: string;
  setCalendarType: React.Dispatch<React.SetStateAction<string>>;
};

export default function Header({ setWeekStartDate, weekStartDate, calendarType, setCalendarType }: props) {
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

  const [titleValue, setTitleValue] = useState<string>(`Woche ${weekStartDate.isoWeek()}`);

  const calendarButtonRef = useRef<HTMLDivElement>(null);
  const handleWeekCalendar = (e: React.MouseEvent<HTMLButtonElement>, calendarType: string) => {
    const type = calendarType.toLowerCase();
    const btnParentTarget = calendarButtonRef.current?.querySelectorAll<HTMLElement>("[data-title]");
    if (!btnParentTarget) return;

    btnParentTarget.forEach((el) => {
      const title = el.getAttribute("data-title")?.toLowerCase();
      el.style.background = title === type ? "#67adebff" : "#228be6";
    });

    switch (calendarType) {
      case "month":
        setTitleValue(`Monat ${weekStartDate.format("MMMM")}`);
        setCalendarType("month");
        break;
      case "week":
        setTitleValue(`Woche ${weekStartDate.isoWeek()}`);
        setCalendarType("week");
        break;
      case "day":
        setTitleValue(`Tag ${weekStartDate.format("dddd")}`);
        setCalendarType("day");
        break;
    }
  };

  useEffect(() => {
    setTitleValue(`Woche ${weekStartDate.isoWeek()}`);
  }, [handlePrevWeek, handleNextWeek]);

  return (
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        <Button size="xs" variant="filled" onClick={handlePrevWeek} rightSection={<FaChevronLeft />}></Button>
        <Button size="xs" variant="filled" onClick={handleNextWeek} rightSection={<FaChevronRight />}></Button>
      </div>
      <div className={styles.headerTitle}>{titleValue}</div>

      <div className={styles.headerRight} ref={calendarButtonRef}>
        <Button variant="default" size="xs" onClick={handleToday}>
          Today
        </Button>
        <Button disabled variant="filled" size="xs" data-title="month" onClick={(e) => handleWeekCalendar(e, "month")}>
          Month
        </Button>
        <Button variant="filled" size="xs" data-title="week" onClick={(e) => handleWeekCalendar(e, "week")}>
          Week
        </Button>
        <Button disabled variant="filled" size="xs" data-title="day" onClick={(e) => handleWeekCalendar(e, "day")}>
          Day
        </Button>
      </div>
    </div>
  );
}
