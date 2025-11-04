'use client'

import { useState } from 'react'
import BookingItem from './booking-item'
import BookingInfo from './booking-info'

interface BookingsClientProps {
  confirmedBookings: any[]
  concludedBookings: any[]
}

export default function BookingsClient({
  confirmedBookings,
  concludedBookings,
}: BookingsClientProps) {
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null)

  const handleBookingCanceled = () => {
    setSelectedBooking(null)
  }

  const totalBookings = confirmedBookings.length + concludedBookings.length
  const remainingSlots = Math.max(0, 10 - confirmedBookings.length)

  const limitedConfirmed = confirmedBookings.slice(0, 10)
  const limitedConcluded =
    confirmedBookings.length >= 10
      ? []
      : concludedBookings.slice(0, remainingSlots)

  return (
    <div className="md:flex md:gap-10">
      <div className="flex-1 space-y-3">
        {limitedConfirmed.length > 0 && (
          <>
            <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
              Confirmados
            </h2>

            {limitedConfirmed.map((booking) => (
              <div
                key={booking.id}
                onClick={() => setSelectedBooking(booking)}
                className="cursor-pointer"
              >
                <BookingItem booking={booking} />
              </div>
            ))}
          </>
        )}

        {limitedConcluded.length > 0 && (
          <>
            <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
              Finalizados
            </h2>
            {limitedConcluded.map((booking) => (
              <div
                key={booking.id}
                onClick={() => setSelectedBooking(booking)}
                className="cursor-pointer"
              >
                <BookingItem booking={booking} />
              </div>
            ))}
          </>
        )}
      </div>

      {/* Renderiza o BookingInfo apenas no desktop */}
      <div className="hidden md:block md:w-[400px]">
        {selectedBooking ? (
          <BookingInfo
            booking={selectedBooking}
            onBookingCanceled={handleBookingCanceled}
          />
        ) : (
          <p className="text-gray-400 mt-10">
            Selecione um agendamento para ver os detalhes.
          </p>
        )}
      </div>
    </div>
  )
}
