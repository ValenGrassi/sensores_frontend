import type { RoomType } from "@/lib/types"

export const roomTypeLabels: Record<RoomType, string> = {
  projection: "Sala de proyección",
  hall: "Hall / lobby principal",
  lobby: "Recepción",
  storage: "Depósito",
  other: "Otro",
}

export function roomTypeLabel(type: RoomType) {
  return roomTypeLabels[type] ?? type
}
