"use client"

import { Building2 } from "lucide-react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCinemas } from "@/lib/hooks"
import { useCinemaFilter } from "@/lib/cinema-filter"

export function CinemaSelector() {
  const { data: cinemas } = useCinemas()
  const { cinemaId, setCinemaId } = useCinemaFilter()

  const currentLabel = cinemaId ? cinemas?.find((c) => c.id === cinemaId)?.name ?? "Todos los cines" : "Todos los cines"

  return (
    <Select value={cinemaId ?? "all"} onValueChange={(value) => setCinemaId(value === "all" ? null : value)}>
      <SelectTrigger className="w-56" size="sm">
        <Building2 className="text-muted-foreground" />
        <SelectValue placeholder="Todos los cines">{currentLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="all">Todos los cines</SelectItem>
          {cinemas?.map((cinema) => (
            <SelectItem key={cinema.id} value={cinema.id}>
              {cinema.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
