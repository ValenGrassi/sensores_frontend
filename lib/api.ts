// Thin client-side wrapper around the /api/* routes. This is the ONLY layer
// UI code should import for data access. To connect a real backend later,
// point NEXT_PUBLIC_API_BASE_URL at it (or replace the route handlers under
// app/api with proxies) — this file and every hook in lib/hooks.ts stay the same.

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error ?? `Error ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function fetcher<T>(path: string): Promise<T> {
  return request<T>(path)
}

export const api = {
  getDashboard: () => request("/api/dashboard"),
  getCinemas: () => request("/api/cinemas"),
  getCinema: (id: string) => request(`/api/cinemas/${id}`),
  getSensors: (params?: { cinemaId?: string; roomId?: string; status?: string }) =>
    request(`/api/sensors${toQuery(params)}`),
  getSensor: (id: string) => request(`/api/sensors/${id}`),
  getSensorMeasurements: (id: string, params?: { preset?: string; from?: string; to?: string }) =>
    request(`/api/sensors/${id}/measurements${toQuery(params)}`),
  getMeasurements: (params?: Record<string, string | number | undefined>) =>
    request(`/api/measurements${toQuery(params)}`),
  getAlerts: (params?: { active?: boolean }) =>
    request(`/api/alerts${toQuery(params ? { active: String(params.active) } : undefined)}`),
  getIncidents: () => request("/api/incidents"),
  createIncident: (input: { title: string; description: string; sensorId: string; alertId?: string | null }) =>
    request("/api/incidents", { method: "POST", body: JSON.stringify(input) }),
  updateIncidentStatus: (id: string, status: "open" | "resolved") =>
    request(`/api/incidents/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  getProfiles: () => request("/api/profiles"),
  updateProfile: (id: string, patch: Record<string, unknown>) =>
    request(`/api/profiles/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  getReport: (params?: Record<string, string | number | undefined>) => request(`/api/reports${toQuery(params)}`),
}

function toQuery(params?: Record<string, string | number | boolean | undefined>) {
  if (!params) return ""
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ""
}
