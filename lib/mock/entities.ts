import type { Cinema, Profile, Room, RoomType, Sensor } from "@/lib/types"
import { seededRange } from "./seed"

// ---------------------------------------------------------------------------
// Profiles (operating profiles / rangos normales)
// ---------------------------------------------------------------------------

export const profiles: Profile[] = [
  {
    id: "profile-sala",
    name: "Sala de Cine",
    description: "Salas de proyección para el público",
    temperatureMin: 22,
    temperatureMax: 26,
    humidityMin: 40,
    humidityMax: 65,
  },
  {
    id: "profile-proyeccion",
    name: "Proyección",
    description: "Cabina de proyección y racks de equipos",
    temperatureMin: 20,
    temperatureMax: 25,
    humidityMin: 35,
    humidityMax: 60,
  },
  {
    id: "profile-lobby",
    name: "Lobby / Área Pública",
    description: "Halls, boletería y confitería",
    temperatureMin: 20,
    temperatureMax: 28,
    humidityMin: 30,
    humidityMax: 70,
  },
  {
    id: "profile-deposito",
    name: "Depósito",
    description: "Depósitos y áreas técnicas",
    temperatureMin: 15,
    temperatureMax: 30,
    humidityMin: 20,
    humidityMax: 80,
  },
]

export function getProfile(id: string): Profile {
  const profile = profiles.find((p) => p.id === id)
  if (!profile) throw new Error(`Profile not found: ${id}`)
  return profile
}

// ---------------------------------------------------------------------------
// Cinemas
// ---------------------------------------------------------------------------

export const cinemas: Cinema[] = [
  { id: "cine-palermo", name: "Cine Palermo", address: "Av. Santa Fe 3253, CABA" },
  { id: "cine-abasto", name: "Cine Abasto", address: "Av. Corrientes 3247, CABA" },
  { id: "cine-unicenter", name: "Cine Unicenter", address: "Paraná 3745, Martínez" },
]

export function getCinema(id: string): Cinema | undefined {
  return cinemas.find((c) => c.id === id)
}

// ---------------------------------------------------------------------------
// Rooms
// ---------------------------------------------------------------------------

interface RoomBlueprint {
  cinemaId: string
  salaCount: number
  hasLobby: boolean
  hasDeposito: boolean
}

const roomBlueprints: RoomBlueprint[] = [
  { cinemaId: "cine-palermo", salaCount: 8, hasLobby: true, hasDeposito: false },
  { cinemaId: "cine-abasto", salaCount: 9, hasLobby: true, hasDeposito: false },
  { cinemaId: "cine-unicenter", salaCount: 7, hasLobby: true, hasDeposito: true },
]

function buildRooms(): Room[] {
  const rooms: Room[] = []
  for (const bp of roomBlueprints) {
    rooms.push({
      id: `${bp.cinemaId}-proyeccion`,
      cinemaId: bp.cinemaId,
      name: "Proyección",
      type: "projection" as RoomType,
      profileId: "profile-proyeccion",
    })
    for (let i = 1; i <= bp.salaCount; i++) {
      rooms.push({
        id: `${bp.cinemaId}-sala-${i}`,
        cinemaId: bp.cinemaId,
        name: `Sala ${i}`,
        type: "hall" as RoomType,
        profileId: "profile-sala",
      })
    }
    if (bp.hasLobby) {
      rooms.push({
        id: `${bp.cinemaId}-lobby`,
        cinemaId: bp.cinemaId,
        name: "Lobby",
        type: "lobby" as RoomType,
        profileId: "profile-lobby",
      })
    }
    if (bp.hasDeposito) {
      rooms.push({
        id: `${bp.cinemaId}-deposito`,
        cinemaId: bp.cinemaId,
        name: "Depósito",
        type: "storage" as RoomType,
        profileId: "profile-deposito",
      })
    }
  }
  return rooms
}

export const rooms: Room[] = buildRooms()

export function getRoom(id: string): Room | undefined {
  return rooms.find((r) => r.id === id)
}

export function getRoomsByCinema(cinemaId: string): Room[] {
  return rooms.filter((r) => r.cinemaId === cinemaId)
}

// ---------------------------------------------------------------------------
// Sensors
// ---------------------------------------------------------------------------

export type SensorScenario =
  | "normal"
  | "offline"
  | "temp_high"
  | "temp_low"
  | "humidity_high"
  | "low_battery"

// Scenario assignments requested by the product spec, so the V1 always has
// something to look at: one offline sensor, one high-temp alert, one
// low-temp alert, one humidity alert, one low-battery sensor.
const scenarioAssignments: Record<string, SensorScenario> = {
  "cine-palermo-proyeccion-rack": "offline",
  "cine-abasto-sala-2-sensor": "temp_high",
  "cine-palermo-sala-4-sensor": "temp_low",
  "cine-unicenter-sala-3-sensor": "humidity_high",
  "cine-abasto-sala-6-sensor": "low_battery",
}

function devEuiFor(seedInput: string): string {
  const rng = seededRange(seedInput, 0, 1, 99)
  const hex = Math.floor(rng * 0xffffffffffffffff)
    .toString(16)
    .toUpperCase()
    .padStart(16, "0")
    .slice(0, 16)
  return hex
}

function buildSensors(): Sensor[] {
  const sensors: Sensor[] = []
  for (const room of rooms) {
    const isProjection = room.type === "projection"
    const sensorSpecs = isProjection
      ? [
          { suffix: "sensor", label: "Sensor Proyección" },
          { suffix: "rack", label: "Sensor Rack" },
        ]
      : [{ suffix: "sensor", label: `Sensor ${room.name}` }]

    for (const spec of sensorSpecs) {
      const id = `${room.id}-${spec.suffix}`
      const scenario = scenarioAssignments[id] ?? "normal"
      sensors.push({
        id,
        roomId: room.id,
        name: spec.label,
        devEui: devEuiFor(id),
        profileId: room.profileId,
        status: "online",
        battery: Math.round(seededRange(id, 80, 100, 3)),
        temperature: 0,
        humidity: 0,
        lastSeen: new Date().toISOString(),
        reportingIntervalMinutes: 5,
      })
      sensors[sensors.length - 1] = applyScenarioToSensor(sensors[sensors.length - 1], scenario)
    }
  }
  return sensors
}

function applyScenarioToSensor(sensor: Sensor, scenario: SensorScenario): Sensor {
  ;(sensor as Sensor & { scenario: SensorScenario }).scenario = scenario
  return sensor
}

export const sensors: Sensor[] = buildSensors()

export function getSensorScenario(sensorId: string): SensorScenario {
  return scenarioAssignments[sensorId] ?? "normal"
}

export function getSensor(id: string): Sensor | undefined {
  return sensors.find((s) => s.id === id)
}

export function getSensorsByRoom(roomId: string): Sensor[] {
  return sensors.filter((s) => s.roomId === roomId)
}

export function getSensorsByCinema(cinemaId: string): Sensor[] {
  const roomIds = new Set(getRoomsByCinema(cinemaId).map((r) => r.id))
  return sensors.filter((s) => roomIds.has(s.roomId))
}
