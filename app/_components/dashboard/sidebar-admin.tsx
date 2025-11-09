import Link from 'next/link'
import { Button } from '../ui/button'
import {
  CalendarIcon,
  LayoutDashboard,
  MenuIcon,
  Scissors,
  User,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet'

const SidebarAdmin = () => {
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
          <Button variant="ghost" className="justify-start" asChild>
            <Link href="/dashboard">
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
          </Button>

          <Button variant="ghost" className="justify-start" asChild>
            <Link href="/dashboard/calendar">
              <CalendarIcon size={18} />
              Agenda
            </Link>
          </Button>

          <Button variant="ghost" className="justify-start" asChild>
            <Link href="/dashboard/services">
              <Scissors size={18} />
              Serviços
            </Link>
          </Button>

          <Button variant="ghost" className="justify-start">
            <User size={18} />
            Perfil
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default SidebarAdmin
