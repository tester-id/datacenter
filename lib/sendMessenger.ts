"use client";

import axios from "axios";

const cooldowns = new Map<string, number>();

export async function sendMessengerMessage(message: string, type: "fire" | "gas" | "temp" | "hum") {
  const apikey = process.env.NEXT_PUBLIC_CALLMEBOT_API_KEY;

  if (!apikey) {
    console.error("API key not defined in env");
    return;
  }

  const now = Date.now();
  const lastSent = cooldowns.get(type) || 0;
  const COOLDOWN_MS = 10 * 1000;

  if (now - lastSent < COOLDOWN_MS) {
    console.log(`Skipping ${type} alert: still in cooldown.`);
    return;
  }

  const url = `https://api.callmebot.com/facebook/send.php?apikey=${apikey}&text=${encodeURIComponent(
    message
  )}`;

  try {
    const res = await axios.get(url);
    console.log("✅ Messenger sent:", res.data);
    cooldowns.set(type, now);
  } catch (error) {
    console.error("❌ Failed to send Messenger message:", error);
  }
}
