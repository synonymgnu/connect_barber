'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/_lib/auth'
import { revalidatePath } from 'next/cache'
import { db } from '../_lib/prisma'
import { createAuditLog } from '../_lib/audit'

export async function deleteService(id: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    throw new Error('Usuário não autenticado')
  }

  const barbershop = await db.barbershop.findFirst({
    where: { ownerId: session.user.id },
  })

  if (!barbershop) {
    throw new Error('Barbearia do usuário não encontrada')
  }

  const service = await db.barbershopService.findUnique({
    where: { id },
  })

  if (!service) {
    throw new Error('Serviço não encontrado')
  }

  if (service.barbershopId !== barbershop.id) {
    throw new Error('Você não tem permissão para excluir este serviço')
  }

  await db.barbershopService.delete({
    where: { id },
  })

  await createAuditLog({
    userId: session.user.id,
    action: 'DELETE_SERVICE',
    resource: 'service',
    resourceId: id,
    ipAddress: 'server-action',
    userAgent: 'client-app',
    metadata: { name: service.name, barbershopId: barbershop.id }
  })

  revalidatePath('/dashboard/services')
}
