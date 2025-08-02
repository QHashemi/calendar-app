import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import getWeatherForDate from "../../../services/weather/dailyWeather"; // your async weather function
import { WeatherResult } from "../Types";
import styles from "../Calendar.module.scss"
type Props = {
  daysOfWeek: dayjs.Dayjs[];
};

export default function DailyTableTitle({ daysOfWeek }: Props) {
//   const [weatherData, setWeatherData] = useState<(WeatherResult | null)[]>([]);

//   useEffect(() => {
//     async function fetchWeather() {
//       const results = await Promise.all(
//         daysOfWeek.map((day) => getWeatherForDate(day))
//       );
//       setWeatherData(results);
//     }
//     fetchWeather();
 
//   }, [daysOfWeek]);

  return (
    <tr className={styles.tableHeaderTitle}>
      <th style={{ width: 120 }}>Resurcen</th>
      <th></th>
      {daysOfWeek.map((day, i) => {
        // const weather = weatherData[i];
        return (
          <th key={i}>
            <p style={{ fontSize: 15 }}><strong>{day.format("dddd")}</strong></p>
            <p style={{ fontSize: 15 }}>{day.format("DD, MMMM YYYY")}</p>
            {/* <div>
              {weather ? (
                <>
                  {weather.icon} <small>{weather.min_temp} - {weather.max_temp}°C</small>
                </>
              ) : (
                "❓"
              )}
            </div> */}
          </th>
        );
      })}
    </tr>
  );
}
