import { NextResponse } from "next/server"
import { resolveDateRange } from "@/lib/date-range"
import { getSensorMeasurements } from "@/lib/server/store"
import type { DateRangePreset } from "@/lib/types"

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const { searchParams } = new URL(request.url)
  const preset = (searchParams.get("preset") as DateRangePreset | null) ?? "24h"
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  const { fromMs, toMs } = resolveDateRange(preset, from, to)
  const measurements = getSensorMeasurements(id, fromMs, toMs)
  return NextResponse.json(measurements)
}
