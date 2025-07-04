export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { format } from "date-fns";
import { getEntityId } from "@/lib/thingsboard";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const range = (searchParams.get("range") || "7d") as RangeKey;

  const { id, type, token } = await getEntityId();
  const now = Date.now();

  type RangeKey = "12h" | "24h" | "7d" | "12d";
  const config: Record<RangeKey, { interval: number; points: number }> = {
    "12h": { interval: 60 * 60 * 1000, points: 12 },
    "24h": { interval: 60 * 60 * 1000, points: 24 },
    "7d": { interval: 24 * 60 * 60 * 1000, points: 7 },
    "12d": { interval: 24 * 60 * 60 * 1000, points: 12 },
  };

  const { interval, points } = config[range];
  const startTs = now - interval * points;

  const url = `${process.env.TB_API_URL}/api/plugins/telemetry/${type}/${id}/values/timeseries?keys=tempIn,humIn&startTs=${startTs}&endTs=${now}&interval=${interval}&limit=${points}&agg=AVG`;

  const res = await fetch(url, {
    headers: { "X-Authorization": `Bearer ${token}` },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch telemetry data" }, { status: 500 });
  }

  const data = await res.json();

  const result = Array.from({ length: points }).map((_, i) => {
    const ts = now - (points - i - 1) * interval;
    return {
      time: format(new Date(ts), "dd/MM HH:mm"),
      tempIn: parseFloat(data?.tempIn?.[i]?.value || "0"),
      humIn: parseFloat(data?.humIn?.[i]?.value || "0"),
    };
  });

  return NextResponse.json(result);
}
