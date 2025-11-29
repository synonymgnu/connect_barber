'use client'

import { AdminSidebar } from '@/app/_components/dashboard/admin-sidebar'
import { SidebarProvider, SidebarTrigger } from '../_components/ui/sidebar'
import AdminSidebarMobile from '../_components/dashboard/admin-sidebar-mobile'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center gap-2 border-b px-4 py-3 shrink-0">
            <div className="hidden lg:block">
              <SidebarTrigger />
            </div>
            <AdminSidebarMobile />
            <h1 className="font-semibold text-lg">Painel Administrativo</h1>
          </header>
          <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
