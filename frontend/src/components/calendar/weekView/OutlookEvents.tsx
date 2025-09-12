import { SLOT_HEIGHT } from '@/services/TimeSlots'
import { Title } from '@mantine/core'
import { EventType } from '../../../types/EventTypes'
import dayjs, { Dayjs } from 'dayjs'
import React from 'react'
type props = {
  outlookEvents: EventType[]
  day: Dayjs
}
export default function OutlookEvents({outlookEvents, day}:props) {
  return (
    <div> {outlookEvents.map((ev, idx) => {
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
            })}</div>
  )
}
