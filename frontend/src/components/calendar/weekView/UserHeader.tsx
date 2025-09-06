import React, { useRef } from "react";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { selectEvents } from "@/Api/slices/EventSlice";
import styles from "../Calendar.module.scss";
import { EventType } from "../../../types/EventTypes";

type Props = {
  daysOfWeek: dayjs.Dayjs[];
  userIndex: number;
  userId: number;
  handleMouseDown: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    ev: EventType,
    dayIndex: number
  ) => void;
  cellRefs: React.RefObject<(HTMLTableCellElement | null)[][]>;
};

export default function UserHeader({
  daysOfWeek,
  userId,
  userIndex,
  cellRefs,
  handleMouseDown,
}: Props) {
  const events = useSelector(selectEvents);
  const gridRef = useRef<HTMLDivElement>(null);

  const isMultiDay = (e: any) => e.is_all_day || dayjs(e.end).diff(dayjs(e.start), "day") >= 1;

  const getEventIndexes = (e: any) => {
    const s = dayjs(e.start), en = dayjs(e.end);
    return daysOfWeek
      .map((d, i) =>
        d.isSame(s, "day") || d.isSame(en, "day") || (d.isAfter(s, "day") && d.isBefore(en, "day")) ? i : -1
      )
      .filter((i) => i !== -1);
  };

  const multiDayEvents = events.filter((e: any) => e?.owner?.id === userId && isMultiDay(e));

  // keep per-day refs without changing table structure
  const attachDayRefs = (container: HTMLDivElement | null) => {
    if (!container) return;
    const cols = Array.from(container.querySelectorAll<HTMLDivElement>("[data-day-anchor]"));
    if (!cellRefs.current[userIndex]) cellRefs.current[userIndex] = [];
    cols.forEach((col, i) => {
      // store the DOM node; cast to match your existing ref type
      cellRefs.current[userIndex][i] = (col as unknown) as HTMLTableCellElement;
    });
  };

  const dayIndexFromMouse = (ev: React.MouseEvent) => {
    const grid = gridRef.current;
    if (!grid) return 0;
    const r = grid.getBoundingClientRect();
    const x = ev.clientX - r.left;
    const colW = r.width / daysOfWeek.length || 1;
    return Math.max(0, Math.min(daysOfWeek.length - 1, Math.floor(x / colW)));
  };

  return (
    <tr className={styles.tableHeaderTitle}>
      <th style={{ width: 120 }}>Whole day</th>
      <th />
      <td colSpan={daysOfWeek.length} style={{ position: "relative", padding: 0 }}>
        <div
          ref={(el) => {
            gridRef.current = el;
            attachDayRefs(el);
          }}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${daysOfWeek.length}, 1fr)`,
            gap: 6,
            padding: 6,
            position: "relative",
          }}
        >
          {/* invisible anchors for per-day refs */}
          {daysOfWeek.map((_, i) => (
            <div key={`anchor-${i}`} data-day-anchor style={{ pointerEvents: "none" }} />
          ))}

          {/* multi-day (incl. all-day) chips */}
          {multiDayEvents.map((event: any) => {
            const idxs = getEventIndexes(event);
            if (!idxs.length) return null;
            const start = Math.min(...idxs);
            const span = idxs.length;

            return (
              <div
                key={event.id}
                style={{
                  gridColumn: `${start + 1} / span ${span}`,
                  backgroundColor: event.color || "#177fff",
                  color: "#fff",
                  borderRadius: 6,
                  padding: "2px 6px",
                  fontSize: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  cursor: "grab",
                }}
                onMouseDown={(e) => handleMouseDown(e, event, dayIndexFromMouse(e))}
                title={event.title}
              >
                <span>{dayjs(event.start).format("D MMM")}</span>
                <strong>{event.title}</strong>
                <span>{dayjs(event.end).format("D MMM")}</span>
              </div>
            );
          })}
        </div>
      </td>
    </tr>
  );
}
