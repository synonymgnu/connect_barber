import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/_lib/auth'
import { db } from '@/app/_lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'BARBER') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const barber = await db.barber.findFirst({
      where: { userId: session.user.id }
    })

    if (!barber) {
      return NextResponse.json({ error: 'Barbeiro não encontrado' }, { status: 404 })
    }

    const absences = await db.barberAbsence.findMany({
      where: {
        barberId: barber.id
      },
      orderBy: { date: 'asc' }
    })

    const formattedAbsences = absences.map(absence => ({
      id: absence.id,
      date: absence.date,
      reason: absence.reason,
      isAllDay: absence.isAllDay,
      barberId: absence.barberId,
      barberName: barber.name,
      type: 'BARBER_ABSENCE'
    }))

    return NextResponse.json(formattedAbsences)
  } catch (error) {
    console.error('Error fetching barber absences:', error)
    return NextResponse.json({ error: 'Erro ao carregar ausências' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'BARBER') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const barber = await db.barber.findFirst({
      where: { userId: session.user.id }
    })

    if (!barber) {
      return NextResponse.json({ error: 'Barbeiro não encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const { date, reason, isAllDay } = body

    if (!date) {
      return NextResponse.json({ 
        error: 'Data é obrigatória'
      }, { status: 400 })
    }

    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json({ 
        error: 'Data inválida'
      }, { status: 400 })
    }

    const absence = await db.barberAbsence.create({
      data: {
        barberId: barber.id,
        date: dateObj.toISOString(),
        type: 'BARBER_ABSENCE',
        reason: reason?.trim() || null,
        isAllDay: Boolean(isAllDay)
      }
    })

    return NextResponse.json({
      id: absence.id,
      date: absence.date,
      reason: absence.reason,
      isAllDay: absence.isAllDay,
      barberId: absence.barberId,
      barberName: barber.name,
      type: 'BARBER_ABSENCE'
    })
  } catch (error) {
    console.error('Error creating barber absence:', error)
    return NextResponse.json({ error: 'Erro ao registrar ausência' }, { status: 500 })
  }
}