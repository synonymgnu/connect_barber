'use server'

import { db } from '@/app/_lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/_lib/auth' // ajuste para o caminho real do seu authOptions
import { revalidatePath } from 'next/cache'

export async function toggleFavoriteBarber(barberId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error('Você precisa estar logado para favoritar um barbeiro.')
  }

  const userId = session.user.id

  const existing = await db.favoriteBarber.findUnique({
    where: {
      userId_barberId: {
        userId,
        barberId,
      },
    },
  })

  if (existing) {
    await db.favoriteBarber.delete({
      where: { id: existing.id },
    })
  } else {
    await db.favoriteBarber.create({
      data: { userId, barberId },
    })
  }

  revalidatePath('/favorites')

  return { favorited: !existing }
}
