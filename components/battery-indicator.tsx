import { Battery, BatteryLow, BatteryMedium, BatteryWarning } from "lucide-react"
import { cn } from "@/lib/utils"

export function BatteryIndicator({ percent, className }: { percent: number; className?: string }) {
  const Icon = percent <= 15 ? BatteryWarning : percent <= 40 ? BatteryLow : percent <= 75 ? BatteryMedium : Battery
  const colorClass = percent <= 15 ? "text-status-alert" : percent <= 40 ? "text-status-attention" : "text-muted-foreground"

  return (
    <span className={cn("inline-flex items-center gap-1.5 font-mono text-sm tabular-nums", colorClass, className)}>
      <Icon className="size-4" />
      {percent}%
    </span>
  )
}
