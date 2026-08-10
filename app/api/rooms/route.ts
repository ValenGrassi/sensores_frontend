import { NextResponse } from "next/server"
import { listRooms } from "@/lib/server/store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cinemaId = searchParams.get("cinemaId") ?? undefined
  return NextResponse.json(listRooms(cinemaId))
}
