"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Thermometer, Droplets } from "lucide-react"
import { useAlerts, useSensors } from "@/lib/hooks"
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2 } from "lucide-react"

const typeIcon = { temperature_high: Thermometer, temperature_low: Thermometer, humidity_high: Droplets, humidity_low: Droplets }
const typeLabel = {
  temperature_high: "Temperatura alta",
  temperature_low: "Temperatura baja",
  humidity_high: "Humedad alta",
  humidity_low: "Humedad baja",
}

export function ActiveAlertsPanel() {
  const { data: alerts, isLoading } = useAlerts(true)
  const { data: sensors } = useSensors()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (!alerts || alerts.length === 0) {
    return (
      <Empty className="border border-dashed border-border py-10">
        <EmptyMedia variant="icon">
          <CheckCircle2 className="text-status-ok" />
        </EmptyMedia>
        <EmptyTitle>Sin alertas activas</EmptyTitle>
        <EmptyDescription>Todos los sensores están dentro de rango.</EmptyDescription>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {alerts.map((alert) => {
        const sensor = sensors?.find((s) => s.id === alert.sensorId)
        const Icon = typeIcon[alert.type]
        return (
          <Link
            key={alert.id}
            href={sensor ? `/sensores/${sensor.devEui}` : "/alertas"}
            className="flex items-center gap-4 rounded-lg border border-status-alert/30 bg-status-alert/5 p-4 transition-colors hover:bg-status-alert/10"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-status-alert/15 text-status-alert">
              <Icon className="size-4.5" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium text-foreground">
                {sensor ? `${sensor.cinema.name} · ${sensor.room.name}` : "Sensor desconocido"}
              </span>
              <span className="truncate text-xs text-muted-foreground">{typeLabel[alert.type]}</span>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <Badge variant="destructive">
                {alert.temperature.toFixed(1)}°C · {alert.humidity.toFixed(0)}%
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true, locale: es })}
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
