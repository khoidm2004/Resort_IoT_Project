import { useState } from 'react';
import WeatherSection from './weathersection';
import EventsTabs from './events';
import './tv.css';

const TvView = () => { 
  const [weatherClass, setWeatherClass] = useState('clear'); 

  const updateWeatherBackground = (weather) => {
    switch (weather) {
      case 'Clear':
        setWeatherClass('clear');
        break;
      case 'Cloudy':
        setWeatherClass('cloudy');
        break;
      case 'Rain':
        setWeatherClass('rainy');
        break;
      case 'Snow':
        setWeatherClass('snowy');
        break;
      case 'Sunny':
        setWeatherClass('sunny');
        break;
      default:
        setWeatherClass('clear');
    }
  };

  return (
    <div className={`tv-app ${weatherClass}`}>
      <div className="left-panel">
        <WeatherSection updateWeatherBackground={updateWeatherBackground} />
      </div>
      <div className="right-panel">
        <h2>Events</h2>
        <EventsTabs />
      </div>
    </div>
  );
};

export default TvView;