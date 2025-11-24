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
      console.log('User session:', JSON.stringify(session.user, null, 2))
      return NextResponse.json({ error: 'Barbearia não encontrada. Faça logout e login novamente.' }, { status: 404 })
    }

    const barbershopId = session.user.barbershopId

    // hoje
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 7 dias
    const next7Days = new Date()
    next7Days.setDate(today.getDate() + 7)

    // 30 dias
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(today.getDate() - 30)
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(today.getDate() - 60)

    // Próximos
    const upcomingBookings = await db.booking.count({
      where: {
        date: {
          gte: today,
          lte: next7Days
        },
        service: {
          barbershopId: barbershopId
        }
      }
    })

    // Concluídos
    const completedBookings = await db.booking.count({
      where: {
        date: {
          gte: thirtyDaysAgo,
          lt: today
        },
        status: 'COMPLETED',
        service: {
          barbershopId: barbershopId
        }
      }
    })

    // Cancelados (total)
    const cancelledBookings = await db.booking.count({
      where: {
        status: 'CANCELLED',
        service: {
          barbershopId: barbershopId
        }
      }
    })

    // Cancelados últimos 30 dias (para comparação)
    const last30DaysCancelled = await db.booking.count({
      where: {
        date: {
          gte: thirtyDaysAgo
        },
        status: 'CANCELLED',
        service: {
          barbershopId: barbershopId
        }
      }
    })

    const previousCancelledBookings = await db.booking.count({
      where: {
        date: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo
        },
        status: 'CANCELLED',
        service: {
          barbershopId: barbershopId
        }
      }
    })

    // Total de clientes únicos
    const totalCustomers = await db.booking.findMany({
      where: {
        service: {
          barbershopId: barbershopId
        }
      },
      select: {
        userId: true
      },
      distinct: ['userId']
    })

    const previousCompletedBookings = await db.booking.count({
      where: {
        date: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo
        },
        status: 'COMPLETED',
        service: {
          barbershopId: barbershopId
        }
      }
    })

    const previousCustomers = await db.booking.findMany({
      where: {
        date: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo
        },
        service: {
          barbershopId: barbershopId
        }
      },
      select: {
        userId: true
      },
      distinct: ['userId']
    })

    const calculatePercentage = (current: number, previous: number): number => {
      if (previous === 0 && current === 0) return 0
      if (previous === 0) return 100
      return Number((((current - previous) / previous) * 100).toFixed(1))
    }

    const completedChange = calculatePercentage(completedBookings, previousCompletedBookings)
    const customersChange = calculatePercentage(totalCustomers.length, previousCustomers.length)
    const cancelledChange = calculatePercentage(last30DaysCancelled, previousCancelledBookings)

    return NextResponse.json({
      metrics: {
        upcoming: {
          value: upcomingBookings.toString(),
          change: Math.round(completedChange),
          percentage: "12%",
          trend: upcomingBookings > previousCompletedBookings ? "up" : "down"
        },
        completed: {
          value: completedBookings.toString(),
          change: Math.round(completedChange),
          percentage: "11%",
          trend: completedChange > 0 ? "up" : "down"
        },
        cancelled: {
          value: cancelledBookings.toString(),
          change: Math.round(cancelledChange),
          percentage: "15%",
          trend: cancelledChange > 0 ? "up" : "down"
        },
        customers: {
          value: totalCustomers.length.toString(),
          change: Math.round(customersChange),
          percentage: "35%",
          trend: customersChange > 0 ? "up" : "down"
        }
      },
      totalAppointments: completedBookings + upcomingBookings
    }, { 
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    })

  } catch (error) {
    console.error('Error fetching appointment metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}