import dayjs from "dayjs";

interface User {
  id: number;
  name: string;
}

interface Event {
  id: number;
  userId: number;
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
  title: string;
  color: string;
  note?: string;
}

type DraggingEvent = {
  eventId: number;
  offsetY: number;
  originalStart: dayjs.Dayjs;
  duration: number;
} | null;

type ResizingEvent = {
  eventId: number;
  start: dayjs.Dayjs;
  originalEnd: dayjs.Dayjs;
  offsetY: number;
} | null;
 type EventWithColumn = Event & {
                    column: number;
                    totalColumns: number;
                  };


type WeatherResult = {
  date: string;
  max_temp: number;
  min_temp: number;
  icon: string;
} | null;
export type {User, Event, DraggingEvent, ResizingEvent, EventWithColumn, WeatherResult}