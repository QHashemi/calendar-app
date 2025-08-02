"use client";

import React, { useState, useRef, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import duration from "dayjs/plugin/duration";
import { events as eventsData, users } from "../data";
import { DraggingEvent, Event, ResizingEvent, User } from "../Types";
import styles from "../Calendar.module.scss";
import "dayjs/locale/de";
import Header from "./Header";
import Days from "./Days";
import SidebarUsers from "./SidebarUsers";
import { SLOT_HEIGHT } from "@/services/TimeSlots";
import TimeSlots from "./TimeSlots";
import { useDisclosure } from "@mantine/hooks";
import AddEventForm from "./AddEventForm";
import GlobalPopover from "@components/globalComponents/GlobalPopover";
import GlobalModal from "@components/globalComponents/GlobalModal";
import AddDetailsEventForm from "./AddDetailsEventForm";
import GetWeather from "@/services/weather/dailyWeather";
import DailyTableTitle from "./DailyTableTitle";
import EventDetails from "./EventDetails";


dayjs.locale("de");
dayjs.extend(isoWeek);
dayjs.extend(duration);

export default function Week() {

  const popoverDisclosure = useDisclosure(false);
  const isPopoverOpen = popoverDisclosure[0];
  const openPopover = popoverDisclosure[1].open;
  const closePopover = popoverDisclosure[1].close;

  // STATES ================================
  const [weekStartDate, setWeekStartDate] = useState(dayjs().startOf("week"));
  const [events, setEvents] = useState<Event[]>(eventsData);
  const [draggingEvent, setDraggingEvent] = useState<DraggingEvent>(null);
  const [resizingEvent, setResizingEvent] = useState<ResizingEvent>(null);


  // REFS ==================================
  const containerRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<(HTMLTableCellElement | null)[][]>([]);
  const userRowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  const daysOfWeek = Array.from({ length: 7 }, (_, i) => weekStartDate.add(i, "day"));



const [activeEventId, setActiveEventId] = useState<number | null>(null)


  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, ev: Event) => {
    e.stopPropagation();
    const eventBox = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - eventBox.top;
    e.currentTarget.classList.add(styles.activeEvent)
 
    
    setActiveEventId(ev.id); // ✅ Save ID instead of element
    
 
    setDraggingEvent({
      eventId: ev.id,
      offsetY,
      originalStart: ev.start,
      duration: ev.end.diff(ev.start, "minute"),
    });
      if(isPopoverOpen){
      closePopover()
    }

  };

  const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>, ev: Event) => {
    e.stopPropagation();
    const eventBox = e.currentTarget.parentElement!.getBoundingClientRect();
    const offsetY = e.clientY - eventBox.top;

     if(isPopoverOpen){
      closePopover()
    }

    setResizingEvent({
      eventId: ev.id,
      start: ev.start,
      originalEnd: ev.end,
      offsetY,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!containerRef.current)  return;
   

    const findHoveredUserId = () => {
      for (let i = 0; i < userRowRefs.current.length; i++) {
        const row = userRowRefs.current[i];
        if (!row) continue;
        const bounds = row.getBoundingClientRect();
        if (e.clientY >= bounds.top && e.clientY <= bounds.bottom) {
          return users[i].id;
        }
      }
      return null;
    };

    const findDayIndex = (userIndex: number) => {
      const rowCells = cellRefs.current[userIndex];
      if (!rowCells) return -1;
      for (let i = 0; i < rowCells.length; i++) {
        const cell = rowCells[i];
        if (!cell) continue;
        const bounds = cell.getBoundingClientRect();
        if (e.clientX >= bounds.left && e.clientX <= bounds.right) {
          return i;
        }
      }
      return -1;
    };

    if (draggingEvent) {
      const hoveredUserId = findHoveredUserId();
      if (hoveredUserId === null) return;

      const userIndex = users.findIndex((u) => u.id === hoveredUserId);
      if (userIndex === -1) return;

      const dayIndex = findDayIndex(userIndex);
      if (dayIndex === -1) return;

      const cell = cellRefs.current[userIndex][dayIndex];
      if (!cell) return;

      const cellBounds = cell.getBoundingClientRect();
      const relativeY = e.clientY - cellBounds.top - draggingEvent.offsetY;
      
      const slotIndex = Math.max(0, Math.floor(relativeY / SLOT_HEIGHT));

      const newDay = daysOfWeek[dayIndex].startOf("day").add(6, "hour");
      const newStart = newDay.add(slotIndex * 30, "minute");
      const newEnd = newStart.add(draggingEvent.duration, "minute");

      setEvents((prev) => prev.map((ev) => (ev.id === draggingEvent.eventId ? { ...ev, start: newStart, end: newEnd, userId: hoveredUserId } : ev)));

    } else if (resizingEvent) {

      const hoveredUserId = findHoveredUserId();
      if (hoveredUserId === null) return;

      const userIndex = users.findIndex((u) => u.id === hoveredUserId);
    
      if (userIndex === -1) return;

      const dayIndex = findDayIndex(userIndex);
      
      if (dayIndex === -1) return;

      const cell = cellRefs.current[userIndex][dayIndex];
      if (!cell) return;

      const cellBounds = cell.getBoundingClientRect();

      let relativeY = e.clientY - cellBounds.top + 15;
      
      relativeY = Math.max(relativeY, SLOT_HEIGHT);
    
      const slotIndex = Math.max(1, Math.floor(relativeY / SLOT_HEIGHT));

     
      const newDay = daysOfWeek[dayIndex].startOf("day").add(6, "hour");
      const newEnd = newDay.add(slotIndex * 30, "minute");
 

      const minEnd = resizingEvent.start.add(30, "minute");
      const finalEnd = newEnd.isAfter(minEnd) ? newEnd : minEnd;

      setEvents((prev) => prev.map((ev) => (ev.id === resizingEvent.eventId ? { ...ev, end: finalEnd, userId: hoveredUserId } : ev)));
    }
  };

  const handleMouseUp = () => {
    setDraggingEvent(null);
    setResizingEvent(null);
     setActiveEventId(null); // ✅ reset ID
      
  };

  useEffect(() => {
    if (draggingEvent || resizingEvent) {
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
  }, [draggingEvent, resizingEvent]);




const [clientX, setClientX] = useState<number>(0);
const [clientY, setClientY] = useState<number>(0);

const [start, setStart] = useState<Dayjs>(dayjs())
const [end, setEnd] = useState<Dayjs>(dayjs())
const [user, setUser] = useState<User>()

const dialogRef = useRef<HTMLDivElement>(null); // Reference to your popover/dialog


const getPopoverPosition = (e: React.PointerEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement, MouseEvent>)=>{
  e.stopPropagation();

  const target = e.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();

  const dialogWidth = dialogRef.current?.offsetWidth || 300;
  const dialogHeight = dialogRef.current?.offsetHeight || 180;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Cell's position relative to the document:
  const cellTop = rect.top + window.scrollY;
  const cellLeft = rect.left + window.scrollX;

  // Start position: right & aligned top of cell
  let x = cellLeft + target.clientWidth + 10; // 10px padding
  let y = cellTop;

  // Flip horizontally if it overflows viewport right edge
  if (x + dialogWidth > window.scrollX + viewportWidth) {
    x = cellLeft - dialogWidth - 10; // position left side of cell
  }

  // Flip vertically if it overflows viewport bottom edge
  if (y + dialogHeight > window.scrollY + viewportHeight) {
    y = cellTop + target.offsetHeight - dialogHeight; // align bottom of cell
  }

  setClientX(x);
  setClientY(y);
  openPopover();
}



const handleAddSimpleEvent = ( e: React.PointerEvent<HTMLDivElement>, day: Dayjs, hour: Dayjs, userId: number ) => {
  e.stopPropagation();
  getPopoverPosition(e)

  const selectedUser = users.find((user) => user.id === userId);
  const startDate = day.hour(hour.hour()).minute(hour.minute());
  const endDate = startDate.add(30, "minute");

  setStart(startDate);
  setEnd(endDate);
  setUser(selectedUser);
  setPopoverContent(<AddEventForm start={start} end={end} user={user} users={users} handleOpenDetailsForm={handleOpenDetailsForm}/>)

  openPopover();
};


 const tableRef = useRef<HTMLTableSectionElement>(null);
useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    const dialog = dialogRef.current;
    const container = tableRef.current;

    if (!dialog || !container) return;

    const children = container.querySelectorAll("[data-day_table]");
    const clickedInsideDayCell = Array.from(children).some((el) =>
      el.contains(event.target as Node)
    );


    const clickedInsideDialog = dialog.contains(event.target as Node);
    // Close only if clicked outside both the dialog AND all [data-day_table] elements
    if (!clickedInsideDialog && !clickedInsideDayCell ) {
      closePopover();
    }
  }
  if (isPopoverOpen) {
    document.addEventListener("mousedown", handleClickOutside);
  }
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [isPopoverOpen, closePopover]);


const [popoverContent, setPopoverContent] = useState<React.ReactNode | null>(null);
const modalDisclosure = useDisclosure(false);
const isModalOpen = modalDisclosure[0];
const openModal = modalDisclosure[1].open;
const closeModal = modalDisclosure[1].close;

const handleAddDetailsEvent = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, day: Dayjs, hour: Dayjs, userId:number)=>{
   e.preventDefault();
  const selectedUser = users.find((user) => user.id === userId);
  const startDate = day.hour(hour.hour()).minute(hour.minute());
  const endDate = startDate.add(30, "minute");

  setStart(startDate);
  setEnd(endDate);
  setUser(selectedUser);


  if(isPopoverOpen){
    closePopover()
  }
  openModal()
}


// Handle add simple event
const handleOpenDetailsForm = ()=>{
  if(isPopoverOpen){
    closePopover()
  }
  openModal()
}
const handleCloseSimpleForm = ()=>{
    closePopover()
}




const handleShowEventDetails = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, eventId:number)=>{
  getPopoverPosition(e)
  setPopoverContent(<EventDetails eventId={eventId}/>)
}


  return (
    <div ref={containerRef}>

      <Header setWeekStartDate={setWeekStartDate} weekStartDate={weekStartDate} />
      <GlobalPopover
        ref={dialogRef}
        popoverOpened={isPopoverOpen}
        handleCloseSimpleForm={handleCloseSimpleForm}
        popoverContent={popoverContent}
        clientX={clientX}
        clientY={clientY}
      />


      <GlobalModal isModalOpen={isModalOpen} title="Add Details Event" closeModal={closeModal} modalContent={<AddDetailsEventForm start={start} end={end} user={user} users={users} />}/>


      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead className={styles.calendarWeekHeader}>
            <DailyTableTitle daysOfWeek={daysOfWeek}/>
          </thead>
          
          <tbody ref={tableRef}>
            {users.map((user, userIndex) => {
              return (
                <tr key={user.id} ref={(el) => (userRowRefs.current[userIndex] = el) as any}>
                  <td className={styles.userTableRow}>
                    <SidebarUsers user={user} />
                  </td>

                  <td style={{ width: 30 }}>
                    <TimeSlots />
                  </td>
                     <Days 
                        
                        daysOfWeek={daysOfWeek} 
                        events={events} 
                        user={user} 
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
