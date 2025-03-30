import React from "react";
import getWeatherIcon from "../../services/getWeatherIcon.jsx";
import { Skeleton } from "@mui/material";
import "./weatherday.css";

const WeatherDay = ({ day, weather, tempHigh, tempLow, isLoading }) => {
  const weatherType = weather ? weather.split(",")[0].trim() : "";
  const icon = weatherType ? getWeatherIcon(weatherType) : null;

  if (isLoading) {
    return (
      <div className="weather-day-card">
        <Skeleton variant="text" width={60} height={24} />
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="text" width={80} height={20} />
      </div>
    );
  }

  return (
    <div className="weather-day-card">
      <p className="day">{day}</p>
      {React.cloneElement(icon, { className: "day-icon" })}
      <div className="temperature-range">
        <span>{tempHigh}°</span> / <span>{tempLow}°</span>
      </div>
    </div>
  );
};

export default WeatherDay;
