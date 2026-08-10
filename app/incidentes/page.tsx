"use client"

import * as React from "react"
import { useSWRConfig } from "swr"
import Link from "next/link"
import { ClipboardList, RotateCcw, CheckCircle2 } from "lucide-react"
import { useIncidents, useSensors } from "@/lib/hooks"
import { api } from "@/lib/api"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { IncidentStatus } from "@/lib/types"

export default function IncidentesPage() {
  const [tab, setTab] = React.useState<"all" | IncidentStatus>("all")
  const { data: incidents, isLoading } = useIncidents()
  const { data: sensors } = useSensors()
  const { mutate } = useSWRConfig()
  const [updatingId, setUpdatingId] = React.useState<string | null>(null)

  const sensorMap = React.useMemo(() => new Map(sensors?.map((s) => [s.id, s])), [sensors])

  const rows = incidents?.filter((i) => (tab === "all" ? true : i.status === tab))

  async function toggleStatus(id: string, current: IncidentStatus) {
    setUpdatingId(id)
    try {
      await api.updateIncidentStatus(id, current === "open" ? "resolved" : "open")
      await mutate("/api/incidents")
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Incidentes</h1>
        <p className="text-sm text-muted-foreground">
          Seguimiento de intervenciones técnicas originadas por alertas de temperatura y humedad.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | IncidentStatus)}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="open">Abiertos</TabsTrigger>
          <TabsTrigger value="resolved">Resueltos</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : rows && rows.length > 0 ? (
        <div className="flex flex-col gap-3">
          {rows.map((incident) => {
            const sensor = sensorMap.get(incident.sensorId)
            return (
              <div key={incident.id} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{incident.title}</span>
                      {incident.status === "open" ? (
                        <Badge variant="destructive">Abierto</Badge>
                      ) : (
                        <Badge variant="outline">Resuelto</Badge>
                      )}
                    </div>
                    {sensor && (
                      <Link
                        href={`/sensores/${sensor.id}`}
                        className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                      >
                        {sensor.cinema.name} · {sensor.room.name}
                      </Link>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updatingId === incident.id}
                    onClick={() => toggleStatus(incident.id, incident.status)}
                  >
                    {incident.status === "open" ? (
                      <>
                        <CheckCircle2 />
                        Marcar resuelto
                      </>
                    ) : (
                      <>
                        <RotateCcw />
                        Reabrir
                      </>
                    )}
                  </Button>
                </div>

                {incident.description && <p className="text-sm text-muted-foreground">{incident.description}</p>}

                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>Creado {format(new Date(incident.createdAt), "d MMM yyyy, HH:mm", { locale: es })}</span>
                  {incident.resolvedAt && (
                    <span>Resuelto {format(new Date(incident.resolvedAt), "d MMM yyyy, HH:mm", { locale: es })}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardList />
            </EmptyMedia>
            <EmptyTitle>Sin incidentes</EmptyTitle>
            <EmptyDescription>No hay incidentes registrados para este filtro.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  )
}
