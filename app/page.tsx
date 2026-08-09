"use client"

import { Building2, Radio, WifiOff, AlertTriangle, Thermometer } from "lucide-react"
import { useDashboard } from "@/lib/hooks"
import { MetricCard } from "@/components/dashboard/metric-card"
import { CinemaStatusList } from "@/components/dashboard/cinema-status-list"
import { ActiveAlertsPanel } from "@/components/dashboard/active-alerts-panel"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const { data: summary, isLoading } = useDashboard()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Estado general de temperatura, humedad y conectividad en la cadena.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {isLoading || !summary ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[72px] w-full" />)
        ) : (
          <>
            <MetricCard label="Cines" value={summary.cinemaCount} icon={Building2} />
            <MetricCard label="Sensores" value={summary.sensorCount} icon={Radio} />
            <MetricCard label="Online" value={summary.sensorsOnline} icon={Radio} tone="ok" />
            <MetricCard label="Sin comunicación" value={summary.sensorsOffline} icon={WifiOff} tone="attention" />
            <MetricCard label="En alerta" value={summary.sensorsAlert} icon={AlertTriangle} tone="alert" />
            <MetricCard
              label="Temp. promedio"
              value={summary.avgTemperature.toFixed(1)}
              suffix="°C"
              icon={Thermometer}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Estado por cine</h2>
          </div>
          <CinemaStatusList />
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Alertas activas</h2>
          </div>
          <ActiveAlertsPanel />
        </section>
      </div>
    </div>
  )
}
