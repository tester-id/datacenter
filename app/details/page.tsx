"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import LiquidFillGauge from "react-liquid-gauge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";

type ChartDataPoint = {
  time: string;
  tempIn: number;
  humIn: number;
};

type DailyData = {
  date: string;
  gas: number;
  temp: number;
  hum: number;
};

const formatNumber = (num: number): number => {
  if (num >= 100) return Math.round(num);
  if (num >= 10) return parseFloat(num.toFixed(1));
  return parseFloat(num.toFixed(2));
};

const fetchChartData = async (range: string): Promise<ChartDataPoint[]> => {
  const res = await fetch(`/api/telemetry?range=${range}`);
  if (!res.ok) return [];
  return res.json();
};

const fetchDailyData = async (): Promise<DailyData[]> => {
  const res = await fetch(`/api/telemetry/history?days=7`);
  if (!res.ok) return [];
  return res.json();
};

const getCategoryColor = (category: string): string => {
  switch (category) {
    case "Danger":
      return "bg-red-600 text-white";
    case "Unhealthy":
      return "bg-orange-500 text-white";
    case "Moderate":
      return "bg-yellow-400 text-black";
    case "Good":
      return "bg-green-500 text-white";
    case "Very Good":
      return "bg-blue-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

const getAirQualityCategory = (gas: number, temp: number, hum: number): string => {
  if (gas > 3000 || temp > 40 || hum > 80) return "Danger";
  if (gas > 2000 || temp > 35 || hum > 70) return "Unhealthy";
  if (gas > 1000 || temp > 30 || hum > 60) return "Moderate";
  if (gas > 500 || temp > 25 || hum > 50) return "Good";
  return "Very Good";
};

export default function DetailsPage() {
  const router = useRouter();
  const [range, setRange] = useState<"12d" | "7d" | "24h" | "12h">("7d");
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [gasNow, setGasNow] = useState<number>(0);
  const gasPercent = (gasNow / 5000) * 100;
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [gaugeSize, setGaugeSize] = useState(200);

  useEffect(() => {
    fetchChartData(range).then(setChartData);
    fetch(`/api/telemetry/gas/latest`)
      .then((res) => (res.ok ? res.json() : { value: 0 }))
      .then((d) => setGasNow(d.value));
    fetchDailyData().then(setDailyData);
  }, [range]);

  useEffect(() => {
    const handleResize = () => {
      setGaugeSize(window.innerWidth < 640 ? 160 : 200);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-t from-[#111627] to-[#344378]">
      <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white">Details</h2>

        {/* Range Selector */}
        <div className="flex gap-2 flex-wrap">
          {["12d", "7d", "24h", "12h"].map((r) => (
            <Button
              key={r}
              className="cursor-pointer"
              variant={range === r ? "default" : "outline"}
              onClick={() => setRange(r as any)}
            >
              {r.toUpperCase()}
            </Button>
          ))}
        </div>

        {/* Chart & Gauge */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Area Chart */}
          <Card className="p-4 rounded-xl bg-[#1e293b]">
            <h3 className="text-xl font-semibold mb-4 text-white">
              Temperature & Humidity (Indoor)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    value.toFixed(1),
                    name,
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="tempIn"
                  stroke="#f43f5e"
                  fill="url(#colorTemp)"
                  name="Temp (°C)"
                />
                <Area
                  type="monotone"
                  dataKey="humIn"
                  stroke="#0ea5e9"
                  fill="url(#colorHum)"
                  name="Humidity (%)"
                />
              </AreaChart>
            </ResponsiveContainer>

            <div className="flex flex-col items-center mt-6">
              <LiquidFillGauge
                value={gasPercent}
                minValue={0}
                maxValue={5000}
                width={gaugeSize}
                height={gaugeSize}
                textStyle={{ fill: "#fff", fontSize: 22 }}
                riseAnimation
                waveAnimation
                waveFrequency={2}
                waveAmplitude={3}
                gradient
                textRenderer={() => (
                  <tspan>{Math.round(gasNow)} ppm</tspan>
                )}
              />
              <p className="mt-2 text-sm text-gray-300">ppm</p>
            </div>
          </Card>
        </div>

        {/* Table - 7 Days */}
        <Card className="p-4 rounded-xl bg-[#1e293b] overflow-auto">
          <h3 className="text-xl font-semibold mb-4 text-white">
            Latest 7 Days Data
          </h3>
          <div className="w-full overflow-x-auto">
            <table className="min-w-[600px] w-full text-sm text-left">
              <thead className="text-xs text-white uppercase border-b border-white/10">
                <tr>
                  <th className="px-4 py-2">Day/Date</th>
                  <th className="px-4 py-2">Gas (ppm)</th>
                  <th className="px-4 py-2">Temperature (°C)</th>
                  <th className="px-4 py-2">Humidity (%)</th>
                  <th className="px-4 py-2">Category</th>
                </tr>
              </thead>
              <tbody>
                {dailyData.map((item, i) => {
                  const category = getAirQualityCategory(item.gas, item.temp, item.hum);
                  return (
                    <tr key={i} className="border-b border-white/5">
                      <td className="px-4 py-2 text-gray-300">
                        {format(parseISO(item.date), "EEEE, dd MMMM yyyy")}
                      </td>
                      <td className="px-4 py-2 text-gray-300">{formatNumber(item.gas)}</td>
                      <td className="px-4 py-2 text-gray-300">{formatNumber(item.temp)}</td>
                      <td className="px-4 py-2 text-gray-300">{formatNumber(item.hum)}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 text-xs rounded-full font-semibold ${getCategoryColor(category)}`}>
                          {category}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      {/* Floating Back Button */}
      <div className="group fixed bottom-6 right-6 z-50">
        <button
          onClick={() => router.push("/")}
          className="cursor-pointer flex items-center gap-2 bg-gradient-to-tr from-[#0e1426] to-[#1d2b53] text-white px-4 py-2 rounded-full shadow-xl hover:shadow-2xl transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
          aria-label="Back to Dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline text-sm font-medium">Back</span>
        </button>
      </div>
    </div>
  );
}
