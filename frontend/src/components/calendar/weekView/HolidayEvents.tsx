import { Title } from '@mantine/core';
import { EventType } from '../../../types/EventTypes';
import dayjs, { Dayjs } from 'dayjs';
import React from 'react'
type props = {
  holidayEvents: EventType[]
  day: Dayjs
}
export default function HolidayEvents({holidayEvents, day}:props) {
  return (
    <div>
          {holidayEvents.map((ev, idx) => {
      if (!ev.start || !ev.end) return null;

      const dayStart = day.startOf("day").add(6, "hour"); 
      const dayEnd = day.startOf("day").add(18, "hour"); 

      const eventStart = dayjs(ev.start);
      const eventEnd = dayjs(ev.end);

      // Clip to visible hours
      const segmentStart = eventStart.isBefore(dayStart) ? dayStart : eventStart;
      const segmentEnd = eventEnd.isAfter(dayEnd) ? dayEnd : eventEnd;
      
      if (segmentEnd.hour(18).isBefore(dayStart) || segmentStart.hour(6).isAfter(dayEnd)) {
        return null;
      }

      const SLOT_HEIGHT = 20; // px per 30 minutes
      const top = (segmentStart.diff(dayStart, "minute") / 30) * SLOT_HEIGHT;
      const timeRange = `${segmentStart.format("HH:mm")} - ${segmentEnd.format("HH:mm")}`;

          return (
            <div
              key={`ms-${idx}`}
              style={{
                position: "absolute",
                top: `${top}px`,
                left: "0%",
                width: "100%",
                height: `${100}%`,
                background: "rgba(0, 255, 55, 0.5)",
                color: "gray",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "5px",
                pointerEvents: "none"
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                <Title style={{ textAlign: "center" }} size={10}>{ev.title || "MS Event"}</Title>
                {/* <Title size={8}>{timeRange}</Title> */}
              </div>
            </div>
          );
        })}
    </div>
  )
}
