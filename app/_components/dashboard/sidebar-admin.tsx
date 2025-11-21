'use client'

import Link from 'next/link'
import { Button } from '../ui/button'
import {
  CalendarIcon,
  LayoutDashboard,
  MenuIcon,
  Scissors,
  User,
  Bell,
  FileText,
} from 'lucide-react'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet'
import { useEffect, useState } from 'react'
import { Badge } from '../ui/badge'

const SidebarAdmin = () => {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const res = await fetch("/api/notifications")
        if (res.ok) {
          const data = await res.json()
          setUnreadCount(data.unreadCount)
        }
      } catch (error) {
        console.error("Erro ao carregar notificações:", error)
      }
    }
    
    loadUnreadCount()
    const interval = setInterval(loadUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="md:hidden" size="icon" variant="outline">
          <MenuIcon />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>
        <div className="py-5 flex flex-col gap-2 border-b border-solid">
          <SheetClose asChild>
            <Button variant="ghost" className="justify-start" asChild>
              <Link href="/dashboard">
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
            </Button>
          </SheetClose>

          <SheetClose asChild>
            <Button variant="ghost" className="justify-start" asChild>
              <Link href="/dashboard/calendar">
                <CalendarIcon size={18} />
                Agenda
              </Link>
            </Button>
          </SheetClose>

          <SheetClose asChild>
            <Button variant="ghost" className="justify-start" asChild>
              <Link href="/dashboard/services">
                <Scissors size={18} />
                Serviços
              </Link>
            </Button>
          </SheetClose>

          <SheetClose asChild>
            <Button variant="ghost" className="justify-start" asChild>
              <Link href="/notifications">
                <div className="relative">
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-xs">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                </div>
                Notificações
              </Link>
            </Button>
          </SheetClose>

          <SheetClose asChild>
            <Button variant="ghost" className="justify-start" asChild>
              <Link href="/audit-logs">
                <FileText size={18} />
                Logs de Auditoria
              </Link>
            </Button>
          </SheetClose>

          <SheetClose asChild>
            <Button variant="ghost" className="justify-start" asChild>
              <Link href="/dashboard/profile">
                <User size={18} />
                Perfil
              </Link>
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default SidebarAdmin
