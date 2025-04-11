import axios from "axios";

const getWeatherData = async (callback) => {
  try {
    const response = await axios.get(
      "https://thong123.work.gd/info/weather?city=hyrynsalmi",
    );
    const weatherDataArray = response.data.newContent;

    if (Array.isArray(weatherDataArray) && weatherDataArray.length > 0) {
      callback({
        weatherData: weatherDataArray,
      });
    } else {
      callback({ weatherData: null });
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
    callback({ weatherData: null });
  }
};

export default getWeatherData;
