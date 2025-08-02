import dayjs from "dayjs";


  const TIME_SLOTS = Array.from({ length: 24 }, (_, i) =>
    dayjs()
      .startOf("day")
      .hour(6)
      .add(i * 30, "minute")
  );

    const SLOT_HEIGHT = 25;


  export {TIME_SLOTS, SLOT_HEIGHT}