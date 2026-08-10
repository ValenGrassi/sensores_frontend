"use client"

import * as React from "react"
import { Download, FileBarChart, Thermometer, Droplets, TriangleAlert, WifiOff, ClipboardList } from "lucide-react"
import { useCinemaFilter } from "@/lib/cinema-filter"
import { useSensors, useReport } from "@/lib/hooks"
import { DateRangeSelect } from "@/components/date-range-select"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { DateRangePreset } from "@/lib/types"

function StatCard({
  label,
  value,
  unit,
  icon: Icon,
}: {
  label: string
  value: string
  unit?: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-5">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-mono text-xl font-semibold tabular-nums leading-tight">
          {value}
          {unit && <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>}
        </p>
      </div>
    </div>
  )
}

export default function ReportesPage() {
  const { cinemaId } = useCinemaFilter()
  const [preset, setPreset] = React.useState<DateRangePreset>("30d")
  const [sensorId, setSensorId] = React.useState<string>("all")

  const { data: sensors } = useSensors({ cinemaId: cinemaId ?? undefined })
  const { data: report, isLoading } = useReport({
    cinemaId: cinemaId ?? undefined,
    sensorId: sensorId === "all" ? undefined : sensorId,
    preset,
  })

  function handleExport() {
    if (!report) return
    const rows = [
      ["Métrica", "Valor"],
      ["Temperatura mínima (°C)", report.temperatureMin ?? ""],
      ["Temperatura máxima (°C)", report.temperatureMax ?? ""],
      ["Temperatura promedio (°C)", report.temperatureAvg?.toFixed(1) ?? ""],
      ["Humedad mínima (%)", report.humidityMin ?? ""],
      ["Humedad máxima (%)", report.humidityMax ?? ""],
      ["Humedad promedio (%)", report.humidityAvg?.toFixed(1) ?? ""],
      ["Alertas", report.alertCount],
      ["Incidentes", report.incidentCount],
      ["Minutos sin comunicación", Math.round(report.offlineMinutes)],
      ["Mediciones analizadas", report.sampleCount],
    ]
    const csv = rows.map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `reporte-${preset}-${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Reportes</h1>
          <p className="text-sm text-muted-foreground">
            Resumen de temperatura, humedad, alertas e incidentes por período.
          </p>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={!report}>
          <Download />
          Exportar CSV
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={sensorId} onValueChange={setSensorId}>
          <SelectTrigger className="w-56" size="sm">
            <SelectValue>
              {sensorId === "all" ? "Todos los sensores" : sensors?.find((s) => s.id === sensorId)?.name}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Todos los sensores</SelectItem>
              {sensors?.map((sensor) => (
                <SelectItem key={sensor.id} value={sensor.id}>
                  {sensor.name} · {sensor.cinema.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <DateRangeSelect value={preset} onChange={setPreset} />
      </div>

      {isLoading || !report ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Temperatura mínima"
            value={report.temperatureMin != null ? report.temperatureMin.toFixed(1) : "—"}
            unit="°C"
            icon={Thermometer}
          />
          <StatCard
            label="Temperatura máxima"
            value={report.temperatureMax != null ? report.temperatureMax.toFixed(1) : "—"}
            unit="°C"
            icon={Thermometer}
          />
          <StatCard
            label="Temperatura promedio"
            value={report.temperatureAvg != null ? report.temperatureAvg.toFixed(1) : "—"}
            unit="°C"
            icon={Thermometer}
          />
          <StatCard
            label="Mediciones analizadas"
            value={String(report.sampleCount)}
            icon={FileBarChart}
          />
          <StatCard
            label="Humedad mínima"
            value={report.humidityMin != null ? report.humidityMin.toFixed(0) : "—"}
            unit="%"
            icon={Droplets}
          />
          <StatCard
            label="Humedad máxima"
            value={report.humidityMax != null ? report.humidityMax.toFixed(0) : "—"}
            unit="%"
            icon={Droplets}
          />
          <StatCard
            label="Humedad promedio"
            value={report.humidityAvg != null ? report.humidityAvg.toFixed(0) : "—"}
            unit="%"
            icon={Droplets}
          />
          <StatCard label="Alertas en el período" value={String(report.alertCount)} icon={TriangleAlert} />
          <StatCard label="Incidentes en el período" value={String(report.incidentCount)} icon={ClipboardList} />
          <StatCard
            label="Tiempo sin comunicación"
            value={String(Math.round(report.offlineMinutes))}
            unit="min"
            icon={WifiOff}
          />
        </div>
      )}
    </div>
  )
}
