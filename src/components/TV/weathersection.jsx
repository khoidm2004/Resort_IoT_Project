import { useState, useMemo, useCallback, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { getDayAndTime } from '../../services/getDayandTime';
import useDataStore from '../../services/data';
import WeatherDay from './weatherday.jsx';
import getWeatherIcon from '../../services/getWeatherIcon';
import { Skeleton } from '@mui/material';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import './tv.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const WeatherSection = ({ updateWeatherBackground }) => {
  const { data, isLoading } = useDataStore();
  const [selectedTab, setSelectedTab] = useState(0);
  const [currentTime, setCurrentTime] = useState('');

  // Current time updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const weatherData = useMemo(() => data.weatherData || [], [data.weatherData]);

  const getDailyStats = useMemo(() => {
    const dailyStats = [];
    weatherData.forEach((dataItem) => {
      const dayDate = new Date(dataItem.time).toDateString();
      let dayStats = dailyStats.find((stat) => stat.date === dayDate);
      if (!dayStats) {
        dayStats = {
          date: dayDate,
          minTemp: Infinity,
          maxTemp: -Infinity,
          weather: dataItem.weather,
          shortDay: getDayAndTime(dayDate).shortDay,
        };
        dailyStats.push(dayStats);
      }
      dayStats.minTemp = Math.min(dayStats.minTemp, dataItem.temperature);
      dayStats.maxTemp = Math.max(dayStats.maxTemp, dataItem.temperature);
    });
    return dailyStats;
  }, [weatherData]);

  const dailyStats = getDailyStats;

  const roundToNearestHour = useCallback(() => {
    const currentTime = new Date();
    currentTime.setMinutes(0, 0, 0);
    return currentTime;
  }, []);

  const filteredWeatherData = useMemo(() => {
    const currentDate = new Date().toDateString();
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayString = nextDay.toDateString();
    return weatherData.filter((dataItem) => {
      const dataTime = new Date(dataItem.time);
      const dataDateString = dataTime.toDateString();
      return dataDateString === currentDate || dataDateString === nextDayString;
    });
  }, [weatherData]);

  const filteredDataEvery3Hours = useMemo(() => {
    const currentTime = roundToNearestHour();
    const filteredData = filteredWeatherData.filter((dataItem) => {
      const dataTime = new Date(dataItem.time).getTime();
      const roundedTime = currentTime.getTime();
      return (dataTime - roundedTime) % (3 * 60 * 60 * 1000) === 0;
    });
    return filteredData.slice(0, 9);
  }, [filteredWeatherData, roundToNearestHour]);

  const extendedFilteredData = useMemo(() => {
    const currentTime = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const tomorrowData = filteredWeatherData.filter((dataItem) => {
      const dataTime = new Date(dataItem.time);
      return dataTime > endOfDay;
    });
    return [...filteredDataEvery3Hours, ...tomorrowData];
  }, [filteredDataEvery3Hours, filteredWeatherData]);

  const latestWeather = extendedFilteredData[0] || {};

  useEffect(() => {
    if (latestWeather?.weather) {
      updateWeatherBackground(latestWeather.weather);
    }
  }, [latestWeather?.weather, updateWeatherBackground]);

  const todaytime = latestWeather.time ? getDayAndTime(latestWeather.time) : { date: '', day: '' };

  const labelsWithInterval = useMemo(() => {
    return filteredDataEvery3Hours.map((dataItem) => {
      const date = new Date(dataItem.time);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    });
  }, [filteredDataEvery3Hours]);

  const calculateTemperatureYAxisLimits = useCallback(() => {
    const temperatureValues = extendedFilteredData.map((dataItem) => dataItem.temperature);
    const maxTemperature = Math.max(...temperatureValues);
    const minTemperature = Math.min(...temperatureValues);
    const minY = Math.max(minTemperature - 3, -30);
    const maxY = Math.min(maxTemperature + 3, 40);
    return { minY, maxY };
  }, [extendedFilteredData]);

  const calculateHumidityYAxisLimits = useCallback(() => {
    const humidityValues = extendedFilteredData.map((dataItem) => dataItem.humidity);
    const maxHumidity = Math.max(...humidityValues);
    const minHumidity = Math.min(...humidityValues);
    const minY = Math.max(minHumidity - 3, 0);
    const maxY = Math.min(maxHumidity + 3, 100);
    return { minY, maxY };
  }, [extendedFilteredData]);

  const { minY: tempMinY, maxY: tempMaxY } = calculateTemperatureYAxisLimits();
  const { minY: humidityMinY, maxY: humidityMaxY } = calculateHumidityYAxisLimits();

  const limitedData = useMemo(() => {
    return filteredDataEvery3Hours.slice(0, 9);
  }, [filteredDataEvery3Hours]);

  const temperatureData = useMemo(() => ({
    labels: labelsWithInterval,
    datasets: [{
      label: 'Temperature (°C)',
      data: limitedData.map((dataItem) => dataItem.temperature),
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      fill: true,
      pointRadius: 5,
      tension: 0.4,
    }],
  }), [labelsWithInterval, limitedData]);

  const humidityData = useMemo(() => ({
    labels: labelsWithInterval,
    datasets: [{
      label: 'Humidity (%)',
      data: limitedData.map((dataItem) => dataItem.humidity),
      borderColor: 'rgba(153, 102, 255, 1)',
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
      fill: true,
      pointRadius: 5,
      tension: 0.4,
    }],
  }), [labelsWithInterval, limitedData]);

  const optionsTemperature = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { enabled: false },
      datalabels: {
        color: 'white',
        anchor: 'end',
        align: 'top',
        formatter: (value) => `${value}°C`,
        font: { size: 12, weight: 'bold' },
      },
    },
    scales: {
      x: {
        display: true,
        ticks: {
          maxRotation: 45,
          minRotation: 30,
          stepSize: 1,
          font: { size: 14, weight: 'bold' },
          color: 'white',
          callback: (value, index) => labelsWithInterval[index] || null,
        },
      },
      y: {
        display: true,
        min: tempMinY - 3,
        max: tempMaxY + 3,
        ticks: { beginAtZero: false, stepSize: 1, color: 'white' },
      },
    },
    elements: {
      point: {
        radius: 5,
        hoverRadius: 7,
        backgroundColor: 'rgba(75, 192, 192, 1)',
        borderColor: 'white',
        borderWidth: 2,
        hitRadius: 10,
      },
    },
  }), [tempMinY, tempMaxY, labelsWithInterval]);

  const optionsHumidity = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { enabled: false },
      datalabels: {
        color: 'white',
        anchor: 'end',
        align: 'top',
        formatter: (value) => `${value}%`,
        font: { size: 12, weight: 'bold' },
      },
    },
    scales: {
      x: {
        display: true,
        ticks: {
          maxRotation: 45,
          minRotation: 30,
          stepSize: 1,
          font: { size: 14, weight: 'bold' },
          color: 'white',
          callback: (value, index) => labelsWithInterval[index] || null,
        },
      },
      y: {
        display: true,
        min: humidityMinY - 3,
        max: humidityMaxY + 3,
        ticks: { beginAtZero: false, stepSize: 1, color: 'white' },
      },
    },
    elements: {
      point: {
        radius: 5,
        hoverRadius: 7,
        backgroundColor: 'rgba(153, 102, 255, 1)',
        borderColor: 'white',
        borderWidth: 2,
        hitRadius: 10,
      },
    },
  }), [humidityMinY, humidityMaxY, labelsWithInterval]);

  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  if (isLoading) {
    return (
      <div className="weather-section">
        <div className="top-panel">
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="text" width={100} height={40} />
          <div className="top-panel-data">
            <Skeleton variant="text" width={120} height={24} />
            <Skeleton variant="text" width={120} height={24} />
            <Skeleton variant="text" width={120} height={24} />
          </div>
          <div className="top-panel right">
            <Skeleton variant="text" width={100} height={24} />
            <div className="day-time">
              <Skeleton variant="text" width={60} height={24} />
              <Skeleton variant="text" width={60} height={24} />
            </div>
          </div>
        </div>

        <div className="bottom-panel">
          <Tabs value={0}>
            <Tab label={<Skeleton variant="text" width={100} height={24} />} />
            <Tab label={<Skeleton variant="text" width={100} height={24} />} />
          </Tabs>
          <div className="chart-container">
            <Skeleton variant="rectangular" width="100%" height={300} />
          </div>
        </div>

        <div className="weather-summary">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="weather-day-card">
              <Skeleton variant="text" width={60} height={24} />
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="text" width={80} height={20} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!latestWeather.time) {
    return <div>Loading weather data...</div>;
  }

  return (
    <div className="weather-section">
      <div className="top-panel">
        {getWeatherIcon(latestWeather.weather)}
        <h1>
          <span className="temperature">{latestWeather.temperature}</span>
          <span className="temperature-unit">°C</span>
        </h1>
        <div className="top-panel-data">
          <p>Feels like: {latestWeather.temperatureApparent}°C</p>
          <p>UV Index: {latestWeather.uvIndex}</p>
          <p>Wind speed: {latestWeather.windSpeed} m/s</p>
        </div>
        <div className="top-panel right">
          <h2 className="date">{todaytime.date}</h2>
          <div className="day-time">
            <p className="day">{currentTime} {todaytime.day}</p>
            <p className='time'>{latestWeather.location}</p>
          </div>
        </div>
      </div>
      <div className="bottom-panel">
        <Tabs
          value={selectedTab}
          onChange={handleChange}
          aria-label="weather data tabs"
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            '& .MuiTabs-indicator': { backgroundColor: 'white' },
          }}
        >
          <Tab label="Temperature" sx={{ color: 'white', '&.Mui-selected': { color: 'white' } }} />
          <Tab label="Humidity" sx={{ color: 'white', '&.Mui-selected': { color: 'white' } }} />
        </Tabs>
        <div className="chart-container">
          {selectedTab === 0 && <Line data={temperatureData} options={optionsTemperature} />}
          {selectedTab === 1 && <Line data={humidityData} options={optionsHumidity} />}
        </div>
      </div>
      <div className="weather-summary">
        {dailyStats.map((stat, index) => (
          <WeatherDay
            key={index}
            day={stat.shortDay}
            weather={stat.weather}
            tempHigh={stat.maxTemp}
            tempLow={stat.minTemp}
          />
        ))}
      </div>
    </div>
  );
};

export default WeatherSection;