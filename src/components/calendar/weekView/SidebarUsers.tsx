import React from 'react'
import styles from "../Calendar.module.scss"
import { User } from '../Types'
import { Avatar } from '@mantine/core'

type props = {
    user:User
}
export default function SidebarUsers({user}: props) {
  return (
         <div className={styles.sidebarUser}>
            <Avatar radius="xl" />
            <p>{user.name}</p>
        </div>
  )
}
