"use client"

import * as React from "react"
import Link from "next/link"
import { AlertTriangle, Thermometer, Droplets, CheckCircle2 } from "lucide-react"
import { useAlerts, useSensors, useIncidents } from "@/lib/hooks"
import { alertTypeLabel } from "@/lib/alert-labels"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { CreateIncidentDialog } from "@/components/create-incident-dialog"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

export default function AlertasPage() {
  const [tab, setTab] = React.useState<"active" | "history">("active")
  const { data: alerts, isLoading } = useAlerts(tab === "active" ? true : undefined)
  const { data: sensors } = useSensors()
  const { data: incidents } = useIncidents()

  const sensorMap = React.useMemo(() => {
    const map = new Map(sensors?.map((s) => [s.id, s]))
    return map
  }, [sensors])

  const alertIdsWithIncident = React.useMemo(
    () => new Set(incidents?.map((i) => i.alertId).filter(Boolean)),
    [incidents],
  )

  const rows = tab === "history" ? alerts?.filter((a) => !a.active) : alerts

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Alertas</h1>
        <p className="text-sm text-muted-foreground">
          Temperaturas y humedades fuera del rango configurado por perfil de sala.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "active" | "history")}>
        <TabsList>
          <TabsTrigger value="active">Activas</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : rows && rows.length > 0 ? (
        <div className="flex flex-col gap-3">
          {rows.map((alert) => {
            const sensor = sensorMap.get(alert.sensorId)
            const isTemp = alert.type.startsWith("temperature")
            const hasIncident = alertIdsWithIncident.has(alert.id)
            return (
              <div
                key={alert.id}
                className={cn(
                  "flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between",
                  alert.active ? "border-status-alert/30 bg-status-alert/5" : "border-border bg-card",
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                      alert.active ? "bg-status-alert/15 text-status-alert" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {isTemp ? <Thermometer className="size-4" /> : <Droplets className="size-4" />}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{alertTypeLabel(alert.type)}</span>
                      {alert.active ? (
                        <Badge variant="destructive">Activa</Badge>
                      ) : (
                        <Badge variant="outline">Resuelta</Badge>
                      )}
                    </div>
                    {sensor && (
                      <Link
                        href={`/sensores/${sensor.id}`}
                        className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                      >
                        {sensor.cinema.name} · {sensor.room.name} · {sensor.name}
                      </Link>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {alert.temperature.toFixed(1)}°C · {alert.humidity.toFixed(0)}% ·{" "}
                      {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:ml-4">
                  {hasIncident ? (
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <CheckCircle2 className="size-4 text-status-ok" />
                      Incidente creado
                    </span>
                  ) : (
                    <CreateIncidentDialog alert={alert} sensor={sensor} />
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
              <AlertTriangle />
            </EmptyMedia>
            <EmptyTitle>Sin alertas</EmptyTitle>
            <EmptyDescription>
              {tab === "active"
                ? "No hay alertas activas en este momento."
                : "Todavía no hay alertas resueltas en el historial."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  )
}
