import Image from "next/image"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Avatar, AvatarImage } from "./ui/avatar"
import { MenuIcon, SearchIcon } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import SidebarSheet from "./sidebar-sheet"
import { Input } from "./ui/input"
import Link from "next/link"

const Header = () => {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5 lg:px-32 lg:py-9">
        <Link href="/">
        <Image alt="CNC Barber" src="/logo2.png" height={18} width={120} />
        </Link>
        
        

        {/* Mantém apenas o menu lateral com SidebarSheet */}
        <Sheet>
          <SheetTrigger>
          </SheetTrigger>
          <SidebarSheet />
        </Sheet>
       
        {/* DESKTOP HEADER */}
         <div className="hidden md:flex items-center gap-2  w-full max-w-lg px-11">
          <Input className="" placeholder="Faça sua busca..." />
          <Button>
            <SearchIcon></SearchIcon>
          </Button>
        </div>
        <div className="hidden md:flex">
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
            <p className="whitespace-nowrap">Felipe Dourado de Carvalho</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default Header
