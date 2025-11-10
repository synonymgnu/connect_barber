'use server'

import { db } from '../_lib/prisma'

export async function getServices() {
  const services = await db.barbershopService.findMany({
    where: {
      barbershop: {
        name: 'Barbearia Vintage', // ✅ mostra apenas os serviços dessa barbearia
      },
    },
    include: {
      barbershop: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

  return services
}
