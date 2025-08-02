import dayjs from "dayjs";
import React from "react";

import styles from "../Calendar.module.scss";
import { Button } from "@mantine/core";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";


type props = {
  setWeekStartDate: React.Dispatch<React.SetStateAction<dayjs.Dayjs>>;

  weekStartDate: dayjs.Dayjs;
};

export default function Header({ setWeekStartDate, weekStartDate }: props) {
  const handleNextWeek = () => {
    setWeekStartDate((prev) => prev.add(1, "week"));
  };

  const handlePrevWeek = () => {
    setWeekStartDate((prev) => prev.subtract(1, "week"));
  };

  return (
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        <Button
          variant="filled"
          onClick={handlePrevWeek}
          rightSection={<FaChevronLeft />}
        ></Button>
        <Button
          variant="filled"
          onClick={handleNextWeek}
          rightSection={<FaChevronRight />}
        ></Button>
        
      </div>
      <div className={styles.headerTitle}>Kalendar Woche {weekStartDate.isoWeek()}</div>

      <div className={styles.headerRight}>
        <Button variant="default"> Today </Button>

    
        <Button variant="filled">Month</Button>
        <Button variant="filled">Week</Button>
        <Button variant="filled">Day</Button>
      </div>
    </div>
  );
}
