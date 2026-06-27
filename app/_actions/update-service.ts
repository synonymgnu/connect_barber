'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/_lib/auth'
import { revalidatePath } from 'next/cache'
import { db } from '../_lib/prisma'
import { createAuditLog } from '../_lib/audit'

type UpdateServiceData = {
  name?: string
  description?: string
  price?: number | string
  imageUrl?: string
  duration?: number
  barbershopId?: string
  barbershop?: any
  id?: string
}

export async function updateService(id: string, data: UpdateServiceData) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    throw new Error('Usuário não autenticado')
  }

  const price = typeof data.price === 'string' ? Number(data.price) : data.price

  const { barbershopId, barbershop, id: ignoredId, ...safeData } = data
  void barbershopId
  void barbershop
  void ignoredId

  await db.barbershopService.update({
    where: { id },
    data: {
      ...safeData,
      ...(price !== undefined ? { price } : {}),
      ...(data.duration !== undefined ? { duration: data.duration } : {}),
    },
  })

  await createAuditLog({
    userId: session.user.id,
    action: 'UPDATE_SERVICE',
    resource: 'service',
    resourceId: id,
    ipAddress: 'server-action',
    userAgent: 'client-app',
    metadata: { name: data.name, price }
  })

  revalidatePath('/dashboard/services')
}
