import { TB_API_URL, TB_USERNAME, TB_PASSWORD } from "@/lib/env";

let cachedToken: string | null = null;

export async function getTBToken(): Promise<string> {

  const res = await fetch(`${TB_API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: TB_USERNAME, password: TB_PASSWORD }),
  });

  if (!res.ok) throw new Error("Failed to login to ThingsBoard");

  const data = await res.json();
  cachedToken = data.token;
  if (!cachedToken) throw new Error("Token not found in response");
  return cachedToken;
}

export async function getEntityId(): Promise<{ id: string; type: string; token: string }> {
  const token = await getTBToken();

  // Ambil device bernama "datacenter"
  const res = await fetch(
    `${TB_API_URL}/api/tenant/devices?textSearch=datacenter&pageSize=1&page=0`,
    {
      headers: { "X-Authorization": `Bearer ${token}` },
    }
  );

  if (!res.ok) throw new Error("Failed to fetch device");

  const json = await res.json();
  const device = json.data?.find((d: any) => d.name === "datacenter");

  if (!device) throw new Error("Device 'datacenter' not found");

  return {
    id: device.id.id,
    type: device.id.entityType,
    token,
  };
}

export async function getLatestTelemetry(): Promise<{
  time: string;
  tempIn: number;
  humIn: number;
  gas: number;
}> {
  const { id, token } = await getEntityId();

  const res = await fetch(
    `${TB_API_URL}/api/plugins/telemetry/DEVICE/${id}/values/timeseries?keys=tempIn,humIn,gas`,
    {
      headers: { "X-Authorization": `Bearer ${token}` },
    }
  );

  if (!res.ok) throw new Error("Failed to fetch latest telemetry");

  const json = await res.json();

  return {
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    tempIn: parseFloat(json.tempIn?.[0]?.value || "0"),
    humIn: parseFloat(json.humIn?.[0]?.value || "0"),
    gas: parseFloat(json.gas?.[0]?.value || "0"),
  };
}