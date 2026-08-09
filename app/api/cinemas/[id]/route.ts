import { NextResponse } from "next/server"
import { getCinemaDetail } from "@/lib/server/store"

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const detail = getCinemaDetail(id)
  if (!detail) {
    return NextResponse.json({ error: "Cine no encontrado" }, { status: 404 })
  }
  return NextResponse.json(detail)
}
