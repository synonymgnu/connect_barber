'use client'

import { Barbershop, BarbershopService, Booking } from '@prisma/client'
import Image from 'next/image'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from './ui/sheet'
import { Calendar } from './ui/calendar'
import { ptBR } from 'date-fns/locale'
import { useEffect, useMemo, useState } from 'react'
import { isPast, isToday, set } from 'date-fns'
import { createBooking } from '../_actions/create-booking'
import { useSession } from 'next-auth/react'
import { getBookings } from '../_actions/get-bookings'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import SignInDialog from './sign-in-dialog'
import BookingSummary from './booking-summary'
import { useRouter } from 'next/navigation'
import { Clock2 } from 'lucide-react'

interface ServiceItemProps {
  service: BarbershopService
  barbershop: Pick<Barbershop, 'name'>
}

const TIME_LIST = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
]

interface GetTimeListProps {
  bookings: Booking[]
  selectedDay: Date
}

const getTimeList = ({ bookings, selectedDay }: GetTimeListProps) => {
  // TODO: Não exibir horários no passado
  return TIME_LIST.filter((time) => {
    const hour = Number(time.split(':')[0])
    const minutes = Number(time.split(':')[1])

    const timeIsOnThePast = isPast(set(new Date(), { hours: hour, minutes }))
    if (timeIsOnThePast && isToday(selectedDay)) {
      return false
    }

    const hasBookingOnCurrentTime = bookings.some(
      (booking) =>
        booking.date.getHours() == hour && booking.date.getMinutes() == minutes
    )
    if (hasBookingOnCurrentTime) {
      return false
    }
    return true
  })
}

const ServiceItem = ({ service, barbershop }: ServiceItemProps) => {
  const { data } = useSession()
  const router = useRouter()

  const [SignInDialogIsOpen, setSignInDialogIsOpen] = useState(false)
  const [SuccessDialogIsOpen, setSuccessDialogIsOpen] = useState(false)
  const [ErrorDialogIsOpen, setErrorDialogIsOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined
  )
  const [dayBookings, setDayBookings] = useState<Booking[]>([])
  const [bookingSheetIsOpen, setBookingSheetIsOpen] = useState(false)

  useEffect(() => {
    if (!selectedDay) return
    const fetch = async () => {
      const bookings = await getBookings({
        date: selectedDay,
        serviceId: service.id,
      })
      setDayBookings(bookings)
    }
    fetch()
  }, [selectedDay, service.id])

  const selectedDate = useMemo(() => {
    if (!selectedDay || !selectedTime) return
    return set(selectedDay, {
      hours: Number(selectedTime?.split(':')[0]),
      minutes: Number(selectedTime?.split(':')[1]),
    })
  }, [selectedDay, selectedTime])

  const handleBookingClick = () => {
    if (data?.user) {
      return setBookingSheetIsOpen(true)
    }
    return setSignInDialogIsOpen(true)
  }

  const handleBookingSheetOpenChange = () => {
    setSelectedDay(undefined)
    setSelectedTime(undefined)
    setDayBookings([])
    setBookingSheetIsOpen(false)
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDay(date)
    setSelectedTime(undefined)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleCreateBooking = async () => {
    try {
      if (!selectedDate) return
      await createBooking({
        serviceId: service.id,
        date: selectedDate,
      })
      handleBookingSheetOpenChange()
      setSuccessDialogIsOpen(true)
    } catch (error) {
      console.error(error)
      setErrorDialogIsOpen(true)
    }
  }

  const timeList = useMemo(() => {
    if (!selectedDay) return []
    return getTimeList({
      bookings: dayBookings,
      selectedDay,
    })
  }, [dayBookings, selectedDay])

  return (
    <>
      <Card>
        <CardContent className="flex items-center gap-3 p-3">
          {/* IMAGE */}
          <div className="relative max-h-[110px] min-h-[110px] min-w-[80px] max-w-[80px]">
            <Image
              alt={service.name}
              src={service.imageUrl}
              fill
              className="object-cover rounded-lg "
            />
          </div>
          {/* DIREITA */}
          <div className="space-y-2 w-screen flex-1 min-w-0">
            <div className="marquee-container truncate">
              <span
                className={`marquee-text font-semibold text-sm lg:text-base ${
                  service.name.length > 20 ? 'marquee-long' : ''
                }`}
                title={service.name}
              >
                {service.name}
              </span>
            </div>
            <p className="text-sm text-gray-400 line-clamp-2 break-words">
              {service.description}
            </p>
            {/* PREÇO, DURAÇÃO E BOTÃO  */}
            <div className="flex items-center justify-between">
              <p className="font-bold text-sm text-primary">
                {Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(Number(service.price))}
              </p>
              <p className="flex items-center gap-[2px] text-xs text-gray-400">
                <Clock2 width={18} height={18} />
                {service.duration}min
              </p>

              <Sheet
                open={bookingSheetIsOpen}
                onOpenChange={handleBookingSheetOpenChange}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleBookingClick}
                >
                  Reservar
                </Button>

                <SheetContent className="px-0">
                  <SheetHeader>
                    <SheetTitle className="px-5">Fazer Reserva</SheetTitle>
                  </SheetHeader>

                  <div className="flex flex-col items-center  py-5 border-b border-solid">
                    <Calendar
                      mode="single"
                      locale={ptBR}
                      selected={selectedDay}
                      onSelect={handleDateSelect}
                      disabled={{ before: new Date() }}
                      styles={{
                        head_cell: {
                          width: '100%',
                          textTransform: 'capitalize',
                        },
                        cell: {
                          width: '100%',
                        },
                        button: {
                          width: '100%',
                        },
                        nav_button_previous: {
                          width: '32px',
                          height: '32px',
                        },
                        nav_button_next: {
                          width: '32px',
                          height: '32px',
                        },
                        caption: {
                          textTransform: 'capitalize',
                        },
                      }}
                    />
                  </div>

                  {selectedDay && (
                    <div
                      className="flex gap-3 border-b border-solid overflow-x-auto p-5 [&::-webkit-scrollbar]:hidden select-none"
                      onMouseDown={(e) => {
                        const container = e.currentTarget
                        let startX = e.pageX - container.offsetLeft
                        let scrollLeft = container.scrollLeft
                        let isDragging = true

                        const handleMouseMove = (event: MouseEvent) => {
                          if (!isDragging) return
                          event.preventDefault()
                          const x = event.pageX - container.offsetLeft
                          const walk = (x - startX) * 1.2
                          container.scrollLeft = scrollLeft - walk
                        }

                        const handleMouseUp = () => {
                          isDragging = false
                          window.removeEventListener(
                            'mousemove',
                            handleMouseMove
                          )
                          window.removeEventListener('mouseup', handleMouseUp)
                        }

                        window.addEventListener('mousemove', handleMouseMove)
                        window.addEventListener('mouseup', handleMouseUp)
                      }}
                    >
                      {timeList.length > 0 ? (
                        timeList.map((time) => (
                          <Button
                            key={time}
                            variant={
                              selectedTime == time ? 'default' : 'outline'
                            }
                            className="rounded-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleTimeSelect(time)
                            }}
                          >
                            {time}
                          </Button>
                        ))
                      ) : (
                        <p className="text-xs">
                          Não há horários disponíveis para este dia.
                        </p>
                      )}
                    </div>
                  )}

                  {selectedDate && (
                    <div className="p-5">
                      <BookingSummary
                        barbershop={barbershop}
                        service={service}
                        selectedDate={selectedDate}
                      />
                    </div>
                  )}
                  <SheetFooter className="mt-5 px-5">
                    <SheetClose asChild>
                      <Button
                        className="w-full"
                        onClick={handleCreateBooking}
                        disabled={!selectedDay || !selectedTime}
                      >
                        Confirmar
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={SignInDialogIsOpen}
        onOpenChange={(open) => setSignInDialogIsOpen(open)}
      >
        <DialogContent className="w-[90%] lg:w-[30%] rounded-lg">
          <SignInDialog />
        </DialogContent>
      </Dialog>

      {/* Dialog de sucesso */}
      <Dialog open={SuccessDialogIsOpen} onOpenChange={setSuccessDialogIsOpen}>
        <DialogContent className="w-[90%] lg:w-[30%] rounded-lg text-center">
          <DialogHeader className="items-center">
            <Image alt="Check" src="/Vector.png" height={60} width={60} />
            <DialogTitle className="text-lg font-bold text-center">
              Reserva Efetuada!
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Sua reserva foi agendada com sucesso.
          </DialogDescription>
          <DialogFooter className="flex flex-col gap-2">
            <Button
              className="w-full"
              onClick={() => {
                setSuccessDialogIsOpen(false)
                router.push('/bookings')
              }}
            >
              Ver agendamentos
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSuccessDialogIsOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de erro */}
      <Dialog open={ErrorDialogIsOpen} onOpenChange={setErrorDialogIsOpen}>
        <DialogContent className="w-[90%] lg:w-[30%] text-center rounded-lg">
          <DialogHeader className="items-center">
            <Image alt="Erro" src="/Error.png" height={60} width={60} />
            <DialogTitle className="text-lg font-bold text-red-600 text-center">
              Erro ao criar reserva!
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Ocorreu um erro ao tentar registrar sua reserva. Tente novamente em
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

export default ServiceItem
