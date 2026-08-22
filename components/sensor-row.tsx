import Link from "next/link"
import { ChevronRight, Thermometer, Droplets, BatteryIcon } from "lucide-react"
import type { SensorWithContext } from "@/lib/types"
import { SensorStatusIndicator } from "@/components/status-indicator"
import { BatteryIndicator } from "@/components/battery-indicator"
import { cn } from "@/lib/utils"

export function SensorRow({ sensor, showContext = false }: { sensor: SensorWithContext; showContext?: boolean }) {
  const outOfRange =
    sensor.temperature < sensor.profile.temperatureMin ||
    sensor.temperature > sensor.profile.temperatureMax ||
    sensor.humidity < sensor.profile.humidityMin ||
    sensor.humidity > sensor.profile.humidityMax

  return (
    <Link
      href={`/sensores/${sensor.devEui}`}
      className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-medium text-foreground">{sensor.name}</span>
        <span className="truncate text-xs text-muted-foreground">
          {showContext
            ? `${sensor.cinema.name} · ${sensor.room.name} · ${sensor.devEui}`
            : sensor.devEui}
        </span>
      </div>

      <div className="hidden items-center gap-4 sm:flex">
      <span
          className={cn(
            "flex items-center gap-1.5 font-mono text-sm tabular-nums",
            outOfRange ? "text-status-alert" : "text-foreground",
          )}
        >
          <BatteryIcon className="size-4 text-muted-foreground" />
          {sensor.battery}%
        </span>
        <span
          className={cn(
            "flex items-center gap-1.5 font-mono text-sm tabular-nums",
            outOfRange ? "text-status-alert" : "text-foreground",
          )}
        >
          <Thermometer className="size-4 text-muted-foreground" />
          {sensor.temperature.toFixed(1)}°C
        </span>
        <span
          className={cn(
            "flex items-center gap-1.5 font-mono text-sm tabular-nums",
            outOfRange ? "text-status-alert" : "text-foreground",
          )}
        >
          <Droplets className="size-4 text-muted-foreground" />
          {sensor.humidity.toFixed(0)}%
        </span>
        {/* <BatteryIndicator percent={sensor.battery} /> */}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <SensorStatusIndicator status={sensor.status} className="hidden md:inline-flex" />
        <ChevronRight className="size-4 text-muted-foreground" />
      </div>
    </Link>
  )
}
