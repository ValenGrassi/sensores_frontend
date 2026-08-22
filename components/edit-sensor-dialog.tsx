// "use client"

// import * as React from "react"
// import { useSWRConfig } from "swr"
// import { Settings2, Lock } from "lucide-react"
// import { api } from "@/lib/api"
// import { useCinemas, useRooms } from "@/lib/hooks"
// import type { SensorWithContext } from "@/lib/types"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import {
//   Dialog,
//   DialogTrigger,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
//   DialogClose,
// } from "@/components/ui/dialog"

// export function EditSensorDialog({ sensor }: { sensor: SensorWithContext }) {
//   const { mutate } = useSWRConfig()
//   const [open, setOpen] = React.useState(false)
//   const [name, setName] = React.useState(sensor.name)
//   const [cinemaId, setCinemaId] = React.useState(sensor.cinema.id)
//   const [roomId, setRoomId] = React.useState(sensor.room.id)
//   const [submitting, setSubmitting] = React.useState(false)

//   const { data: cinemas } = useCinemas()
//   const { data: rooms } = useRooms(cinemaId)

//   React.useEffect(() => {
//     if (open) {
//       setName(sensor.name)
//       setCinemaId(sensor.cinema.id)
//       setRoomId(sensor.room.id)
//     }
//   }, [open, sensor])

//   function handleCinemaChange(nextCinemaId: string) {
//     setCinemaId(nextCinemaId)
//     setRoomId("")
//   }

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault()
//     setSubmitting(true)
//     try {
//       await api.updateSensor(sensor.id, { name, roomId })
//       await Promise.all([
//         mutate("/api/sensors"),
//         mutate(`/api/sensors/${sensor.id}`),
//         mutate("/api/dashboard"),
//         mutate("/api/cinemas"),
//       ])
//       setOpen(false)
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger render={<Button size="sm" variant="outline" />}>
//         <Settings2 />
//         Configurar
//       </DialogTrigger>
//       <DialogContent>
//         <form onSubmit={handleSubmit} className="flex flex-col gap-5">
//           <DialogHeader>
//             <DialogTitle>Configuración del sensor</DialogTitle>
//             <DialogDescription>Editá el nombre y la ubicación del sensor.</DialogDescription>
//           </DialogHeader>

//           <div className="flex flex-col gap-2">
//             <Label htmlFor="sensor-name">Nombre</Label>
//             <Input id="sensor-name" value={name} onChange={(e) => setName(e.target.value)} required />
//           </div>

//           <div className="flex flex-col gap-2">
//             <Label htmlFor="sensor-cinema">Cine</Label>
//             <Select value={cinemaId} onValueChange={handleCinemaChange}>
//               <SelectTrigger id="sensor-cinema" className="w-full">
//                 <SelectValue>{cinemas?.find((c) => c.id === cinemaId)?.name}</SelectValue>
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectGroup>
//                   {cinemas?.map((cinema) => (
//                     <SelectItem key={cinema.id} value={cinema.id}>
//                       {cinema.name}
//                     </SelectItem>
//                   ))}
//                 </SelectGroup>
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="flex flex-col gap-2">
//             <Label htmlFor="sensor-room">Sector</Label>
//             <Select value={roomId} onValueChange={setRoomId}>
//               <SelectTrigger id="sensor-room" className="w-full">
//                 <SelectValue>{rooms?.find((r) => r.id === roomId)?.name}</SelectValue>
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectGroup>
//                   {rooms?.map((room) => (
//                     <SelectItem key={room.id} value={room.id}>
//                       {room.name}
//                     </SelectItem>
//                   ))}
//                 </SelectGroup>
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="flex flex-col gap-2">
//             <Label htmlFor="sensor-deveui" className="flex items-center gap-1.5 text-muted-foreground">
//               <Lock className="size-3.5" />
//               devEUI
//             </Label>
//             <Input id="sensor-deveui" value={sensor.devEui} disabled readOnly className="font-mono opacity-60" />
//           </div>

//           <DialogFooter>
//             <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
//             <Button type="submit" disabled={submitting || !roomId}>
//               {submitting ? "Guardando..." : "Guardar cambios"}
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   )
// }

"use client"

import * as React from "react"
import { useSWRConfig } from "swr"
import { Settings2, Lock } from "lucide-react"

import { api } from "@/lib/api"
import { useCinemas, useRooms } from "@/lib/hooks"
import type { SensorWithContext } from "@/lib/types"

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

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function EditSensorDialog({
  sensor,
}: {
  sensor: SensorWithContext
}) {
  const { mutate } = useSWRConfig()

  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState(sensor.name)
  const [cinemaId, setCinemaId] = React.useState(sensor.cinema.id)
  const [roomId, setRoomId] = React.useState(sensor.room.id)
  const [submitting, setSubmitting] = React.useState(false)

  const { data: cinemas } = useCinemas()
  const { data: rooms } = useRooms(cinemaId)

  React.useEffect(() => {
    if (open) {
      setName(sensor.name)
      setCinemaId(sensor.cinema.id)
      setRoomId(sensor.room.id)
    }
  }, [open, sensor])

  function handleCinemaChange(nextCinemaId: string) {
    setCinemaId(nextCinemaId)
    setRoomId("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim() || !roomId) {
      return
    }

    setSubmitting(true)

    try {
      await api.updateSensor(sensor.devEui, {
        name: name.trim(),
        roomId,
      })

      await Promise.all([
        mutate("/api/sensors"),
        mutate(`/api/sensors/${sensor.devEui}`),
        mutate("/api/dashboard"),
        mutate("/api/cinemas"),
      ])

      setOpen(false)
    } catch (error) {
      console.error("Error actualizando sensor:", error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <Settings2 />
        Configurar
      </DialogTrigger>

      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          <DialogHeader>
            <DialogTitle>
              Configuración del sensor
            </DialogTitle>

            <DialogDescription>
              Modificá el nombre y la ubicación del sensor.
            </DialogDescription>
          </DialogHeader>

          {/* NOMBRE */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="sensor-name">
              Nombre
            </Label>

            <Input
              id="sensor-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Sensor Sala 1"
              required
            />
          </div>

          {/* CINE */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="sensor-cinema">
              Cine
            </Label>

            <Select
              value={cinemaId}
              onValueChange={handleCinemaChange}
            >
              <SelectTrigger
                id="sensor-cinema"
                className="w-full"
              >
                <SelectValue>
                  {cinemas?.find(
                    (cinema) => cinema.id === cinemaId
                  )?.name}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  {cinemas?.map((cinema) => (
                    <SelectItem
                      key={cinema.id}
                      value={cinema.id}
                    >
                      {cinema.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* SALA */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="sensor-room">
              Sala
            </Label>

            <Select
              value={roomId}
              onValueChange={setRoomId}
              disabled={!cinemaId}
            >
              <SelectTrigger
                id="sensor-room"
                className="w-full"
              >
                <SelectValue>
                  {rooms?.find(
                    (room) => room.id === roomId
                  )?.name}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  {rooms?.map((room) => (
                    <SelectItem
                      key={room.id}
                      value={room.id}
                    >
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* DEVEUI */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="sensor-deveui"
              className="flex items-center gap-1.5 text-muted-foreground"
            >
              <Lock className="size-3.5" />
              devEUI
            </Label>

            <Input
              id="sensor-deveui"
              value={sensor.devEui}
              disabled
              readOnly
              className="font-mono opacity-60"
            />
          </div>

          <DialogFooter>
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                />
              }
            >
              Cancelar
            </DialogClose>

            <Button
              type="submit"
              disabled={
                submitting ||
                !name.trim() ||
                !roomId
              }
            >
              {submitting
                ? "Guardando..."
                : "Guardar cambios"}
            </Button>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  )
}