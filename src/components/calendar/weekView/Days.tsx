import React from "react";
import { EventWithColumn, Event, User } from "../Types";
import dayjs, { Dayjs } from "dayjs";
import Events from "./Events";
import styles from "../Calendar.module.scss";
import { users } from "../data";
import { SLOT_HEIGHT, TIME_SLOTS } from "@/services/TimeSlots";
import isBetween from "dayjs/plugin/isBetween";
import GetWeather from "@/services/weather/dailyWeather";
dayjs.extend(isBetween);

type props = {
  daysOfWeek: dayjs.Dayjs[];
  events: Event[];
  user: User;
  cellRefs: React.RefObject<(HTMLTableCellElement | null)[][]>;
  userIndex: number;
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, ev: Event) => void;
  handleResizeMouseDown: (e: React.MouseEvent<HTMLDivElement>, ev: Event) => void;
  handleAddSimpleEvent: (e: React.PointerEvent<HTMLDivElement>, day: Dayjs, hour: Dayjs, userId:number) => void;
 handleAddDetailsEvent: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, day: Dayjs, hour: Dayjs, userId:number) => void;
 activeEventId:number | null;
   handleShowEventDetails:(e: React.MouseEvent<HTMLDivElement, MouseEvent>, eventId:number)=> void
};

export default function days({ daysOfWeek, 
  events, 
  user, 
  cellRefs,
  userIndex, 
  handleMouseDown, 
  handleResizeMouseDown,
  handleAddSimpleEvent,
  handleAddDetailsEvent,
  activeEventId,
  handleShowEventDetails
}: props) {

  function eventsOverlap(a: Event, b: Event) {
    return a.start.isBefore(b.end) && b.start.isBefore(a.end);
  }


  return daysOfWeek.map((day, dayIndex) => {
   
    const dayEvents = events.filter((ev) => ev.userId === user.id && ev.start.isBefore(day.endOf("day")) && ev.end.isAfter(day.startOf("day")));
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
            return (
              <div
                key={i}
                style={{
                  height: SLOT_HEIGHT,
                  backgroundColor: (day.day() === 0 || day.day() === 6 ? (
                    day.isSame(dayjs())  ? "": "#f7f9fa"
                  ): (day.isSame(dayjs()) ? "#d6f1ff": "")),
                  position: "relative",
                }}
                className={styles.hours}
                onPointerDown={(e) => handleAddSimpleEvent(e, day, hour, user.id)}
                onDoubleClick={(e) => handleAddDetailsEvent(e, day, hour, user.id)}
                data-user={user.id}
              ></div>
            );
          })}

          <Events postionedEvents={positionedEvents} day={day} SLOT_HEIGHT={SLOT_HEIGHT} handleMouseDown={handleMouseDown} handleResizeMouseDown={handleResizeMouseDown} users={users} activeEventId={activeEventId} handleShowEventDetails={handleShowEventDetails}/>
        </td>

      
    );
  });
}








