'use client'

import { Prisma } from '@prisma/client'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { format, isFuture } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from './ui/sheet'
import Image from 'next/image'
import PhoneItem from './phone-item'
import { Button } from './ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { deleteBooking } from '../_actions/delete-booking'
import { useState } from 'react'
import BookingSummary from './booking-summary'
import RatingDialog from './rating-dialog'
import { Clock2 } from 'lucide-react'

export interface BookingItemProps {
  booking: Prisma.BookingGetPayload<{
    include: {
      service: {
        include: {
          barbershop: true
        }
      }
      barber: true
    }
  }>
}

// TODO: receber agendamento como prop
const BookingItem = ({ booking }: BookingItemProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [successDialogIsOpen, setSuccessDialogIsOpen] = useState(false)
  const [errorDialogIsOpen, setErrorDialogIsOpen] = useState(false)

  const {
    service: { barbershop },
  } = booking
  const isConfirmed = isFuture(booking.date)
  const handleCancelBooking = async () => {
    try {
      await deleteBooking(booking.id)
      setIsSheetOpen(false)
      setSuccessDialogIsOpen(true)
    } catch (error) {
      console.error('Erro ao cancelar reserva:', error)
      setErrorDialogIsOpen(true)
    }
  }
  const handleSheetOpenChange = (isOpen: boolean) => {
    setIsSheetOpen(isOpen)
  }
  return (
    <>
      <Card
        className="min-w-[90%] cursor-pointer"
        onMouseDown={(e) => {
          e.currentTarget.dataset.downX = e.clientX.toString()
          e.currentTarget.dataset.downY = e.clientY.toString()
        }}
        onMouseUp={(e) => {
          const startX = parseFloat(e.currentTarget.dataset.downX || '0')
          const startY = parseFloat(e.currentTarget.dataset.downY || '0')
          const diffX = Math.abs(e.clientX - startX)
          const diffY = Math.abs(e.clientY - startY)
          const moveThreshold = 10 // tolerância em pixels

          if (diffX < moveThreshold && diffY < moveThreshold) {
            if (window.innerWidth < 1024 || window.location.pathname === '/') {
              setIsSheetOpen(true)
            }
          }
        }}
        onTouchStart={(e) => {
          const touch = e.touches[0]
          e.currentTarget.dataset.touchX = touch.clientX.toString()
          e.currentTarget.dataset.touchY = touch.clientY.toString()
        }}
        onTouchEnd={(e) => {
          const touch = e.changedTouches[0]
          const startX = parseFloat(e.currentTarget.dataset.touchX || '0')
          const startY = parseFloat(e.currentTarget.dataset.touchY || '0')
          const diffX = Math.abs(touch.clientX - startX)
          const diffY = Math.abs(touch.clientY - startY)
          const moveThreshold = 10

          if (diffX < moveThreshold && diffY < moveThreshold) {
            if (window.innerWidth < 1024 || window.location.pathname === '/') {
              setIsSheetOpen(true)
            }
          }
        }}
      >
        <CardContent className="flex justify-between p-0 items-stretch">
          {/* ESQUERDA */}
          <div className="flex flex-col gap-2 py-5 pl-5 items-start text-left flex-1">
            <div className="flex gap-2">
              <Badge
                className="w-fit"
                variant={isConfirmed ? 'default' : 'secondary'}
              >
                {isConfirmed ? 'Confirmado' : 'Finalizado'}
              </Badge>
              <p className="flex items-center gap-[2px] text-xs text-gray-400">
                <Clock2 width={18} height={18} />
                {booking.service.duration}min
              </p>
            </div>
            <h3 className="font-semibold">{booking.service.name}</h3>

            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={booking.service.barbershop.images[0]} />
                <AvatarFallback>
                  {booking.service.barbershop.name[0]}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm">{booking.service.barbershop.name}</p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={
                    booking.barber?.imageUrl ||
                    `https://ui-avatars.com/api/?name=${booking.barber?.name}&background=bc130d&color=fff`
                  }
                />
                <AvatarFallback>{booking.barber?.name?.[0]}</AvatarFallback>
              </Avatar>
              <p className="text-sm">{booking.barber?.name}</p>
            </div>
          </div>
          {/* DIREITA */}
          <div className=" flex-none w-28 flex flex-col items-center justify-center border-l-2 border-solid px-5">
            <p className="text-sm capitalize">
              {format(booking.date, 'MMMM', { locale: ptBR })}
            </p>
            <p className="text-2xl">
              {format(booking.date, 'dd', { locale: ptBR })}
            </p>
            <p className="text-sm">
              {format(booking.date, 'HH:mm', { locale: ptBR })}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="lg:hidden">
        <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
          <SheetContent className="w-[85%]">
            <SheetHeader>
              <SheetTitle className="text-left">
                Informações da Reserva
              </SheetTitle>
            </SheetHeader>

            <div className="relative flex h-[180px] w-full items-end mt-6">
              {barbershop.googleMaps ? (
                <iframe
                  src={barbershop.googleMaps}
                  className="w-full h-[200px] rounded-xl"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : (
                <Image
                  alt="Mapa"
                  src="/map.png"
                  fill
                  className="rounded-xl object-cover"
                />
              )}

              {/* <Card className="z-50 mx-5 mb-3 w-full rounded-xl">
                <CardContent className="flex px-5 py-3 items-center gap-3">
                  <Avatar>
                    <AvatarImage src={barbershop.imageUrl} />
                    <AvatarFallback>{barbershop.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold">{barbershop.name}</h3>
                    <p className="text-xs">{barbershop.address}</p>
                  </div>
                </CardContent>
              </Card>*/}
            </div>

            <div className="mt-6">
              <div className="flex gap-2">
                <Badge
                  className="w-fit"
                  variant={isConfirmed ? 'default' : 'secondary'}
                >
                  {isConfirmed ? 'Confirmado' : 'Finalizado'}
                </Badge>
                <p className="flex items-center gap-[2px] text-xs text-gray-400">
                  <Clock2 width={18} height={18} />
                  {booking.service.duration}min
                </p>
              </div>

              <div className="mb-3 mt-6">
                <BookingSummary
                  barbershop={barbershop}
                  service={booking.service}
                  selectedDate={booking.date}
                  barber={booking.barber!}
                />
              </div>

              <div className="space-y-3">
                {barbershop.phone.map((phone, index) => (
                  <PhoneItem key={index} phone={phone} />
                ))}
              </div>
            </div>
            <SheetFooter className="mt-6">
              <div className="flex items-center gap-3 w-full">
                <SheetClose asChild>
                  <Button variant="outline" className="w-full">
                    Voltar
                  </Button>
                </SheetClose>

                {isConfirmed ? (
                  <Dialog>
                    <DialogTrigger className="w-full">
                      <Button variant="destructive" className="w-full">
                        Cancelar reserva
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[90%] lg:w-[30%] rounded-lg">
                      <DialogHeader className="items-center">
                        <DialogTitle>
                          Você deseja cancelar sua reserva?
                        </DialogTitle>
                        <DialogDescription className="text-center">
                          Ao cancelar, você perderá sua reserva e não poderá
                          recuperá-la. Essa ação é irreversível.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="flex flex-row gap-3">
                        <DialogClose asChild>
                          <Button variant="secondary" className="w-full">
                            Voltar
                          </Button>
                        </DialogClose>
                        <DialogClose className="w-full">
                          <Button
                            variant="destructive"
                            className="w-full"
                            onClick={handleCancelBooking}
                          >
                            Confirmar
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <RatingDialog
                    bookingId={booking.id}
                    barbershopName={booking.service.barbershop.name}
                  />
                )}
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      {/* Dialog de sucesso */}
      <Dialog open={successDialogIsOpen} onOpenChange={setSuccessDialogIsOpen}>
        <DialogContent className="w-[90%] lg:w-[30%] text-center rounded-lg">
          <DialogHeader className="items-center">
            <Image alt="Check" src="/Vector.png" height={60} width={60} />
            <DialogTitle className="text-lg font-bold">
              Reserva cancelada com sucesso!
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Sua reserva foi cancelada com sucesso.
          </DialogDescription>

          <DialogFooter className="flex flex-col gap-2">
            <Button
              className="w-full"
              onClick={() => setSuccessDialogIsOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de erro */}
      <Dialog open={errorDialogIsOpen} onOpenChange={setErrorDialogIsOpen}>
        <DialogContent className="w-[90%] lg:w-[30%] text-center rounded-lg">
          <DialogHeader className="items-center">
            <Image alt="Erro" src="/Error.png" height={60} width={60} />
            <DialogTitle className="text-lg font-bold text-red-600">
              Erro ao cancelar reserva!
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Ocorreu um erro ao tentar cancelar sua reserva. Tente novamente em
            alguns instantes.
          </DialogDescription>

          <DialogFooter className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setErrorDialogIsOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default BookingItem
