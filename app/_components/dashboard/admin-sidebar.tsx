'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Scissors,
  Calendar,
  LayoutDashboard,
  ChevronUp,
  X,
  Users,
  Store,
} from 'lucide-react'
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
import { Avatar, AvatarImage } from '../ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'

export function AdminSidebar() {
  const pathname = usePathname()
  const sidebar = useSidebar() // 👈 pegando o objeto inteiro
  const { open, setOpen } = useSidebar()
  const [hover, setHover] = useState(false)
  const expanded = open || hover

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Agenda', href: '/dashboard/calendar', icon: Calendar },
    { label: 'Serviços', href: '/dashboard/services', icon: Scissors },
    { label: 'Equipe', href: '/dashboard/barbers', icon: Users },
    { label: 'Barbearia', href: '/dashboard/settings', icon: Store },
  ]

  return (
    <Sidebar
      collapsible="icon"
      className="border-r bg-card shadow-sm text-card-foreground"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <motion.div
        animate={{
          width: expanded ? 240 : 72,
        }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="overflow-hidden h-full flex flex-col"
      >
        {/* BOTÃO DE FECHAR (mobile) */}
        {open && (
          <button
            onClick={() => setOpen(false)}
            className="absolute right-3 top-3 md:hidden p-1 rounded-md hover:bg-muted transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {/* HEADER */}
        <SidebarHeader
          className={`p-[9px]  transition-all duration-200 ${
            expanded ? 'border-border' : 'border-transparent'
          }`}
        >
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 overflow-hidden"
          >
            <Image
              alt="Connect Barber"
              src="/logo3.png"
              height={30}
              width={30}
            />
            <motion.div
              animate={{
                opacity: open ? 1 : 0,
                width: open ? 'auto' : 0,
              }}
              transition={{ duration: 0.15, ease: 'easeInOut' }}
              className="whitespace-nowrap"
            >
              {open && (
                <h1 className="font-bold text-lg tracking-tight">
                  Connect Barber
                </h1>
              )}
            </motion.div>
          </button>
        </SidebarHeader>

        {/* MENU */}
        <SidebarContent className="flex-1">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const active = pathname === item.href

                  return (
                    <SidebarMenuItem key={item.href} className="relative group">
                      <Tooltip open={!open ? undefined : false}>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild isActive={active}>
                            <Link
                              href={item.href}
                              className="flex items-center gap-3 px-3 py-2 rounded-md transition hover:bg-muted relative"
                            >
                              <Icon className="w-5 h-5" />
                              {expanded && (
                                <span className="font-medium text-sm">
                                  {item.label}
                                </span>
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        {!open && (
                          <TooltipContent
                            side="right"
                            align="center"
                            sideOffset={10}
                          >
                            <p>{item.label}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* FOOTER */}
        <SidebarFooter
          className={`transition-all duration-200 ${
            open ? 'border-t border-border' : 'border-none'
          }`}
        >
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <Avatar className="w-4 h-4">
                      <AvatarImage src="/user-img.svg" />
                    </Avatar>
                    Username
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuItem>
                    <span>Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Billing</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </motion.div>

      <SidebarRail />
    </Sidebar>
  )
}
