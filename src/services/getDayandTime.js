export function getDayAndTime(timestamp) {
  const date = new Date(timestamp);

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const shortDaysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const day = daysOfWeek[date.getUTCDay()];
  const shortDay = shortDaysOfWeek[date.getUTCDay()];

  const formattedDate = date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return {
    day: day,
    shortDay: shortDay,
    date: formattedDate,
    time: formattedTime,
  };
}
