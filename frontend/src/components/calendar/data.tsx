import dayjs from "dayjs";

const events = [
  {
    id: 1,
    userId: 1,
    start: dayjs().startOf("week").add(1, "day").hour(9),
    end: dayjs().startOf("week").add(1, "day").hour(10).minute(30),
    title: "Team Meeting",
    color: "#6C63FF", // soft purple
    note: "Nice note for you",
    description: "Everyone should pay attention to this meeting's outcomes and action items.",
  },
  {
    id: 2,
    userId: 2,
    start: dayjs().startOf("week").add(3, "day").hour(11),
    end: dayjs().startOf("week").add(3, "day").hour(16),
    title: "Design Review",
    color: "#00C49A", // teal green
    note: "Second note, if it's OK!",
    description: "We will review key design decisions and align on UI/UX direction.",
  },
  {
    id: 3,
    userId: 1,
    start: dayjs().startOf("week").add(3, "day").hour(11),
    end: dayjs().startOf("week").add(3, "day").hour(13),
    title: "Project Test 3",
    color: "#E6AF2E", // gold/yellow
    note: "focus on error handling and UI glitches.",
    description: "Testing features and checking stability before internal review.",
  },
  {
    id: 4,
    userId: 1,
    start: dayjs().startOf("week").add(2, "day").hour(11),
    end: dayjs().startOf("week").add(2, "day").hour(14),
    title: "Project Kickoff",
    color: "#2274A5", // deep blue
    description: "Initial meeting to align goals, roles, and roadmap for the new project.",
  },
  {
    id: 5,
    userId: 1,
    start: dayjs().startOf("week").add(3, "day").hour(15),
    end: dayjs().startOf("week").add(3, "day").hour(17),
    title: "Project Test 1",
    color: "#FF7F50", // coral
    description: "Synchronize testing tasks and ensure consistent quality checks.",
  },
  {
    id: 6,
    userId: 1,
    start: dayjs().startOf("week").add(3, "day").hour(13),
    end: dayjs().startOf("week").add(3, "day").hour(15),
    title: "Test 2",
    color: "#48A9A6", // muted teal
    description: "Mid-phase testing — focus on error handling and UI glitches.",
  },
];

const users = [
  { id: 1, name: "Manuel Gaisberger", image: "https://media.istockphoto.com/id/656669482/photo/smiling-in-blue.jpg?s=612x612&w=0&k=20&c=uuyAsoPlN72gD76kcU_feMlKVCG8cdeqqY85gLqYD5k=" },
  {
    id: 2,
    name: "Gerog Diwold",
    image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D",
  },
];

export { events, users };
