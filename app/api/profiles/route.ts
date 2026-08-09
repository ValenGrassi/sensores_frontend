import { NextResponse } from "next/server"
import { listProfiles } from "@/lib/server/store"

export async function GET() {
  return NextResponse.json(listProfiles())
}
