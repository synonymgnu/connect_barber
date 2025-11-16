import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/_lib/auth'
import { db } from '@/app/_lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.barbershopId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const barbershop = await db.barbershop.findUnique({
      where: { id: session.user.barbershopId },
      include: {
        barbers: {
          include: {
            workSchedule: true
            }
        }
      }
    })

    if (!barbershop || barbershop.barbers.length === 0) {
      return NextResponse.json([])
    }

    // Retorna o horário do primeiro barbeiro (padrão da barbearia)
    // Você pode adaptar para múltiplos barbeiros depois
    const schedules = barbershop.barbers[0].workSchedule
    return NextResponse.json(schedules)
  } catch (error) {
    console.error('Error fetching work schedule:', error)
    return NextResponse.json({ error: 'Erro ao carregar horários' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.barbershopId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { schedules } = await request.json()
    
    const barbershop = await db.barbershop.findUnique({
      where: { id: session.user.barbershopId },
      include: {
        barbers: true
      }
    })

    if (!barbershop || barbershop.barbers.length === 0) {
      return NextResponse.json({ error: 'Nenhum barbeiro encontrado' }, { status: 404 })
    }

    const barber = barbershop.barbers[0]

    // Deleta horários existentes e cria novos
    await db.barberWorkSchedule.deleteMany({
      where: { barberId: barber.id }
    })

    const createPromises = schedules
      .filter((s: any) => s.isActive)
      .map((schedule: any) => 
        db.barberWorkSchedule.create({
          data: {
            barberId: barber.id,
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            isActive: schedule.isActive
          }
        })
      )

    await Promise.all(createPromises)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving work schedule:', error)
    return NextResponse.json({ error: 'Erro ao salvar horários' }, { status: 500 })
  }
}