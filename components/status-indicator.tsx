import { cn } from "@/lib/utils"
import type { CinemaStatus, SensorStatus } from "@/lib/types"

const cinemaStatusConfig: Record<CinemaStatus, { label: string; dot: string; text: string }> = {
  ok: { label: "Todo OK", dot: "bg-status-ok", text: "text-status-ok" },
  attention: { label: "Requiere atención", dot: "bg-status-attention", text: "text-status-attention" },
  problem: { label: "Problemas detectados", dot: "bg-status-alert", text: "text-status-alert" },
}

export function CinemaStatusIndicator({
  status,
  className,
  showLabel = true,
}: {
  status: CinemaStatus
  className?: string
  showLabel?: boolean
}) {
  const config = cinemaStatusConfig[status]
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm font-medium", config.text, className)}>
      <span className={cn("size-2.5 rounded-full", config.dot)} aria-hidden />
      {showLabel && config.label}
    </span>
  )
}

const sensorStatusConfig: Record<SensorStatus, { label: string; dot: string; text: string }> = {
  online: { label: "Online", dot: "bg-status-ok", text: "text-status-ok" },
  offline: { label: "Sin comunicación", dot: "bg-status-attention", text: "text-status-attention" },
  alert: { label: "Alerta", dot: "bg-status-alert", text: "text-status-alert" },
}

export function SensorStatusIndicator({
  status,
  className,
}: {
  status: SensorStatus
  className?: string
}) {
  const config = sensorStatusConfig[status]
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium", config.text, className)}>
      <span className={cn("size-2 rounded-full", config.dot)} aria-hidden />
      {config.label}
    </span>
  )
}

export function cinemaStatusLabel(status: CinemaStatus) {
  return cinemaStatusConfig[status].label
}

export function sensorStatusLabel(status: SensorStatus) {
  return sensorStatusConfig[status].label
}
