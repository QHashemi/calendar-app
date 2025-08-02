import { SLOT_HEIGHT, TIME_SLOTS } from '@/services/TimeSlots';
import dayjs, { Dayjs } from 'dayjs';
import React, { useState } from 'react';
import styles from "../Calendar.module.scss";
import { User } from '../Types';
import { Popover, Button } from '@mantine/core';

type Props = {
  day: Dayjs,
  user: User
};


export default function TimeSlotsCells({ day, user }: Props) {


  return (
    <>
    {TIME_SLOTS.map((hour, i) => (
            <div
                key={i}
                style={{
                height: SLOT_HEIGHT,
                backgroundColor: (
                    day.day() === 0 || day.day() === 6
                    ? (day.day() === dayjs().day() ? "" : "#f7f9fa")
                    : (day.day() === dayjs().day() ? "#d6f1ff" : "")
                ),
                position: "relative",
                cursor: "pointer",
                }}
                className={styles.hours}
                data-user={user.id}
            />
            ))}

    </>
  );
}
