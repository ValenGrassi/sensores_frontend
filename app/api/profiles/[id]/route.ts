import { NextResponse } from "next/server"
import { updateProfile } from "@/lib/server/store"

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const body = await request.json()
  const profile = updateProfile(id, {
    name: body.name,
    description: body.description,
    temperatureMin: body.temperatureMin,
    temperatureMax: body.temperatureMax,
    humidityMin: body.humidityMin,
    humidityMax: body.humidityMax,
  })
  if (!profile) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 })
  }
  return NextResponse.json(profile)
}
