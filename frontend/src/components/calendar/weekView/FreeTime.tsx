import React from "react";
import dayjs, { Dayjs } from "dayjs";
import { SLOT_HEIGHT } from "@/services/TimeSlots";
import styles from "../Calendar.module.scss";
import { EventType } from "../../../types/EventTypes";
type props = {
  day: Dayjs;
  events:EventType[]
};

export default function FreeTime({ day, events }: props) {
  return (
    <div>
      {events.map((ev) => {
        const dayStart = day.startOf("day").add(6, "hour");
        const dayEnd = day.startOf("day").add(18, "hour");

        const eventStart = dayjs(ev.start);
        const eventEnd = dayjs(ev.end);

        // Clip event to visible day segment
        const segmentStart = eventStart.isBefore(dayStart) ? dayStart : eventStart;
        const segmentEnd = eventEnd.isAfter(dayEnd) ? dayEnd : eventEnd;

        if (segmentEnd.isBefore(dayStart) || segmentStart.isAfter(dayEnd)) {
          return null;
        }

        const top = (segmentStart.diff(dayStart, "minute") / 30) * SLOT_HEIGHT;
        const height = (segmentEnd.diff(segmentStart, "minute") / 30) * SLOT_HEIGHT;

        const cols = Math.max(1, ev.totalColumns);
        const colIndex = Math.max(0, Math.min(ev.column, cols - 1));
        const GAP = 0; // px gap between columns
        const widthPercent = 100 / cols;
        const leftPercent = (colIndex / cols) * 100;

        const styleLeft = `calc(${leftPercent}% + ${GAP * colIndex}px)`;
        const styleWidth = `calc(${widthPercent}% - ${(GAP * (cols - 1)) / cols}px)`;

        const timeRange = `${segmentStart.format("HH:mm")} - ${segmentEnd.format("HH:mm")}`;

        const isLongerThan30Min = dayjs(ev.end).diff(dayjs(ev.start), "minute") > 30;

        return (
          <div
            data-event={ev.title}
            className={`${styles.events}`}
            style={{
              position: "absolute",
              top,
              left: styleLeft,
              width: styleWidth,
              height,
            }}
          >
            FREE TIME
          </div>
        );
      })}
    </div>
  );
}
