// services/weather/dailyWeather.ts
import dayjs, { Dayjs } from "dayjs";
import WeatherAPI from "../../lib/api/WeatherAPI";

const WeatherIcons: Record<number, string> = {
  0: "☀️",
  1: "⛅️",
  2: "⛅️",
  3: "⛅️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  53: "🌦️",
  55: "🌦️",
  61: "🌧️",
  63: "🌧️",
  65: "🌧️",
  71: "❄️",
  73: "❄️",
  75: "❄️",
  80: "🌧️",
  81: "🌧️",
  82: "🌧️",
  95: "⛈️",
  96: "⛈️",
  99: "⛈️",
};

export type WeatherResult = {
  date: string;
  max_temp: number;
  min_temp: number;
  icon: string;
} | null;

export default async function getWeatherForDate(date: Dayjs): Promise<WeatherResult> {
  try {
    const data = await WeatherAPI(date);
    const daily = data.daily;

    const index = daily.time.findIndex((d: string) =>
      dayjs(d).isSame(date, "day")
    );

    if (index === -1) return null;

    return {
      date: daily.time[index],
      max_temp: daily.temperature_2m_max[index],
      min_temp: daily.temperature_2m_min[index],
      icon: WeatherIcons[daily.weathercode[index]] || "❓",
    };
  } catch (err) {
    console.error("Weather fetch failed:", err);
    return null;
  }
}
