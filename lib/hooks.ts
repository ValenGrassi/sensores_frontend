"use client"

import useSWR from "swr"
import { fetcher } from "@/lib/api"
import type {
  Alert,
  CinemaSummary,
  DashboardSummary,
  DateRangePreset,
  Incident,
  Measurement,
  Profile,
  SensorWithContext,
} from "@/lib/types"
import type { MeasurementRow, ReportResult } from "@/lib/server/store"

// Live-ish sections poll on an interval so the UI reflects new
// measurements without the user needing to refresh — this mirrors how the
// app will behave once it's wired to real LoRaWAN telemetry.
const LIVE_REFRESH_MS = 30000

function toQuery(params?: Record<string, string | number | boolean | undefined>) {
  if (!params) return ""
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ""
}

export function useDashboard() {
  return useSWR<DashboardSummary>("/api/dashboard", fetcher, { refreshInterval: LIVE_REFRESH_MS })
}

export function useCinemas() {
  return useSWR<CinemaSummary[]>("/api/cinemas", fetcher, { refreshInterval: LIVE_REFRESH_MS })
}

interface CinemaDetail extends CinemaSummary {
  rooms: { id: string; name: string; type: string; profileId: string; sensors: SensorWithContext[] }[]
}

export function useCinema(id: string | undefined) {
  return useSWR<CinemaDetail>(id ? `/api/cinemas/${id}` : null, fetcher, { refreshInterval: LIVE_REFRESH_MS })
}

export function useSensors(filters?: { cinemaId?: string; roomId?: string; status?: string }) {
  const key = `/api/sensors${toQuery(filters)}`
  return useSWR<SensorWithContext[]>(key, fetcher, { refreshInterval: LIVE_REFRESH_MS })
}

export function useSensor(id: string | undefined) {
  return useSWR<SensorWithContext>(id ? `/api/sensors/${id}` : null, fetcher, { refreshInterval: LIVE_REFRESH_MS })
}

export function useSensorMeasurements(
  id: string | undefined,
  preset: DateRangePreset,
  range?: { from?: string; to?: string },
) {
  const key = id
    ? `/api/sensors/${id}/measurements${toQuery({ preset, from: range?.from, to: range?.to })}`
    : null
  return useSWR<Measurement[]>(key, fetcher)
}

export function useMeasurements(params: {
  cinemaId?: string
  roomId?: string
  sensorId?: string
  preset?: DateRangePreset
  from?: string
  to?: string
  page?: number
  pageSize?: number
}) {
  const key = `/api/measurements${toQuery(params)}`
  return useSWR<{ rows: MeasurementRow[]; total: number; page: number; pageSize: number }>(key, fetcher)
}

export function useAlerts(active?: boolean) {
  const key = `/api/alerts${toQuery(active !== undefined ? { active: String(active) } : undefined)}`
  return useSWR<Alert[]>(key, fetcher, { refreshInterval: LIVE_REFRESH_MS })
}

export function useIncidents() {
  return useSWR<Incident[]>("/api/incidents", fetcher, { refreshInterval: LIVE_REFRESH_MS })
}

export function useProfiles() {
  return useSWR<Profile[]>("/api/profiles", fetcher)
}

export function useReport(params: {
  cinemaId?: string
  roomId?: string
  sensorId?: string
  preset?: DateRangePreset
  from?: string
  to?: string
}) {
  const key = `/api/reports${toQuery(params)}`
  return useSWR<ReportResult>(key, fetcher)
}
