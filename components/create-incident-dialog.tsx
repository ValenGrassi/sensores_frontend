"use client"

import * as React from "react"
import { useSWRConfig } from "swr"
import { ClipboardPlus } from "lucide-react"
import { api } from "@/lib/api"
import type { Alert, SensorWithContext } from "@/lib/types"
import { alertTypeLabel } from "@/lib/alert-labels"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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

export function CreateIncidentDialog({ alert, sensor }: { alert: Alert; sensor: SensorWithContext | undefined }) {
  const { mutate } = useSWRConfig()
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState(
    sensor ? `${sensor.room.name} - ${alertTypeLabel(alert.type)}` : alertTypeLabel(alert.type),
  )
  const [description, setDescription] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.createIncident({ title, description, sensorId: alert.sensorId, alertId: alert.id })
      await mutate("/api/incidents")
      setOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <ClipboardPlus />
        Crear incidente
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Crear incidente</DialogTitle>
            <DialogDescription>
              Registra un incidente para dar seguimiento a esta alerta{sensor ? ` de ${sensor.name}` : ""}.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="incident-title">Título</Label>
            <Input id="incident-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="incident-description">Descripción</Label>
            <Textarea
              id="incident-description"
              placeholder="Detalles de la revisión, causa raíz, acciones tomadas..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creando..." : "Crear incidente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
