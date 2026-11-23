"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, MapPin } from "lucide-react"
import { useAccess, useCinema, useProfiles, useRefresh } from "@/lib/hooks"
import { api } from "@/lib/api"
import { CinemaStatusIndicator } from "@/components/status-indicator"
import { SensorRow } from "@/components/sensor-row"
import { CinemaDialog } from "@/components/cinema-dialog"
import { RoomDialog } from "@/components/room-dialog"
import { ConfirmDeleteButton } from "@/components/confirm-delete-button"
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
  const router = useRouter()
  const { data: cinema, isLoading } = useCinema(params.id)
  const { data: profiles } = useProfiles()
  const { isAdmin } = useAccess()
  const refresh = useRefresh()

  async function deleteCinema() {
    await api.deleteCinema(params.id)
    await refresh("/api/cinemas", "/api/dashboard", "/api/stats")
    router.push("/cines")
  }

  async function deleteRoom(roomId: string) {
    await api.deleteRoom(roomId)
    await refresh("/api/cinemas", "/api/rooms")
  }

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
          <div className="flex flex-wrap items-center gap-2">
            <CinemaStatusIndicator status={cinema.status} />
            {isAdmin && (
              <>
                <CinemaDialog cinema={cinema} />
                <ConfirmDeleteButton
                  title={`Eliminar ${cinema.name}`}
                  description="Se elimina el cine. Solo se puede si no tiene salas."
                  onConfirm={deleteCinema}
                />
              </>
            )}
          </div>
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
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-foreground">Salas y sensores</h2>
          {isAdmin && <RoomDialog cinemaId={cinema.id} />}
        </div>
        {cinema.rooms.length === 0 && (
          <p className="text-sm text-muted-foreground">Este cine todavía no tiene salas.</p>
        )}
        {cinema.rooms.map((room) => (
          <div key={room.id} className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-sm font-medium text-foreground">{room.name}</span>
                <span className="text-xs text-muted-foreground">
                  {roomTypeLabel(room.type as any)}
                  {profiles && ` · Perfil: ${profiles.find((p) => p.id === room.profileId)?.name ?? "—"}`}
                </span>
              </div>
              {isAdmin && (
                <div className="flex items-center gap-1">
                  <RoomDialog cinemaId={cinema.id} room={room} />
                  <ConfirmDeleteButton
                    title={`Eliminar ${room.name}`}
                    description="Se elimina la sala. Solo se puede si no tiene sensores."
                    onConfirm={() => deleteRoom(room.id)}
                  />
                </div>
              )}
            </div>
            {room.sensors.length === 0 && <p className="text-xs text-muted-foreground">Sin sensores.</p>}
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
