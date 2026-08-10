import { NextResponse } from "next/server"
import { getSensorDetail, updateSensor } from "@/lib/server/store"

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const sensor = getSensorDetail(id)
  if (!sensor) {
    return NextResponse.json({ error: "Sensor no encontrado" }, { status: 404 })
  }
  return NextResponse.json(sensor)
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const body = await request.json()
  const updated = updateSensor(id, {
    name: typeof body.name === "string" ? body.name : undefined,
    roomId: typeof body.roomId === "string" ? body.roomId : undefined,
  })
  if (!updated) {
    return NextResponse.json({ error: "Sensor no encontrado" }, { status: 404 })
  }
  const sensor = getSensorDetail(id)
  return NextResponse.json(sensor)
}
