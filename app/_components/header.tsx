import Image from "next/image"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Avatar, AvatarImage } from "./ui/avatar"
import { MenuIcon } from "lucide-react"
import { Sheet, SheetTrigger } from "./ui/sheet"
import SidebarSheet from "./sidebar-sheet"

const Header = () => {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5 lg:px-32 lg:py-9">
        <Image alt="CNC Barber" src="/logo2.png" height={18} width={120} />

        {/* Mantém apenas o menu lateral com SidebarSheet */}
        <Sheet>
          <SheetTrigger>
          </SheetTrigger>
          <SidebarSheet />
        </Sheet>

        <div className="flex">
          <Button
            variant="ghost"
            className="hidden md:flex items-center gap-2"
          >
            <Image
              src="/Calendar.svg"
              width={16}
              height={16}
              alt="Calendário"
            />
            <p>Agendamentos</p>
          </Button>

          <div className="flex items-center gap-2 pl-6">
            <Avatar className="h-9 w-9 hidden md:block">
              <AvatarImage src="/user-img.svg" />
            </Avatar>
            <p className="hidden md:block">Felipe Dourado de Carvalho</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default Header
