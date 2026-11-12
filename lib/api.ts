// Thin client-side wrapper around the backend API. This is the ONLY layer
// UI code should import for data access.
//
// - Lecturas (GET): públicas, no mandan clave.
// - Escrituras (POST/PATCH/DELETE): mandan la clave de administrador guardada
//   en este navegador (Configuración > Acceso de administrador).

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://sensores-backend-2fa8.onrender.com"

const API_KEY_STORAGE = "sensores.apiKey"

/** Error de la API con el código estable del backend (p. ej. "API_KEY_REQUIRED"). */
export class ApiError extends Error {
  status: number
  code: string
  details?: { field: string; message: string }[]

  constructor(status: number, code: string, message: string, details?: { field: string; message: string }[]) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.code = code
    this.details = details
  }

  /** true si el problema es la clave (falta, es inválida o no tiene permiso). */
  get isAuthError() {
    return this.status === 401 || this.status === 403
  }
}

export function getApiKey(): string | null {
  try {
    return window.localStorage.getItem(API_KEY_STORAGE)
  } catch {
    return null
  }
}

export function setApiKey(key: string) {
  try {
    window.localStorage.setItem(API_KEY_STORAGE, key)
  } catch {
    // almacenamiento bloqueado: la clave dura solo esta pestaña
  }
}

export function clearApiKey() {
  try {
    window.localStorage.removeItem(API_KEY_STORAGE)
  } catch {
    // nada que limpiar
  }
}

async function toApiError(res: Response): Promise<ApiError> {
  const body = await res.json().catch(() => null)
  const error = body?.error

  // Formato actual: { error: { code, message, details } }. Formato viejo: { error: "mensaje" }.
  if (error && typeof error === "object") {
    return new ApiError(res.status, error.code ?? "UNKNOWN", error.message ?? `Error ${res.status}`, error.details)
  }
  return new ApiError(res.status, "UNKNOWN", typeof error === "string" ? error : `Error ${res.status}`)
}

async function request<T>(path: string, init?: RequestInit & { apiKey?: string | null }): Promise<T> {
  const { apiKey: explicitKey, ...fetchInit } = init ?? {}
  const method = (fetchInit.method ?? "GET").toUpperCase()
  const headers = new Headers(fetchInit.headers)

  if (fetchInit.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const apiKey = explicitKey !== undefined ? explicitKey : method === "GET" ? null : getApiKey()
  if (apiKey) headers.set("X-API-Key", apiKey)

  const res = await fetch(`${API_BASE}${path}`, { ...fetchInit, headers })

  if (!res.ok) throw await toApiError(res)
  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}

/** Mensaje para mostrar en pantalla, con una pista si falta la clave. */
export function describeError(error: unknown): string {
  if (error instanceof ApiError && error.isAuthError) {
    return `${error.message} Configurá la clave en Configuración > Acceso de administrador.`
  }
  return error instanceof Error ? error.message : "Ocurrió un error inesperado."
}

export function fetcher<T>(path: string): Promise<T> {
  return request<T>(path)
}

export interface MeResponse {
  authenticated: boolean
  client: { id: string; name: string; type: "admin" | "client" } | null
  permissions: string[]
}

export const api = {
  getDashboard: () => request("/api/dashboard"),
  getCinemas: () => request("/api/cinemas"),
  getCinema: (id: string) => request(`/api/cinemas/${id}`),
  getSensors: (params?: { cinemaId?: string; roomId?: string; status?: string }) =>
    request(`/api/sensors${toQuery(params)}`),
  getSensor: (id: string) => request(`/api/sensors/${id}`),
  updateSensor: (devEui: string, patch: Record<string, unknown>) =>
    request(`/api/sensors/${devEui}`, { method: "PATCH", body: JSON.stringify(patch) }),
  getSensorMeasurements: (id: string, params?: { preset?: string; from?: string; to?: string }) =>
    request(`/api/sensors/${id}/measurements${toQuery(params)}`),
  getMeasurements: (params?: Record<string, string | number | undefined>) =>
    request(`/api/measurements${toQuery(params)}`),
  getAlerts: (params?: { active?: boolean }) =>
    request(`/api/alerts${toQuery(params ? { active: String(params.active) } : undefined)}`),
  getRooms: (params?: { cinemaId?: string }) => request(`/api/rooms${toQuery(params)}`),
  getProfiles: () => request("/api/profiles"),

  getProfile: (id: string) => request(`/api/profiles/${id}`),

  createProfile: (data: {
    name: string
    description?: string
    temperatureMin: number
    temperatureMax: number
    humidityMin: number
    humidityMax: number
  }) =>
    request("/api/profiles", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateProfile: (
    id: string,
    patch: {
      name?: string
      description?: string
      temperatureMin?: number
      temperatureMax?: number
      humidityMin?: number
      humidityMax?: number
    },
  ) =>
    request(`/api/profiles/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),

  deleteProfile: (id: string) =>
    request(`/api/profiles/${id}`, {
      method: "DELETE",
    }),

  /** Verifica una clave sin guardarla (o la guardada, si no se pasa ninguna). */
  getMe: (apiKey?: string) => request<MeResponse>("/api/me", { apiKey: apiKey ?? getApiKey() }),
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
