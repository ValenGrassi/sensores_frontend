"use client"

import { CalendarClock } from "lucide-react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DATE_RANGE_PRESETS } from "@/lib/date-range"
import type { DateRangePreset } from "@/lib/types"

export function DateRangeSelect({
  value,
  onChange,
  includeCustom = false,
}: {
  value: DateRangePreset
  onChange: (value: DateRangePreset) => void
  includeCustom?: boolean
}) {
  const options = includeCustom ? DATE_RANGE_PRESETS : DATE_RANGE_PRESETS.filter((p) => p.value !== "custom")
  const currentLabel = options.find((p) => p.value === value)?.label ?? options[0].label

  return (
    <Select value={value} onValueChange={(v) => onChange(v as DateRangePreset)}>
      <SelectTrigger className="w-48" size="sm">
        <CalendarClock className="text-muted-foreground" />
        <SelectValue>{currentLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
