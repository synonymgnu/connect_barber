import { db } from '@/app/_lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/_lib/auth'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const userId = session.user.id
  const role = session.user.role

  // 🔥 Se for ADMIN → excluir barbearia e tudo relacionado
  if (role === 'ADMIN') {
    const barbershop = await db.barbershop.findFirst({
      where: { ownerId: userId },
    })

    if (barbershop) {
      // Exclui ratings
      await db.rating.deleteMany({
        where: { barbershopId: barbershop.id },
      })

      // Exclui bookings vinculados aos serviços da barbearia
      await db.booking.deleteMany({
        where: {
          service: {
            barbershopId: barbershop.id,
          },
        },
      })

      // Exclui serviços
      await db.barbershopService.deleteMany({
        where: { barbershopId: barbershop.id },
      })

      // 🔥 Desativar barbeiros antes de excluir
      const barbers = await db.barber.findMany({
        where: { barbershopId: barbershop.id },
      })

      for (const barber of barbers) {
        await db.user.update({
          where: { id: barber.userId },
          data: { role: 'CLIENT' }, // 🔥 volta a ser cliente
        })
      }

      // Excluir barbeiros
      await db.barber.deleteMany({
        where: { barbershopId: barbershop.id },
      })

      // Por fim excluir a barbearia
      await db.barbershop.delete({
        where: { id: barbershop.id },
      })
    }
  }

  // 🔥 Se o usuário é um barbeiro (não admin)
  if (role === 'BARBER') {
    const barber = await db.barber.findUnique({
      where: { userId },
    })

    if (barber) {
      // Excluir bookings do barbeiro
      await db.booking.deleteMany({
        where: { barberId: barber.id },
      })

      // Excluir o próprio registro de barbeiro
      await db.barber.delete({
        where: { id: barber.id },
      })
    }
  }

  // Excluir avaliações feitas pelo usuário
  await db.rating.deleteMany({
    where: { userId },
  })

  // Excluir bookings feitos pelo usuário
  await db.booking.deleteMany({
    where: { userId },
  })

  // Finalmente excluir o usuário
  await db.user.delete({
    where: { id: userId },
  })

  return NextResponse.json({ ok: true })
}
