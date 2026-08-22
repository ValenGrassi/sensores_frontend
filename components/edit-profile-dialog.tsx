"use client"

import { useState } from "react"
import { useSWRConfig } from "swr"
import { Pencil } from "lucide-react"
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
import { api } from "@/lib/api"
import type { Profile } from "@/lib/types"

export function EditProfileDialog({ profile }: { profile: Profile }) {
  const { mutate } = useSWRConfig()
  const [open, setOpen] = useState(false)
  const [tempMin, setTempMin] = useState(String(profile.temperatureMin))
  const [tempMax, setTempMax] = useState(String(profile.temperatureMax))
  const [humMin, setHumMin] = useState(String(profile.humidityMin))
  const [humMax, setHumMax] = useState(String(profile.humidityMax))
  const [submitting, setSubmitting] = useState(false)
  const invalidTemperature =
  Number(tempMax) < Number(tempMin)

const invalidHumidity =
  Number(humMax) < Number(humMin)

  async function handleSubmit() {
    setSubmitting(true)
    try {
      await api.updateProfile(profile.id, {
        temperatureMin: Number(tempMin),
        temperatureMax: Number(tempMax),
        humidityMin: Number(humMin),
        humidityMax: Number(humMax),
      })
      await mutate("/api/profiles")
      await mutate("/api/dashboard")
      setOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <Pencil />
        Editar rangos
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar {profile.name}</DialogTitle>
          <DialogDescription>Define los rangos aceptables de temperatura y humedad para este perfil.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tmin">Temp. mínima (°C)</Label>
            <Input id="tmin" type="number" step="0.1" value={tempMin} onChange={(e) => setTempMin(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tmax">Temp. máxima (°C)</Label>
            <Input
  id="tmax"
  type="number"
  step="0.1"
  value={tempMax}
  onChange={(e) => setTempMax(e.target.value)}
  min={tempMin}
/>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="hmin">Humedad mínima (%)</Label>
            <Input id="hmin" type="number" step="1" value={humMin} onChange={(e) => setHumMin(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="hmax">Humedad máxima (%)</Label>
            <Input
  id="hmax"
  type="number"
  step="1"
  value={humMax}
  onChange={(e) => setHumMax(e.target.value)}
  min={humMin}
/>
          </div>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <Button
  onClick={handleSubmit}
  disabled={submitting || invalidTemperature || invalidHumidity}
>
  {submitting ? "Guardando..." : "Guardar cambios"}
</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
