"use client"

import * as React from "react"
import { Pencil, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api, describeError } from "@/lib/api"
import { useProfiles, useRefresh } from "@/lib/hooks"
import { roomTypeLabels } from "@/lib/room-labels"
import type { RoomType } from "@/lib/types"

const ROOM_TYPES = Object.keys(roomTypeLabels) as RoomType[]

/** Alta (sin `room`) o edición de una sala de un cine. Solo con la clave de administrador. */
export function RoomDialog({
  cinemaId,
  room,
}: {
  cinemaId: string
  room?: { id: string; name: string; type: string; profileId: string }
}) {
  const refresh = useRefresh()
  const { data: profiles } = useProfiles()
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [type, setType] = React.useState<string>("projection")
  const [profileId, setProfileId] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      setName(room?.name ?? "")
      setType(room?.type ?? "projection")
      setProfileId(room?.profileId ?? "")
      setError(null)
    }
  }, [open, room])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const data = { name: name.trim(), type, profileId }
      if (room) await api.updateRoom(room.id, data)
      else await api.createRoom({ cinemaId, ...data })
      // el perfil de la sala define las alertas de sus sensores
      await refresh("/api/cinemas", "/api/rooms", "/api/sensors", "/api/dashboard", "/api/stats", "/api/alerts")
      setOpen(false)
    } catch (err) {
      setError(describeError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant={room ? "ghost" : "outline"} />}>
        {room ? <Pencil /> : <Plus />}
        {room ? "Editar" : "Agregar sala"}
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>{room ? `Editar ${room.name}` : "Nueva sala"}</DialogTitle>
            <DialogDescription>El perfil define los rangos de temperatura y humedad que disparan alertas.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="room-name">Nombre</Label>
            <Input id="room-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Sala 5" maxLength={100} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="room-type">Tipo</Label>
            <Select value={type} onValueChange={(value) => setType(value ?? "projection")}>
              <SelectTrigger id="room-type" className="w-full">
                <SelectValue>{roomTypeLabels[type as RoomType] ?? type}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {ROOM_TYPES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {roomTypeLabels[value]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="room-profile">Perfil</Label>
            <Select value={profileId} onValueChange={(value) => setProfileId(value ?? "")}>
              <SelectTrigger id="room-profile" className="w-full">
                <SelectValue>{profiles?.find((p) => p.id === profileId)?.name ?? "Elegí un perfil"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {profiles?.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name} · {profile.temperatureMin}–{profile.temperatureMax} °C · {profile.humidityMin}–{profile.humidityMax} %
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {profiles && profiles.length === 0 && (
              <p className="text-xs text-muted-foreground">No hay perfiles: creá uno en Configuración.</p>
            )}
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
            <Button type="submit" disabled={saving || !name.trim() || !profileId}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
