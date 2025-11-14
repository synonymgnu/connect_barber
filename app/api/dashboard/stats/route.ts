import { NextResponse } from 'next/server'
import { db } from '@/app/_lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/_lib/auth'

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

    // Últimos 7 dias
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Métricas do período atual (últimos 7 dias) para esta barbearia
    const currentBookings = await db.booking.count({
      where: {
        createdAt: { gte: sevenDaysAgo },
        service: { barbershopId: barbershopId }
      }
    })

    const currentUsers = await db.user.count({
      where: {
        createdAt: { gte: sevenDaysAgo },
        bookings: {
          some: {
            service: { barbershopId: barbershopId }
          }
        }
      }
    })

    // Receita atual
    const currentBookingsWithServices = await db.booking.findMany({
      where: { 
        createdAt: { gte: sevenDaysAgo },
        service: { barbershopId: barbershopId }
      },
      include: { service: { select: { price: true } } }
    })
    
    const currentRevenue = currentBookingsWithServices.reduce((acc, booking) => {
      return acc + Number(booking.service.price)
    }, 0)

    // 7 dias antes dos últimos 7 dias
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
    
    const previousBookings = await db.booking.count({
      where: {
        createdAt: {
          gte: fourteenDaysAgo,
          lt: sevenDaysAgo
        },
        service: { barbershopId: barbershopId }
      }
    })

    const previousUsers = await db.user.count({
      where: {
        createdAt: {
          gte: fourteenDaysAgo,
          lt: sevenDaysAgo
        },
        bookings: {
          some: {
            service: { barbershopId: barbershopId }
          }
        }
      }
    })

    const previousBookingsWithServices = await db.booking.findMany({
      where: {
        createdAt: {
          gte: fourteenDaysAgo,
          lt: sevenDaysAgo
        },
        service: { barbershopId: barbershopId }
      },
      include: { service: { select: { price: true } } }
    })
    
    const previousRevenue = previousBookingsWithServices.reduce((acc, booking) => {
      return acc + Number(booking.service.price)
    }, 0)

    // Função para calcular porcentagem de crescimento
    const calculatePercentage = (current: number, previous: number) => {
      if (previous === 0) return 100
      return Number((((current - previous) / previous) * 100).toFixed(1))
    }

    return NextResponse.json({
      bookings: {
        count: currentBookings,
        percentage: calculatePercentage(currentBookings, previousBookings)
      },
      users: {
        count: currentUsers,
        percentage: calculatePercentage(currentUsers, previousUsers)
      },
      barbershops: {
        count: 1,
        percentage: 0
      },
      revenue: {
        count: currentRevenue,
        percentage: calculatePercentage(currentRevenue, previousRevenue)
      }
    })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}