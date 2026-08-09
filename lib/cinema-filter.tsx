"use client"

import * as React from "react"

interface CinemaFilterContextValue {
  cinemaId: string | null // null = "Todos los cines"
  setCinemaId: (id: string | null) => void
}

const CinemaFilterContext = React.createContext<CinemaFilterContextValue | null>(null)

export function CinemaFilterProvider({ children }: { children: React.ReactNode }) {
  const [cinemaId, setCinemaId] = React.useState<string | null>(null)
  const value = React.useMemo(() => ({ cinemaId, setCinemaId }), [cinemaId])
  return <CinemaFilterContext.Provider value={value}>{children}</CinemaFilterContext.Provider>
}

export function useCinemaFilter() {
  const context = React.useContext(CinemaFilterContext)
  if (!context) throw new Error("useCinemaFilter must be used within a CinemaFilterProvider")
  return context
}
