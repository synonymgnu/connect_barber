'use client'

import { ReactNode } from 'react'
import { SidebarProvider, SidebarTrigger } from '@/app/_components/ui/sidebar'
import { MasterSidebar } from '@/app/_components/master-sidebar'
import MasterSidebarMobile from '@/app/_components/master-sidebar-mobile'

export default function MasterLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <MasterSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center gap-2 border-b px-4 py-3 shrink-0">
            <div className="hidden lg:block">
              <SidebarTrigger />
            </div>

            <MasterSidebarMobile />
            <h1 className="font-semibold text-lg">Painel Master</h1>
          </header>
          {children}
        </div>
      </div>
    </SidebarProvider>
  )
}
