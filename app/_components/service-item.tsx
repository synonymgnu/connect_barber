'use client'

import { Barbershop, BarbershopService } from '@prisma/client'
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
import { Clock2, StarIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

interface ServiceItemProps {
  service: BarbershopService
  barbershop: Pick<Barbershop, 'id' | 'name'>
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
  const [bookingSheetIsOpen, setBookingSheetIsOpen] = useState(false)

  const [selectedBarber, setSelectedBarber] = useState<any>(null)
  const [barbers, setBarbers] = useState<any[]>([])
  const [availability, setAvailability] = useState<any>(null)
  const [timeSlots, setTimeSlots] = useState<string[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const [barbersRes, availabilityRes] = await Promise.all([
        fetch(`/api/barbers/active?barbershopId=${barbershop.id}`),
        fetch(`/api/barbershop/${barbershop.id}/availability`),
      ])

      const barbersData = await barbersRes.json()
      const availabilityData = await availabilityRes.json()

      setBarbers(barbersData)
      setAvailability(availabilityData)
    }
    fetchData()
  }, [])

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
    setSelectedBarber(null)
    setTimeSlots([])
    setBookingSheetIsOpen(false)
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDay(date)
    setSelectedTime(undefined)
    setSelectedBarber(null)
    setTimeSlots([])
  }

  const toLocalDateStr = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  const isDateDisabled = (date: Date) => {
    if (!availability) return false

    const dateStr = toLocalDateStr(date)
    const isClosure = availability.shopClosures?.some((closure: any) => {
      const closureDate = toLocalDateStr(new Date(closure.date))
      return closureDate === dateStr
    })
    if (isClosure) return true

    if (availability.shopSchedule?.length > 0) {
      const dayOfWeek = date.getDay()
      const hasSchedule = availability.shopSchedule.some(
        (s: any) => s.dayOfWeek === dayOfWeek
      )
      if (!hasSchedule) return true
    }

    return false
  }

  const getAvailableBarbers = () => {
    if (!selectedDay || !availability) return barbers

    const dateStr = toLocalDateStr(selectedDay)
    const dayOfWeek = selectedDay.getDay()

    return barbers.filter((barber: any) => {
      const barberData = availability.barbers.find(
        (b: any) => b.id === barber.id
      )
      if (!barberData) return true

      const hasAbsence = barberData.absences?.some((absence: any) => {
        const absenceDate = toLocalDateStr(new Date(absence.date))
        return absenceDate === dateStr
      })

      if (hasAbsence) return false

      if (barberData.workSchedule?.length === 0) return true

      const hasSchedule = barberData.workSchedule?.some(
        (schedule: any) => schedule.dayOfWeek === dayOfWeek && schedule.isActive
      )

      return hasSchedule
    })
  }

  const fetchBarberSlots = async (barber: any, day: Date) => {
    const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
    const now = new Date().toISOString()
    const res = await fetch(
      `/api/barbers/${barber.id}/slots?date=${dateStr}&duration=${service.duration}&now=${encodeURIComponent(now)}`
    )
    const slots = await res.json()
    setTimeSlots(Array.isArray(slots) ? slots : [])
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleCreateBooking = async () => {
    try {
      if (!selectedDate || !selectedBarber) return
      await createBooking({
        serviceId: service.id,
        barberId: selectedBarber.id,
        date: selectedDate,
      })
      handleBookingSheetOpenChange()
      setSuccessDialogIsOpen(true)
    } catch (error) {
      console.error(error)
      setErrorDialogIsOpen(true)
    }
  }

  const timeList = timeSlots

  return (
    <>
      <Card>
        <CardContent className="flex items-center gap-3 p-3">
          {/* IMAGE */}
          <div className="relative max-h-[110px] min-h-[110px] min-w-[110px] max-w-[110px]">
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
              <div className="flex gap-2">
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
              </div>

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

                <SheetContent className="px-0 p-0">
                  <div className="overflow-y-auto max-h-[80vh] pb-6">
                    <SheetHeader>
                      <SheetTitle className="px-5">Fazer Reserva</SheetTitle>
                    </SheetHeader>

                    <div className="flex flex-col items-center   border-b border-solid">
                      <Calendar
                        mode="single"
                        locale={ptBR}
                        selected={selectedDay}
                        onSelect={handleDateSelect}
                        disabled={(date) =>
                          (isPast(date) && !isToday(date)) ||
                          isDateDisabled(date)
                        }
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

                    {/*  MOSTRAR BARBEIROS SÓ APÓS SELECIONAR O DIA */}
                    {selectedDay && (
                      <div className="border-b p-5 space-y-3 transition-all">
                        <p className="font-medium text-sm">
                          Selecione o barbeiro(a):
                        </p>

                        <div
                          className="flex gap-3 overflow-x-auto p-5 [&::-webkit-scrollbar]:hidden select-none"
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
                              window.removeEventListener(
                                'mouseup',
                                handleMouseUp
                              )
                            }

                            window.addEventListener(
                              'mousemove',
                              handleMouseMove
                            )
                            window.addEventListener('mouseup', handleMouseUp)
                          }}
                        >
                          {getAvailableBarbers().length > 0 ? (
                            getAvailableBarbers().map((barber) => (
                              <button
                                key={barber.id}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedBarber(barber)
                                  setSelectedTime(undefined)
                                  if (selectedDay) fetchBarberSlots(barber, selectedDay)
                                }}
                                className={`flex flex-col items-center p-3 rounded-xl border min-w-[100px] transition-all ${
                                  selectedBarber?.id === barber.id
                                    ? 'border-primary text-white'
                                    : 'border-muted '
                                }`}
                              >
                                <Avatar className="h-12 w-12">
                                  <AvatarImage
                                    src={
                                      barber.imageUrl ||
                                      `https://ui-avatars.com/api/?name=${barber.name}&background=bc130d&color=fff`
                                    }
                                  />
                                  <AvatarFallback>
                                    {barber.name[0].toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>

                                <span className="text-xs mt-2 font-medium">
                                  {barber.name}
                                </span>

                                {barber.averageRating !== null ? (
                                  <span className="flex items-center gap-[2px] text-xs">
                                    <StarIcon
                                      className="text-primary fill-primary"
                                      size={20}
                                    />
                                    {barber.averageRating.toFixed(1)}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-gray-500">
                                    Sem avaliações
                                  </span>
                                )}
                              </button>
                            ))
                          ) : (
                            <p className="text-sm text-gray-400 px-5">
                              Nenhum barbeiro disponível neste dia.
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedDay && selectedBarber && (
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
                          barber={selectedBarber}
                        />
                      </div>
                    )}
                  </div>
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
