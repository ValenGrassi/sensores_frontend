// Formato de lecturas que pueden faltar (null = el sensor no informó el dato).

export function formatTemperature(value: number | null | undefined): string {
  return typeof value === "number" ? `${value.toFixed(1)}°C` : "—"
}

export function formatHumidity(value: number | null | undefined): string {
  return typeof value === "number" ? `${value.toFixed(0)}%` : "—"
}

export function formatBattery(value: number | null | undefined): string {
  return typeof value === "number" ? `${value}%` : "—"
}

// Un sensor recién registrado puede no tener nombre, sala ni lecturas todavía.

/** Nombre a mostrar: el del sensor o, si no tiene, su devEUI. */
export function sensorLabel(sensor: { name: string | null; devEui: string }): string {
  return sensor.name || sensor.devEui
}

/** "Cine · Sala", o "Sin sala asignada". */
export function sensorPlace(sensor: { cinema: { name: string } | null; room: { name: string } | null }): string {
  return sensor.cinema && sensor.room ? `${sensor.cinema.name} · ${sensor.room.name}` : "Sin sala asignada"
}

/** true si el valor está fuera del rango [min, max]; false si falta el valor o el rango. */
export function isOutOfRange(value: number | null | undefined, min?: number, max?: number): boolean {
  if (typeof value !== "number" || min === undefined || max === undefined) return false
  return value < min || value > max
}
