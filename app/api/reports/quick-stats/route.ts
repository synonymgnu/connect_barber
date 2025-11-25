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

    // New Orders (últimos 7 dias)
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)
    
    const newOrders = await db.booking.count({
      where: {
        service: {
          barbershopId
        },
        date: {
          gte: lastWeek
        }
      }
    })

    // Visitantes Únicos (clientes distintos no período)
    const uniqueVisitors = await db.booking.groupBy({
      by: ['userId'],
      where: {
        service: {
          barbershopId
        },
        date: {
          gte: lastWeek
        }
      }
    })

    // Receita Total (últimos 30 dias)
    const lastMonth = new Date()
    lastMonth.setDate(lastMonth.getDate() - 30)

    const completedBookings = await db.booking.findMany({
      where: {
        service: {
          barbershopId
        },
        date: {
          gte: lastMonth
        },
        status: 'COMPLETED'
      },
      include: {
        service: true
      }
    })

    const totalRevenue = completedBookings.reduce((sum, booking) => 
      sum + Number(booking.service.price || 0), 0
    )

    return NextResponse.json({
      newOrders,
      uniqueVisitors: uniqueVisitors.length,
      totalRevenue
    })

  } catch (error) {
    console.error('Erro ao buscar estatísticas rápidas:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}