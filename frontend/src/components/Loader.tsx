import { Loader, LoadingOverlay } from "@mantine/core";
import React from "react";

export default function Loading() {
  return (
    <div style={{width:"100%", height:"calc(100vh - 60px)", display:"flex", justifyContent:"center", alignItems:"center", flexDirection:"column"}}>

      <Loader />
      <br />
      <p>Loading .....</p>
    </div>
  );
}
