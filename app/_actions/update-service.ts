'use server'

import { revalidatePath } from 'next/cache'
import { db } from '../_lib/prisma'

type UpdateServiceData = {
  name?: string
  description?: string
  price?: number | string
  imageUrl?: string
  barbershopId?: string
  barbershop?: any // Pode vir do client, mas será ignorado
  id?: string // Pode vir do client, mas será ignorado
}

export async function updateService(id: string, data: UpdateServiceData) {
  // Converte preço se vier como string
  const price = typeof data.price === 'string' ? Number(data.price) : data.price

  // Remove campos não permitidos antes de enviar ao Prisma
  const { barbershopId, barbershop, id: ignoredId, ...safeData } = data
  void barbershopId
  void barbershop
  void ignoredId

  await db.barbershopService.update({
    where: { id },
    data: {
      ...safeData,
      ...(price != undefined ? { price } : {}),
    },
  })

  revalidatePath('/dashboard/services')
}
