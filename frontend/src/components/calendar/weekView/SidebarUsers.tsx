import React from "react";
import styles from "../Calendar.module.scss";

import { Avatar } from "@mantine/core";
import { useSelector } from "react-redux";
import { RootState } from "@/Api/store";
import { selectUserById } from "@/Api/slices/User";
import { uploadsUrl } from "@config/coreConfig";

type props = {
  userId: number;
};
export default function SidebarUsers({ userId }: props) {
  const user = useSelector((state: RootState) => selectUserById(state, userId));

  return (
    <div className={styles.sidebarUser}>
      <div className={styles.avatarContainer}>
        <Avatar
          src={user?.image ? `${uploadsUrl}${user.image}` : undefined} // only use src if image exists
          color={user?.color}
          alt="Profile Image"
          radius="50%"
          size={35}
          name={user?.display_name} // will be displayed if src is undefined
        />
      </div>
      <div className={styles.userDetails}>
        <strong>{user?.display_name}</strong>
        <br />
        <small>{user?.job}</small>
      </div>
    </div>
  );
}
