'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/_lib/auth'
import { revalidatePath } from 'next/cache'
import { db } from '../_lib/prisma'
import { createAuditLog } from '../_lib/audit'

export async function createService(data: {
  name: string
  description: string
  price: number | string
  imageUrl: string
  duration: number
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    throw new Error('Usuário não autenticado')
  }

  const price = typeof data.price === 'string' ? Number(data.price) : data.price

  const barbershop = await db.barbershop.findFirst({
    where: { ownerId: session.user.id },
  })

  if (!barbershop) {
    throw new Error('Barbearia não encontrada para este usuário')
  }

  const service = await db.barbershopService.create({
    data: {
      name: data.name,
      description: data.description,
      price,
      imageUrl: data.imageUrl,
      duration: data.duration,
      barbershopId: barbershop.id,
    },
  })

  await createAuditLog({
    userId: session.user.id,
    action: 'CREATE_SERVICE',
    resource: 'service',
    resourceId: service.id,
    ipAddress: 'server-action',
    userAgent: 'client-app',
    metadata: { name: data.name, price, barbershopId: barbershop.id }
  })

  revalidatePath('/dashboard/services')
}
