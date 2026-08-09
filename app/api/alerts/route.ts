import { NextResponse } from "next/server"
import { listAlerts } from "@/lib/server/store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const activeParam = searchParams.get("active")
  const alerts = listAlerts()
  if (activeParam === "true") return NextResponse.json(alerts.filter((a) => a.active))
  if (activeParam === "false") return NextResponse.json(alerts.filter((a) => !a.active))
  return NextResponse.json(alerts)
}
