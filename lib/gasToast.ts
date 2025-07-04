"use client";

import { toast } from "sonner";

export function gasToast(value: number) {
  if (value > 3000) {
    toast.error(`🚨 High Danger! Gas value: ${value}`, {
      description: "Gas concentration is extremely high! Take immediate action!",
    });
  } else if (value >= 2000) {
    toast.warning(`⚠️ Potential Hazard! Gas value: ${value}`, {
      description: "Elevated gas levels detected. Please stay alert.",
    });
  }
}