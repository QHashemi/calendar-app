import React from "react";
import dayjs from "dayjs";
import { events, users } from "../data";
import styles from "../Calendar.module.scss";

interface EventDetailsProps {
  eventId: number;

}

export default function EventDetails({ eventId }: EventDetailsProps) {
  const event = events.find((e) => e.id === eventId);
  

 const handleDeleteEvent = (eventId: number)=>{

 }
 const handleEditEvent  = (eventId: number)=>{

 }


  if (!event) {
    return <div className={styles.wrapper}>Event not found.</div>;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header} style={{background:`${event.color}/${10}`}}>
        <div className={styles.color} style={{ backgroundColor: event.color, border:`1px solid ${event.color}` }} />
        <h2 className={styles.title}>{event.title}</h2>
      </div>

      <div className={styles.detailRow}>
        <span className={styles.label}>Datum:</span>
        <span className={styles.value}>{dayjs(event.start).format("dddd, MMM D, YYYY")}</span>
      </div>

      <div className={styles.detailRow}>
        <span className={styles.label}>Zeit:</span>
        <span className={styles.value}>
          {dayjs(event.start).format("HH:mm")} - {dayjs(event.end).format("HH:mm")}
        </span>
      </div>

      <div className={styles.detailRow}>
        <span className={styles.label}>Benutzer:</span>
        <span className={styles.value}>{users.find(user=> user.id === event.userId)?.name}</span>
      </div>

      {event.note && (
        <div className={styles.detailRow}>
          <span className={styles.label}>Note:</span>
          <span className={styles.value}>{event.note}</span>
        </div>
      )}

      <div className={styles.buttonRow}>
        <button className={styles.editButton} onClick={() => handleEditEvent?.(event.id)}>Edit</button>
        <button className={styles.deleteButton} onClick={() => handleDeleteEvent?.(event.id)}>Delete</button>
      </div>
    </div>
  );
}
