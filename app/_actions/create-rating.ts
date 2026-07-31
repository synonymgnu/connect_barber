'use server'

import { db } from '../_lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../_lib/auth'

export async function createRating(
  bookingId: string,
  value: number,
  comment?: string
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error('Usuário não autenticado')

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { service: { include: { barbershop: true } }, ratings: true },
  })

  if (!booking) throw new Error('Agendamento não encontrado')

  if (booking.ratings) {
    throw new Error('Este agendamento já foi avaliado')
  }

  await db.rating.create({
    data: {
      value,
      comment,
      bookingId,
      userId: session.user.id,
      barbershopId: booking.service.barbershop.id,
    },
  })

  return { success: true }
}
