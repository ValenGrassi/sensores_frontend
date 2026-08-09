import { NextResponse } from "next/server"
import { createIncident, listIncidents } from "@/lib/server/store"

export async function GET() {
  return NextResponse.json(listIncidents())
}

export async function POST(request: Request) {
  const body = await request.json()
  if (!body?.title || !body?.sensorId) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
  }
  const incident = createIncident({
    title: body.title,
    description: body.description ?? "",
    sensorId: body.sensorId,
    alertId: body.alertId ?? null,
  })
  return NextResponse.json(incident, { status: 201 })
}
