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

    const absences = await db.barberAbsence.findMany({
      where: {
        OR: [
          {
            barber: {
              barbershopId: session.user.barbershopId
            }
          },
          {
            barberId: null,
          }
        ]
      },
      include: {
        barber: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { date: 'asc' }
    })

    const formattedAbsences = absences.map(absence => ({
      id: absence.id,
      date: absence.date,
      reason: absence.reason,
      isAllDay: absence.isAllDay,
      barberId: absence.barberId,
      barberName: absence.barber?.name || null,
      type: absence.barberId ? 'BARBER_ABSENCE' : 'SHOP_CLOSURE'
    }))

    return NextResponse.json(formattedAbsences)
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

    const body = await request.json()

    const { date, barberId, type, reason, isAllDay } = body

    if (!date || !type) {
      return NextResponse.json({ 
        error: 'Dados incompletos',
        details: 'Campos obrigatórios: date, type'
      }, { status: 400 })
    }

    if (type === 'BARBER_ABSENCE') {
      if (!barberId) {
        return NextResponse.json({ 
          error: 'Barbeiro não selecionado',
          details: 'Para ausência de barbeiro, selecione um barbeiro'
        }, { status: 400 })
      }

      const barber = await db.barber.findFirst({
        where: {
          id: barberId,
          barbershopId: session.user.barbershopId
        }
      })

      if (!barber) {
        console.error('Barbeiro não encontrado ou não pertence à barbearia:', barberId)
        return NextResponse.json({ error: 'Barbeiro não encontrado' }, { status: 404 })
      }
    }

    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json({ 
        error: 'Data inválida',
        details: `Não foi possível converter ${date} para uma data válida`
      }, { status: 400 })
    }

    const absence = await db.barberAbsence.create({
      data: {
        barberId: type === 'BARBER_ABSENCE' ? barberId : null,
        date: dateObj.toISOString(),
        type,
        reason: reason?.trim() || null,
        isAllDay: Boolean(isAllDay)
      },
      include: {
        barber: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    console.log('Ausência criada com sucesso:', absence.id)

    return NextResponse.json({
      id: absence.id,
      date: absence.date,
      reason: absence.reason,
      isAllDay: absence.isAllDay,
      barberId: absence.barberId,
      barberName: absence.barber?.name || null,
      type: absence.type
    })
  } catch (error) {
    console.error('Error creating absence:', error)
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ 
        error: 'Erro ao criar ausência',
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }, { status: 500 })
    }
    return NextResponse.json({ error: 'Erro ao criar ausência' }, { status: 500 })
  }
}