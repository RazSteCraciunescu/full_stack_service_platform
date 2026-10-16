import type { Metrics, RequestRow } from "./types";

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`API request failed (${response.status})`);
  return response.json() as Promise<T>;
}

export async function loadDashboard() {
  const [metrics, requests] = await Promise.all([
    getJson<Metrics>("/api/metrics"),
    getJson<{ items: RequestRow[] }>("/api/requests")
  ]);
  return { metrics, requests: requests.items };
}
