 import Image from "next/image"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Calendar1Icon, CalendarIcon, HomeIcon, LogOutIcon, MenuIcon } from "lucide-react"
import { Avatar, AvatarImage } from "./ui/avatar"
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet"
import { quickSearchOptions } from "../_constants/search"
import Link from "next/link"

const Header = () => {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5 lg:px-32 lg:py-9">
        <Image alt="CNC Barber" src="/logo2.png" height={18} width={120} />
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
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline">
          <MenuIcon />
        </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
      <SheetTitle className="text-left">Menu</SheetTitle>
    </SheetHeader>
          <div className="py-5 flex item-center border-b border-solid gap-3">
            <Avatar>
              <AvatarImage src={"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=880"}/>
            </Avatar>
            <div className="flex flex-col ml-3">
              <p className="font-bold">Felipe Dourado de Carvalho</p>
              <p className="text-xs">felipedourado@cncbarber.io</p>
            </div>
          </div>
          
          <div className="py-5 flex flex-col gap-2 border-b border-solid">
            <SheetClose asChild>
              <Button className="justify-start gap-2" variant="ghost" asChild>
              <Link href="/">
              <HomeIcon size={18} />
              Início
              </Link>
              </Button>
            </SheetClose>
            <Button className="justify-start gap-2" variant="ghost">
              <CalendarIcon size={18} />
              Agendamentos
              </Button>
          </div>

          <div className="py-5 flex flex-col gap-2 border-b border-solid">
            {quickSearchOptions.map((option) => 
            <Button 
            key={option.title}
            className="justify-start gap-2" 
            variant="ghost">
              <Image 
              alt={option.title}
              src={option.imageUrl} 
              height={18} 
              width={18} 
              />
              {option.title}
              </Button> )}
          </div>

          <div className="py-5 flex flex-col gap-2">
            <Button variant="ghost" className="justify-start gap-2">
              <LogOutIcon size={18}/>
              Sair da Conta
              </Button>
          </div>

          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  )
}

export default Header
