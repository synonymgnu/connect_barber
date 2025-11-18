'use server'

import { revalidatePath } from 'next/cache'
import { db } from '../_lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../_lib/auth'

interface CreateBookingParams {
  serviceId: string
  date: Date
  barberId: string
}

export const createBooking = async (params: CreateBookingParams) => {
  const user = await getServerSession(authOptions)
  if (!user) {
    throw new Error('Usuário não autenticado!')
  }
  await db.booking.create({
    data: {
      serviceId: params.serviceId,
      date: params.date,
      barberId: params.barberId || null,
      userId: (user.user as any).id,
    },
  })
  revalidatePath('/barbershops/[id]')
  revalidatePath('/bookings')
}
