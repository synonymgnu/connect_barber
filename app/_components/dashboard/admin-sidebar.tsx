'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Scissors, Calendar, LogOut, LayoutDashboard, User } from 'lucide-react'
import { useState } from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '../ui/sidebar'
import Image from 'next/image'

export function AdminSidebar() {
  const pathname = usePathname()
  const { open } = useSidebar()
  const [hover, setHover] = useState(false)

  const expanded = open || hover

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Agenda', href: '/dashboard/calendar', icon: Calendar },
    { label: 'Serviços', href: '/dashboard/services', icon: Scissors },
    { label: 'Perfil', href: '/dashboard/clients', icon: User },
  ]

  return (
    <Sidebar
      collapsible="icon"
      className="border-r bg-card shadow-sm text-card-foreground"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* ANIMAÇÃO DE EXPANSÃO */}
      <motion.div
        animate={{
          width: expanded ? 240 : 72,
        }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="overflow-hidden h-full flex flex-col"
      >
        <SidebarHeader className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Image
              alt="Connect Barber"
              src="/logo3.png"
              height={18}
              width={18}
            />
            <AnimatePresence>
              {expanded && (
                <motion.h1
                  key="title"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-bold text-lg tracking-tight"
                >
                  Connect Barber
                </motion.h1>
              )}
            </AnimatePresence>
          </div>
        </SidebarHeader>

        {/* CONTEÚDO */}
        <SidebarContent className="flex-1">
          <SidebarGroup>
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                ></motion.div>
              )}
            </AnimatePresence>

            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const active = pathname === item.href
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={active}>
                        <Link
                          href={item.href}
                          className="flex items-center gap-3 px-3 py-2 rounded-md transition hover:bg-muted"
                        >
                          <Icon className="w-5 h-5" />
                          {expanded && (
                            <span className="font-medium text-sm">
                              {item.label}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* RODAPÉ */}
        <SidebarFooter className="border-t p-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <button className="flex items-center gap-3 text-red-500 w-full hover:bg-red-100 dark:hover:bg-red-900/20 rounded-md px-3 py-2 transition">
                  <LogOut className="w-5 h-5" />
                  {expanded && <span className="font-medium">Sair</span>}
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </motion.div>

      <SidebarRail />
    </Sidebar>
  )
}
