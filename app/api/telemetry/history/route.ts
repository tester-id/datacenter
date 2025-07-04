export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { format } from "date-fns";
import { getEntityId } from "@/lib/thingsboard";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") || "7");

  const { id, type, token } = await getEntityId();
  const now = Date.now();
  const interval = 24 * 60 * 60 * 1000;
  const startTs = now - days * interval;

  const url = `${process.env.TB_API_URL}/api/plugins/telemetry/${type}/${id}/values/timeseries?keys=tempIn,humIn,gas&startTs=${startTs}&endTs=${now}&interval=${interval}&limit=${days}&agg=AVG`;

  const res = await fetch(url, {
    headers: { "X-Authorization": `Bearer ${token}` },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch daily history" }, { status: 500 });
  }

  const data = await res.json();

  const result = Array.from({ length: days }).map((_, i) => {
    const ts = now - (days - i - 1) * interval;
    return {
      date: format(new Date(ts), "yyyy-MM-dd"),
      gas: parseFloat(data?.gas?.[i]?.value || "0"),
      temp: parseFloat(data?.tempIn?.[i]?.value || "0"),
      hum: parseFloat(data?.humIn?.[i]?.value || "0"),
    };
  });

  return NextResponse.json(result);
}
