'use server'

import { revalidatePath } from 'next/cache'
import { db } from '../_lib/prisma'

export async function createService(data: {
  name: string
  description: string
  price: number
  imageUrl: string
}) {
  // Busca a Barbearia Vintage
  const vintageBarbershop = await db.barbershop.findFirst({
    where: { name: 'Barbearia Vintage' },
  })

  if (!vintageBarbershop) {
    throw new Error('Barbearia Vintage não encontrada')
  }

  await db.barbershopService.create({
    data: {
      ...data,
      barbershop: {
        connect: {
          id: vintageBarbershop.id,
        },
      },
    },
  })

  revalidatePath('/dashboard/services')
}

export async function updateService(
  id: string,
  data: {
    name?: string
    description?: string
    price?: number
    imageUrl?: string
  }
) {
  await db.barbershopService.update({
    where: { id },
    data,
  })

  revalidatePath('/dashboard/services')
}

export async function deleteService(id: string) {
  await db.barbershopService.delete({
    where: { id },
  })

  revalidatePath('/dashboard/services')
}
