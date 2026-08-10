"use client"

import * as React from "react"
import { Search, Radio } from "lucide-react"
import { useSensors } from "@/lib/hooks"
import { useCinemaFilter } from "@/lib/cinema-filter"
import { SensorRow } from "@/components/sensor-row"
import { Skeleton } from "@/components/ui/skeleton"
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import type { SensorStatus } from "@/lib/types"

const statusTabs: { value: "all" | SensorStatus; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "online", label: "Online" },
  { value: "offline", label: "Sin comunicación" },
  { value: "alert", label: "En alerta" },
]

export default function SensoresPage() {
  const { cinemaId } = useCinemaFilter()
  const [status, setStatus] = React.useState<"all" | SensorStatus>("all")
  const [query, setQuery] = React.useState("")

  const { data: sensors, isLoading } = useSensors({
    cinemaId: cinemaId ?? undefined,
    status: status === "all" ? undefined : status,
  })

  const filtered = React.useMemo(() => {
    if (!sensors) return sensors
    if (!query.trim()) return sensors
    const q = query.trim().toLowerCase()
    return sensors.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.devEui.toLowerCase().includes(q) ||
        s.cinema.name.toLowerCase().includes(q) ||
        s.room.name.toLowerCase().includes(q),
    )
  }, [sensors, query])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Sensores</h1>
        <p className="text-sm text-muted-foreground">
          Todos los sensores LoRaWAN de temperatura y humedad de la cadena.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={status} onValueChange={(v) => setStatus(v as "all" | SensorStatus)}>
          <TabsList>
            {statusTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <InputGroup className="sm:w-64">
          <InputGroupInput
            placeholder="Buscar sensor, sala o cine..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="flex flex-col gap-2">
          {filtered.map((sensor) => (
            <SensorRow key={sensor.id} sensor={sensor} showContext />
          ))}
        </div>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Radio />
            </EmptyMedia>
            <EmptyTitle>Sin resultados</EmptyTitle>
            <EmptyDescription>No se encontraron sensores con los filtros seleccionados.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  )
}
