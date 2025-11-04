'use client'

import Image from 'next/image'
import { Card, CardContent } from './ui/card'
import { Avatar, AvatarImage } from './ui/avatar'
import PhoneItem from './phone-item'
import { Badge } from './ui/badge'
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
import { Button } from './ui/button'
import { BookingItemProps } from './booking-item'
import { isFuture } from 'date-fns'
import { deleteBooking } from '../_actions/delete-booking'
import { useState } from 'react'
import BookingSummary from './booking-summary'

interface BookingInfoProps extends BookingItemProps {
  onBookingCanceled?: () => void
}

const BookingInfo = ({ booking, onBookingCanceled }: BookingInfoProps) => {
  const [successDialogIsOpen, setSuccessDialogIsOpen] = useState(false)
  const [errorDialogIsOpen, setErrorDialogIsOpen] = useState(false)

  const {
    service: { barbershop },
  } = booking
  const isConfirmed = isFuture(booking.date)
  const handleCancelBooking = async () => {
    try {
      await deleteBooking(booking.id)
      setSuccessDialogIsOpen(true)
      onBookingCanceled?.()
    } catch (error) {
      console.error(error)
      setErrorDialogIsOpen(true)
    }
  }

  return (
    <Card className="hidden lg:block mt-14 self-start w-[380px]">
      <CardContent>
        <div className="relative flex h-[180px] w-full items-end mt-6">
          <Image
            alt={`Mapa da barbearia ${booking.service.barbershop.name}`}
            src="map.png"
            fill
            className="object-cover rounded-xl"
          />

          <Card className="z-50 mx-5 mb-3 w-full rounded-xl">
            <CardContent className="flex px-5 py-3 items-center gap-3">
              <Avatar>
                <AvatarImage src={barbershop.imageUrl} />
              </Avatar>
              <div>
                <h3 className="font-bold">{barbershop.name}</h3>
                <p className="text-xs">{barbershop.address}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <h2 className="font-bold uppercase text-sm mb-2.5 mt-5">Sobre nós</h2>
        <p className="text-sm text-zinc-300 text-justify border-b pb-5">
          {barbershop.description}
        </p>

        <div className="space-y-3 mt-5">
          {barbershop.phone.map((phone, index) => (
            <PhoneItem key={index} phone={phone} />
          ))}
        </div>

        <div className="mt-6">
          <Badge
            className="w-fit"
            variant={isConfirmed ? 'default' : 'secondary'}
          >
            {isConfirmed ? 'Confirmado' : 'Finalizado'}
          </Badge>

          <div className="mb-3 mt-6">
            <BookingSummary
              barbershop={barbershop}
              service={booking.service}
              selectedDate={booking.date}
            />
          </div>
        </div>
        {isConfirmed && (
          <Dialog>
            <DialogTrigger className="w-full">
              <Button variant="destructive" className="w-full">
                Cancelar reserva
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[90%] lg:w-[30%] rounded-lg">
              <DialogHeader className="items-center">
                <DialogTitle>Você deseja cancelar sua reserva?</DialogTitle>
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
        )}
        {/* Dialog de sucesso */}
        <Dialog
          open={successDialogIsOpen}
          onOpenChange={setSuccessDialogIsOpen}
        >
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
      </CardContent>
    </Card>
  )
}

export default BookingInfo
