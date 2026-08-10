"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Thermometer, Droplets, Radio, Clock } from "lucide-react"
import { useSensor, useSensorMeasurements } from "@/lib/hooks"
import { SensorStatusIndicator } from "@/components/status-indicator"
import { DateRangeSelect } from "@/components/date-range-select"
import { SensorChart } from "@/components/sensor-chart"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import type { DateRangePreset } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export default function SensorDetailPage() {
  const params = useParams<{ id: string }>()
  const { data: sensor, isLoading } = useSensor(params.id)
  const [preset, setPreset] = React.useState<DateRangePreset>("24h")
  const { data: measurements, isLoading: measurementsLoading } = useSensorMeasurements(params.id, preset)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!sensor) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Radio />
          </EmptyMedia>
          <EmptyTitle>Sensor no encontrado</EmptyTitle>
          <EmptyDescription>No pudimos encontrar el sensor solicitado.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const outOfRangeTemp = sensor.temperature < sensor.profile.temperatureMin || sensor.temperature > sensor.profile.temperatureMax
  const outOfRangeHumidity = sensor.humidity < sensor.profile.humidityMin || sensor.humidity > sensor.profile.humidityMax

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/sensores"
          className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Sensores
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-foreground">{sensor.name}</h1>
            <span className="text-sm text-muted-foreground">
              {sensor.cinema.name} · {sensor.room.name} · {sensor.devEui}
            </span>
          </div>
          <SensorStatusIndicator status={sensor.status} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="gap-2 p-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Thermometer className="size-3.5" />
            Temperatura
          </span>
          <p className={`text-xl font-semibold tabular-nums ${outOfRangeTemp ? "text-status-alert" : "text-foreground"}`}>
            {sensor.temperature.toFixed(1)}°C
          </p>
        </Card>
        <Card className="gap-2 p-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Droplets className="size-3.5" />
            Humedad
          </span>
          <p className={`text-xl font-semibold tabular-nums ${outOfRangeHumidity ? "text-status-alert" : "text-foreground"}`}>
            {sensor.humidity.toFixed(0)}%
          </p>
        </Card>
        <Card className="gap-2 p-4">
          <span className="text-xs text-muted-foreground">Batería</span>
          <p className="text-xl font-semibold tabular-nums text-foreground">{sensor.battery}%</p>
        </Card>
        <Card className="gap-2 p-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5" />
            Último reporte
          </span>
          <p className="text-sm font-medium text-foreground">
            {formatDistanceToNow(new Date(sensor.lastSeen), { addSuffix: true, locale: es })}
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Rango normal del perfil</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-6 text-sm text-muted-foreground">
          <span>
            Perfil: <span className="font-medium text-foreground">{sensor.profile.name}</span>
          </span>
          <span>
            Temperatura:{" "}
            <span className="font-medium text-foreground">
              {sensor.profile.temperatureMin}°C – {sensor.profile.temperatureMax}°C
            </span>
          </span>
          <span>
            Humedad:{" "}
            <span className="font-medium text-foreground">
              {sensor.profile.humidityMin}% – {sensor.profile.humidityMax}%
            </span>
          </span>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground">Historial de mediciones</h2>
        <DateRangeSelect value={preset} onChange={setPreset} />
      </div>

      {measurementsLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : measurements && measurements.length > 0 ? (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Temperatura</CardTitle>
            </CardHeader>
            <CardContent>
              <SensorChart
                measurements={measurements}
                metric="temperature"
                min={sensor.profile.temperatureMin}
                max={sensor.profile.temperatureMax}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Humedad</CardTitle>
            </CardHeader>
            <CardContent>
              <SensorChart
                measurements={measurements}
                metric="humidity"
                min={sensor.profile.humidityMin}
                max={sensor.profile.humidityMax}
              />
            </CardContent>
          </Card>
        </div>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Radio />
            </EmptyMedia>
            <EmptyTitle>Sin mediciones</EmptyTitle>
            <EmptyDescription>No hay mediciones registradas para el rango seleccionado.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  )
}
