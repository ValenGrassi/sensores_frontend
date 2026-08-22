"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  AlertTriangle,
  Building2,
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
import { useAlerts } from "@/lib/hooks"
import { UserMenu } from "@/components/user-menu"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cines", label: "Cines", icon: Building2 },
  { href: "/sensores", label: "Sensores", icon: Radio },
  { href: "/historial", label: "Historial", icon: History },
  { href: "/alertas", label: "Alertas", icon: AlertTriangle, badgeKey: "alerts" as const },
  { href: "/configuracion", label: "Configuración", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { data: activeAlerts } = useAlerts(true)

  const badgeCount = (key: "alerts" | undefined) => {
    if (key === "alerts") return activeAlerts?.length ?? 0
    return 0
  }

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="gap-0 border-b border-sidebar-border/60 py-4">
        <div className="flex items-center gap-3 px-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/70 text-sidebar-primary-foreground shadow-sm shadow-sidebar-primary/30">
            <Thermometer className="size-4.5" />
          </div>
          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
              Monitor Cinemark
            </span>
            <span className="truncate text-xs text-sidebar-foreground/55">Temperatura y humedad</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-1 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[11px] font-semibold tracking-widest text-sidebar-foreground/40 uppercase">
            Plataforma
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-1">
            <SidebarMenu className="gap-1">
              {navItems.map((item) => {
                const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
                const count = badgeCount(item.badgeKey)
                return (
                  <SidebarMenuItem key={item.href}>
                    {isActive && (
                      <span className="absolute top-1.5 bottom-1.5 left-0 w-0.5 rounded-full bg-sidebar-primary group-data-[collapsible=icon]:hidden" />
                    )}
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        "rounded-lg px-3 font-medium text-sidebar-foreground/70 transition-colors duration-150",
                        "hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
                        "data-active:bg-sidebar-primary/12 data-active:text-sidebar-foreground data-active:shadow-none",
                        "[&_svg]:text-sidebar-foreground/50 data-active:[&_svg]:text-sidebar-primary",
                      )}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                    {item.badgeKey && count > 0 && (
                      <SidebarMenuBadge
                        className={cn(
                          "rounded-full text-[11px]",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "bg-sidebar-accent text-sidebar-foreground/80",
                        )}
                      >
                        {count}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/60 px-1 py-2">
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  )
}
