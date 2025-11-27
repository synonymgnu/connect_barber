'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/_lib/auth'

import { revalidatePath } from 'next/cache'
import { db } from '../_lib/prisma'

export async function deleteService(id: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    throw new Error('Usuário não autenticado')
  }

  // 1. Obtém a barbearia do usuário
  const barbershop = await db.barbershop.findFirst({
    where: { ownerId: session.user.id },
  })

  if (!barbershop) {
    throw new Error('Barbearia do usuário não encontrada')
  }

  // 2. Busca o serviço para validar
  const service = await db.barbershopService.findUnique({
    where: { id },
  })

  if (!service) {
    throw new Error('Serviço não encontrado')
  }

  // 3. Garante que pertence ao dono
  if (service.barbershopId !== barbershop.id) {
    throw new Error('Você não tem permissão para excluir este serviço')
  }

  // 4. Excluir
  await db.barbershopService.delete({
    where: { id },
  })

  revalidatePath('/dashboard/services')
}
