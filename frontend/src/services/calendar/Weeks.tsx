import dayjs, { Dayjs } from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
dayjs.extend(weekOfYear);

const generateWeeks = (
  weekStartDate: Dayjs,
  startTime: Dayjs,
  endTime: Dayjs,
  isWorkWeek: boolean,
  stepMinutes: number = 30
) => {
  const startOfWeek = weekStartDate.startOf("week");
  const days = [];

  for (let i = 0; i < 7; i++) {
    const currentDay = startOfWeek.add(i, "day");
    const hours = [];

    for (let hour = startTime.hour(); hour <= endTime.hour(); hour++) {
      for (let min = 0; min < 60; min += stepMinutes) {
        const timeSlot = currentDay.clone().hour(hour).minute(min);
        // Don't go past endTime
        if (timeSlot.isAfter(currentDay.clone().hour(endTime.hour()).minute(endTime.minute()))) {
          break;
        }
        hours.push(timeSlot);
      }
    }

    const isWeekend = currentDay.day() === 0 || currentDay.day() === 6;
    if (!isWorkWeek || !isWeekend) {
      days.push({ day: currentDay, hours });
    }
  }

  return { days, startOfWeek };
};

export default generateWeeks;
