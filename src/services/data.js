import { create } from "zustand";
import { getHumid } from "./humid";
import { getTemp } from "./temp";
import getWeatherData from "./weather";
import { getLedStatus } from "./led";
import { getRelayStatus } from "./relay";

const useDataStore = create((set, get) => ({
  data: {
    humid: [],
    temp: [],
    weatherData: [],
    ledStatus: "off",
    relayStatus: "off",
  },
  weatherIntervalId: null,
  fetchHumidityStream: () => {
    getHumid((data) => {
      if (data.humid) {
        set((state) => ({
          data: {
            ...state.data,
            humid: data.humid,
          },
        }));
      }
    });
  },
  fetchTemperatureStream: () => {
    getTemp((data) => {
      if (data.temp) {
        set((state) => ({
          data: {
            ...state.data,
            temp: data.temp,
          },
        }));
      }
    });
  },
  fetchWeatherData: async () => {
    try {
      await getWeatherData((data) => {
        if (data.weatherData) {
          set((state) => ({
            data: {
              ...state.data,
              weatherData: data.weatherData,
            },
          }));
        }
      });
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  },
  fetchLedStatus: () => {
    getLedStatus((data) => {
      if (data.ledStatus) {
        set((state) => ({
          data: {
            ...state.data,
            ledStatus: data.ledStatus,
          },
        }));
      }
    });
  },
  fetchRelayStatus: () => {
    getRelayStatus((data) => {
      if (data.relayStatus) {
        set((state) => ({
          data: {
            ...state.data,
            relayStatus: data.relayStatus,
          },
        }));
      }
    });
  },
  startWeatherDataInterval: () => {
    if (!get().weatherIntervalId) {
      const intervalId = setInterval(
        () => {
          get().fetchWeatherData();
        },
        30 * 60 * 1000,
      ); // 30 phút
      set({ weatherIntervalId: intervalId });
    }
  },
  stopWeatherDataInterval: () => {
    if (get().weatherIntervalId) {
      clearInterval(get().weatherIntervalId);
      set({ weatherIntervalId: null });
    }
  },
}));

export default useDataStore;
