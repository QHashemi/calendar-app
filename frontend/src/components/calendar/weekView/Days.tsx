import React, { memo } from "react";
import dayjs, { Dayjs } from "dayjs";
import Events from "./Events";
import styles from "../Calendar.module.scss";
import { SLOT_HEIGHT, TIME_SLOTS } from "@/services/TimeSlots";
import isBetween from "dayjs/plugin/isBetween";
import GetWeather from "@/services/weather/dailyWeather";
import { useSelector } from "react-redux";
import { RootState } from "@/Api/store";
import { selectUserById } from "@/Api/slices/User";
import { EventType, EventWithColumn } from "../../../types/EventTypes";
import { can } from "@/helpers/policy";
import { selectCredentialState } from "@/Api/slices/CredentialsSlice";
import FreeTime from "./FreeTime";
import { Title } from "@mantine/core";
dayjs.extend(isBetween);

type props = {
  daysOfWeek: dayjs.Dayjs[];
  userId: number;
  cellRefs: React.RefObject<(HTMLTableCellElement | null)[][]>;
  userIndex: number;
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, ev: EventType) => void;
  handleResizeMouseDown: (e: React.MouseEvent<HTMLDivElement>, ev: EventType) => void;
  handleAddSimpleEvent: (e: React.PointerEvent<HTMLDivElement>, day: Dayjs, hour: Dayjs, userId: number) => void;
  handleAddDetailsEvent: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, day: Dayjs, hour: Dayjs, userId: number) => void;
  activeEventId: number | null;
  handleShowEventDetails: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, eventId: number) => void;
  events: EventType[];
};

function days({ daysOfWeek, userId, cellRefs, userIndex, handleMouseDown, handleResizeMouseDown, handleAddSimpleEvent, handleAddDetailsEvent, activeEventId, handleShowEventDetails, events }: props) {
  const ms_events = events.filter((event) => event.is_ms_event);

  const normal_events = events.filter((event) => !event.is_ms_event);
  const { user: loggedUser } = useSelector(selectCredentialState);
  const user = useSelector((state: RootState) => selectUserById(state, userId));

  // const events = useSelector(selectEvents);

  function eventsOverlap(a: EventType, b: EventType) {
    return dayjs(a.start).isBefore(b.end) && dayjs(a.start).isBefore(a.end);
  }

  return daysOfWeek.map((day, dayIndex) => {
    if (!user) return;

    const dayEvents = normal_events.filter((ev) => ev.owner.id === user.id && dayjs(ev.start).isBefore(day.endOf("day")) && dayjs(ev.end).isAfter(day.startOf("day")));
    const msEvents = ms_events.filter((ev) => ev.owner.id === user.id && dayjs(ev.start).isBefore(day.endOf("day")) && dayjs(ev.end).isAfter(day.startOf("day")));

    const positionedEvents: EventWithColumn[] = [];

    dayEvents.forEach((ev) => {
      const overlapping = dayEvents.filter((e) => eventsOverlap(e, ev));

      const usedColumns = new Set<number>();
      positionedEvents.forEach((pe) => {
        if (eventsOverlap(pe, ev)) {
          usedColumns.add(pe.column);
        }
      });
      let col = 0;
      while (usedColumns.has(col)) col++;
      const totalCols = overlapping.length;
      positionedEvents.push({ ...ev, column: col, totalColumns: totalCols });
    });

    return (
      <td
        key={dayIndex}
        ref={(el) => {
          if (!cellRefs.current[userIndex]) cellRefs.current[userIndex] = [];
          cellRefs.current[userIndex][dayIndex] = el;
        }}
        style={{
          position: "relative",
          border: "1px solid #ddd",
          height: SLOT_HEIGHT * TIME_SLOTS.length,
        }}
        data-day_table={day.toISOString()}
      >
        {TIME_SLOTS.map((hour, i) => {
          const canAdd = can(loggedUser, "add:event", {});
          if (canAdd) {
            return (
              <div
                key={i}
                style={{
                  height: SLOT_HEIGHT,
                  backgroundColor: day.day() === 0 || day.day() === 6 ? (day.isSame(dayjs()) ? "" : "#f7f9fa") : day.isSame(dayjs()) ? "#d6f1ff" : "",
                  position: "relative",
                }}
                className={styles.hours}
                onPointerDown={(e) => handleAddSimpleEvent(e, day, hour, user.id)}
                onDoubleClick={(e) => handleAddDetailsEvent(e, day, hour, user.id)}
                data-user={user.id}
              ></div>
            );
          } else {
            return (
              <div
                key={i}
                style={{
                  height: SLOT_HEIGHT,
                  backgroundColor: day.day() === 0 || day.day() === 6 ? (day.isSame(dayjs()) ? "" : "#f7f9fa") : day.isSame(dayjs()) ? "#d6f1ff" : "",
                  position: "relative",
                }}
                className={styles.hours}
                data-user={user.id}
              ></div>
            );
          }
        })}

        <Events
          postionedEvents={positionedEvents}
          day={day}
          SLOT_HEIGHT={SLOT_HEIGHT}
          handleMouseDown={handleMouseDown}
          handleResizeMouseDown={handleResizeMouseDown}
          activeEventId={activeEventId}
          handleShowEventDetails={handleShowEventDetails}
        />

        {/* Render ms_events directly (like FreeTime, no column handling) */}
        {msEvents.map((ev, idx) => {
          const dayStart = day.startOf("day").add(6, "hour");
          const dayEnd = day.startOf("day").add(18, "hour");

          const eventStart = dayjs(ev.start);
          const eventEnd = dayjs(ev.end);

          // Clip to visible hours
          const segmentStart = eventStart.isBefore(dayStart) ? dayStart : eventStart;
          const segmentEnd = eventEnd.isAfter(dayEnd) ? dayEnd : eventEnd;

          if (segmentEnd.isBefore(dayStart) || segmentStart.isAfter(dayEnd)) {
            return null;
          }

          const top = (segmentStart.diff(dayStart, "minute") / 30) * SLOT_HEIGHT;
          const height = (segmentEnd.diff(segmentStart, "minute") / 30) * SLOT_HEIGHT;
          const timeRange = `${segmentStart.format("HH:mm")} - ${segmentEnd.format("HH:mm")}`;
          return (
            <div
              key={`ms-${idx}`}
              // className={styles.events}
              style={{
                position: "absolute",
                top: `${top}px`,
                left: "0%", // always full width
                width: "100%", // take full width
                height: `${height}px`,
                background: "rgba(255, 166, 0, 0.5)",
                color: "white",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding:"5px",
                pointerEvents:"none"
                
              }}
            >
              <div style={{display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center"}}>
                <Title style={{textAlign:"center"}} size={10}>{ev.title || "MS Event"}</Title>
                {/* <Title size={8}>{timeRange}</Title> */}
              </div>
            </div>
          );
        })}
      </td>
    );
  });
}

export default memo(days);
