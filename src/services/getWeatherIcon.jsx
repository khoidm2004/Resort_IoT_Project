import { Icon } from "@iconify/react";
import "../components/TV/tv.css";

const getWeatherIcon = (weather) => {
  const iconMap = {
    Clear: "twemoji:sun-behind-cloud",
    Cloudy: "twemoji:cloud",
    "Mostly Clear": "twemoji:sun-behind-cloud",
    "Partly Cloudy": "twemoji:cloud",
    "Light Rain": "twemoji:cloud-with-rain",
    Rain: "twemoji:cloud-with-rain",
    Thunderstorm: "twemoji:cloud-with-lightning",
    "Light Snow": "twemoji:snowflake",
    Flurries: "twemoji:snowflake",
  };

  return (
    <Icon
      icon={iconMap[weather] || "twemoji:sun-behind-cloud"}
      className="weather-icon"
    />
  );
};

export default getWeatherIcon;
