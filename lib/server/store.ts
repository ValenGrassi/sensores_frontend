// In-memory "database" for the mock backend. This module is the single
// place that knows how to compute live sensor state, alerts, and reports.
// When a real API is available, only the route handlers under app/api/*
// need to change — the rest of the app talks to this shape via fetch.

import {
  cinemas,
  getCinema,
  getProfile,
  getRoom,
  getRoomsByCinema,
  getSensor,
  getSensorsByCinema,
  getSensorsByRoom,
  profiles,
  rooms,
  sensors,
} from "@/lib/mock/entities"
import { computeReadingAt, generateSeries, lastSeenMsFor, pickStepMs } from "@/lib/mock/measurements"
import type {
  Alert,
  AlertType,
  Cinema,
  CinemaStatus,
  CinemaSummary,
  DashboardSummary,
  Incident,
  IncidentStatus,
  Measurement,
  Profile,
  Room,
  Sensor,
  SensorStatus,
  SensorWithContext,
} from "@/lib/types"

const OFFLINE_THRESHOLD_MULTIPLIER = 3 // offline if silent for > 3x the reporting interval

export interface SensorRuntime {
  status: SensorStatus
  temperature: number
  humidity: number
  battery: number
  lastSeen: string
  outOfRange: boolean
  activeAlertType: AlertType | null
}

export function getSensorRuntime(sensor: Sensor, nowMs = Date.now()): SensorRuntime {
  const profile = getProfile(sensor.profileId)
  const lastSeenMs = lastSeenMsFor(sensor.id, nowMs)
  const silentMinutes = (nowMs - lastSeenMs) / 60000
  const offlineThreshold = sensor.reportingIntervalMinutes * OFFLINE_THRESHOLD_MULTIPLIER
  const isOffline = silentMinutes > offlineThreshold

  const reading = computeReadingAt(sensor.id, sensor.profileId, lastSeenMs, nowMs)

  let activeAlertType: AlertType | null = null
  if (reading.temperature > profile.temperatureMax) activeAlertType = "temperature_high"
  else if (reading.temperature < profile.temperatureMin) activeAlertType = "temperature_low"
  else if (reading.humidity > profile.humidityMax) activeAlertType = "humidity_high"
  else if (reading.humidity < profile.humidityMin) activeAlertType = "humidity_low"

  const outOfRange = activeAlertType !== null

  let status: SensorStatus = "online"
  if (isOffline) status = "offline"
  else if (outOfRange) status = "alert"

  return {
    status,
    temperature: reading.temperature,
    humidity: reading.humidity,
    battery: reading.battery,
    lastSeen: new Date(lastSeenMs).toISOString(),
    outOfRange,
    activeAlertType,
  }
}

export function getSensorWithContext(sensor: Sensor, nowMs = Date.now()): SensorWithContext {
  const room = getRoom(sensor.roomId)
  if (!room) throw new Error(`Room not found for sensor ${sensor.id}`)
  const cinema = getCinema(room.cinemaId)
  if (!cinema) throw new Error(`Cinema not found for room ${room.id}`)
  const profile = getProfile(sensor.profileId)
  const runtime = getSensorRuntime(sensor, nowMs)
  return {
    ...sensor,
    status: runtime.status,
    temperature: runtime.temperature,
    humidity: runtime.humidity,
    battery: runtime.battery,
    lastSeen: runtime.lastSeen,
    room,
    cinema,
    profile,
  }
}

export function listSensors(filters?: { cinemaId?: string; roomId?: string; status?: SensorStatus }) {
  let list = sensors
  if (filters?.roomId) list = list.filter((s) => s.roomId === filters.roomId)
  else if (filters?.cinemaId) list = getSensorsByCinema(filters.cinemaId)
  const enriched = list.map((s) => getSensorWithContext(s))
  if (filters?.status) return enriched.filter((s) => s.status === filters.status)
  return enriched
}

export function getSensorDetail(sensorId: string): SensorWithContext | undefined {
  const sensor = getSensor(sensorId)
  if (!sensor) return undefined
  return getSensorWithContext(sensor)
}

function computeCinemaStatus(sensorRuntimes: SensorRuntime[]): CinemaStatus {
  const hasOutOfRange = sensorRuntimes.some((r) => r.outOfRange)
  if (hasOutOfRange) return "problem"
  const hasOffline = sensorRuntimes.some((r) => r.status === "offline")
  if (hasOffline) return "attention"
  return "ok"
}

export function getCinemaSummary(cinema: Cinema, nowMs = Date.now()): CinemaSummary {
  const cinemaSensors = getSensorsByCinema(cinema.id)
  const runtimes = cinemaSensors.map((s) => getSensorRuntime(s, nowMs))
  const status = computeCinemaStatus(runtimes)
  return {
    ...cinema,
    status,
    sensorCount: cinemaSensors.length,
    sensorsOnline: runtimes.filter((r) => r.status === "online").length,
    sensorsOffline: runtimes.filter((r) => r.status === "offline").length,
    activeAlerts: runtimes.filter((r) => r.outOfRange).length,
  }
}

export function listCinemaSummaries(nowMs = Date.now()): CinemaSummary[] {
  return cinemas.map((c) => getCinemaSummary(c, nowMs))
}

export function getCinemaDetail(cinemaId: string, nowMs = Date.now()) {
  const cinema = getCinema(cinemaId)
  if (!cinema) return undefined
  const summary = getCinemaSummary(cinema, nowMs)
  const cinemaRooms = getRoomsByCinema(cinemaId)
  const roomsWithSensors = cinemaRooms.map((room) => ({
    ...room,
    sensors: getSensorsByRoom(room.id).map((s) => getSensorWithContext(s, nowMs)),
  }))
  return { ...summary, rooms: roomsWithSensors }
}

export function getDashboardSummary(nowMs = Date.now()): DashboardSummary {
  const allRuntimes = sensors.map((s) => getSensorRuntime(s, nowMs))
  const online = allRuntimes.filter((r) => r.status === "online")
  const offline = allRuntimes.filter((r) => r.status === "offline")
  const alert = allRuntimes.filter((r) => r.status === "alert")
  const avgTemperature =
    allRuntimes.reduce((sum, r) => sum + r.temperature, 0) / (allRuntimes.length || 1)
  const avgHumidity = allRuntimes.reduce((sum, r) => sum + r.humidity, 0) / (allRuntimes.length || 1)
  return {
    cinemaCount: cinemas.length,
    sensorCount: sensors.length,
    sensorsOnline: online.length,
    sensorsOffline: offline.length,
    sensorsAlert: alert.length,
    avgTemperature: Math.round(avgTemperature * 10) / 10,
    avgHumidity: Math.round(avgHumidity * 10) / 10,
  }
}

// ---------------------------------------------------------------------------
// Measurements / historial
// ---------------------------------------------------------------------------

export function getSensorMeasurements(sensorId: string, fromMs: number, toMs: number, nowMs = Date.now()): Measurement[] {
  const sensor = getSensor(sensorId)
  if (!sensor) return []
  const step = pickStepMs(fromMs, toMs)
  return generateSeries(sensorId, sensor.profileId, fromMs, toMs, step, nowMs)
}

export interface MeasurementRow extends Measurement {
  cinemaId: string
  cinemaName: string
  roomId: string
  roomName: string
  sensorName: string
  status: SensorStatus
}

export function listMeasurementRows(params: {
  cinemaId?: string
  roomId?: string
  sensorId?: string
  fromMs: number
  toMs: number
  nowMs?: number
}): MeasurementRow[] {
  const nowMs = params.nowMs ?? Date.now()
  let targetSensors = sensors
  if (params.sensorId) targetSensors = targetSensors.filter((s) => s.id === params.sensorId)
  else if (params.roomId) targetSensors = targetSensors.filter((s) => s.roomId === params.roomId)
  else if (params.cinemaId) targetSensors = getSensorsByCinema(params.cinemaId)

  const rowsOut: MeasurementRow[] = []
  for (const sensor of targetSensors) {
    const room = getRoom(sensor.roomId)
    const cinema = room ? getCinema(room.cinemaId) : undefined
    if (!room || !cinema) continue
    const step = pickStepMs(params.fromMs, params.toMs)
    const series = generateSeries(sensor.id, sensor.profileId, params.fromMs, params.toMs, step, nowMs)
    const profile = getProfile(sensor.profileId)
    for (const m of series) {
      let status: SensorStatus = "online"
      if (m.temperature > profile.temperatureMax || m.temperature < profile.temperatureMin) status = "alert"
      else if (m.humidity > profile.humidityMax || m.humidity < profile.humidityMin) status = "alert"
      rowsOut.push({
        ...m,
        cinemaId: cinema.id,
        cinemaName: cinema.name,
        roomId: room.id,
        roomName: room.name,
        sensorName: sensor.name,
        status,
      })
    }
  }
  return rowsOut.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

// ---------------------------------------------------------------------------
// Alerts — a single active alert per sensor while the condition persists.
// ---------------------------------------------------------------------------

const alertTypeLabels: Record<AlertType, string> = {
  temperature_high: "Temperatura por encima del máximo",
  temperature_low: "Temperatura por debajo del mínimo",
  humidity_high: "Humedad por encima del máximo",
  humidity_low: "Humedad por debajo del mínimo",
}

export function alertTypeLabel(type: AlertType) {
  return alertTypeLabels[type]
}

// Resolved alerts kept around so the Alertas/Reportes screens have some
// history to show beyond whatever is active right now.
const resolvedAlertSeed: Alert[] = [
  {
    id: "alert-seed-1",
    sensorId: "cine-abasto-sala-2-sensor",
    type: "temperature_high",
    temperature: 27.1,
    humidity: 63,
    createdAt: daysAgoIso(6, 9, 40),
    resolvedAt: daysAgoIso(6, 11, 5),
    active: false,
  },
  {
    id: "alert-seed-2",
    sensorId: "cine-palermo-sala-4-sensor",
    type: "temperature_low",
    temperature: 21.2,
    humidity: 46,
    createdAt: daysAgoIso(12, 3, 15),
    resolvedAt: daysAgoIso(12, 4, 2),
    active: false,
  },
  {
    id: "alert-seed-3",
    sensorId: "cine-unicenter-sala-3-sensor",
    type: "humidity_high",
    temperature: 24.4,
    humidity: 71.2,
    createdAt: daysAgoIso(20, 14, 0),
    resolvedAt: daysAgoIso(20, 15, 40),
    active: false,
  },
]

function daysAgoIso(days: number, hour: number, minute: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

export function listAlerts(nowMs = Date.now()): Alert[] {
  const active: Alert[] = []
  for (const sensor of sensors) {
    const runtime = getSensorRuntime(sensor, nowMs)
    if (runtime.activeAlertType) {
      active.push({
        id: `alert-active-${sensor.id}`,
        sensorId: sensor.id,
        type: runtime.activeAlertType,
        temperature: runtime.temperature,
        humidity: runtime.humidity,
        createdAt: new Date(nowMs - 3 * 60 * 60 * 1000 * 0.85).toISOString(),
        resolvedAt: null,
        active: true,
      })
    }
  }
  return [...active, ...resolvedAlertSeed].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getAlert(alertId: string, nowMs = Date.now()): Alert | undefined {
  return listAlerts(nowMs).find((a) => a.id === alertId)
}

// ---------------------------------------------------------------------------
// Incidents — simple in-memory mutable log.
// ---------------------------------------------------------------------------

let incidentSeq = 124
const incidents: Incident[] = [
  {
    id: "124",
    alertId: "alert-seed-1",
    cinemaId: "cine-abasto",
    roomId: "cine-abasto-sala-2",
    sensorId: "cine-abasto-sala-2-sensor",
    title: "Sala 2 - Temperatura elevada",
    description: "Se revisó el sistema de climatización. Filtro obstruido, reemplazado.",
    status: "resolved",
    createdAt: daysAgoIso(6, 9, 45),
    resolvedAt: daysAgoIso(6, 11, 10),
  },
  {
    id: "123",
    alertId: "alert-seed-2",
    cinemaId: "cine-palermo",
    roomId: "cine-palermo-sala-4",
    sensorId: "cine-palermo-sala-4-sensor",
    title: "Sala 4 - Temperatura baja",
    description: "Aire acondicionado configurado por debajo del rango permitido. Ajustado el termostato.",
    status: "resolved",
    createdAt: daysAgoIso(12, 3, 20),
    resolvedAt: daysAgoIso(12, 4, 10),
  },
]

export function listIncidents(): Incident[] {
  return [...incidents].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getIncident(id: string): Incident | undefined {
  return incidents.find((i) => i.id === id)
}

export function createIncident(input: {
  title: string
  description: string
  sensorId: string
  alertId?: string | null
}): Incident {
  const sensor = getSensor(input.sensorId)
  const room = sensor ? getRoom(sensor.roomId) : undefined
  const cinema = room ? getCinema(room.cinemaId) : undefined
  incidentSeq += 1
  const incident: Incident = {
    id: String(incidentSeq),
    alertId: input.alertId ?? null,
    cinemaId: cinema?.id ?? "",
    roomId: room?.id ?? "",
    sensorId: input.sensorId,
    title: input.title,
    description: input.description,
    status: "open",
    createdAt: new Date().toISOString(),
    resolvedAt: null,
  }
  incidents.unshift(incident)
  return incident
}

export function updateIncidentStatus(id: string, status: IncidentStatus): Incident | undefined {
  const incident = incidents.find((i) => i.id === id)
  if (!incident) return undefined
  incident.status = status
  incident.resolvedAt = status === "resolved" ? new Date().toISOString() : null
  return incident
}

// ---------------------------------------------------------------------------
// Profiles — editable in-memory list.
// ---------------------------------------------------------------------------

export function listProfiles(): Profile[] {
  return profiles
}

export function updateProfile(id: string, patch: Partial<Omit<Profile, "id">>): Profile | undefined {
  const profile = profiles.find((p) => p.id === id)
  if (!profile) return undefined
  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) (profile as Record<string, unknown>)[key] = value
  }
  return profile
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

export interface ReportResult {
  temperatureMin: number | null
  temperatureMax: number | null
  temperatureAvg: number | null
  humidityMin: number | null
  humidityMax: number | null
  humidityAvg: number | null
  alertCount: number
  offlineMinutes: number
  incidentCount: number
  sampleCount: number
}

export function buildReport(params: {
  cinemaId?: string
  roomId?: string
  sensorId?: string
  fromMs: number
  toMs: number
  nowMs?: number
}): ReportResult {
  const rowsData = listMeasurementRows(params)
  const temps = rowsData.map((r) => r.temperature)
  const hums = rowsData.map((r) => r.humidity)
  const alertCount = rowsData.filter((r) => r.status === "alert").length

  let targetSensorIds = sensors.map((s) => s.id)
  if (params.sensorId) targetSensorIds = [params.sensorId]
  else if (params.roomId) targetSensorIds = getSensorsByRoom(params.roomId).map((s) => s.id)
  else if (params.cinemaId) targetSensorIds = getSensorsByCinema(params.cinemaId).map((s) => s.id)

  const relevantIncidents = listIncidents().filter(
    (inc) =>
      targetSensorIds.includes(inc.sensorId) &&
      new Date(inc.createdAt).getTime() >= params.fromMs &&
      new Date(inc.createdAt).getTime() <= params.toMs,
  )

  const nowMs = params.nowMs ?? Date.now()
  const offlineMinutes = targetSensorIds.reduce((sum, id) => {
    const sensor = getSensor(id)
    if (!sensor) return sum
    const runtime = getSensorRuntime(sensor, nowMs)
    if (runtime.status !== "offline") return sum
    const lastSeenMs = new Date(runtime.lastSeen).getTime()
    return sum + (nowMs - lastSeenMs) / 60000
  }, 0)

  const avg = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : null)

  return {
    temperatureMin: temps.length ? Math.min(...temps) : null,
    temperatureMax: temps.length ? Math.max(...temps) : null,
    temperatureAvg: avg(temps),
    humidityMin: hums.length ? Math.min(...hums) : null,
    humidityMax: hums.length ? Math.max(...hums) : null,
    humidityAvg: avg(hums),
    alertCount,
    offlineMinutes: Math.round(offlineMinutes),
    incidentCount: relevantIncidents.length,
    sampleCount: rowsData.length,
  }
}

export { cinemas, rooms, sensors, profiles }
