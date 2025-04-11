import React from "react";
import HumidTempChart from "./chart";
import BookingAnalysis from "./bookingAnalysis";
import FacilityReport from "./facilityReport";
import { Icon } from "@iconify/react";
import "./reports.css";
import "../../variables.css";

const Reports = () => {
  return (
    <div className="reports">
      <div className="dir">
        <span>Dashboard</span>
        <Icon
          icon="material-symbols:chevron-right-rounded"
          width="24"
          height="24"
        />
        <span>Report</span>
      </div>
      <HumidTempChart />
      <BookingAnalysis />
      <FacilityReport />
    </div>
  );
};
export default Reports;
