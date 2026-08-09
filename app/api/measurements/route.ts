import { NextResponse } from "next/server"
import { resolveDateRange } from "@/lib/date-range"
import { listMeasurementRows } from "@/lib/server/store"
import type { DateRangePreset } from "@/lib/types"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cinemaId = searchParams.get("cinemaId") ?? undefined
  const roomId = searchParams.get("roomId") ?? undefined
  const sensorId = searchParams.get("sensorId") ?? undefined
  const preset = (searchParams.get("preset") as DateRangePreset | null) ?? "7d"
  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const page = Number(searchParams.get("page") ?? "1")
  const pageSize = Number(searchParams.get("pageSize") ?? "25")

  const { fromMs, toMs } = resolveDateRange(preset, from, to)
  const rows = listMeasurementRows({ cinemaId, roomId, sensorId, fromMs, toMs })

  const total = rows.length
  const start = (page - 1) * pageSize
  const paged = rows.slice(start, start + pageSize)

  return NextResponse.json({ rows: paged, total, page, pageSize })
}
