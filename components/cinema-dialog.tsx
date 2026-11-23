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
import { api, describeError } from "@/lib/api"
import { useRefresh } from "@/lib/hooks"
import type { Cinema } from "@/lib/types"

/** Alta (sin `cinema`) o edición de un cine. Solo con la clave de administrador. */
export function CinemaDialog({ cinema }: { cinema?: Cinema }) {
  const refresh = useRefresh()
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [address, setAddress] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      setName(cinema?.name ?? "")
      setAddress(cinema?.address ?? "")
      setError(null)
    }
  }, [open, cinema])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const data = { name: name.trim(), address: address.trim() }
      if (cinema) await api.updateCinema(cinema.id, data)
      else await api.createCinema(data)
      await refresh("/api/cinemas", "/api/sensors", "/api/dashboard", "/api/stats")
      setOpen(false)
    } catch (err) {
      setError(describeError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant={cinema ? "outline" : "default"} />}>
        {cinema ? <Pencil /> : <Plus />}
        {cinema ? "Editar cine" : "Agregar cine"}
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>{cinema ? `Editar ${cinema.name}` : "Nuevo cine"}</DialogTitle>
            <DialogDescription>Después le agregás las salas desde la página del cine.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cinema-name">Nombre</Label>
            <Input id="cinema-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Cine Centro" maxLength={100} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cinema-address">Dirección</Label>
            <Input id="cinema-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ej. Av. Corrientes 1234" maxLength={200} required />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
            <Button type="submit" disabled={saving || !name.trim() || !address.trim()}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
