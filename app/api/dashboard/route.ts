import { NextResponse } from "next/server"
import { getDashboardSummary } from "@/lib/server/store"

export async function GET() {
  return NextResponse.json(getDashboardSummary())
}
