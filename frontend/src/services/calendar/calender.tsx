export const generateCalendar = (startYear: number, endYear: number) => {
    const years = [];
  
    for (let year = startYear; year <= endYear; year++) {
      const months = [];
  
      for (let month = 1; month <= 12; month++) {
        const daysInMonth = new Date(year, month, 0).getDate(); // Get number of days
        const weeks = [];
  
        for (let day = 1; day <= daysInMonth; day++) {
          const dayOfWeek = new Date(year, month - 1, day).getDay(); // Sunday (0) to Saturday (6)
          const hours = [];
  
          for (let hour = 7; hour <= 17; hour++) { // Time slots from 7 AM to 5 PM
            hours.push(`${hour}:00`);
          }
  
          weeks.push({ day, dayOfWeek, hours });
        }
  
        months.push({ month, weeks });
      }
  
      years.push({ year, months });
    }
  
    return ;
  };
  

  export default generateCalendar;