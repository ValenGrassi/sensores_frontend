"use client"

import * as React from "react"
import { Plus } from "lucide-react"
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

const EMPTY = { name: "", description: "", tempMin: "18", tempMax: "24", humMin: "30", humMax: "60" }

/** Perfil nuevo: nombre y rangos de temperatura y humedad. */
export function NewProfileDialog() {
  const refresh = useRefresh()
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState(EMPTY)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const set = (field: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [field]: e.target.value }))

  const invalidRanges = Number(form.tempMin) >= Number(form.tempMax) || Number(form.humMin) >= Number(form.humMax)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await api.createProfile({
        name: form.name.trim(),
        ...(form.description.trim() && { description: form.description.trim() }),
        temperatureMin: Number(form.tempMin),
        temperatureMax: Number(form.tempMax),
        humidityMin: Number(form.humMin),
        humidityMax: Number(form.humMax),
      })
      await refresh("/api/profiles")
      setOpen(false)
    } catch (err) {
      setError(describeError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          setForm(EMPTY)
          setError(null)
        }
      }}
    >
      <DialogTrigger render={<Button size="sm" />}>
        <Plus />
        Nuevo perfil
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Nuevo perfil</DialogTitle>
            <DialogDescription>Rangos aceptables. Fuera de ellos, se abre una alerta.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-name">Nombre</Label>
            <Input id="profile-name" value={form.name} onChange={set("name")} placeholder="Ej. Proyección" maxLength={100} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-description">Descripción (opcional)</Label>
            <Input id="profile-description" value={form.description} onChange={set("description")} maxLength={500} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-tmin">Temp. mínima (°C)</Label>
              <Input id="new-tmin" type="number" step="0.1" value={form.tempMin} onChange={set("tempMin")} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-tmax">Temp. máxima (°C)</Label>
              <Input id="new-tmax" type="number" step="0.1" value={form.tempMax} onChange={set("tempMax")} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-hmin">Humedad mínima (%)</Label>
              <Input id="new-hmin" type="number" step="1" value={form.humMin} onChange={set("humMin")} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-hmax">Humedad máxima (%)</Label>
              <Input id="new-hmax" type="number" step="1" value={form.humMax} onChange={set("humMax")} required />
            </div>
          </div>
          {invalidRanges && <p className="text-xs text-muted-foreground">Cada mínimo tiene que ser menor que su máximo.</p>}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
            <Button type="submit" disabled={saving || !form.name.trim() || invalidRanges}>
              {saving ? "Guardando..." : "Crear perfil"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
