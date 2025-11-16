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
            absences: {
              orderBy: { date: 'asc' }
            }
          }
        }
      }
    })

    if (!barbershop || barbershop.barbers.length === 0) {
      return NextResponse.json([])
    }

    // Retorna as ausências do primeiro barbeiro
    const absences = barbershop.barbers[0].absences
    return NextResponse.json(absences)
  } catch (error) {
    console.error('Error fetching absences:', error)
    return NextResponse.json({ error: 'Erro ao carregar ausências' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.barbershopId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { date, reason, isAllDay } = await request.json()
    
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

    const absence = await db.barberAbsence.create({
      data: {
        barberId: barber.id,
        date: new Date(date),
        reason,
        isAllDay
      }
    })

    return NextResponse.json(absence)
  } catch (error) {
    console.error('Error creating absence:', error)
    return NextResponse.json({ error: 'Erro ao criar ausência' }, { status: 500 })
  }
}