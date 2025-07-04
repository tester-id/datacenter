"use client";

import React, { useEffect, useState } from "react";
import { loginTb, readSetting } from "@/actions";
import axios from "axios";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { LiquidFillGauge } from "react-liquid-gauge";
import { interpolateRgb } from "d3-interpolate";
import { color } from "d3-color";

type DayStat = {
  date: string;
  gas: number;
  temp: number;
  hum: number;
  category: "Good" | "Bad" | "Danger";
};

export function Details() {
  const [history, setHistory] = useState<DayStat[]>([]);
  const [todayGas, setTodayGas] = useState<number>(0);

  // Fetch history + today's gas
  const fetchHistory = async () => {
    try {
      const login = await loginTb();
      const setting = await readSetting();
      if (!login.token || !setting.data?.length) return;

      const { entityId, entityType } = setting.data[0];
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_TB_API_URL}/api/plugins/telemetry/${entityType}/${entityId}/values/timeseries?keys=gas,tempIn,humIn&startTs=${Date.now() - 7 * 24 * 3600 * 1000}&endTs=${Date.now()}`,
        { headers: { "X-Authorization": login.token } }
      );

      const data = res.data;
      // Transform per day
      const weekStats: DayStat[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 3600 * 1000);
        const key = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const gasArr = data.gas?.filter((d: any) =>
          new Date(d.ts).toDateString() === date.toDateString()
        ) || [];
        const tempArr = data.tempIn?.filter((d: any) =>
          new Date(d.ts).toDateString() === date.toDateString()
        ) || [];
        const humArr = data.humIn?.filter((d: any) =>
          new Date(d.ts).toDateString() === date.toDateString()
        ) || [];
        const avg = (arr: any[]) =>
          arr.length ? arr.reduce((a, b) => a + Number(b.value), 0) / arr.length : 0;
        const gas = Math.round(avg(gasArr));
        const temp = parseFloat(avg(tempArr).toFixed(1));
        const hum = parseFloat(avg(humArr).toFixed(1));
        const category =
          gas >= 3000 || temp > 30 || hum > 80
            ? "Danger"
            : gas >= 2000 || temp > 27 || hum > 70
            ? "Bad"
            : "Good";
        weekStats.push({ date: key, gas, temp, hum, category });
      }
      setHistory(weekStats);
      setTodayGas(weekStats[weekStats.length - 1].gas);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchHistory();
    const iv = setInterval(fetchHistory, 60 * 60 * 1000); // refresh tiap jam
    return () => clearInterval(iv);
  }, []);

  const gaugePct = Math.min(Math.max(todayGas / 40, 0), 100);
  const fillColor = interpolateRgb("#00BFFF", "#FF4500")(gaugePct / 100);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Sensor Details (Last 7 Days)</h1>

      {/* Area Chart */}
      <div className="bg-card p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Temperature & Humidity</h2>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={history}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" domain={[0, 100]} unit="%" />
            <YAxis yAxisId="right" orientation="right" domain={[0, 50]} unit="°C" />
            <Tooltip />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="temp"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.3}
              name="Temp (°C)"
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="hum"
              stroke="#82ca9d"
              fill="#82ca9d"
              fillOpacity={0.3}
              name="Humidity (%)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Gas Gauge */}
      <div className="bg-card p-4 rounded-lg flex items-center">
        <div className="w-48 h-48">
          <LiquidFillGauge
            width={192}
            height={192}
            value={gaugePct}
            percent="%"
            gradient
            gradientStops={[
              {
                key: "0%",
                stopColor: color(fillColor)?.darker(0.5).toString(),
                stopOpacity: 1,
                offset: "0%",
              },
              {
                key: "50%",
                stopColor: fillColor,
                stopOpacity: 0.75,
                offset: "50%",
              },
              {
                key: "100%",
                stopColor: color(fillColor)?.brighter(0.5).toString(),
                stopOpacity: 0.5,
                offset: "100%",
              },
            ]}
            circleStyle={{ fill: fillColor }}
            waveStyle={{ fill: fillColor }}
            textRenderer={({ value, height, }: {  value: number;  height: number; }) => {
              const gasVal = Math.round((value / 100) * todayGas);
              return (
                <tspan style={{ fontSize: height / 2 }}>{gasVal} ppm</tspan>
              );
            }}
            textStyle={{ fill: "#444", fontFamily: "Arial" }}
            waveTextStyle={{ fill: "#fff", fontFamily: "Arial" }}
          />
        </div>
        <div className="ml-4">
          <h2 className="text-lg font-semibold">Today's Gas</h2>
          <p className="text-4xl">{todayGas} ppm</p>
        </div>
      </div>

      {/* 7-Day Table */}
      <div className="bg-card p-4 rounded-lg overflow-x-auto">
        <h2 className="text-lg font-semibold mb-2">Last 7 Days Stats</h2>
        <table className="w-full text-left table-fixed">
          <thead>
            <tr className="border-b">
              {["Date", "Gas (ppm)", "Temp (°C)", "Hum (%)", "Category"].map((h) => (
                <th key={h} className="py-1">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((d, i) => (
              <tr key={i} className="border-b">
                <td className="py-1">{d.date}</td>
                <td className="py-1">{d.gas}</td>
                <td className="py-1">{d.temp.toFixed(1)}</td>
                <td className="py-1">{d.hum.toFixed(1)}</td>
                <td className={`py-1 font-semibold ${
                  d.category === "Good"
                    ? "text-green-500"
                    : d.category === "Bad"
                    ? "text-yellow-500"
                    : "text-red-500"
                }`}>
                  {d.category}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
