import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/_lib/auth'
import { db } from '@/app/_lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const barbershopId = session.user.barbershopId

    if (!barbershopId) {
      return NextResponse.json({ error: 'Barbearia não encontrada' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    if (!year || !month) {
      return NextResponse.json({ error: 'Ano e mês são obrigatórios' }, { status: 400 })
    }

    const startDate = new Date(`${year}-${month}-01`)
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + 1)

    // Buscar agendamentos do mês
    const bookings = await db.booking.findMany({
      where: {
        service: {
          barbershopId
        },
        date: {
          gte: startDate,
          lt: endDate
        },
        status: 'COMPLETED'
      },
      select: {
        date: true,
        service: {
          select: {
            price: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Agrupar por dia do mês
    const daysInMonth = new Date(Number(year), Number(month), 0).getDate()
    const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      const dayBookings = bookings.filter(booking => {
        const bookingDay = new Date(booking.date).getDate()
        return bookingDay === day
      })

      const revenue = dayBookings.reduce((sum, booking) => 
        sum + Number(booking.service.price || 0), 0
      )

      return {
        day: `${day.toString().padStart(2, '0')}`,
        revenue,
        appointments: dayBookings.length
      }
    })

    return NextResponse.json(dailyData)

  } catch (error) {
    console.error('Erro ao buscar ganhos mensais:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}