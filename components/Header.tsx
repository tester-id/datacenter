"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Cloud,
  CloudRain,
  CloudLightning,
  Sun,
  Snowflake,
  CloudFog,
  MapPin,
} from "lucide-react";

export function Header() {
  const [weatherMain, setWeatherMain] = useState("");
  const [weatherDesc, setWeatherDesc] = useState("");

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=Selong&appid=${process.env.NEXT_PUBLIC_OW_API_KEY}&units=metric`
        );
        const data = res.data;
        setWeatherMain(data.weather[0].main);
        setWeatherDesc(data.weather[0].description);
      } catch (err) {
        console.error("Failed to fetch current weather:", err);
      }
    };

    fetchWeather();
  }, []);

  const getWeatherIcon = () => {
    switch (weatherMain.toLowerCase()) {
      case "clear":
        return <Sun className="w-6 h-6 md:w-12 md:h-12 text-yellow-400" />;
      case "clouds":
        return <Cloud className="w-6 h-6 md:w-12 md:h-12 text-gray-400" />;
      case "rain":
        return <CloudRain className="w-6 h-6 md:w-12 md:h-12 text-blue-400" />;
      case "thunderstorm":
        return <CloudLightning className="w-6 h-6 md:w-12 md:h-12 text-yellow-300" />;
      case "snow":
        return <Snowflake className="w-6 h-6 md:w-12 md:h-12 text-white" />;
      case "mist":
      case "haze":
      case "fog":
        return <CloudFog className="w-6 h-6 md:w-12 md:h-12 text-gray-300" />;
      default:
        return <Cloud className="w-6 h-6 md:w-12 md:h-12 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col justify-center md:items-start md:flex-row md:justify-between md:mt-3 md:mx-3">
      <div className="flex flex-col md:mt-0 text-center md:text-left ">
        <h1 className="text-xl md:text-4xl font-bold text-shadow-lg shadow-slate-800 uppercase">
          Data Center
        </h1>
        <div className="flex justify-center md:justify-start items-center gap-1">
          <MapPin className="w-6 h-6 md:block text-slate-300" />
          <p className="text-sm md:text-xl text-shadow shadow-slate-800 ">
            Selong, Kemkomdigi, 83611
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center text-center">
        <h1 className="text-xl md:text-3xl">Forecasts</h1>
        {getWeatherIcon()}
        <p className="text-xs md:text-sm capitalize mt-1 text-gray-400">
          {weatherDesc || "Loading..."}
        </p>
      </div>
    </div>
  );
}
