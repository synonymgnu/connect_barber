'use client'

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet'
import { quickSearchOptions } from '../_constants/search'
import Link from 'next/link'
import {
  CalendarIcon,
  HomeIcon,
  LogInIcon,
  LogOutIcon,
  MenuIcon,
  Bell,
  UserCog,
  ReceiptText,
} from 'lucide-react'
import { Button } from './ui/button'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { useSession } from 'next-auth/react'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import SignInDialog from './sign-in-dialog'
import SignOutDialog from './sign-out-dialog'
import { useEffect, useState } from 'react'
import { Badge } from './ui/badge'

const SidebarSheet = () => {
  const { data } = useSession()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!data?.user) return

    const loadUnreadCount = async () => {
      try {
        const res = await fetch('/api/notifications')
        if (res.ok) {
          const notifData = await res.json()
          setUnreadCount(notifData.unreadCount)
        }
      } catch (error) {
        console.error('Erro ao carregar notificações:', error)
      }
    }

    loadUnreadCount()
    const interval = setInterval(loadUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [data])

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="md:hidden" size="icon" variant="outline">
          <MenuIcon />
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>
        <div className="py-5 flex item-center justify-between border-b border-solid gap-3">
          {data?.user ? (
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={data?.user?.image ?? ''} />
                <AvatarFallback>
                  {data.user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col ml-3">
                <p className="font-bold">{data.user.name}</p>
                <p className="text-xs">{data.user.email}</p>
              </div>
            </div>
          ) : (
            <>
              <h2 className="font-bold">Olá, faça seu login!</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="icon">
                    <LogInIcon />
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[90%] rounded-lg">
                  <SignInDialog />
                </DialogContent>
              </Dialog>
            </>
          )}
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
          {data?.user ? (
            <>
              {data.user.role === 'MASTER' && (
                <SheetClose asChild>
                  <Button className="justify-start" variant="ghost" asChild>
                    <Link href="/master/barbershops">
                      <CalendarIcon size={18} />
                      Dashboard Master
                    </Link>
                  </Button>
                </SheetClose>
              )}
              <Button className="justify-start" variant="ghost" asChild>
                <Link href="/account">
                  <UserCog size={18} /> Minha conta
                </Link>
              </Button>

              <SheetClose asChild>
                <Button className="justify-start gap-2" variant="ghost" asChild>
                  <Link href="/bookings">
                    <CalendarIcon size={18} />
                    Agendamentos
                  </Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button className="justify-start gap-2" variant="ghost" asChild>
                  <Link href="/notifications">
                    <div className="relative">
                      <Bell size={18} />
                      {unreadCount > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-xs">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                      )}
                    </div>
                    Notificações
                  </Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button className="justify-start" variant="ghost" asChild>
                  <Link href="/consent">
                    <ReceiptText size={18} />
                    Termos e Condições
                  </Link>
                </Button>
              </SheetClose>
              {data.user.role === 'BARBER' && (
                <SheetClose asChild>
                  <Button
                    className="justify-start gap-2"
                    variant="ghost"
                    asChild
                  >
                    <Link href="/barber/schedule">
                      <CalendarIcon size={18} />
                      Minha Agenda
                    </Link>
                  </Button>
                </SheetClose>
              )}
              {data.user.role === 'ADMIN' && (
                <SheetClose asChild>
                  <Button
                    className="justify-start gap-2"
                    variant="ghost"
                    asChild
                  >
                    <Link href="/dashboard">
                      <CalendarIcon size={18} />
                      Dashboard Admin
                    </Link>
                  </Button>
                </SheetClose>
              )}
            </>
          ) : (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="justify-start gap-2" variant="ghost">
                    <CalendarIcon size={18} />
                    Agendamentos
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[90%] rounded-lg">
                  <SignInDialog callbackUrl="/bookings" />
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>

        <div className="py-5 flex flex-col gap-2 border-b border-solid">
          {quickSearchOptions.map((option) => (
            <SheetClose key={option.title} asChild>
              <Button className="justify-start gap-2" variant="ghost" asChild>
                <Link href={`/barbershops?service=${option.title}`}>
                  <Image
                    alt={option.title}
                    src={option.imageUrl}
                    height={18}
                    width={18}
                  />
                  {option.title}
                </Link>
              </Button>
            </SheetClose>
          ))}
        </div>

        {data?.user && (
          <div className="py-5 flex flex-col gap-2">
            <Dialog>
              <DialogTrigger className="w-full">
                <Button
                  variant="ghost"
                  className="gap-2 justify-start w-full text-left"
                >
                  <LogOutIcon size={18} />
                  Sair da Conta
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[90%] rounded-lg">
                <SignOutDialog />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default SidebarSheet
