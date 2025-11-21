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
  LogOutIcon,
  Bell,
  UserCog,
  CircleUserRound,
  Home,
  Clock,
  BarChart3,
  FileText,
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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import { useSession } from 'next-auth/react'
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import SignOutDialog from '../sign-out-dialog'
import SignInDialog from '../sign-in-dialog'

export function AdminSidebar() {
  const { data } = useSession()

  const pathname = usePathname()
  const { open, setOpen } = useSidebar()
  const [hover, setHover] = useState(false)

  const menuItems = [
    { label: 'Início', href: '/', icon: Home },
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Agenda', href: '/dashboard/calendar', icon: Calendar },
    { label: 'Serviços', href: '/dashboard/services', icon: Scissors },
    { label: 'Equipe', href: '/dashboard/barbers', icon: Users },
    { label: 'Disponibilidade', href: '/dashboard/availability', icon: Clock },
    { label: 'Relatórios', href: '/dashboard/reports', icon: BarChart3 },
    { label: 'Logs de Auditoria', href: '/audit-logs', icon: FileText },
    { label: 'Barbearia', href: '/dashboard/settings', icon: Store },
  ]

  return (
    <Sidebar
      collapsible="icon"
      className="border-r bg-card shadow-sm text-card-foreground"
      onMouseEnter={() => !open && setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <motion.div
        animate={{
          width: open ? 240 : 72,
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
          className={`p-[9px] transition-all duration-200 ${
            open ? 'border-border' : 'border-transparent'
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
                              {(open || hover) && (
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
              {data?.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="gap-2">
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={data?.user?.image ?? ''} />
                      </Avatar>
                      <span className="truncate">
                        {data?.user?.name || 'Username'}
                      </span>
                      <ChevronUp className="ml-auto" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="top" className="w-full">
                    <DropdownMenuLabel>
                      <div className="p-2  flex gap-2 border-b border-solid">
                        <Avatar>
                          <AvatarImage src={data?.user?.image ?? ''} />
                        </Avatar>
                        <div className="flex flex-col ml-3">
                          <p className="font-bold">{data.user.name}</p>
                          <p className="text-xs">{data.user.email}</p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuGroup className="p-2">
                      <DropdownMenuItem>
                        <UserCog /> Minha conta
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Bell /> Notificações
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <div className="py-5 flex flex-col gap-2 items-start">
                      <Dialog>
                        <DialogTrigger className="w-full">
                          <Button
                            variant="ghost"
                            className="gap-2 justify-start w-full text-left"
                          >
                            <LogOutIcon size={18} />
                            Sair da Conta
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[30%]">
                          <SignOutDialog />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Dialog>
                    <DialogTrigger className="flex" asChild>
                      <SidebarMenuButton>
                        <CircleUserRound className="w-4 h-4" />
                        Perfil
                      </SidebarMenuButton>
                    </DialogTrigger>
                    <DialogContent className="w-[30%]">
                      <SignInDialog />
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </motion.div>

      <SidebarRail />
    </Sidebar>
  )
}
