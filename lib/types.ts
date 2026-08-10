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
  name: string
  devEui: string
  profileId: string
  status: SensorStatus
  battery: number
  temperature: number
  humidity: number
  lastSeen: string // ISO timestamp
  reportingIntervalMinutes: number
}

export interface Measurement {
  id: string
  sensorId: string
  timestamp: string // ISO timestamp
  temperature: number
  humidity: number
  battery: number
}

export interface Alert {
  id: string
  sensorId: string
  type: AlertType
  temperature: number
  humidity: number
  createdAt: string
  resolvedAt: string | null
  active: boolean
}

// Denormalized shapes used by the UI for convenience. The service layer
// enriches raw entities with these when needed.

export interface SensorWithContext extends Sensor {
  room: Room
  cinema: Cinema
  profile: Profile
}

export interface RoomWithSensors extends Room {
  sensors: SensorWithContext[]
}

export interface CinemaSummary extends Cinema {
  status: CinemaStatus
  sensorCount: number
  sensorsOnline: number
  sensorsOffline: number
  activeAlerts: number
}

export interface DashboardSummary {
  cinemaCount: number
  sensorCount: number
  sensorsOnline: number
  sensorsOffline: number
  sensorsAlert: number
  avgTemperature: number
  avgHumidity: number
}

export type DateRangePreset = "24h" | "7d" | "30d" | "3m" | "6m" | "all" | "custom"
