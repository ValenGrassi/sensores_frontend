import { NextResponse } from "next/server"
import { listSensors } from "@/lib/server/store"
import type { SensorStatus } from "@/lib/types"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cinemaId = searchParams.get("cinemaId") ?? undefined
  const roomId = searchParams.get("roomId") ?? undefined
  const status = (searchParams.get("status") as SensorStatus | null) ?? undefined

  return NextResponse.json(listSensors({ cinemaId, roomId, status }))
}
