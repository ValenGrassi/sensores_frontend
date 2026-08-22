import type { Measurement, Profile } from "@/lib/types"
import { getProfile, getSensorScenario, type SensorScenario } from "./entities"
import { seededRange } from "./seed"

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR
const INSTALL_WINDOW_DAYS = 200
const ALERT_WINDOW_MS = 3 * HOUR

// The "offline" demo sensor also had a longer silent stretch a few days back
// (in addition to its current outage), so historical charts show a real gap
// in reporting instead of a continuous line across missing days.
const HISTORICAL_OUTAGE_START_DAYS_AGO = 11
const HISTORICAL_OUTAGE_END_DAYS_AGO = 2

function isInHistoricalOutage(scenario: SensorScenario, tMs: number, nowMs: number) {
  if (scenario !== "offline") return false
  return (
    tMs >= nowMs - HISTORICAL_OUTAGE_START_DAYS_AGO * DAY && tMs <= nowMs - HISTORICAL_OUTAGE_END_DAYS_AGO * DAY
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * clamp(t, 0, 1)
}

/** Smooth per-sensor offset so sensors in the same room don't read identically. */
function sensorOffset(sensorId: string, salt: number) {
  return seededRange(sensorId, -0.8, 0.8, salt)
}

function baselineTemperature(sensorId: string, profile: Profile, tMs: number) {
  const mid = (profile.temperatureMin + profile.temperatureMax) / 2
  const amplitude = (profile.temperatureMax - profile.temperatureMin) * 0.32
  const hourOfDay = new Date(tMs).getHours() + new Date(tMs).getMinutes() / 60
  const daily = Math.sin(((hourOfDay - 9) / 24) * Math.PI * 2) * amplitude * 0.55
  const bucket = Math.floor(tMs / (10 * 60 * 1000))
  const jitter = seededRange(sensorId, -0.5, 0.5, bucket)
  return mid + daily + jitter + sensorOffset(sensorId, 1)
}

function baselineHumidity(sensorId: string, profile: Profile, tMs: number) {
  const mid = (profile.humidityMin + profile.humidityMax) / 2
  const amplitude = (profile.humidityMax - profile.humidityMin) * 0.3
  const hourOfDay = new Date(tMs).getHours() + new Date(tMs).getMinutes() / 60
  const daily = Math.sin(((hourOfDay - 15) / 24) * Math.PI * 2) * amplitude * 0.5
  const bucket = Math.floor(tMs / (10 * 60 * 1000))
  const jitter = seededRange(sensorId, -1.2, 1.2, bucket)
  return mid + daily + jitter + sensorOffset(sensorId, 2) * 2
}

function applyScenarioAdjustment(
  scenario: SensorScenario,
  profile: Profile,
  temperature: number,
  humidity: number,
  tMs: number,
  nowMs: number,
) {
  const windowStart = nowMs - ALERT_WINDOW_MS
  const factor = clamp((tMs - windowStart) / ALERT_WINDOW_MS, 0, 1)
  if (factor <= 0) return { temperature, humidity }

  switch (scenario) {
    case "temp_high":
      return { temperature: lerp(temperature, profile.temperatureMax + 2.4, factor), humidity }
    case "temp_low":
      return { temperature: lerp(temperature, profile.temperatureMin - 2.1, factor), humidity }
    case "humidity_high":
      return { temperature, humidity: lerp(humidity, profile.humidityMax + 6, factor) }
    default:
      return { temperature, humidity }
  }
}

function batteryAt(sensorId: string, scenario: SensorScenario, tMs: number, nowMs: number) {
  const target = scenario === "low_battery" ? 12 : Math.round(seededRange(sensorId, 80, 97, 3))
  const daysAgo = (nowMs - tMs) / DAY
  const fractionElapsed = clamp(1 - daysAgo / INSTALL_WINDOW_DAYS, 0, 1)
  const bucket = Math.floor(tMs / DAY)
  const noise = seededRange(sensorId, -0.6, 0.6, bucket)
  const value = 100 - fractionElapsed * (100 - target) + noise
  return clamp(Math.round(value * 10) / 10, 1, 100)
}

export interface ComputedReading {
  temperature: number
  humidity: number
  battery: number
}

export function computeReadingAt(sensorId: string, profileId: string, tMs: number, nowMs: number): ComputedReading {
  const profile = getProfile(profileId)
  const scenario = getSensorScenario(sensorId)
  let temperature = baselineTemperature(sensorId, profile, tMs)
  let humidity = baselineHumidity(sensorId, profile, tMs)
  const adjusted = applyScenarioAdjustment(scenario, profile, temperature, humidity, tMs, nowMs)
  temperature = adjusted.temperature
  humidity = adjusted.humidity
  const battery = batteryAt(sensorId, scenario, tMs, nowMs)
  return {
    temperature: Math.round(temperature * 10) / 10,
    humidity: Math.round(clamp(humidity, 5, 95) * 10) / 10,
    battery,
  }
}

/** Effective last-communication timestamp for a sensor, in ms since epoch. */
export function lastSeenMsFor(sensorId: string, nowMs: number): number {
  const scenario = getSensorScenario(sensorId)
  if (scenario === "offline") return nowMs - 37 * 60 * 1000
  return nowMs - seededRange(sensorId, 10, 240, 7) * 1000
}

export function generateSeries(
  sensorId: string,
  profileId: string,
  fromMs: number,
  toMs: number,
  stepMs: number,
  nowMs: number,
): Measurement[] {
  const scenario = getSensorScenario(sensorId)
  const lastSeen = lastSeenMsFor(sensorId, nowMs)
  const clippedTo = Math.min(toMs, lastSeen)
  const points: Measurement[] = []
  if (fromMs > clippedTo) return points
  const maxPoints = 2000
  const totalSteps = Math.floor((clippedTo - fromMs) / stepMs) + 1
  const effectiveStep = totalSteps > maxPoints ? Math.ceil(((clippedTo - fromMs) / maxPoints)) : stepMs
  for (let t = fromMs; t <= clippedTo; t += effectiveStep) {
    if (isInHistoricalOutage(scenario, t, nowMs)) continue
    const reading = computeReadingAt(sensorId, profileId, t, nowMs)
    points.push({
      id: `${sensorId}-${t}`,
      sensorId,
      timestamp: new Date(t).toISOString(),
      temperature: reading.temperature,
      humidity: reading.humidity,
      battery: reading.battery,
    })
  }
  return points
}

export function pickStepMs(fromMs: number, toMs: number): number {
  const rangeMs = toMs - fromMs
  if (rangeMs <= DAY * 1.5) return 5 * 60 * 1000 // 5 min
  if (rangeMs <= DAY * 9) return 30 * 60 * 1000 // 30 min
  if (rangeMs <= DAY * 35) return 2 * HOUR
  if (rangeMs <= DAY * 100) return 8 * HOUR
  if (rangeMs <= DAY * 200) return 16 * HOUR
  return DAY
}
