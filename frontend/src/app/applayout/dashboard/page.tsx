import Dashboard from "@components/dashboard/Dashboard";
import ReturnComponent from "@config/componentList";
import React from "react";

export default function DashboardPage() {
  return (
    <div>
      <ReturnComponent componentName="dashboard" component={<Dashboard />}/>
    </div>
  );
}
