'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/_lib/auth'

import { db } from '../_lib/prisma'

export async function getServices() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) return []

  const barbershop = await db.barbershop.findFirst({
    where: {
      owner: {
        email: session.user.email,
      },
    },
  })

  if (!barbershop) return []

  return await db.barbershopService.findMany({
    where: {
      barbershopId: barbershop.id,
    },
    include: { barbershop: true },
    orderBy: { name: 'asc' },
  })
}
