import { NextResponse } from "next/server";
import { getEntityId } from "@/lib/thingsboard";

export async function GET() {
  const { id, type, token } = await getEntityId();

  const url = `${process.env.TB_API_URL}/api/plugins/telemetry/${type}/${id}/values/timeseries?keys=gas`;

  const res = await fetch(url, {
    headers: { "X-Authorization": `Bearer ${token}` },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch gas value" }, { status: 500 });
  }

  const data = await res.json();
  const gas = parseFloat(data?.gas?.[0]?.value || "0");

  return NextResponse.json({ value: gas });
}
