"use client"

import Image from "next/image"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Avatar, AvatarImage } from "./ui/avatar"
import { SearchIcon } from "lucide-react"
import { Sheet, SheetTrigger } from "./ui/sheet"
import SidebarSheet from "./sidebar-sheet"
import { Input } from "./ui/input"
import Link from "next/link"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import SignInDialog from "./sign-in-dialog"
import { useSession } from "next-auth/react"

const Header = () => {
  const { data } = useSession()

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5 lg:px-32 lg:py-9">
        <Link href="/">
          <Image alt="CNC Barber" src="/logo2.png" height={18} width={120} />
        </Link>

        {/* MENU LATERAL MOBILE */}
        <Sheet>
          <SheetTrigger />
          <SidebarSheet />
        </Sheet>

        {/* DESKTOP HEADER */}
        <div className="hidden md:flex items-center gap-2 w-full max-w-lg px-11">
          <Input placeholder="Faça sua busca..." />
          <Button>
            <SearchIcon />
          </Button>
        </div>

        <div className="hidden md:flex">
          <Link href="/bookings">
            <Button variant="ghost" className="hidden md:flex items-center gap-2">
              <Image src="/Calendar.svg" width={16} height={16} alt="Calendário" />
              <p>Agendamentos</p>
            </Button>
          </Link>

          {data?.user ? (
            <div className="flex items-center gap-2 pl-6">
              <Avatar className="w-9 h-9">
                <AvatarImage src={data?.user?.image ?? ""} />
              </Avatar>
                <p className="whitespace-nowrap">{data.user.name}</p>
            </div>
          ) : (
            <>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                  <Image alt="Usuário" src="/User.png" height={16} width={16} />
                    <p className="font-bold">Perfil</p>
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[90%]">
                  <SignInDialog />
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default Header
