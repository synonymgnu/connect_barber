import { getServerSession } from 'next-auth'
import Header from '../_components/header'
import { authOptions } from '../_lib/auth'
import { notFound } from 'next/navigation'
import BookingItem from '../_components/booking-item'
import { getConfirmedBookings } from '../_data/get-confirmed-bookings'
import { getConcludedBookings } from '../_data/get-concluded-bookings'
import { Card, CardContent } from '../_components/ui/card'
import Image from 'next/image'
import { Avatar, AvatarImage } from '../_components/ui/avatar'
import { Badge } from '../_components/ui/badge'
import PhoneItem from '../_components/phone-item'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../_components/ui/dialog'
import { Button } from '../_components/ui/button'
import BookingInfo from '../_components/booking-info'
import BookingsClient from '../_components/bookings-client'

const Bookings = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    //TODO: mostrar pop-up de login
    return notFound()
  }
  const confirmedBookings = await getConfirmedBookings()

  const concludedBookings = await getConcludedBookings()

  const totalBookings = confirmedBookings.length + concludedBookings.length
  const remainingSlots = Math.max(0, 10 - confirmedBookings.length)

  const limitedConfirmed = confirmedBookings.slice(0, 10)
  const limitedConcluded =
    confirmedBookings.length >= 10
      ? [] // já atingiu o limite com confirmados
      : concludedBookings.slice(0, remainingSlots)

  return (
    <>
      <Header isHidden="md:flex" />
      <div className=" space-y-3 px-5 pt-5 lg:pt-10 lg:px-64">
        <h1 className="font-bold text-xl md:text-2xl md:mb-2">Agendamentos</h1>
        {confirmedBookings.length == 0 && concludedBookings.length == 0 && (
          <p className="text-gray-400">Você não tem agendamentos.</p>
        )}
        <div className="md:flex md:gap-10">
          <div className="flex-1 space-y-3">
            {confirmedBookings.length === 0 &&
            concludedBookings.length === 0 ? (
              ''
            ) : (
              <BookingsClient
                confirmedBookings={confirmedBookings}
                concludedBookings={concludedBookings}
              />
            )}

            {totalBookings > 10 && (
              <p className="text-gray-400 text-xs mt-2">
                Exibindo apenas os 10 agendamentos mais recentes.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Bookings
