// app/api/bookings/route.ts
import { authOptions } from '@/app/_lib/auth'
import { NextRequest } from 'next/server'
import { db } from '@/app/_lib/prisma'
import { getServerSession } from 'next-auth'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const startStr = searchParams.get('start')
  const endStr = searchParams.get('end')

  if (!startStr || !endStr) {
    return Response.json(
      { error: 'Parâmetros start/end obrigatórios' },
      { status: 400 }
    )
  }

  const start = new Date(startStr)
  const end = new Date(endStr)

  try {
    let bookings

    if (session.user.role === 'ADMIN') {
      bookings = await db.booking.findMany({
        where: {
          service: {
            barbershopId: session.user.barbershopId || undefined,
          },
          date: {
            gte: start,
            lte: end,
          },
        },
        include: {
          user: { select: { name: true, email: true } },
          service: { select: { name: true, duration: true } },
          barber: { select: { name: true } },
        },
      })
    } else if (session.user.role === 'BARBER') {
      bookings = await db.booking.findMany({
        where: {
          barberId: session.user.id,
          date: {
            gte: start,
            lte: end,
          },
        },
        include: {
          user: { select: { name: true } },
          service: { select: { name: true, duration: true } },
        },
      })
    } else {
      // Cliente
      bookings = await db.booking.findMany({
        where: {
          userId: session.user.id,
          date: {
            gte: start,
            lte: end,
          },
        },
        include: {
          service: { select: { name: true, duration: true } },
          barber: { select: { name: true } },
        },
      })
    }

    return Response.json(bookings)
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error)
    return Response.json(
      { error: 'Erro ao carregar agendamentos' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'BARBER') {
    return Response.json({ error: 'Acesso negado' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { date, customerId, serviceId, duration } = body

    if (!date || !customerId || !serviceId) {
      return Response.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    const existing = await db.booking.findFirst({
      where: {
        barberId: session.user.id,
        date: new Date(date),
      },
    })
    if (existing) {
      return Response.json({ error: 'Horário já ocupado' }, { status: 409 })
    }

    const booking = await db.booking.create({
      data: {
        date: new Date(date),
        duration: duration || 30,
        status: 'CONFIRMED',
        source: 'ONLINE',
        userId: customerId,
        serviceId,
        barberId: session.user.id,
        employee: session.user.name,
      },
    })

    return Response.json(booking, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar agendamento:', error)
    return Response.json(
      { error: 'Erro ao criar agendamento' },
      { status: 500 }
    )
  }
}
