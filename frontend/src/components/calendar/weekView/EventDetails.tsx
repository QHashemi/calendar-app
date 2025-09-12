import React from "react";
import dayjs from "dayjs";
import styles from "../Calendar.module.scss";
import { MdDateRange } from "react-icons/md";
import { IoTimeOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa6";
import { Button } from "@mantine/core";
import hexToRgba from "@/utils/lighterColor";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/Api/store";
import { delete_event, selectEventById } from "@/Api/slices/EventSlice";
import { selectUsers } from "@/Api/slices/User";
import { FaUsersCog } from "react-icons/fa";
import { LuNotebookPen } from "react-icons/lu";
import { PiNotebookFill } from "react-icons/pi";
import DeleteButton from "@components/globalComponents/DeleteModal";
import useAxiosPrivate from "@/Api/useAxiosPrivate";
import { can } from "@/helpers/policy";
import { selectCredentialState } from "@/Api/slices/CredentialsSlice";

interface EventDetailsProps {
  eventId: number;
  handleOpenEditEventModal: (eventId: number) => void;
}

export default function EventDetails({
  eventId,
  handleOpenEditEventModal,
}: EventDetailsProps) {
  const axiosInstance = useAxiosPrivate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector(selectCredentialState);
  const event = useSelector((state: RootState) =>
    selectEventById(state, eventId)
  );

  const handleDeleteEvent = (eventId: number) => {
    dispatch(
      delete_event({
        axiosInstance,
        value: eventId,
        componentType: "delete_event_modal",
      })
    );
  };

  if (!event) {
    return <div className={styles.wrapper}>Ereignis nicht gefunden.</div>;
  }

  const canEdit = can(user, "edit:event", event);
  const canDelete = can(user, "delete:event", event);

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.header}
        style={{
          background: `${event.color}/10`,
          width: "100%",
          margin: 0,
          marginBottom: 5,
        }}
      >
        <div
          className={styles.color}
          style={{
            backgroundColor: event.color,
            border: `1px solid ${event.color}`,
          }}
        />
        <h2 className={styles.title}>
          {event.title} (
          <span title="Organisator" style={{ color: event.color }}>
            {event.organizer.first_name} {event.organizer.last_name}
          </span>
          )
        </h2>
      </div>

      <div className={styles.detailRow}>
        <span className={styles.label}>
          <MdDateRange />
        </span>
        <span className={styles.value}>
          {dayjs(event.start).format("dddd, D. MMM YYYY")}
        </span>
      </div>

      <div className={styles.detailRow}>
        <span className={styles.label}>
          <IoTimeOutline />
        </span>
        <span className={styles.value}>
          <strong>
            {dayjs(event.start).format("HH:mm")} - {dayjs(event.end).format("HH:mm")}
          </strong>
        </span>
      </div>

      <div className={styles.detailRow}>
        <span className={styles.label}>
          <FaUser />
        </span>
        <span className={styles.value}>
          {event.owner.first_name} {event.owner.last_name}
        </span>
      </div>

      {event.helpers.length !== 0 && (
        <div className={styles.detailRow}>
          <span className={styles.label}>
            <FaUsersCog />
          </span>
          <span className={styles.value}>
            {event.helpers.map((helper) => (
              <span
                key={helper.id}
                style={{
                  border: `1px solid ${event.color}`,
                  borderRadius: "5px",
                  margin: 1,
                  padding: "0px 2px",
                }}
              >
                {helper.first_name}
              </span>
            ))}
          </span>
        </div>
      )}

      {event.description && (
        <div className={styles.detailRow}>
          <span className={styles.label}>
            <PiNotebookFill />
          </span>
          <div
            className={styles.eventDesc}
            dangerouslySetInnerHTML={{ __html: event.description }}
          />
        </div>
      )}

      {event.note && (
        <div className={styles.detailRow}>
          <span className={styles.label}>
            <LuNotebookPen />
          </span>
          <span
            className={styles.value}
            style={{
              background: hexToRgba(event.color, 0.5),
              border: `1px solid ${event.color}`,
              padding: "0 2px",
              borderRadius: "4px",
              color: "black",
            }}
          >
            {event.note}
          </span>
        </div>
      )}

      <div className={styles.buttonRow}>
        <Button
          size="xs"
          onClick={() => handleOpenEditEventModal(event.id)}
          disabled={!canEdit}
        >
          Bearbeiten
        </Button>

        {!canDelete ? (
          <Button size="xs" color="red" disabled>
            Löschen
          </Button>
        ) : (
          <DeleteButton
            isButton
            size="xs"
            title="Ausgewähltes Ereignis löschen!"
            buttonTitle="Ereignis löschen"
            deleteText="Sind Sie sicher, dass Sie dieses Ereignis löschen möchten? Diese Aktion ist endgültig und die Daten können nur über den Support wiederhergestellt werden."
            onConfirm={() => handleDeleteEvent(event.id)}
          />
        )}
      </div>
    </div>
  );
}
