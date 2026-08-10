"use client"

import Link from "next/link"
import { ChevronRight, MapPin } from "lucide-react"
import { useCinemas } from "@/lib/hooks"
import { CinemaStatusIndicator } from "@/components/status-indicator"
import { Skeleton } from "@/components/ui/skeleton"

export default function CinesPage() {
  const { data: cinemas, isLoading } = useCinemas()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Cines</h1>
        <p className="text-sm text-muted-foreground">
          Listado de todas las salas monitoreadas de la cadena.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cinemas?.map((cinema) => (
            <Link
              key={cinema.id}
              href={`/cines/${cinema.id}`}
              className="group flex flex-col gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:bg-accent/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="truncate text-base font-medium text-foreground">{cinema.name}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3 shrink-0" />
                    <span className="truncate">{cinema.address}</span>
                  </span>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Sensores online</span>
                  <span className="text-sm font-medium tabular-nums text-foreground">
                    {cinema.sensorsOnline}/{cinema.sensorCount}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-xs text-muted-foreground">Estado</span>
                  <CinemaStatusIndicator status={cinema.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
