import React, { forwardRef } from "react";
import { IoClose } from "react-icons/io5";
import styles from "./GlobalComponents.module.scss"

type Props = {
  popoverOpened: boolean;
  popoverContent: React.ReactNode;
  clientX: number;
  clientY: number;
  handleCloseSimpleForm: () => void;
  
};

const GlobalPopover = forwardRef<HTMLDivElement, Props>(
  ({ popoverOpened, popoverContent, clientX, clientY, handleCloseSimpleForm }, ref) => {
    if (!popoverOpened) return null;

    return (
      <div
        ref={ref}
        className={styles.globalPopover}
        style={{ left: clientX, top: clientY,transition: "left 0.5s ease, top 0.5s ease" }}
      >
        <div className={styles.popoverHeader} >
          <IoClose onClick={handleCloseSimpleForm} className={styles.closeBtn} />
        </div>

        <div style={{ width: "100%" }}>
          {popoverContent}
        </div>
      </div>
    );
  }
);

export default GlobalPopover;
