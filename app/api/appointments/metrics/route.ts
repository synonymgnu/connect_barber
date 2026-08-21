import { NextResponse } from 'next/server'
import { db } from '@/app/_lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/_lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!session.user.barbershopId) {
      console.log('User session:', JSON.stringify(session.user, null, 2))
      return NextResponse.json(
        { error: 'Barbearia não encontrada. Faça logout e login novamente.' },
        { status: 404 }
      )
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

    // Próximos (7 dias) — somente status CONFIRMED
    const upcomingBookings = await db.booking.count({
      where: {
        date: {
          gte: today,
          lte: next7Days,
        },
        status: 'CONFIRMED',
        service: {
          barbershopId: barbershopId,
        },
      },
    })

    // Próximos do período anterior (7-14 dias atrás)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(today.getDate() - 7)
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(today.getDate() - 14)

    const previousUpcomingBookings = await db.booking.count({
      where: {
        date: {
          gte: fourteenDaysAgo,
          lt: sevenDaysAgo,
        },
        status: 'CONFIRMED',
        service: {
          barbershopId: barbershopId,
        },
      },
    })

    // Concluídos
    const completedBookings = await db.booking.count({
      where: {
        date: {
          gte: thirtyDaysAgo,
          lt: today,
        },
        status: 'COMPLETED',
        service: {
          barbershopId: barbershopId,
        },
      },
    })

    // Cancelados (total)
    const cancelledBookings = await db.booking.count({
      where: {
        status: 'CANCELLED',
        service: {
          barbershopId: barbershopId,
        },
      },
    })

    // Cancelados últimos 30 dias (para comparação)
    const last30DaysCancelled = await db.booking.count({
      where: {
        updatedAt: {
          gte: thirtyDaysAgo,
        },
        status: 'CANCELLED',
        service: {
          barbershopId: barbershopId,
        },
      },
    })

    const previousCancelledBookings = await db.booking.count({
      where: {
        updatedAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo,
        },
        status: 'CANCELLED',
        service: {
          barbershopId: barbershopId,
        },
      },
    })

    // Total de clientes únicos
    const totalCustomers = await db.booking.findMany({
      where: {
        service: {
          barbershopId: barbershopId,
        },
      },
      select: {
        userId: true,
      },
      distinct: ['userId'],
    })

    const previousCompletedBookings = await db.booking.count({
      where: {
        date: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo,
        },
        status: 'COMPLETED',
        service: {
          barbershopId: barbershopId,
        },
      },
    })

    const previousCustomers = await db.booking.findMany({
      where: {
        date: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo,
        },
        service: {
          barbershopId: barbershopId,
        },
      },
      select: {
        userId: true,
      },
      distinct: ['userId'],
    })

    const calculatePercentage = (
      current: number,
      previous: number
    ): number | null => {
      if (previous === 0 && current === 0) return 0
      if (previous === 0) return null // sem período anterior para comparar
      return Number((((current - previous) / previous) * 100).toFixed(1))
    }

    const upcomingChange = calculatePercentage(
      upcomingBookings,
      previousUpcomingBookings
    )
    const completedChange = calculatePercentage(
      completedBookings,
      previousCompletedBookings
    )
    const customersChange = calculatePercentage(
      totalCustomers.length,
      previousCustomers.length
    )
    const cancelledChange = calculatePercentage(
      last30DaysCancelled,
      previousCancelledBookings
    )

    const roundChange = (v: number | null) =>
      v === null ? null : Math.round(v)

    // Percentual do gráfico circular: proporção do período atual em relação ao total acumulado
    const totalBookings = await db.booking.count({
      where: { service: { barbershopId } },
    })
    const totalCompleted = await db.booking.count({
      where: { status: 'COMPLETED', service: { barbershopId } },
    })
    const totalCancelled = await db.booking.count({
      where: { status: 'CANCELLED', service: { barbershopId } },
    })

    const pct = (part: number, total: number) =>
      total === 0 ? '0%' : `${Math.min(100, Math.round((part / total) * 100))}%`

    return NextResponse.json(
      {
        metrics: {
          upcoming: {
            value: upcomingBookings.toString(),
            change: roundChange(upcomingChange),
            percentage: pct(upcomingBookings, totalBookings),
            trend: (upcomingChange ?? 0) >= 0 ? 'up' : 'down',
          },
          completed: {
            value: completedBookings.toString(),
            change: roundChange(completedChange),
            percentage: pct(completedBookings, totalCompleted || 1),
            trend: (completedChange ?? 0) >= 0 ? 'up' : 'down',
          },
          cancelled: {
            value: cancelledBookings.toString(),
            change: roundChange(cancelledChange),
            percentage: pct(cancelledBookings, totalBookings),
            trend: (cancelledChange ?? 0) >= 0 ? 'up' : 'down',
          },
          customers: {
            value: totalCustomers.length.toString(),
            change: roundChange(customersChange),
            percentage: pct(
              previousCustomers.length > 0
                ? totalCustomers.length - previousCustomers.length
                : totalCustomers.length,
              totalCustomers.length || 1
            ),
            trend: (customersChange ?? 0) >= 0 ? 'up' : 'down',
          },
        },
        totalAppointments: completedBookings + upcomingBookings,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching appointment metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
