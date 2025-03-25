import React, { useEffect, useState } from 'react';
import useDataStore from '../../../services/data';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Skeleton from '@mui/material/Skeleton';

const HumidTempChart = () => {
  const { humid, temp } = useDataStore((state) => state.data);
  const [loading, setLoading] = useState(true);

  console.log("Data from useDataStore:", { humid, temp });

  useEffect(() => {
    if (humid.length > 0 && temp.length > 0) {
      setLoading(false);
    }
  }, [humid, temp]);

  if (loading) {
    return (
      <div>
        <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>
          Daily Humidity and Temperature Comparison (Indoor)
        </h3>
        <Skeleton variant="rectangular" width="100%" height={400} animation="wave" />
      </div>
    );
  }

  const aggregateDataByDay = () => {
    const dailyData = {};
    humid.forEach((item, index) => {
      const dateKey = new Date(item.time).toLocaleDateString();
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { 
          humidityIndoor: item.humidity, 
          temperatureIndoor: temp[index]?.temperature || null,
          count: 1
        };
      } else {
        dailyData[dateKey].humidityIndoor += item.humidity;
        dailyData[dateKey].temperatureIndoor += temp[index]?.temperature || 0;
        dailyData[dateKey].count += 1;
      }
    });

    return Object.entries(dailyData).map(([date, data]) => ({
      date,
      humidityIndoor: (data.humidityIndoor / data.count).toFixed(1),
      temperatureIndoor: (data.temperatureIndoor / data.count).toFixed(1)
    }));
  };

  const chartData = aggregateDataByDay();
  
  return (
    <div>
      <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>
        Daily Humidity and Temperature Comparison (Indoor)
      </h3>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="humidityIndoor" stroke="#8884d8" activeDot={{ r: 8 }} name="Humidity (Indoor)" />
          <Line type="monotone" dataKey="temperatureIndoor" stroke="#82ca9d" name="Temperature (Indoor)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HumidTempChart;
