import React, { useRef } from "react";
import { events, users } from "../data";
import { SLOT_HEIGHT, TIME_SLOTS } from "@/services/TimeSlots";
import dayjs, { Dayjs } from "dayjs";
import { EventWithColumn } from "../Types";

type Props = {
  day: Dayjs;
};

export default function DayView({ day }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const userRowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const cellRefs = useRef<(HTMLTableCellElement | null)[][]>([]);

  return (
    <div ref={containerRef} style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th
              style={{
                minWidth: 120,
                position: "sticky",
                left: 0,
                background: "#f7f7f7",
                zIndex: 2,
              }}
            >
              User
            </th>
            {TIME_SLOTS.map((hour, i) => (
              <th key={i} style={{ minWidth: 60 }}>
                <small>{hour.format("HH:mm")}</small>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {users.map((user, userIndex) => {




            return (
              <tr key={user.id}>
                <td
                  style={{
                    minWidth: 120,
                    position: "sticky",
                    left: 0,
                    background: "#fff",
                    zIndex: 1,
                  }}
                >
                  <small>{user.name}</small>
                </td>

                {TIME_SLOTS.map((hour, timeIndex) => (
                  <td
                    key={timeIndex}
                    style={{
                      border: "1px solid #ccc",
                      height: SLOT_HEIGHT,
                      position: "relative",
                      minWidth: "60px",
                    }}
                    data-user={user.id}
                    data-time={hour.format("HH:mm")}
                  />
                ))}

                event
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
