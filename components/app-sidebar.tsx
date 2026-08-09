"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  AlertTriangle,
  Building2,
  ClipboardList,
  FileBarChart,
  History,
  LayoutDashboard,
  Radio,
  Settings,
  Thermometer,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAlerts, useSensors } from "@/lib/hooks"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cines", label: "Cines", icon: Building2 },
  { href: "/sensores", label: "Sensores", icon: Radio },
  { href: "/historial", label: "Historial", icon: History },
  { href: "/alertas", label: "Alertas", icon: AlertTriangle, badgeKey: "alerts" as const },
  { href: "/incidentes", label: "Incidentes", icon: ClipboardList },
  { href: "/reportes", label: "Reportes", icon: FileBarChart },
  { href: "/configuracion", label: "Configuración", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { data: activeAlerts } = useAlerts(true)
  const { data: offlineSensors } = useSensors({ status: "offline" })

  const badgeCount = (key: "alerts" | undefined) => {
    if (key === "alerts") return activeAlerts?.length ?? 0
    return 0
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-0 border-b border-sidebar-border/60 py-3">
        <div className="flex items-center gap-2.5 px-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Thermometer className="size-4" />
          </div>
          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold text-sidebar-foreground">Monitor Cinemark</span>
            <span className="truncate text-xs text-sidebar-foreground/60">Temperatura y humedad</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
                const count = badgeCount(item.badgeKey)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badgeKey && count > 0 && <SidebarMenuBadge>{count}</SidebarMenuBadge>}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/60 group-data-[collapsible=icon]:hidden">
        <div className="flex flex-col gap-0.5 px-2 py-1 text-xs text-sidebar-foreground/60">
          <span>{offlineSensors?.length ?? 0} sensores sin comunicación</span>
          <span>V1 · Datos de demostración</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
