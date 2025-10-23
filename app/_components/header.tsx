"use client"

import Image from "next/image"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Avatar, AvatarImage } from "./ui/avatar"
import { Sheet, SheetTrigger } from "./ui/sheet"
import SidebarSheet from "./sidebar-sheet"
import Link from "next/link"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import SignInDialog from "./sign-in-dialog"
import { useSession } from "next-auth/react"
import Search from "./search"

interface HeaderProps {
  isHidden?: string
}

const Header = ({ isHidden }: HeaderProps) => {
  const { data } = useSession()

  return (
    <Card>
      <CardContent className="flex items-center justify-between py-7 lg:px-32">
        <Link href="/" className="flex-shrink-0">
          <Image alt="Connect Barber" src="/logo2.png" height={24} width={140} />
        </Link>

        {/* MENU LATERAL MOBILE */}
        <Sheet>
          <SheetTrigger />
          <SidebarSheet />
        </Sheet>

        {/* DESKTOP HEADER */}
        <div className={`hidden ${isHidden} items-center w-full  mx-11`}>
          <Search />
        </div>

        <div className="hidden md:flex gap-6">
          <Link href="/bookings">
            <Button variant="ghost" className="hidden md:flex items-center gap-2">
              <Image src="/Calendar.svg" width={16} height={16} alt="Calendário" />
              <p>Agendamentos</p>
            </Button>
          </Link>

          {data?.user ? (
            <div className="flex items-center gap-2">
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
