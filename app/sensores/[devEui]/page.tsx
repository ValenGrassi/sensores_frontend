"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Thermometer, Droplets, Radio, Clock } from "lucide-react"
import { useAccess, useSensor, useSensorMeasurements } from "@/lib/hooks"
import { SensorStatusIndicator } from "@/components/status-indicator"
import { DateRangeSelect } from "@/components/date-range-select"
import { SensorChart } from "@/components/sensor-chart"
import { EditSensorDialog } from "@/components/edit-sensor-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import type { DateRangePreset, Measurement } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { formatBattery, formatHumidity, formatTemperature, isOutOfRange, sensorLabel, sensorPlace } from "@/lib/format"

export default function SensorDetailPage() {
  const params = useParams<{ devEui: string }>()
  const { data: sensor, isLoading } = useSensor(params.devEui)
  const { can } = useAccess()
  const [preset, setPreset] = React.useState<DateRangePreset>("24h")
  const { data: measurements, isLoading: measurementsLoading } = useSensorMeasurements(params.devEui, preset)
  const resolutionLabel = describeResolution(measurements)

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

  const profile = sensor.profile
  const outOfRangeTemp = isOutOfRange(sensor.temperature, profile?.temperatureMin, profile?.temperatureMax)
  const outOfRangeHumidity = isOutOfRange(sensor.humidity, profile?.humidityMin, profile?.humidityMax)

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
            <h1 className="text-2xl font-semibold text-foreground">{sensorLabel(sensor)}</h1>
            <span className="text-sm text-muted-foreground">
              {sensorPlace(sensor)} · {sensor.devEui}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <SensorStatusIndicator status={sensor.status} />
            {can("sensors:write") && <EditSensorDialog sensor={sensor} />}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="gap-2 p-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Thermometer className="size-3.5" />
            Temperatura
          </span>
          <p className={`text-xl font-semibold tabular-nums ${outOfRangeTemp ? "text-status-alert" : "text-foreground"}`}>
            {formatTemperature(sensor.temperature)}
          </p>
        </Card>
        <Card className="gap-2 p-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Droplets className="size-3.5" />
            Humedad
          </span>
          <p className={`text-xl font-semibold tabular-nums ${outOfRangeHumidity ? "text-status-alert" : "text-foreground"}`}>
            {formatHumidity(sensor.humidity)}
          </p>
        </Card>
        <Card className="gap-2 p-4">
          <span className="text-xs text-muted-foreground">Batería</span>
          <p className="text-xl font-semibold tabular-nums text-foreground">{formatBattery(sensor.battery)}</p>
        </Card>
        <Card className="gap-2 p-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5" />
            Último reporte
          </span>
          <p className="text-sm font-medium text-foreground">
            {sensor.lastSeen
              ? formatDistanceToNow(new Date(sensor.lastSeen), { addSuffix: true, locale: es })
              : "Todavía no reportó"}
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Rango normal del perfil</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-6 text-sm text-muted-foreground">
          {profile ? (
            <>
              <span>
                Perfil: <span className="font-medium text-foreground">{profile.name}</span>
              </span>
              <span>
                Temperatura:{" "}
                <span className="font-medium text-foreground">
                  {profile.temperatureMin}°C – {profile.temperatureMax}°C
                </span>
              </span>
              <span>
                Humedad:{" "}
                <span className="font-medium text-foreground">
                  {profile.humidityMin}% – {profile.humidityMax}%
                </span>
              </span>
            </>
          ) : (
            <span>Sin sala asignada: no se monitorea. Asignale una sala con Configurar (necesita tu clave de administrador).</span>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-sm font-medium text-foreground">Historial de mediciones</h2>
          {resolutionLabel && <span className="text-xs text-muted-foreground">{resolutionLabel}</span>}
        </div>
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
                min={profile?.temperatureMin}
                max={profile?.temperatureMax}
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
                min={profile?.humidityMin}
                max={profile?.humidityMax}
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

/** En rangos largos el backend devuelve promedios: se aclara debajo del título. */
function describeResolution(measurements: Measurement[] | undefined): string | null {
  if (!measurements || measurements.length === 0 || measurements[0].samples === undefined) return null
  if (measurements.length < 2) return "Promedios"
  const stepMs = new Date(measurements[1].timestamp).getTime() - new Date(measurements[0].timestamp).getTime()
  return stepMs >= 20 * 60 * 60 * 1000 ? "Promedio por día" : "Promedio por hora"
}
