'use client'

import Image from 'next/image'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Avatar, AvatarImage } from './ui/avatar'
import { Sheet, SheetTrigger } from './ui/sheet'
import SidebarSheet from './sidebar-sheet'
import Link from 'next/link'

import SignInDialog from './sign-in-dialog'
import { useSession } from 'next-auth/react'
import Search from './search'

import { quickSearchOptions } from '../_constants/search'
import { LogOutIcon } from 'lucide-react'
import SignOutDialog from './sign-out-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'

interface HeaderProps {
  isHidden?: string
}

const Header = ({ isHidden }: HeaderProps) => {
  const { data } = useSession()

  return (
    <Card>
      <CardContent className="flex items-center justify-between py-7 lg:px-32">
        <Link href="/" className="flex-shrink-0">
          <Image
            alt="Connect Barber"
            src="/logo2.png"
            height={24}
            width={140}
          />
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
          {data?.user ? (
            <Link href="/bookings">
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
            </Link>
          ) : (
            <>
              <Dialog>
                <DialogTrigger asChild>
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
                </DialogTrigger>
                <DialogContent className="w-[90%]">
                  <SignInDialog />
                </DialogContent>
              </Dialog>
            </>
          )}

          {data?.user ? (
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={data?.user?.image ?? ''} />
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="mt-5" align="start">
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
                    {quickSearchOptions.map((service) => (
                      <DropdownMenuItem key={service.title}>
                        <div className="py-2 flex flex-col gap-2 border-b border-solid">
                          <Button
                            className="justify-start gap-2"
                            variant="ghost"
                            asChild
                          >
                            <Link
                              href={`/barbershops?service=${service.title}`}
                            >
                              <Image
                                alt={service.title}
                                src={service.imageUrl}
                                height={18}
                                width={18}
                              />
                              {service.title}
                            </Link>
                          </Button>
                        </div>
                      </DropdownMenuItem>
                    ))}
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
                      <DialogContent className="w-[30%]">
                        <SignOutDialog />
                      </DialogContent>
                    </Dialog>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <p className="whitespace-nowrap">{data.user.name}</p>
            </div>
          ) : (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Image
                      alt="Usuário"
                      src="/User.png"
                      height={16}
                      width={16}
                    />
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
