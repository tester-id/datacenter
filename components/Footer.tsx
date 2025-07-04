"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card } from "./Card";
import { Icons } from "./icons";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { loginTb, readSetting } from "@/actions";
import axios from "axios";
import {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Autoplay,
  Parallax,
} from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { tempToast, humToast } from "@/lib/dhtToast";
import { gasToast } from "@/lib/gasToast";
import { sendMessengerMessage } from "@/lib/sendMessenger";
import SunCalc from "suncalc";
import { MoonPhase } from "./MoonPhase";
// import * as lucideIcons from "lucide-react";

export function Footer() {
  const [tempIn, setTempIn] = useState(0);
  // const [tempOut, setTempOut] = useState(0);
  const [humIn, setHumIn] = useState(0);
  // const [humOut, setHumOut] = useState(0);
  const [gas, setGas] = useState(0);
  const gasAlarmRef = useRef<HTMLAudioElement | null>(null);
  const [fire, setFire] = useState(0);
  const [windDirection, setWindDirection] = useState("N/A");
  const [windSpeed, setWindSpeed] = useState(0);
  const [windAvg, setWindAvg] = useState(0);
  const [moonPhase, setMoonPhase] = useState<number | null>(null);
  const [fireAlerted, setFireAlerted] = useState(false);
  const [gasAlerted, setGasAlerted] = useState(false);
  const [tempAlerted, setTempAlerted] = useState(false);
  const [humAlerted, setHumAlerted] = useState(false);

  const alarmRef = useRef<HTMLAudioElement | null>(null);

  const getMoonIcon = (phase: number | null) => {
  if (phase === null) return <MoonPhase phase={0} />;

  if (phase === 0 || phase === 1) return <MoonPhase phase={0} />; // New Moon
  if (phase > 0 && phase < 0.25) return <MoonPhase phase={0.1} />; // Waxing Crescent
  if (phase === 0.25) return <MoonPhase phase={0.25} />; // First Quarter
  if (phase > 0.25 && phase < 0.5) return <MoonPhase phase={0.3} />; // Waxing Gibbous
  if (phase === 0.5) return <MoonPhase phase={0.5} />; // Full Moon
  if (phase > 0.5 && phase < 0.75) return <MoonPhase phase={0.6} />; // Waning Gibbous
  if (phase === 0.75) return <MoonPhase phase={0.75} />; // Last Quarter
  return <MoonPhase phase={0.8} />; // Waning Crescent
};

  useEffect(() => {
    let webSocket: WebSocket;

    const connectWebSocket = async () => {
      try {
        const login = await loginTb();
        const setting = await readSetting();

        if (!login.token || !setting.data?.length) return;

        const token = login.token;
        const { entityId, entityType } = setting.data[0];

        webSocket = new WebSocket(process.env.NEXT_PUBLIC_TB_WS_URL || "");

        webSocket.onopen = () => {
          const object = {
            authCmd: {
              cmdId: 0,
              token: token,
            },
            cmds: [
              {
                entityType,
                entityId,
                scope: "LATEST_TELEMETRY",
                cmdId: 10,
                type: "TIMESERIES",
              },
            ],
          };
          webSocket.send(JSON.stringify(object));
        };

        webSocket.onmessage = (event) => {
          const received = JSON.parse(event.data);
          const { data } = received;

          if (data.tempIn) setTempIn(Number(data.tempIn[0][1]));
          // if (data.tempOut) setTempOut(Number(data.tempOut[0][1]));
          if (data.humIn) setHumIn(Number(data.humIn[0][1]));
          // if (data.humOut) setHumOut(Number(data.humOut[0][1]));
          if (data.gas) setGas(Number(data.gas[0][1]));
          if (data.fire) setFire(Number(data.fire[0][1]));
          if (data.windDirection) setWindDirection(data.windDirection[0][1]);
          if (data.windSpeed) setWindSpeed(Number(data.windSpeed[0][1]));
          if (data.windAvg) setWindAvg(Number(data.windAvg[0][1]));
        };

        webSocket.onclose = () => {
          console.log("WebSocket connection closed");
        };
      } catch (err) {
        console.error("WebSocket error:", err);
      }
    };

    connectWebSocket();

    return () => {
      webSocket?.close();
    };
  }, []);

  // Polling fallback every 10 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const login = await loginTb();
        const setting = await readSetting();

        if (!login.token || !setting.data?.length) return;

        const token = login.token;
        const { entityId, entityType } = setting.data[0];

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_TB_API_URL}/api/plugins/telemetry/${entityType}/${entityId}/values/timeseries`,
          {
            headers: {
              "X-Authorization": `Bearer ${token}`,
            },
          }
        );

        const data = res.data;

        if (data.tempIn) setTempIn(Number(data.tempIn[0].value));
        // if (data.tempOut) setTempOut(Number(data.tempOut[0].value));
        if (data.humIn) setHumIn(Number(data.humIn[0].value));
        // if (data.humOut) setHumOut(Number(data.humOut[0].value));
        if (data.gas) setGas(Number(data.gas[0].value));
        if (data.fire) setFire(Number(data.fire[0].value));
        if (data.windDirection) setWindDirection(data.windDirection[0].value);
        if (data.windSpeed) setWindSpeed(Number(data.windSpeed[0].value));
        if (data.windAvg) setWindAvg(Number(data.windAvg[0].value));
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 10000); // every 10 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof tempIn === "number" && !tempAlerted) {
      tempToast(tempIn);
      setTempAlerted(true);
    } else {
      setTempAlerted(false);
    }
  }, [tempIn]);

  useEffect(() => {
    if (typeof humIn === "number" && !humAlerted) {
      humToast(humIn);
      setHumAlerted(true);
    } else {
      setHumAlerted(false);
    }
  }, [humIn]);

  // Fire alarm effect
  useEffect(() => {
    if (typeof fire === "number" && fire >= 1 && !fireAlerted) {
      alarmRef.current?.play().catch((err) => {
        console.warn("Audio play failed:", err);
      });
      sendMessengerMessage(`🔥 𝐀𝐋𝐄𝐑𝐓! 𝐀𝐩𝐢 𝐭𝐞𝐫𝐝𝐞𝐭𝐞𝐤𝐬𝐢 𝐝𝐢 𝐫𝐮𝐚𝐧𝐠 𝐬𝐞𝐫𝐯𝐞𝐫! \n\nKandungan Gas = ${gas} ppm \nSuhu = ${formatNumber(tempIn)}°C\nKelembapan = ${humIn}%`, "fire");
      setFireAlerted(true);
    } else {
      if (alarmRef.current && fireAlerted) {
        alarmRef.current.pause();
        alarmRef.current.currentTime = 0;
        setFireAlerted(false);
      }
    }
  }, [fire]);

  const formatNumber = (num: number): number => {
    if (num >= 100) return Math.round(num);
    if (num >= 10) return parseFloat(num.toFixed(1));
    return parseFloat(num.toFixed(2));
  };

  useEffect(() => {
    if (typeof gas === "number" && gas >= 2000 && !gasAlerted) {
      gasAlarmRef.current?.play().catch((e) => {
        console.warn("Gas alarm audio play failed:", e);
      });
      sendMessengerMessage(`🚨 𝐏𝐄𝐑𝐈𝐍𝐆𝐀𝐓𝐀𝐍 𝐆𝐀𝐒! \n\nKandungan gas mencapai ${gas} ppm!\nSuhu = ${formatNumber(tempIn)}°C\nKelembapan = ${humIn}%`, "gas");
      setGasAlerted(true);
    } else {
      if (gasAlarmRef.current && gasAlerted) {
        gasAlarmRef.current.pause();
        gasAlarmRef.current.currentTime = 0;
        setGasAlerted(false);
      }
    }

    if (typeof gas === "number" && !gasAlerted) {
      gasToast(gas);
      setGasAlerted(true);
    } else {
      setGasAlerted(false);
    }
  }, [gas]);

  useEffect(() => {
    if (typeof tempIn === "number") {
      if ((tempIn < 15 || tempIn > 32)) {
        if (!tempAlerted) {
          sendMessengerMessage(
            `🚨 𝐃𝐀𝐍𝐆𝐄𝐑! \n\nSuhu ruangan ${formatNumber(tempIn)}°C di luar batas aman (<15°C atau >32°C)! \nKelembapan = ${humIn}% \nKandungan Gas = ${gas} ppm`,
            "temp"
          );
          setTempAlerted(true);
        }
      } else if ((tempIn < 18 || tempIn > 27)) {
        if (!tempAlerted) {
          sendMessengerMessage(
            `⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆! \n\nSuhu ruangan ${formatNumber(tempIn)}°C di luar rentang ideal (<18°C atau >27°C)! \nKelembapan = ${humIn}% \nKandungan Gas = ${gas} ppm`,
            "temp"
          );
          setTempAlerted(true);
        }
      } else {
        setTempAlerted(false);
      }
    }
  }, [tempIn]);

  useEffect(() => {
    if (typeof humIn === "number") {
      if ((humIn < 20 || humIn > 80)) {
        if (!humAlerted) {
          sendMessengerMessage(
            `🚨 𝐃𝐀𝐍𝐆𝐄𝐑! \n\nKelembapan ruangan ${formatNumber(humIn)}% di luar batas aman (<20% atau >80%)! \nSuhu = ${formatNumber(tempIn)}°C \nKandungan Gas = ${gas} ppm`,
            "hum"
          );
          setHumAlerted(true);
        }
      } else if ((humIn < 30 || humIn > 70)) {
        if (!humAlerted) {
          sendMessengerMessage(
            `⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆! \n\nKelembapan ruangan ${formatNumber(humIn)}% di luar rentang ideal (<30% atau >70%)! \nSuhu = ${formatNumber(tempIn)}°C \nKandungan Gas = ${gas} ppm`,
            "hum"
          );
          setHumAlerted(true);
        }
      } else {
        setHumAlerted(false);
      }
    }
  }, [humIn]);

  useEffect(() => {
  const today = new Date();
  const moon = SunCalc.getMoonIllumination(today);
  setMoonPhase(moon.phase);
}, []);

  return (
    <div className="flex flex-col">
      {/* Audio Alarm */}
      <audio
        ref={gasAlarmRef}
        src="/alarms/gas_alarm.mp3"
        preload="auto"
        loop
      />
      <audio ref={alarmRef} src="/alarms/fire_alarm.mp3" preload="auto" loop/>

      <div className="flex justify-between mx-4">
        <div className="flex flex-col">
          <div className="flex gap-3">
            <h3 className="text-2xl">Wind</h3>
            <Icons.wind className="h-8 w-8 rounded-full bg-[#0e1426] p-1" />
          </div>
          <div className="flex gap-2">
            <p className="text-xl text-[#5f6281]">Direction:</p>
            <p className="text-xl text-white">{windDirection}</p>
          </div>
          <div className="flex gap-2">
            <p className="text-xl text-[#5f6281]">Speed:</p>
            <p className="text-xl text-white">{formatNumber(windSpeed)} m/s</p>
          </div>
          <div className="flex gap-2">
            <p className="text-xl text-[#5f6281]">Average:</p>
            <p className="text-xl text-white">{formatNumber(windAvg)} m/s</p>
          </div>
        </div>
        <div className="flex items-end">
          <p className="text-xl text-[#5f6281]">Moon Phase</p>
          {getMoonIcon(moonPhase)}
        </div>
      </div>

      <div className="flex m-4 gap-3 min-h-60">
        <Swiper
          modules={[
            Navigation,
            Pagination,
            Scrollbar,
            A11y,
            Autoplay,
            Parallax,
          ]}
          spaceBetween={10}
          slidesPerView={4}
          navigation
          pagination={{ clickable: true }}
          autoplay
          breakpoints={{
            200: { slidesPerView: 1, spaceBetween: 10 },
            640: { slidesPerView: 2, spaceBetween: 20 },
            768: { slidesPerView: 3, spaceBetween: 30 },
            1024: { slidesPerView: 4, spaceBetween: 10 },
          }}
        >
          <SwiperSlide>
            <Card
              title="Temperature IN"
              icon={<Icons.temperature />}
              value={formatNumber(tempIn)}
              unit="°C"
              texts={["", "Indoor Temperature", ""]}
            />
          </SwiperSlide>
          <SwiperSlide>
            <Card
              title="Humidity IN"
              icon={<Icons.droplet />}
              value={formatNumber(humIn)}
              unit="%"
              texts={["", "Indoor Humidity", ""]}
            />
          </SwiperSlide>
          <SwiperSlide>
            <Card
              title="Gas IN"
              icon={<Icons.radar />}
              value={formatNumber(gas)}
              unit="ppm"
              texts={["", "Indoor Gas", ""]}
            />
          </SwiperSlide>
          <SwiperSlide>
            {fire >= 1 ? (
              <div className="flex flex-col items-center justify-center h-full bg-[#0e1426] rounded-lg">
                <DotLottieReact
                  src="/animations/fire.lottie"
                  loop
                  autoplay
                  style={{ width: 120, height: 120 }}
                />
                <p className="text-xl text-red-500 mt-2">🚨 Fire Detected</p>
              </div>
            ) : (
              <Card
                title="Fire"
                icon={<Icons.fire />}
                value={0}
                unit={"No Fire"}
                texts={["", "Fire Detection", ""]}
              />
            )}
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  );
}
