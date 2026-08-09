import { NextResponse } from "next/server"
import { resolveDateRange } from "@/lib/date-range"
import { buildReport } from "@/lib/server/store"
import type { DateRangePreset } from "@/lib/types"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cinemaId = searchParams.get("cinemaId") ?? undefined
  const roomId = searchParams.get("roomId") ?? undefined
  const sensorId = searchParams.get("sensorId") ?? undefined
  const preset = (searchParams.get("preset") as DateRangePreset | null) ?? "30d"
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  const { fromMs, toMs } = resolveDateRange(preset, from, to)
  const report = buildReport({ cinemaId, roomId, sensorId, fromMs, toMs })
  return NextResponse.json(report)
}
