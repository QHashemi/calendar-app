// api.ts
import axios from "axios";

const axiosPublic = axios.create({
  baseURL: "http://localhost:4000/calendar/",
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json;charset=UTF-8",
  },
});

const axiosPrivate = axios.create({
  baseURL: "http://localhost:4000/calendar/",
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json;charset=UTF-8",
  },
});

export { axiosPublic, axiosPrivate };
