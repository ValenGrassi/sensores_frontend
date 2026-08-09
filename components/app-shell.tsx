"use client"

import type * as React from "react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Topbar } from "@/components/topbar"
import { CinemaFilterProvider } from "@/lib/cinema-filter"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <CinemaFilterProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Topbar />
          <main className="flex-1 overflow-auto bg-background">
            <div className="mx-auto w-full max-w-[1400px] px-6 py-6">{children}</div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </CinemaFilterProvider>
  )
}
