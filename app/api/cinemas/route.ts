import { NextResponse } from "next/server"
import { listCinemaSummaries } from "@/lib/server/store"

export async function GET() {
  return NextResponse.json(listCinemaSummaries())
}
