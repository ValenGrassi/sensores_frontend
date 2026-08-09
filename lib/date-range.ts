import type { DateRangePreset } from "@/lib/types"

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

export const DATE_RANGE_PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: "24h", label: "Últimas 24 horas" },
  { value: "7d", label: "Últimos 7 días" },
  { value: "30d", label: "Últimos 30 días" },
  { value: "3m", label: "Últimos 3 meses" },
  { value: "6m", label: "Últimos 6 meses" },
  { value: "all", label: "Desde siempre" },
  { value: "custom", label: "Rango personalizado" },
]

export const HISTORY_WINDOW_DAYS = 190

export function resolveDateRange(
  preset: DateRangePreset,
  customFrom?: string | null,
  customTo?: string | null,
  now: number = Date.now(),
): { fromMs: number; toMs: number } {
  if (preset === "custom" && customFrom && customTo) {
    return { fromMs: new Date(customFrom).getTime(), toMs: new Date(customTo).getTime() }
  }
  switch (preset) {
    case "24h":
      return { fromMs: now - DAY, toMs: now }
    case "7d":
      return { fromMs: now - 7 * DAY, toMs: now }
    case "30d":
      return { fromMs: now - 30 * DAY, toMs: now }
    case "3m":
      return { fromMs: now - 91 * DAY, toMs: now }
    case "6m":
      return { fromMs: now - 182 * DAY, toMs: now }
    case "all":
      return { fromMs: now - HISTORY_WINDOW_DAYS * DAY, toMs: now }
    default:
      return { fromMs: now - DAY, toMs: now }
  }
}
