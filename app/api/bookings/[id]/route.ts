// app/api/bookings/[id]/route.ts
import { authOptions } from '@/app/_lib/auth'
import { getServerSession } from 'next-auth'
import { NextRequest } from 'next/server'
import { db } from '@/app/_lib/prisma'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const booking = await db.booking.findUnique({
      where: { id: params.id },
      include: { barber: true, user: true, service: true },
    })

    if (!booking) {
      return Response.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    const { role, id: userId } = session.user

    let allowed = false

    // O dono do agendamento sempre pode cancelar a própria reserva,
    // independente da role da conta (cobre admin/barbeiro testando/agendando para si mesmo)
    if (booking.userId === userId) {
      allowed = true
    } else if (role === 'ADMIN') {
      // Verifica se o agendamento pertence à barbearia do admin
      allowed = booking.service.barbershopId === session.user.barbershopId
    } else if (role === 'BARBER') {
      allowed = booking.barberId === userId
    }

    if (!allowed) {
      return Response.json({ error: 'Acesso negado' }, { status: 403 })
    }

    await db.booking.update({
      where: { id: params.id },
      data: { status: 'CANCELLED' },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error)
    return Response.json({ error: 'Erro ao cancelar' }, { status: 500 })
  }
}
