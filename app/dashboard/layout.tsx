'use client'

import { AdminSidebar } from '@/app/_components/dashboard/admin-sidebar'
import { SidebarProvider, SidebarTrigger } from '../_components/ui/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1">
          {/* TOPO */}
          <header className="flex items-center gap-2 border-b px-5 py-3">
            <SidebarTrigger />
            <h1 className="font-semibold text-lg">Painel Administrativo</h1>
          </header>

          {/* CONTEÚDO */}
          <main className="flex-1 overflow-y-auto p-5 lg:p-10">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
