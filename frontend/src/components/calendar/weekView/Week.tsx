"use client";

import React, { useState, useRef, useEffect, useMemo, memo } from "react";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import duration from "dayjs/plugin/duration";
import { useDispatch, useSelector } from "react-redux";
import { useDisclosure } from "@mantine/hooks";

import styles from "../Calendar.module.scss";
import { SLOT_HEIGHT } from "@/services/TimeSlots";

import Days from "./Days";
import SidebarUsers from "./SidebarUsers";
import TimeSlots from "./TimeSlots";
import AddEventForm from "./AddEventForm";
import AddDetailsEventForm from "./AddDetailsEventForm";
import EventDetails from "./EventDetails";
import DailyTableTitle from "./DailyTableTitle";
import GlobalPopover from "@components/globalComponents/GlobalPopover";
import GlobalModal from "@components/globalComponents/GlobalModal";

import { DraggingEvent, ResizingEvent } from "../Types";
import { EventType } from "../../../types/EventTypes";
import { selectUsers } from "@/Api/slices/User";
import { selectEvents, update_event } from "@/Api/slices/EventSlice";
import { AppDispatch } from "@/Api/store";
import useAxiosPrivate from "@/Api/useAxiosPrivate";
import EditEventForm from "./EditEventForm";
import UserHeader from "./UserHeader";

dayjs.locale("de");
dayjs.extend(isoWeek);
dayjs.extend(duration);

type Props = {
  daysOfWeek: Dayjs[];
};

function Week({ daysOfWeek }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const axiosInstance = useAxiosPrivate();

  // Redux selectors
  const users = useSelector(selectUsers);
  const filteredUser = users.filter((user)=>user.has_personal_calendar)
  const eventsData = useSelector(selectEvents);

  // States
  const [events, setEvents] = useState<EventType[]>(eventsData);
  const [draggingEvent, setDraggingEvent] = useState<DraggingEvent>(null);
  const [resizingEvent, setResizingEvent] = useState<ResizingEvent>(null);
  const [activeEventId, setActiveEventId] = useState<number | null>(null);
  const [popoverContent, setPopoverContent] = useState<React.ReactNode | null>(null);
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
  const latestEventRef = useRef<EventType | null>(null);
  const [clientX, setClientX] = useState<number>(0);
  const [clientY, setClientY] = useState<number>(0);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<(HTMLTableCellElement | null)[][]>([]);
  const userRowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableSectionElement>(null);

  // Popover & Modal controls
  const popoverDisclosure = useDisclosure(false);
  const [isPopoverOpen, { open: openPopover, close: closePopover }] = popoverDisclosure;
  const modalDisclosure = useDisclosure(false);
  const [isModalOpen, { open: openModal, close: closeModal }] = modalDisclosure;

  // Sync events from Redux
  useEffect(() => {
    setEvents(eventsData);
  }, [eventsData]);

  // ===========================
  // Event Handlers
  // ===========================
  // Add to state
  const [pendingDrag, setPendingDrag] = useState<{
    startX: number;
    startY: number;
    event: EventType;
    offsetY: number;
    targetEl: HTMLDivElement;
  } | null>(null);

  const DRAG_THRESHOLD = 5;

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, ev: EventType) => {

    
    if ((e.target as HTMLElement).dataset?.resizeHandle === "true") return;

    e.preventDefault();
    const targetEl = e.currentTarget as HTMLDivElement;
    const offsetY = e.clientY - targetEl.getBoundingClientRect().top;

    targetEl.classList.add(styles.activeEvent);
    setActiveEventId(ev.id);

    setPendingDrag({
      startX: e.clientX,
      startY: e.clientY,
      event: ev,
      offsetY,
      targetEl,
    });

    if (isPopoverOpen) closePopover();
  };

  const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>, ev: EventType) => {
    e.preventDefault();
    e.stopPropagation(); // ✅ Prevent drag handler from firing

    const offsetY = e.clientY - e.currentTarget.parentElement!.getBoundingClientRect().top;

    setActiveEventId(ev.id);
    setResizingEvent({
      eventId: ev.id,
      start: dayjs(ev.start),
      originalEnd: dayjs(ev.end),
      offsetY,
    });

    if (isPopoverOpen) closePopover();
  };

  // One calc used by both openEventDetailsFromEl + getPopoverPosition
  const POP_PADDING = 10;

  // Use this when your popover uses `position: absolute` on the page/body.
  function calcPopoverCoordsAbsolute(rect: DOMRect, dialogW: number, dialogH: number) {
    const pageX = window.scrollX;
    const pageY = window.scrollY;

    // Start to the right of the element
    let x = rect.left + rect.width + POP_PADDING + pageX;
    let y = rect.top + pageY;

    const viewportRight = window.innerWidth + pageX;
    const viewportBottom = window.innerHeight + pageY;

    // Flip to the left if overflowing right edge
    if (x + dialogW > viewportRight) x = rect.left + pageX - dialogW - POP_PADDING;

    // Keep inside vertical viewport
    const elemBottom = rect.top + rect.height + pageY;
    if (y + dialogH > viewportBottom) y = Math.max(pageY + POP_PADDING, elemBottom - dialogH);
    if (y < pageY + POP_PADDING) y = pageY + POP_PADDING;

    // Keep inside left edge
    if (x < pageX + POP_PADDING) x = pageX + POP_PADDING;

    return { x, y };
  }

  const findHoveredUserId = (clientY: number) => {
    for (let i = 0; i < userRowRefs.current.length; i++) {
      const row = userRowRefs.current[i];
      if (!row) continue;
      const bounds = row.getBoundingClientRect();
      if (clientY >= bounds.top && clientY <= bounds.bottom) return filteredUser[i].id;
    }
    return null;
  };

  const findDayIndex = (userIndex: number, clientX: number) => {
    const rowCells = cellRefs.current[userIndex];
    if (!rowCells) return -1;
    for (let i = 0; i < rowCells.length; i++) {
      const cell = rowCells[i];
      if (!cell) continue;
      const bounds = cell.getBoundingClientRect();
      if (clientX >= bounds.left && clientX <= bounds.right) return i;
    }
    return -1;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (pendingDrag && !draggingEvent) {
      const dx = Math.abs(e.clientX - pendingDrag.startX);
      const dy = Math.abs(e.clientY - pendingDrag.startY);
      if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
        setDraggingEvent({
          eventId: pendingDrag.event.id,
          offsetY: pendingDrag.offsetY,
          originalStart: dayjs(pendingDrag.event.start),
          duration: dayjs(pendingDrag.event.end).diff(pendingDrag.event.start, "minute"),
        });
        setPendingDrag(null);
      } else {
        return;
      }
    }

    if (!draggingEvent && !resizingEvent) return;

    if (!containerRef.current) return;
    const hoveredUserId = findHoveredUserId(e.clientY);
    if (!hoveredUserId) return;
    const userIndex = filteredUser.findIndex((u) => u.id === hoveredUserId);
    if (userIndex === -1) return;
    const dayIndex = findDayIndex(userIndex, e.clientX);
    if (dayIndex === -1) return;
    const cell = cellRefs.current[userIndex][dayIndex];
    if (!cell) return;
    const cellBounds = cell.getBoundingClientRect();

    if (draggingEvent) {
      const relativeY = e.clientY - cellBounds.top - draggingEvent.offsetY;
      const slotIndex = Math.max(0, Math.floor(relativeY / SLOT_HEIGHT));
      const newDay = daysOfWeek[dayIndex].startOf("day").add(6, "hour");
      const newStart = newDay.add(slotIndex * 30, "minute");
      const newEnd = newStart.add(draggingEvent.duration, "minute");
      const userFind = filteredUser.find((user) => user.id === hoveredUserId);
      if (!userFind) return;

      latestEventRef.current = {
        ...events.find((ev) => ev.id === draggingEvent.eventId)!,
        start: newStart.toISOString(),
        end: newEnd.toISOString(),
        owner: userFind,
      };

      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === draggingEvent.eventId
            ? {
                ...ev,
                start: newStart.toISOString(),
                end: newEnd.toISOString(),
                owner: userFind,
              }
            : ev
        )
      );
    } else if (resizingEvent) {
      let relativeY = e.clientY - cellBounds.top + 15;
      relativeY = Math.max(relativeY, SLOT_HEIGHT);
      const slotIndex = Math.max(1, Math.floor(relativeY / SLOT_HEIGHT));
      const newDay = daysOfWeek[dayIndex].startOf("day").add(6, "hour");
      const newEnd = newDay.add(slotIndex * 30, "minute");
      const minEnd = resizingEvent.start.add(30, "minute");
      const finalEnd = newEnd.isAfter(minEnd) ? newEnd : minEnd;
      const userFind = filteredUser.find((user) => user.id === hoveredUserId);
      if (!userFind) return;

      latestEventRef.current = {
        ...events.find((ev) => ev.id === resizingEvent.eventId)!,
        end: finalEnd.toISOString(),
      };

      setEvents((prev) => prev.map((ev) => (ev.id === resizingEvent.eventId ? { ...ev, end: finalEnd.toISOString() } : ev)));
    }
  };
  const openEventDetailsFromEl = (el: HTMLElement, eventId: number) => {
    const rect = el.getBoundingClientRect();
    const dialogW = dialogRef.current?.offsetWidth || 300;
    const dialogH = dialogRef.current?.offsetHeight || 180;

    const { x, y } = calcPopoverCoordsAbsolute(rect, dialogW, dialogH);

    setClientX(x);
    setClientY(y);
    setActiveEventId(eventId);
    setPopoverContent(<EventDetails handleOpenEditEventModal={handleOpenEditEventModal} eventId={eventId} />);
    openPopover();
  };

  const handleMouseUp = async () => {
    if (pendingDrag && !draggingEvent && !resizingEvent) {
      openEventDetailsFromEl(pendingDrag.targetEl, pendingDrag.event.id);
    }

    if (latestEventRef.current) {
      const value = {
        start: latestEventRef.current.start,
        end: latestEventRef.current.end,
        ownerId: latestEventRef.current.owner.id,
        id: latestEventRef.current.id,
      };
      await dispatch(
        update_event({
          axiosInstance,
          value,
          componentType: "update_event_drag_resize",
        })
      );
      latestEventRef.current = null;
    }

    if (pendingDrag?.targetEl) {
      pendingDrag.targetEl.classList.remove(styles.activeEvent);
    }

    setDraggingEvent(null);
    setPendingDrag(null);
    setResizingEvent(null);
    setActiveEventId(null);
  };

  useEffect(() => {
    if (pendingDrag || draggingEvent || resizingEvent) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [pendingDrag, draggingEvent, resizingEvent]);

  // ===========================
  // Popover positioning
  // ===========================
  const getPopoverPosition = (e: React.PointerEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const dialogW = dialogRef.current?.offsetWidth || 300;
    const dialogH = dialogRef.current?.offsetHeight || 180;

    const { x, y } = calcPopoverCoordsAbsolute(rect, dialogW, dialogH);

    setClientX(x);
    setClientY(y);
    openPopover();
  };
  // Close popover on outside click
  useEffect(() => {
    if (!isPopoverOpen || !tableRef.current || !dialogRef.current) return;

    const handleClickOutside = (event: MouseEvent) => {
      const dialog = dialogRef.current!;
      const container = tableRef.current!;
      const children = container.querySelectorAll("[data-day_table]");
      const clickedInside =
        Array.from(children).some((el) => el.contains(event.target as Node)) ||
        dialog.contains(event.target as Node) ||
        !!document.querySelector(".mantine-ColorInput-dropdown")?.contains(event.target as Node);
      if (!clickedInside) {
        closePopover();
        setActiveEventId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isPopoverOpen, closePopover]);

  // ===========================
  // Add Event Handlers
  // ===========================

  const handleOpenEditEventModal = (eventId: number) => {
    setModalContent(<EditEventForm eventId={eventId} closeModal={closeModal} />);
    openModal();
    if (isPopoverOpen) return closePopover();
  };

  const [modalData, setModalData] = useState({
    day: dayjs(),
    hour: dayjs(),
    userId: 0,
  });

  const handleAddSimpleEvent = (e: React.PointerEvent<HTMLDivElement>, day: Dayjs, hour: Dayjs, userId: number) => {
    e.stopPropagation();
    getPopoverPosition(e);
    const startDate = day.hour(hour.hour()).minute(hour.minute());
    const endDate = startDate.add(30, "minute");
    setModalData({
      day: day,
      hour,
      userId,
    });
    setPopoverContent(<AddEventForm closePopover={closePopover} start={startDate} end={endDate} userId={userId} handleOpenDetailsForm={handleOpenDetailsForm} />);
    setActiveEventId(null);
  };

  const handleAddDetailsEvent = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, day: Dayjs, hour: Dayjs, userId: number) => {
    e.preventDefault();
    const startDate = day.hour(hour.hour()).minute(hour.minute());
    const endDate = startDate.add(30, "minute");
    setModalContent(<AddDetailsEventForm start={startDate} end={endDate} userId={userId} closeModal={closeModal} />);
    if (isPopoverOpen) {
      closePopover();
    }

    openModal();
  };

  const handleOpenDetailsForm = (start: Dayjs, end: Dayjs, userId: number) => {
    setModalContent(<AddDetailsEventForm start={start} end={end} userId={userId} closeModal={closeModal} />);
    openModal();
    closePopover();
  };

  const handleCloseSimpleForm = () => {
    closePopover();
  };
  const handleShowEventDetails = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, eventId: number) => {
    getPopoverPosition(e);
    setPopoverContent(<EventDetails handleOpenEditEventModal={handleOpenEditEventModal} eventId={eventId} />);
  };


  const tableRows = useMemo(() => {
    return filteredUser.map((user, userIndex) => (
     
        <tr
          key={user.id}
          ref={(el) => {
            userRowRefs.current[userIndex] = el;
          }}
        >
            {/* <UserHeader daysOfWeek={daysOfWeek} handleMouseDown={handleMouseDown} cellRefs={cellRefs} userId={user.id} userIndex={userIndex} /> */}

          <td className={styles.userTableRow}>
            <SidebarUsers userId={user.id} />
          </td>

          <td style={{ width: 30 }}>
            <TimeSlots />
          </td>

          <Days
            events={events}
            daysOfWeek={daysOfWeek}
            userId={user.id}
            cellRefs={cellRefs}
            userIndex={userIndex}
            handleMouseDown={handleMouseDown}
            handleResizeMouseDown={handleResizeMouseDown}
            handleAddSimpleEvent={handleAddSimpleEvent}
            handleAddDetailsEvent={handleAddDetailsEvent}
            activeEventId={activeEventId}
            handleShowEventDetails={handleShowEventDetails}
          />
        </tr>
      
    ));
  }, [filteredUser, events, daysOfWeek, cellRefs, handleMouseDown, handleResizeMouseDown, handleAddSimpleEvent, handleAddDetailsEvent, activeEventId, handleShowEventDetails]);

  return (
    <div style={{marginTop:"30px"}} ref={containerRef}>
      <GlobalPopover ref={dialogRef} popoverOpened={isPopoverOpen} handleCloseSimpleForm={handleCloseSimpleForm} popoverContent={popoverContent} clientX={clientX} clientY={clientY} />

      <GlobalModal isModalOpen={isModalOpen} title="Add Details Event" closeModal={closeModal} modalContent={modalContent} size="lg" />

      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead className={styles.calendarWeekHeader}>
            <DailyTableTitle daysOfWeek={daysOfWeek} />
          </thead>

          <tbody ref={tableRef}>{tableRows}</tbody>
        </table>
      </div>
    </div>
  );
}

export default memo(Week);
