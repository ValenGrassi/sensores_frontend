"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, MapPin } from "lucide-react"
import { useCinema } from "@/lib/hooks"
import { CinemaStatusIndicator } from "@/components/status-indicator"
import { SensorRow } from "@/components/sensor-row"
import { roomTypeLabel } from "@/lib/room-labels"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { Building2 } from "lucide-react"

export default function CineDetailPage() {
  const params = useParams<{ id: string }>()
  const { data: cinema, isLoading } = useCinema(params.id)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!cinema) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Building2 />
          </EmptyMedia>
          <EmptyTitle>Cine no encontrado</EmptyTitle>
          <EmptyDescription>No pudimos encontrar el cine solicitado.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/cines"
          className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Cines
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-foreground">{cinema.name}</h1>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5" />
              {cinema.address}
            </span>
          </div>
          <CinemaStatusIndicator status={cinema.status} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <span className="text-xs text-muted-foreground">Sensores</span>
          <p className="text-xl font-semibold tabular-nums text-foreground">{cinema.sensorCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <span className="text-xs text-muted-foreground">Online</span>
          <p className="text-xl font-semibold tabular-nums text-status-ok">{cinema.sensorsOnline}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <span className="text-xs text-muted-foreground">Sin comunicación</span>
          <p className="text-xl font-semibold tabular-nums text-status-attention">{cinema.sensorsOffline}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <span className="text-xs text-muted-foreground">En alerta</span>
          <p className="text-xl font-semibold tabular-nums text-status-alert">{cinema.activeAlerts}</p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <h2 className="text-sm font-medium text-foreground">Salas y sensores</h2>
        {cinema.rooms.map((room) => (
          <div key={room.id} className="flex flex-col gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium text-foreground">{room.name}</span>
              <span className="text-xs text-muted-foreground">{roomTypeLabel(room.type as any)}</span>
            </div>
            <div className="flex flex-col gap-2">
              {room.sensors.map((sensor) => (
                <SensorRow key={sensor.id} sensor={sensor} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
