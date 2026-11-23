"use client"

import * as React from "react"
import useSWR, { useSWRConfig } from "swr"
import useSWRInfinite from "swr/infinite"
import { API_KEY_CHANGED_EVENT, api, fetcher, getApiKey } from "@/lib/api"
import type {
  Alert,
  CinemaSummary,
  DashboardSummary,
  DateRangePreset,
  Measurement,
  Profile,
  Room,
  SensorWithContext,
} from "@/lib/types"
import type { MeasurementRow } from "@/lib/server/store"

// Las secciones "en vivo" se actualizan solas cada minuto. Los sensores
// reportan cada ~5 minutos, así que consultar más seguido solo gasta
// ancho de banda y cupo de pedidos del backend sin mostrar nada nuevo.
const LIVE_REFRESH_MS = 60000

/** Alertas por página en el historial ("Cargar más" pide la siguiente). */
const ALERT_HISTORY_PAGE_SIZE = 100

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

/** Sensores, con filtros opcionales que aplica el backend (sin filtros: todos). */
export function useSensors(filters?: { cinemaId?: string; roomId?: string; status?: "online" | "offline" | "alert" }) {
  const key = `/api/sensors${toQuery(filters)}`
  return useSWR<SensorWithContext[]>(key, fetcher, { refreshInterval: LIVE_REFRESH_MS })
}

export function useSensor(devEui: string | undefined) {
  return useSWR<SensorWithContext | null>(
    devEui ? `/api/sensors/${devEui}` : null,
    fetcher,
    {
      refreshInterval: LIVE_REFRESH_MS,
    }
  )
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
  battery?: number
  to?: string
  page?: number
  pageSize?: number
}) {
  const key = `/api/measurements${toQuery(params)}`
  return useSWR<{ rows: MeasurementRow[]; total: number; page: number; pageSize: number }>(key, fetcher)
}

/** Alertas activas (o todas): pocas, se actualizan cada minuto. */
export function useAlerts(active?: boolean) {
  const key = `/api/alerts${toQuery(active !== undefined ? { active: String(active) } : undefined)}`
  return useSWR<Alert[]>(key, fetcher, { refreshInterval: LIVE_REFRESH_MS })
}

/**
 * Historial de alertas resueltas, de a páginas (cursor = id de la última recibida).
 * No se actualiza solo: el backend lo cuenta como consulta pesada.
 */
export function useAlertHistory(enabled: boolean) {
  const getKey = (index: number, previous: Alert[] | null) => {
    if (!enabled) return null
    if (previous && previous.length < ALERT_HISTORY_PAGE_SIZE) return null
    const cursor = previous?.[previous.length - 1]?.id
    return `/api/alerts${toQuery({ active: "false", limit: ALERT_HISTORY_PAGE_SIZE, cursor })}`
  }

  const { data, error, size, setSize, isLoading, isValidating } = useSWRInfinite<Alert[]>(getKey, fetcher, {
    revalidateFirstPage: false,
  })

  const lastPage = data?.[data.length - 1]
  return {
    alerts: data?.flat(),
    error,
    isLoading,
    isLoadingMore: isValidating && size > (data?.length ?? 0),
    hasMore: lastPage !== undefined && lastPage.length === ALERT_HISTORY_PAGE_SIZE,
    loadMore: () => setSize(size + 1),
  }
}

export function useProfiles() {
  return useSWR<Profile[]>("/api/profiles", fetcher)
}

export function useRooms(cinemaId?: string) {
  const key = `/api/rooms${toQuery({ cinemaId })}`
  return useSWR<Room[]>(key, fetcher)
}



/**
 * Qué puede hacer la clave guardada en este navegador (Configuración > Acceso
 * de administrador). Sin clave, o mientras se verifica, no puede nada: los
 * botones de edición se ocultan y la app queda en modo lectura.
 */
export function useAccess() {
  const [key, setKey] = React.useState<string | null>(null)

  React.useEffect(() => {
    const read = () => setKey(getApiKey())
    read()
    window.addEventListener(API_KEY_CHANGED_EVENT, read)
    window.addEventListener("storage", read) // otra pestaña cambió la clave
    return () => {
      window.removeEventListener(API_KEY_CHANGED_EVENT, read)
      window.removeEventListener("storage", read)
    }
  }, [])

  const { data: me } = useSWR(key ? ["/api/me", key] : null, ([, apiKey]: [string, string]) => api.getMe(apiKey))

  const isAdmin = me?.client?.type === "admin"
  return {
    /** Cines y salas: solo la clave de administrador. */
    isAdmin,
    /** Permisos de escritura: "sensors:write", "profiles:write". */
    can: (permission: string) => isAdmin || Boolean(me?.permissions.includes(permission)),
  }
}

/** Vuelve a pedir todo lo que empiece con alguno de estos paths (después de editar algo). */
export function useRefresh() {
  const { mutate } = useSWRConfig()
  return React.useCallback(
    (...prefixes: string[]) =>
      mutate((key) => typeof key === "string" && prefixes.some((prefix) => key.startsWith(prefix))),
    [mutate],
  )
}
