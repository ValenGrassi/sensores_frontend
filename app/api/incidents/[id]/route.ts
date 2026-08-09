import { NextResponse } from "next/server"
import { updateIncidentStatus } from "@/lib/server/store"
import type { IncidentStatus } from "@/lib/types"

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const body = await request.json()
  const status = body?.status as IncidentStatus | undefined
  if (status !== "open" && status !== "resolved") {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
  }
  const incident = updateIncidentStatus(id, status)
  if (!incident) {
    return NextResponse.json({ error: "Incidente no encontrado" }, { status: 404 })
  }
  return NextResponse.json(incident)
}
