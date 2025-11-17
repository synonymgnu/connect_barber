'use server'

import { revalidatePath } from 'next/cache'
import { db } from '../_lib/prisma'

type UpdateServiceData = {
  name?: string
  description?: string
  price?: number | string
  imageUrl?: string
  duration?: number // <-- ADICIONAR AQUI
  barbershopId?: string
  barbershop?: any
  id?: string
}

export async function updateService(id: string, data: UpdateServiceData) {
  const price = typeof data.price === 'string' ? Number(data.price) : data.price

  // limpar campos que não podem ir pro banco
  const { barbershopId, barbershop, id: ignoredId, ...safeData } = data
  void barbershopId
  void barbershop
  void ignoredId

  await db.barbershopService.update({
    where: { id },
    data: {
      ...safeData,
      ...(price !== undefined ? { price } : {}),
      ...(data.duration !== undefined ? { duration: data.duration } : {}), // OK
    },
  })

  revalidatePath('/dashboard/services')
}
