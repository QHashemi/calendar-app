import React, { forwardRef } from "react";
import { IoClose } from "react-icons/io5";

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
        className="popover fade-in"
        style={{
          position: "absolute",
          left: clientX,
          top: clientY,
          zIndex: 1000,
          backgroundColor: "white",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          padding: 16,
          borderRadius: 8,
          minWidth: 300,
          maxWidth: 400,
          maxHeight: 500,
          overflowY: "auto",
          transition: "opacity 0.2s ease",
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <IoClose
            onClick={handleCloseSimpleForm}
            style={{
              cursor: "pointer",
              fontSize: "1.2rem",
              color: "#555",
            }}
          />
        </div>

        <div style={{ width: "100%" }}>
          {popoverContent}
        </div>
      </div>
    );
  }
);

export default GlobalPopover;
