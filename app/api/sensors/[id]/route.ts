import { NextResponse } from "next/server"
import { getSensorDetail } from "@/lib/server/store"

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const sensor = getSensorDetail(id)
  if (!sensor) {
    return NextResponse.json({ error: "Sensor no encontrado" }, { status: 404 })
  }
  return NextResponse.json(sensor)
}
