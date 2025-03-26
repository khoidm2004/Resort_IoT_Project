import React, { useState } from "react";
import { Icon } from "@iconify/react";
import './home.css';
import '../../variables.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import MyCalendar from "../home/calendar";
import useDataStore from "../../../services/data";
import DashboardBox from "./roombox";

const Home = () => {
  const { humid, temp } = useDataStore((state) => state.data); 

  const latesthumid = humid.length > 0 ? humid[0].humidity : "--";
  const latesttemp = temp.length > 0 ? temp[0].temperature : "--";

  const [selectedCalendar, setSelectedCalendar] = useState('flat'); 

  const switchCalendar = (calendarType) => {
    setSelectedCalendar(calendarType);
    console.log(`Switching to ${calendarType} calendar`);
  };

  return (
    <div className="home">
      <div className="dir">
        <span>Dashboard</span>
        <Icon icon="material-symbols:chevron-right-rounded" width="24" height="24" />
      </div>

      <div className="db-box-list">
        <DashboardBox
          room="A"
          humid={latesthumid}
          temp={latesttemp}
        />
        <DashboardBox
          room="B"
          humid={latesthumid}
          temp={latesttemp}
        />
        <DashboardBox
          room="C"
          humid={latesthumid}
          temp={latesttemp}
        />
        <DashboardBox
          room="D"
          humid={latesthumid}
          temp={latesttemp}
        />
      </div>

      <div className="calendar-container">
        <div className="calendar-toggle-container">
          <div className="calendar-toggle-buttons">
            <button 
              className={`calendar-toggle-btn ${selectedCalendar === 'flat' ? 'active' : ''}`}
              onClick={() => switchCalendar('flat')}
            >
              Flat Booking Calendar
            </button>
            <button 
              className={`calendar-toggle-btn ${selectedCalendar === 'facilities' ? 'active' : ''}`}
              onClick={() => switchCalendar('facilities')}
            >
              Facilities Calendar
            </button>
          </div>
        </div>
        <MyCalendar calendarType={selectedCalendar} />
      </div>
    </div>
  );
};

export default Home;