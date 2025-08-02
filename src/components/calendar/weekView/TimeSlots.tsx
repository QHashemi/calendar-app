import { SLOT_HEIGHT, TIME_SLOTS } from "@/services/TimeSlots";
import React from "react";
import styles from "../Calendar.module.scss";
import dayjs from "dayjs";

export default function TimeSlots() {
  const now = dayjs();

  return TIME_SLOTS.map((hour, i) => {
    
    return (
      <div key={i} className={styles.sidebarTimeSlots} style={{ height: SLOT_HEIGHT }}>
        <p style={{ fontSize: 11 }}>{hour.minute() === 0 ? hour.format("HH:mm") : ""}</p>
        {now.format("HH:mm") === hour.format("HH:mm") ? <div style={{ width: "100%", height: 2, position: "absolute", background: "red" , left:0, top:0}}></div> : ""}
      </div>
    );
  });
}
