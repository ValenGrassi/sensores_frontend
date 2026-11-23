// Core domain types for the temperature/humidity monitoring platform.
// These mirror the shape of the future real API so the mock service layer
// can be swapped out without touching UI code.

export type SensorStatus = "online" | "offline" | "alert"

export type CinemaStatus = "ok" | "attention" | "problem"

export type AlertType =
  | "temperature_high"
  | "temperature_low"
  | "humidity_high"
  | "humidity_low"

export interface Profile {
  id: string
  name: string
  description?: string
  temperatureMin: number
  temperatureMax: number
  humidityMin: number
  humidityMax: number
}

export interface Cinema {
  id: string
  name: string
  address: string
}

export type RoomType = "projection" | "hall" | "lobby" | "storage" | "other"

export interface Room {
  id: string
  cinemaId: string
  name: string
  type: RoomType
  profileId: string
}

export interface Sensor {
  id: string
  roomId: string
  /** null si se registró sin nombre (npm run sensors -- add <devEui>). */
  name: string | null
  devEui: string
  profileId: string
  status: SensorStatus
  battery: number
  temperature: number
  humidity: number
  lastSeen: string // ISO timestamp
  reportingIntervalMinutes: number
}

/**
 * Punto del historial de un sensor. En rangos largos el backend devuelve
 * promedios por hora o por día: esos puntos no tienen `id` y traen `samples`
 * (cuántas lecturas se promediaron); `timestamp` es el inicio del intervalo.
 */
export interface Measurement {
  id?: string
  sensorId: string
  timestamp: string // ISO timestamp
  temperature: number
  humidity: number
  battery: number
  samples?: number
}

export interface Alert {
  id: string
  sensorId: string
  devEui?: string | null
  type: AlertType
  // Lecturas al abrirse la alerta; null = el sensor no informó ese valor.
  temperature: number | null
  humidity: number | null
  createdAt: string
  resolvedAt: string | null
  active: boolean
}

// Denormalized shapes used by the UI for convenience. The service layer
// enriches raw entities with these when needed.

/** Un sensor recién registrado todavía no tiene sala: room, cinema y profile vienen en null. */
export interface SensorWithContext extends Sensor {
  room: Room | null
  cinema: Cinema | null
  profile: Profile | null
}

export interface RoomWithSensors extends Room {
  sensors: SensorWithContext[]
}

export interface CinemaSummary extends Cinema {
  status: CinemaStatus
  sensorCount: number
  sensorsOnline: number
  sensorsOffline: number
  /** Cantidad de alertas activas. */
  activeAlerts: number
  /** Cantidad de sensores con al menos una alerta activa (backend nuevo). */
  sensorsWithAlerts?: number
}

export interface DashboardSummary {
  cinemaCount: number
  sensorCount: number
  sensorsOnline: number
  sensorsOffline: number
  // Campos del backend nuevo (opcionales mientras conviva con uno viejo)
  activeAlerts?: number
  sensorsWithAlerts?: number
  /** @deprecated usar sensorsWithAlerts */
  sensorsAlert: number
  // null = no hay sensores online con datos
  avgTemperature: number | null
  avgHumidity: number | null
}

export interface ApiSensor {
  id: string
  devEui: string
  name: string | null
  temperature: number | null
  humidity: number | null
  battery: number | null
  lastSeen: string | null
}

export type DateRangePreset = "24h" | "7d" | "30d" | "3m" | "6m" | "all" | "custom"