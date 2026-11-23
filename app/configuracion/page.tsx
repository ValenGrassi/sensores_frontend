"use client"

import { SlidersHorizontal } from "lucide-react"
import { useAccess, useProfiles, useRefresh } from "@/lib/hooks"
import { api } from "@/lib/api"
import { EditProfileDialog } from "@/components/edit-profile-dialog"
import { NewProfileDialog } from "@/components/new-profile-dialog"
import { ConfirmDeleteButton } from "@/components/confirm-delete-button"
import { AdminAccessCard } from "@/components/admin-access-card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ConfiguracionPage() {
  const { data: profiles, isLoading } = useProfiles()
  const { can } = useAccess()
  const refresh = useRefresh()
  const canEditProfiles = can("profiles:write")

  async function deleteProfile(id: string) {
    await api.deleteProfile(id)
    await refresh("/api/profiles")
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
        <p className="text-sm text-muted-foreground">
          Perfiles de sala: rangos de temperatura y humedad que disparan alertas.
        </p>
      </div>

      <AdminAccessCard />

      {canEditProfiles && (
        <div className="flex justify-end">
          <NewProfileDialog />
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profiles?.map((profile) => (
            <div key={profile.id} className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <SlidersHorizontal className="size-4" />
                  </div>
                  <div>
                    <p className="font-medium leading-tight">{profile.name}</p>
                    {profile.description && (
                      <p className="text-xs text-muted-foreground">{profile.description}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md bg-muted/50 px-3 py-2">
                  <p className="text-xs text-muted-foreground">Temperatura</p>
                  <p className="font-mono font-medium">
                    {profile.temperatureMin}°C – {profile.temperatureMax}°C
                  </p>
                </div>
                <div className="rounded-md bg-muted/50 px-3 py-2">
                  <p className="text-xs text-muted-foreground">Humedad</p>
                  <p className="font-mono font-medium">
                    {profile.humidityMin}% – {profile.humidityMax}%
                  </p>
                </div>
              </div>

              {canEditProfiles && (
                <div className="flex justify-end gap-1">
                  <ConfirmDeleteButton
                    title={`Eliminar el perfil ${profile.name}`}
                    description="Solo se puede si ninguna sala lo usa."
                    onConfirm={() => deleteProfile(profile.id)}
                  />
                  <EditProfileDialog profile={profile} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
