
import React  from "react";
import Week from "./weekView/Week";
import styles from "./Calendar.module.scss";


export default function Calendar() {

  return (

      <div className={styles.container}>
        <Week />
      </div>
  );
}
