import React from "react";
import { EventWithColumn, User } from "../Types";
import dayjs from "dayjs";
import styles from "../Calendar.module.scss";
import { GiPin } from "react-icons/gi";
import { Tooltip } from "@mantine/core";
type props = {
  postionedEvents: EventWithColumn[];
  day: dayjs.Dayjs;
  SLOT_HEIGHT: number;
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement>, ev: EventWithColumn) => void;
  handleResizeMouseDown: (e: React.MouseEvent<HTMLDivElement>, ev: EventWithColumn) => void;
  users: User[];
  activeEventId: number | null;
  handleShowEventDetails: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, eventId: number) => void;
};
export default function Events({ postionedEvents, day, SLOT_HEIGHT, handleMouseDown, handleResizeMouseDown, users, activeEventId, handleShowEventDetails }: props) {
  return (
    <div>
      {postionedEvents.map((ev) => {
        const dayStart = day.startOf("day").add(6, "hour");
        const dayEnd = day.startOf("day").add(18, "hour");

        const segmentStart = ev.start.isBefore(dayStart) ? dayStart : ev.start;
        const segmentEnd = ev.end.isAfter(dayEnd) ? dayEnd : ev.end;

        if (segmentEnd.isBefore(dayStart) || segmentStart.isAfter(dayEnd)) {
          return null;
        }

        const top = (segmentStart.diff(dayStart, "minute") / 30) * SLOT_HEIGHT;
        const height = (segmentEnd.diff(segmentStart, "minute") / 30) * SLOT_HEIGHT;
        const widthPercent = 100 / ev.totalColumns;
        const leftPercent = ev.column * widthPercent;

        const timeRange = `${segmentStart.format("HH:mm")} - ${segmentEnd.format("HH:mm")}`;

        return (
          <div
            data-event={ev.title}
            key={`${ev.id}-${day.format("YYYYMMDD")}`}
            onMouseDown={(e) => handleMouseDown(e, ev)}
            onClick={(e) => handleShowEventDetails(e, ev.id)}
            className={`${ev.id === activeEventId ? `${styles.activeEvent} ${styles.events}` : styles.events}`}
            style={{
              top: top,
              left: `${leftPercent}%`,
              width: `${widthPercent}%`,
              height: height,
              backgroundColor: ev.color,
            }}
          >
            {ev.note && (
              <Tooltip color="pink" arrowOffset={10} transitionProps={{ transition: "fade-left", duration: 300 }} arrowSize={4} withArrow position="right" label={ev.note}>
                <div className={styles.eventNote}>
                  <GiPin />
                </div>
              </Tooltip>
            )}

            <div>
              <strong>{ev.title} </strong>
              <div style={{ fontSize: 10, opacity: 0.8 }}>{timeRange}</div>
            </div>

            {segmentEnd.isSame(ev.end) && (
              <div
                onMouseDown={(e) => handleResizeMouseDown(e, ev)}
                style={{
                  height: 5,
                  background: "#3182ce",
                  cursor: "ns-resize",
                  borderRadius: "0 0 4px 4px",
                  marginTop: 0,
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
