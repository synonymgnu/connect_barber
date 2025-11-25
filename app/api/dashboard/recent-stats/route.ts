import { NextResponse } from 'next/server'
import { db } from '@/app/_lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/_lib/auth'

export const dynamic = 'force-dynamic'

interface StatData {
  count: number
  percentage: number
}

interface DashboardStats {
  bookings: StatData
  revenue: StatData
  customers: StatData
  barbers: StatData
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!session.user.barbershopId) {
      return NextResponse.json({ error: 'Barbearia não encontrada' }, { status: 404 })
    }

    const barbershopId = session.user.barbershopId
    
    // Datas de comparação: últimos 7 dias vs 7 dias anteriores
    const now = new Date()
    const today = new Date(now)
    today.setHours(23, 59, 59, 999)
    
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(now.getDate() - 7)
    sevenDaysAgo.setHours(0, 0, 0, 0)
    
    const fourteenDaysAgo = new Date(now)
    fourteenDaysAgo.setDate(now.getDate() - 14)
    fourteenDaysAgo.setHours(0, 0, 0, 0)

    // **BOOKINGS**: Agendamentos do período
    const currentBookings = await db.booking.count({
      where: {
        date: {
          gte: sevenDaysAgo,
          lte: today
        },
        service: { barbershopId }
      }
    })

    const previousBookings = await db.booking.count({
      where: {
        date: {
          gte: fourteenDaysAgo,
          lt: sevenDaysAgo
        },
        service: { barbershopId }
      }
    })

    // **REVENUE**: Soma dos valores de serviços concluídos
    const currentRevenueBookings = await db.booking.findMany({
      where: {
        date: {
          gte: sevenDaysAgo,
          lte: today
        },
        status: 'COMPLETED',
        service: { barbershopId }
      },
      include: {
        service: {
          select: {
            price: true
          }
        }
      }
    })

    const previousRevenueBookings = await db.booking.findMany({
      where: {
        date: {
          gte: fourteenDaysAgo,
          lt: sevenDaysAgo
        },
        status: 'COMPLETED',
        service: { barbershopId }
      },
      include: {
        service: {
          select: {
            price: true
          }
        }
      }
    })

    const currentRevenueSum = currentRevenueBookings.reduce((sum, booking) => sum + Number(booking.service.price), 0)
    const previousRevenueSum = previousRevenueBookings.reduce((sum, booking) => sum + Number(booking.service.price), 0)

    // **CUSTOMERS**: Clientes únicos que fizeram agendamentos
    const currentCustomers = await db.booking.findMany({
      where: {
        date: {
          gte: sevenDaysAgo,
          lte: today
        },
        service: { barbershopId }
      },
      select: { userId: true },
      distinct: ['userId']
    })

    const previousCustomers = await db.booking.findMany({
      where: {
        date: {
          gte: fourteenDaysAgo,
          lt: sevenDaysAgo
        },
        service: { barbershopId }
      },
      select: { userId: true },
      distinct: ['userId']
    })

    // **BARBERS**: Total de barbeiros ativos na barbearia
    const activeBarbers = await db.barber.count({
      where: {
        barbershopId,
        isActive: true
      }
    })

    // Cálculo de porcentagem de mudança
    const calculatePercentage = (current: number, previous: number): number => {
      if (previous === 0 && current === 0) return 0
      if (previous === 0) return 100
      return Number((((current - previous) / previous) * 100).toFixed(1))
    }

    const stats: DashboardStats = {
      bookings: {
        count: currentBookings,
        percentage: calculatePercentage(currentBookings, previousBookings)
      },
      revenue: {
        count: currentRevenueSum,
        percentage: calculatePercentage(currentRevenueSum, previousRevenueSum)
      },
      customers: {
        count: currentCustomers.length,
        percentage: calculatePercentage(currentCustomers.length, previousCustomers.length)
      },
      barbers: {
        count: activeBarbers,
        percentage: 0 // Não faz sentido calcular mudança de barbeiros neste período
      }
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching recent stats:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar estatísticas' },
      { status: 500 }
    )
  }
}