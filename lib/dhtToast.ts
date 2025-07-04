"use client";

import { toast } from "sonner";
const formatNumber = (num: number): number => {
    if (num >= 100) return Math.round(num);
    if (num >= 10) return parseFloat(num.toFixed(1));
    return parseFloat(num.toFixed(2));
  };

export function tempToast(temp: number) {
  if (temp < 15) {
    toast.error(`🔥 Dangerous Temperature! ${formatNumber(temp)}°C`, {
      description: "Temperature is out of safe range! (<15°C)",
    });
  } else if (temp > 32) {
    toast.warning(`🔥 Dangerous Temperature! ${formatNumber(temp)}°C`, {
      description: "Temperature is out of safe range! (>32°C)",
    });
  } else if (temp < 18) {
    toast.warning(`⚠️ Temperature Warning: ${formatNumber(temp)}°C`, {
      description: "Temperature is approaching danger limit! (<18°C)",
    });
  } else if (temp > 27) {
    toast.warning(`⚠️ Temperature Warning: ${formatNumber(temp)}°C`, {
      description: "Temperature is approaching danger limit! (>27°C)",
    });
  }
}

export function humToast(hum: number) {
  if (hum < 20) {
    toast.error(`💧 Dangerous Humidity! ${hum}%`, {
      description: "Humidity is out of safe range! (<20%)",
    });
  } else if (hum > 80) {
    toast.error(`💧 Dangerous Humidity! ${hum}%`, {
      description: "Humidity is out of safe range! (>80%)",
    });
  } else if (hum < 30) {
    toast.warning(`⚠️ Humidity Warning: ${hum}%`, {
      description: "Humidity is approaching danger limit! (<30%)",
    });
  } else if (hum > 70) {
    toast.warning(`⚠️ Humidity Warning: ${hum}%`, {
      description: "Humidity is approaching danger limit! (>70%)",
    });
  }
}