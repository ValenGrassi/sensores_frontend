"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, History } from "lucide-react"
import { useMeasurements, useSensors } from "@/lib/hooks"
import { useCinemaFilter } from "@/lib/cinema-filter"
import { DateRangeSelect } from "@/components/date-range-select"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { SensorStatusIndicator } from "@/components/status-indicator"
import type { DateRangePreset } from "@/lib/types"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const PAGE_SIZE = 20

export default function HistorialPage() {
  const { cinemaId } = useCinemaFilter()
  const [preset, setPreset] = React.useState<DateRangePreset>("7d")
  const [sensorId, setSensorId] = React.useState<string>("all")
  const [page, setPage] = React.useState(1)

  const { data: sensors } = useSensors({ cinemaId: cinemaId ?? undefined })

  const { data, isLoading } = useMeasurements({
    cinemaId: cinemaId ?? undefined,
    sensorId: sensorId === "all" ? undefined : sensorId,
    preset,
    page,
    pageSize: PAGE_SIZE,
  })

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1

  React.useEffect(() => {
    setPage(1)
  }, [cinemaId, sensorId, preset])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Historial</h1>
        <p className="text-sm text-muted-foreground">
          Registro detallado de mediciones de temperatura y humedad.
        </p>
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

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : data && data.rows.length > 0 ? (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha y hora</TableHead>
                  <TableHead>Cine</TableHead>
                  <TableHead>Sala</TableHead>
                  <TableHead>Sensor</TableHead>
                  <TableHead className="text-right">Temp.</TableHead>
                  <TableHead className="text-right">Humedad</TableHead>
                  <TableHead className="text-right">Batería</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap font-mono text-xs tabular-nums text-muted-foreground">
                      {format(new Date(row.timestamp), "d MMM yyyy, HH:mm", { locale: es })}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{row.cinemaName}</TableCell>
                    <TableCell className="whitespace-nowrap">{row.roomName}</TableCell>
                    <TableCell className="whitespace-nowrap">{row.sensorName}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.temperature.toFixed(1)}°C</TableCell>
                    <TableCell className="text-right tabular-nums">{row.humidity.toFixed(0)}%</TableCell>
                    <TableCell className="text-right tabular-nums">{row.battery}%</TableCell>
                    <TableCell>
                      <SensorStatusIndicator status={row.status} className="text-xs" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.total)} de {data.total}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft />
              </Button>
              <span className="tabular-nums">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <History />
            </EmptyMedia>
            <EmptyTitle>Sin mediciones</EmptyTitle>
            <EmptyDescription>No hay mediciones registradas para los filtros seleccionados.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  )
}
