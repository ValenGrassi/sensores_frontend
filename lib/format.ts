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
