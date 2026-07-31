'use client'

import { motion } from 'framer-motion'
import {
  Calendar,
  ChevronUp,
  X,
  LogOutIcon,
  Bell,
  UserCog,
  Home,
  Clock,
  BarChart3,
  Star,
  CircleUserRound,
  ReceiptText,
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
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { useSession } from 'next-auth/react'
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import SignOutDialog from '../sign-out-dialog'
import SignInDialog from '../sign-in-dialog'
import Link from 'next/link'

interface BarberSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

const NAV_ITEMS = [
  { id: 'calendar', label: 'Agenda', icon: Calendar },
  { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
  { id: 'reviews', label: 'Avaliações', icon: Star },
  { id: 'schedule', label: 'Horários', icon: Clock },
]

export function BarberSidebar({ activeSection, onSectionChange }: BarberSidebarProps) {
  const { data } = useSession()
  const { open, setOpen } = useSidebar()
  const [hover, setHover] = useState(false)

  return (
    <Sidebar
      collapsible="icon"
      className="border-r bg-card shadow-sm text-card-foreground"
      onMouseEnter={() => !open && setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <motion.div
        animate={{ width: open ? 240 : 72 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="overflow-hidden h-full flex flex-col"
      >
        {open && (
          <button
            onClick={() => setOpen(false)}
            className="absolute right-3 top-3 md:hidden p-1 rounded-md hover:bg-muted transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <SidebarHeader className={`p-[9px] transition-all duration-200 ${open ? 'border-border' : 'border-transparent'}`}>
          <button onClick={() => setOpen(!open)} className="flex items-center gap-2 overflow-hidden">
            <Image alt="Connect Barber" src="/logo3.png" height={30} width={30} />
            <motion.div
              animate={{ opacity: open ? 1 : 0, width: open ? 'auto' : 0 }}
              transition={{ duration: 0.15, ease: 'easeInOut' }}
              className="whitespace-nowrap"
            >
              {open && <h1 className="font-bold text-lg tracking-tight">Connect Barber</h1>}
            </motion.div>
          </button>
        </SidebarHeader>

        <SidebarContent className="flex-1">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon
                  const active = activeSection === item.id
                  return (
                    <SidebarMenuItem key={item.id} className="relative group">
                      <Tooltip open={!open ? undefined : false}>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton isActive={active} onClick={() => onSectionChange(item.id)}>
                            <div className="flex items-center gap-3 px-3 py-2 rounded-md transition hover:bg-muted relative w-full">
                              <Icon className="w-5 h-5" />
                              {(open || hover) && (
                                <span className="font-medium text-sm">{item.label}</span>
                              )}
                            </div>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        {!open && (
                          <TooltipContent side="right" align="center" sideOffset={10}>
                            <p>{item.label}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </SidebarMenuItem>
                  )
                })}
                <SidebarMenuItem>
                  <Tooltip open={!open ? undefined : false}>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton asChild>
                        <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md transition hover:bg-muted">
                          <Home className="w-5 h-5" />
                          {(open || hover) && <span className="font-medium text-sm">Início</span>}
                        </Link>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    {!open && (
                      <TooltipContent side="right" align="center" sideOffset={10}>
                        <p>Início</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className={`transition-all duration-200 ${open ? 'border-t border-border' : 'border-none'}`}>
          <SidebarMenu>
            <SidebarMenuItem>
              {data?.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="gap-2">
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={data?.user?.image ?? ''} />
                      </Avatar>
                      <span className="truncate">{data?.user?.name || 'Username'}</span>
                      <ChevronUp className="ml-auto" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="top" className="w-full">
                    <DropdownMenuLabel>
                      <div className="p-2 flex gap-2 border-b border-solid">
                        <Avatar>
                          <AvatarImage src={data?.user?.image ?? ''} />
                        </Avatar>
                        <div className="flex flex-col ml-3">
                          <p className="font-bold">{data.user.name}</p>
                          <p className="text-xs">{data.user.email}</p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <Button className="justify-start px-2 w-full" variant="ghost" asChild>
                          <Link href="/account"><UserCog size={18} /> Minha conta</Link>
                        </Button>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Button className="justify-start px-2 w-full" variant="ghost" asChild>
                          <Link href="/notifications"><Bell /> Notificações</Link>
                        </Button>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Button className="justify-start px-2 w-full" variant="ghost" asChild>
                          <Link href="/consent"><ReceiptText size={18} /> Termos e Condições</Link>
                        </Button>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <div className="py-5 flex flex-col gap-2 items-start">
                      <Dialog>
                        <DialogTrigger className="w-full">
                          <Button variant="ghost" className="gap-2 justify-start w-full text-left">
                            <LogOutIcon size={18} /> Sair da Conta
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
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </motion.div>
      <SidebarRail />
    </Sidebar>
  )
}
