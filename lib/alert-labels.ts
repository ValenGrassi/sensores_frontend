import type { AlertType } from "@/lib/types"

export const alertTypeLabels: Record<AlertType, string> = {
  temperature_high: "Temperatura alta",
  temperature_low: "Temperatura baja",
  humidity_high: "Humedad alta",
  humidity_low: "Humedad baja",
}

export function alertTypeLabel(type: AlertType) {
  return alertTypeLabels[type] ?? type
}
