import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function MetricCard({
  label,
  value,
  suffix,
  icon: Icon,
  tone = "default",
}: {
  label: string
  value: string | number
  suffix?: string
  icon: LucideIcon
  tone?: "default" | "ok" | "attention" | "alert"
}) {
  const toneClass = {
    default: "text-foreground",
    ok: "text-status-ok",
    attention: "text-status-attention",
    alert: "text-status-alert",
  }[tone]

  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
      <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-md bg-muted", toneClass)}>
        <Icon className="size-5" />
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={cn("text-2xl font-semibold tabular-nums leading-tight", toneClass)}>
          {value}
          {suffix && <span className="ml-1 text-sm font-normal text-muted-foreground">{suffix}</span>}
        </span>
      </div>
    </div>
  )
}
