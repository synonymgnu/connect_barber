'use client'

import Image from 'next/image'
import { Card, CardContent } from './ui/card'
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
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import BookingSummary from './booking-summary'
import RatingDialog from './rating-dialog'
import { FeedbackDialog } from './feedback-dialog'
import { Clock2 } from 'lucide-react'

interface BookingInfoProps extends BookingItemProps {
  onBookingCanceled?: () => void
}

const BookingInfo = ({ booking, onBookingCanceled }: BookingInfoProps) => {
  const [successDialogIsOpen, setSuccessDialogIsOpen] = useState(false)
  const [errorDialogIsOpen, setErrorDialogIsOpen] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    service: { barbershop },
  } = booking
  const isConfirmed = isFuture(booking.date) && booking.status !== 'CANCELLED'
  const handleCancelBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      router.refresh()
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'metrics'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'recent-stats'] })
      setSuccessDialogIsOpen(true)
    } catch (error) {
      console.error(error)
      setErrorDialogIsOpen(true)
    }
  }

  return (
    <Card className="hidden lg:block mt-[51px] self-start w-[380px]">
      <CardContent>
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

          {/*<Card className="z-50 mx-5 mb-3 w-full rounded-xl">
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
          </Card> */}
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
              barber={booking.barber}
            />
          </div>
        </div>
        {isConfirmed ? (
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

                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleCancelBooking}
                >
                  Confirmar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <RatingDialog
            bookingId={booking.id}
            barbershopName={booking.service.barbershop.name}
          />
        )}

        {/* Sucesso */}
        <FeedbackDialog
          open={successDialogIsOpen}
          onOpenChange={(open) => {
            setSuccessDialogIsOpen(open)
            if (!open) {
              // quando o dialog fechar → avisa o parent
              onBookingCanceled?.()
            }
          }}
          type="success"
          title="Reserva cancelada com sucesso!"
          description="Sua reserva foi cancelada com sucesso."
        />

        {/* Erro */}
        <FeedbackDialog
          open={errorDialogIsOpen}
          onOpenChange={setErrorDialogIsOpen}
          type="error"
          title="Erro ao cancelar reserva!"
          description=" Ocorreu um erro ao tentar cancelar sua reserva. Tente novamente em
              alguns instantes."
        />
      </CardContent>
    </Card>
  )
}

export default BookingInfo
