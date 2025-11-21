'use client'

import Link from 'next/link'
import { Card, CardContent } from '../ui/card'
import Image from 'next/image'
import { Button } from '../ui/button'
import {
  CalendarIcon,
  LayoutDashboard,
  LogOutIcon,
  Scissors,
  User,
  Bell,
  FileText,
} from 'lucide-react'
import { Sheet, SheetTrigger } from '../ui/sheet'
import { Avatar, AvatarImage } from '../ui/avatar'
import SidebarAdmin from './sidebar-admin'
import { NotificationsDropdown } from '../notifications-dropdown'

const HeaderAdmin = () => {
  return (
    <Card className="flex flex-col lg:justify-between lg:border-r lg:border-b lg:w-1/5 lg:h-screen">
      {/* HEADER MOBILE */}
      <CardContent className="flex items-center justify-between py-6 px-4 lg:hidden">
        {/* MENU MOBILE */}
        <div className="flex items-center">
          <Sheet>
            <SheetTrigger />
            <SidebarAdmin />
          </Sheet>
        </div>
        <Avatar className="w-9 h-9">
          <AvatarImage src="/user-img.svg" />
        </Avatar>
      </CardContent>

      {/* SIDEBAR DESKTOP */}
      <CardContent className="hidden lg:flex flex-col gap-5 py-6">
        <Link href="/dashboard" className="flex-shrink-0">
          <Image
            alt="Connect Barber"
            src="/logo2.png"
            height={24}
            width={140}
          />
        </Link>

        <Button variant="ghost" className="gap-2 justify-start mt-5" asChild>
          <Link href="/dashboard">
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
        </Button>

        <Button variant="ghost" className="gap-2 justify-start" asChild>
          <Link href="/dashboard/calendar">
            <CalendarIcon size={18} />
            Agenda
          </Link>
        </Button>

        <Button variant="ghost" className="gap-2 justify-start" asChild>
          <Link href="/dashboard/services">
            <Scissors size={18} />
            Serviços
          </Link>
        </Button>

        <Button variant="ghost" className="gap-2 justify-start" asChild>
          <Link href="/notifications">
            <Bell size={18} />
            Notificações
          </Link>
        </Button>

        <Button variant="ghost" className="gap-2 justify-start" asChild>
          <Link href="/audit-logs">
            <FileText size={18} />
            Logs de Auditoria
          </Link>
        </Button>

        <Button variant="ghost" className="gap-2 justify-start" asChild>
          <Link href="/dashboard/profile">
            <User size={18} />
            Perfil
          </Link>
        </Button>
      </CardContent>

      <div className="border-t border-border p-6 hidden lg:flex">
        <Button variant="ghost" className="justify-start  w-full gap-2">
          <LogOutIcon size={18} />
          Sair da Conta
        </Button>
      </div>
    </Card>
  )
}

export default HeaderAdmin
