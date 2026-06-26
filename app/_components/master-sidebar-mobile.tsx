'use client'

import {
  Bell,
  ChevronUp,
  CircleUserRound,
  Home,
  LogOutIcon,
  PanelLeft,
  Plus,
  ReceiptText,
  Store,
  UserCog,
} from 'lucide-react'

import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Avatar, AvatarImage } from './ui/avatar'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import SignOutDialog from './sign-out-dialog'
import SignInDialog from './sign-in-dialog'
import { Button } from './ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet'

const MasterSidebarMobile = () => {
  const { data } = useSession()

  const menuItems = [
    { label: 'Início', href: '/', icon: Home },
    { label: 'Barbearias', href: '/master/barbershops', icon: Store },
    { label: 'Nova Barbearia', href: '/master/barbershops/new', icon: Plus },
  ]

  return (
    <div className="lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <PanelLeft />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 flex flex-col h-full">
          <SheetHeader className="flex flex-row p-[9px] gap-2">
            <SheetTitle className="flex items-center gap-2 overflow-hidden">
              <Image
                alt="Connect Barber"
                src="/logo3.png"
                height={30}
                width={30}
              />
              <h1 className="font-bold text-lg tracking-tight">
                Connect Barber
              </h1>
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto  flex flex-col gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon

              return (
                <SheetClose asChild key={item.href}>
                  <Button
                    className="justify-start gap-2 px-4 py-2 rounded-md"
                    variant="ghost"
                    asChild
                  >
                    <Link href={item.href}>
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  </Button>
                </SheetClose>
              )
            })}
          </div>
          <div className="border-t p-2">
            {data?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="gap-2" variant="ghost">
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={data?.user?.image ?? ''} />
                    </Avatar>
                    <span className="truncate">
                      {data?.user?.name || 'Username'}
                    </span>
                    <ChevronUp className="ml-auto" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" className="w-full">
                  <DropdownMenuLabel>
                    <div className="p-2  flex gap-2 border-b border-solid">
                      <Avatar>
                        <AvatarImage src={data?.user?.image ?? ''} />
                      </Avatar>
                      <div className="flex flex-col ml-3">
                        <p className="font-bold">{data.user.name}</p>
                        <p className="text-xs">{data.user.email}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <Button
                        className="justify-start px-2 w-full"
                        variant="ghost"
                        asChild
                      >
                        <Link href="/account">
                          <UserCog size={18} /> Minha conta
                        </Link>
                      </Button>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Button
                        className="justify-start px-2 w-full"
                        variant="ghost"
                        asChild
                      >
                        <Link href="/notifications">
                          <Bell /> Notificações
                        </Link>
                      </Button>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Button
                        className="justify-start px-2 w-full"
                        variant="ghost"
                        asChild
                      >
                        <Link href="/consent">
                          <ReceiptText size={18} />
                          Termos e Condições
                        </Link>
                      </Button>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <div className="py-5 flex flex-col gap-2 items-start">
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
                      <DialogContent className="w-[90%]">
                        <SignOutDialog />
                      </DialogContent>
                    </Dialog>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Dialog>
                  <DialogTrigger className="flex" asChild>
                    <Button variant="ghost">
                      <CircleUserRound className="w-4 h-4" />
                      Perfil
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[90%]">
                    <SignInDialog />
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default MasterSidebarMobile
