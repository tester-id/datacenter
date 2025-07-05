import { NextResponse } from "next/server";
import { getLatestTelemetry } from "@/lib/thingsboard";

export async function GET() {
  const data = await getLatestTelemetry();
  return NextResponse.json(data); 
}