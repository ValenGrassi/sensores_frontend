"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { useCinemas } from "@/lib/hooks"
import { CinemaStatusIndicator } from "@/components/status-indicator"
import { Skeleton } from "@/components/ui/skeleton"

export function CinemaStatusList() {
  const { data: cinemas, isLoading } = useCinemas()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {cinemas?.map((cinema) => (
        <Link
          key={cinema.id}
          href={`/cines/${cinema.id}`}
          className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
        >
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium text-foreground">{cinema.name}</span>
            <span className="truncate text-xs text-muted-foreground">{cinema.address}</span>
          </div>
          <div className="flex shrink-0 items-center gap-6">
            <div className="hidden flex-col items-end text-xs text-muted-foreground sm:flex">
              <span className="tabular-nums">
                {cinema.sensorsOnline}/{cinema.sensorCount} sensores online
              </span>
              {cinema.activeAlerts > 0 && (
                <span className="text-status-alert">{cinema.activeAlerts} en alerta</span>
              )}
            </div>
            <CinemaStatusIndicator status={cinema.status} />
            <ChevronRight className="size-4 text-muted-foreground" />
          </div>
        </Link>
      ))}
    </div>
  )
}
