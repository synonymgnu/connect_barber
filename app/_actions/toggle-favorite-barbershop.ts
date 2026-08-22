'use server'

import { db } from '@/app/_lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/_lib/auth' // ajuste para o caminho real do seu authOptions
import { revalidatePath } from 'next/cache'

export async function toggleFavoriteBarbershop(barbershopId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error('Você precisa estar logado para favoritar uma barbearia.')
  }

  const userId = session.user.id

  const existing = await db.favoriteBarbershop.findUnique({
    where: {
      userId_barbershopId: {
        userId,
        barbershopId,
      },
    },
  })

  if (existing) {
    await db.favoriteBarbershop.delete({
      where: { id: existing.id },
    })
  } else {
    await db.favoriteBarbershop.create({
      data: { userId, barbershopId },
    })
  }

  revalidatePath('/favorites')
  revalidatePath(`/barbershops/${barbershopId}`)

  return { favorited: !existing }
}
