import axios from 'axios';


// export default async function WeatherAPI() {
// //https://api.open-meteo.com/v1/forecast?latitude=${48.25}&longitude=${14.63333}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`

//   const BASE_URL = `https://api.open-meteo.com/v1/forecast?latitude=${48.25}&longitude=${14.63333}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;

//  try {
//     const response = await axios.get(BASE_URL);

//     return response.data;

//   } catch (error: any) {

//     console.error("Failed to fetch Berlin weather:", error.message);
//     throw new Error("Weather API request failed");
//   }
// }

import  { Dayjs } from 'dayjs';

export default async function WeatherAPI(day:Dayjs) {
  const start = day.startOf("week").format('YYYY-MM-DD'); // include yesterday
  const end = day.endOf("week").format('YYYY-MM-DD'); // next 6 days

  const BASE_URL = `https://api.open-meteo.com/v1/forecast?latitude=48.25&longitude=14.63333&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&start_date=${start}&end_date=${end}`;

  try {
    const response = await axios.get(BASE_URL);
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch weather:", error.message);
    throw new Error("Weather API request failed");
  }
}


