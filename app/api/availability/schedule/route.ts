import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/_lib/auth'
import { db } from '@/app/_lib/prisma'

// GET /api/availability/schedule?type=shop
// GET /api/availability/schedule?type=barber&barberId=xxx
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.barbershopId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') ?? 'shop'
    const barberId = searchParams.get('barberId')

    if (type === 'barber') {
      if (!barberId) {
        return NextResponse.json({ error: 'barberId obrigatório' }, { status: 400 })
      }

      const barber = await db.barber.findFirst({
        where: { id: barberId, barbershopId: session.user.barbershopId },
      })
      if (!barber) {
        return NextResponse.json({ error: 'Barbeiro não encontrado' }, { status: 404 })
      }

      const schedules = await db.barberWorkSchedule.findMany({
        where: { barberId },
        orderBy: { dayOfWeek: 'asc' },
      })
      return NextResponse.json(schedules)
    }

    // type === 'shop'
    const hours = await db.barbershopHours.findMany({
      where: { barbershopId: session.user.barbershopId },
      orderBy: { dayOfWeek: 'asc' },
    })
    return NextResponse.json(hours)
  } catch (error) {
    console.error('Error fetching schedule:', error)
    return NextResponse.json({ error: 'Erro ao carregar horários' }, { status: 500 })
  }
}

// POST /api/availability/schedule
// body: { type: 'shop' | 'barber', barberId?: string, schedules: WorkSchedule[] }
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.barbershopId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { type = 'shop', barberId, schedules } = await request.json()

    if (!Array.isArray(schedules)) {
      return NextResponse.json({ error: 'schedules inválido' }, { status: 400 })
    }

    // Validação startTime < endTime
    for (const s of schedules) {
      if (s.isActive && s.startTime >= s.endTime) {
        return NextResponse.json(
          { error: `Horário inválido no dia ${s.dayOfWeek}: início deve ser antes do fim` },
          { status: 400 }
        )
      }
    }

    if (type === 'barber') {
      if (!barberId) {
        return NextResponse.json({ error: 'barberId obrigatório' }, { status: 400 })
      }

      const barber = await db.barber.findFirst({
        where: { id: barberId, barbershopId: session.user.barbershopId },
      })
      if (!barber) {
        return NextResponse.json({ error: 'Barbeiro não encontrado' }, { status: 404 })
      }

      await db.$transaction(async (tx) => {
        await tx.barberWorkSchedule.deleteMany({ where: { barberId } })
        await Promise.all(
          schedules.map((s: any) =>
            tx.barberWorkSchedule.create({
              data: {
                barberId,
                dayOfWeek: s.dayOfWeek,
                startTime: s.startTime,
                endTime: s.endTime,
                isActive: s.isActive,
              },
            })
          )
        )
      })

      return NextResponse.json({ success: true })
    }

    // type === 'shop'
    const barbershopId = session.user.barbershopId

    await db.$transaction(async (tx) => {
      await tx.barbershopHours.deleteMany({ where: { barbershopId } })
      await Promise.all(
        schedules.map((s: any) =>
          tx.barbershopHours.create({
            data: {
              barbershopId,
              dayOfWeek: s.dayOfWeek,
              startTime: s.startTime,
              endTime: s.endTime,
              isActive: s.isActive,
            },
          })
        )
      )
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving schedule:', error)
    return NextResponse.json({ error: 'Erro ao salvar horários' }, { status: 500 })
  }
}
