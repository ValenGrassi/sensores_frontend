"use client"

import { Area, AreaChart, CartesianGrid, ReferenceArea, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { Measurement } from "@/lib/types"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const chartConfig: ChartConfig = {
  temperature: { label: "Temperatura (°C)", color: "var(--chart-1)" },
  humidity: { label: "Humedad (%)", color: "var(--chart-2)" },
}

export function SensorChart({
  measurements,
  metric,
  min,
  max,
}: {
  measurements: Measurement[]
  metric: "temperature" | "humidity"
  min: number
  max: number
}) {
  const points = measurements.map((m) => ({
    timestamp: m.timestamp,
    value: metric === "temperature" ? m.temperature : m.humidity,
  }))

  // Detect silent periods (e.g. a sensor that reported on Aug 13 and then
  // again on Aug 22) and insert a null breakpoint so the chart renders a
  // visible blank gap instead of a misleading straight line across the void.
  const diffsMs = points
    .slice(1)
    .map((p, i) => new Date(p.timestamp).getTime() - new Date(points[i].timestamp).getTime())
    .filter((d) => d > 0)
  const sortedDiffs = [...diffsMs].sort((a, b) => a - b)
  const typicalStepMs = sortedDiffs[Math.floor(sortedDiffs.length / 2)] ?? 0
  const GAP_THRESHOLD_MS = Math.max(typicalStepMs * 4, 6 * 60 * 60 * 1000)

  const data: { timestamp: string; value: number | null; gap?: boolean }[] = []
  points.forEach((point, index) => {
    if (index > 0) {
      const prevTs = new Date(points[index - 1].timestamp).getTime()
      const curTs = new Date(point.timestamp).getTime()
      if (curTs - prevTs > GAP_THRESHOLD_MS) {
        data.push({ timestamp: new Date((prevTs + curTs) / 2).toISOString(), value: null, gap: true })
      }
    }
    data.push(point)
  })

  const firstTs = points[0] ? new Date(points[0].timestamp).getTime() : 0
  const lastTs = points[points.length - 1] ? new Date(points[points.length - 1].timestamp).getTime() : 0
  const spansMultipleDays = lastTs - firstTs > 36 * 60 * 60 * 1000

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
      <AreaChart data={data} margin={{ left: 4, right: 12, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id={`fill-${metric}`} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={metric === "temperature" ? "var(--chart-1)" : "var(--chart-2)"}
              stopOpacity={0.35}
            />
            <stop
              offset="95%"
              stopColor={metric === "temperature" ? "var(--chart-1)" : "var(--chart-2)"}
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <ReferenceArea y1={min} y2={max} fill="var(--color-status-ok)" fillOpacity={0.06} strokeOpacity={0} />
        <XAxis
          dataKey="timestamp"
          tickLine={false}
          axisLine={false}
          minTickGap={40}
          tickFormatter={(value) => format(new Date(value), spansMultipleDays ? "d MMM" : "HH:mm", { locale: es })}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={36}
          domain={["auto", "auto"]}
          tickFormatter={(value) => `${value}${metric === "temperature" ? "°" : "%"}`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) => format(new Date(value as string), "PPpp", { locale: es })}
              formatter={(value) =>
                value === null || value === undefined
                  ? ["Sin datos", "Sensor sin comunicación"]
                  : [`${value}${metric === "temperature" ? "°C" : "%"}`, chartConfig[metric].label]
              }
            />
          }
        />
        <Area
          dataKey="value"
          type="monotone"
          fill={`url(#fill-${metric})`}
          stroke={metric === "temperature" ? "var(--chart-1)" : "var(--chart-2)"}
          strokeWidth={2}
          dot={false}
        />
      </AreaChart>
    </ChartContainer>
  )
}
