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
} from 'lucide-react'

const SidebarAdmin = () => {
  return (
    <Card className="hidden lg:flex flex-col justify-between border-r border-b w-1/5 h-screen">
      <CardContent className="flex flex-col gap-5 py-6">
        <Link href="/" className="flex-shrink-0">
          <Image
            alt="Connect Barber"
            src="/logo2.png"
            height={24}
            width={140}
          />
        </Link>

        <Button variant="ghost" className="gap-2 justify-start" asChild>
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

        <Button variant="ghost" className="gap-2  justify-start" asChild>
          <Link href="/dashboard/services">
            <Scissors size={18} />
            Serviços
          </Link>
        </Button>

        <Button variant="ghost" className="gap-2 justify-start">
          <User size={18} />
          Perfil
        </Button>
      </CardContent>

      <div className="border-t border-border p-6">
        <Button variant="ghost" className="justify-start  w-full gap-2">
          <LogOutIcon size={18} />
          Sair da Conta
        </Button>
      </div>
    </Card>
  )
}

export default SidebarAdmin
