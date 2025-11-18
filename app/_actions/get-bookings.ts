'use server'

import { endOfDay, startOfDay } from 'date-fns'
import { db } from '../_lib/prisma'

interface GetBookingsProps {
  serviceId: string
  date: Date
}

export const getBookings = ({ date, serviceId }: GetBookingsProps) => {
  return db.booking.findMany({
    where: {
      serviceId, // ✅ filtra por serviço correto
      date: {
        lte: endOfDay(date),
        gte: startOfDay(date),
      },
    },
    include: {
      barber: true, // ✅ inclui o barbeiro da reserva
      service: {
        include: {
          barbershop: true, // opcional, mas útil
        },
      },
    },
  })
}
