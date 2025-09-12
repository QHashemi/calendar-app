import React from "react";
import dayjs from "dayjs";
import styles from "../Calendar.module.scss";
import { GiPin } from "react-icons/gi";
import { Avatar, Tooltip } from "@mantine/core";
import hexToRgba from "@/utils/lighterColor";
import { EventWithColumn } from "../../../types/EventTypes";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { IoTimeOutline } from "react-icons/io5";
import { uploadsUrl } from "@config/coreConfig";

// enable the plugin
dayjs.extend(isSameOrAfter);
type Props = {
  postionedEvents: EventWithColumn[];
  day: dayjs.Dayjs;
  SLOT_HEIGHT: number;
  handleMouseDown: (
    e: React.MouseEvent<HTMLDivElement>,
    ev: EventWithColumn
  ) => void;
  handleResizeMouseDown: (
    e: React.MouseEvent<HTMLDivElement>,
    ev: EventWithColumn
  ) => void;
  activeEventId: number | null;
  handleShowEventDetails: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    eventId: number
  ) => void;
};

/**
 * Compute columns for overlapping events in a given list (same day)
 * Greedy algorithm: sort by start, assign to earliest available column
 */
function computeColumnsForEvents(events: EventWithColumn[]): EventWithColumn[] {
  if (!events.length) return [];

  // Sort by start time, then end time
  const sorted = [...events].sort(
    (a, b) =>
      dayjs(a.start).valueOf() - dayjs(b.start).valueOf() ||
      dayjs(a.end).valueOf() - dayjs(b.end).valueOf()
  );

  const positioned: EventWithColumn[] = [];
  let i = 0;

  while (i < sorted.length) {
    const cluster: EventWithColumn[] = [sorted[i]];
    let clusterEnd = dayjs(sorted[i].end);
    let j = i + 1;

    // Build overlapping cluster
    while (j < sorted.length && dayjs(sorted[j].start).isBefore(clusterEnd)) {
      cluster.push(sorted[j]);
      if (dayjs(sorted[j].end).isAfter(clusterEnd)) {
        clusterEnd = dayjs(sorted[j].end);
      }
      j++;
    }

    // Assign columns within the cluster
    const columnEnds: dayjs.Dayjs[] = [];
    const assigned: { ev: EventWithColumn; col: number }[] = [];

    for (const ev of cluster) {
      let placed = false;
      for (let col = 0; col < columnEnds.length; col++) {
        if (dayjs(ev.start).isSameOrAfter(columnEnds[col])) {
          columnEnds[col] = dayjs(ev.end);
          assigned.push({ ev, col });
          placed = true;
          break;
        }
      }
      if (!placed) {
        columnEnds.push(dayjs(ev.end));
        assigned.push({ ev, col: columnEnds.length - 1 });
      }
    }

    const total = columnEnds.length;
    for (const { ev, col } of assigned) {
      positioned.push({ ...ev, column: col, totalColumns: total });
    }

    i = j; // move to next cluster
  }

  return positioned;
}

function Events({
  postionedEvents,
  day,
  SLOT_HEIGHT,
  handleMouseDown,
  handleResizeMouseDown,
  activeEventId,
  handleShowEventDetails,
}: Props) {
  // Compute correct columns for the given day's events
  const positioned = computeColumnsForEvents(postionedEvents);

  return (
    <div>
      {positioned.map((ev) => {
        const dayStart = day.startOf("day").add(6, "hour");
        const dayEnd = day.startOf("day").add(18, "hour");

        const eventStart = dayjs(ev.start);
        const eventEnd = dayjs(ev.end);

        // Clip event to visible day segment
        const segmentStart = eventStart.isBefore(dayStart)
          ? dayStart
          : eventStart;
        const segmentEnd = eventEnd.isAfter(dayEnd) ? dayEnd : eventEnd;

        if (segmentEnd.isBefore(dayStart) || segmentStart.isAfter(dayEnd)) {
          return null;
        }

        const top = (segmentStart.diff(dayStart, "minute") / 30) * SLOT_HEIGHT;
        const height =
          (segmentEnd.diff(segmentStart, "minute") / 30) * SLOT_HEIGHT;

        const cols = Math.max(1, ev.totalColumns);
        const colIndex = Math.max(0, Math.min(ev.column, cols - 1));
        const GAP = 0; // px gap between columns
        const widthPercent = 100 / cols;
        const leftPercent = (colIndex / cols) * 100;

        const styleLeft = `calc(${leftPercent}% + ${GAP * colIndex}px)`;
        const styleWidth = `calc(${widthPercent}% - ${
          (GAP * (cols - 1)) / cols
        }px)`;

        const timeRange = `${segmentStart.format(
          "HH:mm"
        )} - ${segmentEnd.format("HH:mm")}`;

        const isLongerThan30Min =
          dayjs(ev.end).diff(dayjs(ev.start), "minute") > 30;

        return (
          <div
            data-event={ev.title}
            key={`${ev.id}-${day.format("YYYYMMDD")}`}
            onMouseDown={(e) => handleMouseDown(e, ev)}
            onClick={(e) => handleShowEventDetails(e, ev.id)}
            className={`${
              ev.id === activeEventId
                ? `${styles.activeEvent} ${styles.events}`
                : styles.events
            }`}
            style={{
              position: "absolute",
              top,
              left: styleLeft,
              width: styleWidth,
              height,
            }}
          >
            <div
              style={{
                height: "100%",
                width: "4px",
                background: ev.color,
                zIndex: 1,
              }}
            ></div>

            <div
              style={{
                background: hexToRgba(ev.color, 0.22),
                width: "100%",
                zIndex: 1,
              }}
            >
              {ev.note && (
                <Tooltip
                  color={"black"}
                  arrowOffset={10}
                  w={200}
                  transitionProps={{ duration: 300 }}
                  multiline
                  arrowSize={4}
                  withArrow
                  position="right"
                  label={ev.note}
                >
                  <div className={styles.eventNote}>
                    <GiPin />
                  </div>
                </Tooltip>
              )}

              <div className={styles.eventContent}>
                <div
                  className={styles.eventHeader}
                  style={{ color: "white", background: ev.color }}
                >
                  <p className={styles.eventTitle}>{ev.title}</p>
                </div>

                <div
                  style={{
                    padding: 3,
                    display: isLongerThan30Min ? "block" : "none",
                  }}
                >
                  <div className={styles.eventCreator}>
                    <div className={styles.eventAvatar}>
                      <Avatar
                        src={
                          ev.organizer?.image
                            ? `${uploadsUrl}${ev.organizer.image}`
                            : undefined
                        } // only use src if image exists
                        color={ev.organizer?.color}
                        alt="Profile Image"
                        radius="50%"
                        size={35}
                        name={ev.organizer?.display_name} // will be displayed if src is undefined
                      />
                    </div>
                    <div>
                      {ev.organizer.first_name} {ev.organizer.last_name}
                      <div className={styles.eventTimeRange}>
                        <IoTimeOutline /> <p>{timeRange}</p>
                      </div>
                    </div>
                  </div>

                  {ev.description && (
                    <div className={styles.eventDecsContainer}>
                      {/* Render rich text stored in event description */}
                      <div
                        className={styles.eventDesc}
                        dangerouslySetInnerHTML={{ __html: ev.description }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {segmentEnd.isSame(ev.end) && (
                <div
                  data-resize-handle="true"
                  onMouseDown={(e) => handleResizeMouseDown(e, ev)}
                  className={styles.resizer}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Events;
