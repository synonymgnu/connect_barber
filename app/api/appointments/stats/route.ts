import { NextResponse } from 'next/server'
import { db } from '@/app/_lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/_lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!session.user.barbershopId) {
      return NextResponse.json({ error: 'Barbearia não encontrada' }, { status: 404 })
    }

    const barbershopId = session.user.barbershopId
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '1W'

    const today = new Date()
    let startDate = new Date()

    switch (range) {
      case '1D':
        startDate = new Date(today)
        startDate.setHours(0, 0, 0, 0)
        break
      case '1W':
        startDate = new Date(today)
        startDate.setDate(today.getDate() - 7)
        break
      case '1M':
        startDate = new Date(today)
        startDate.setMonth(today.getMonth() - 1)
        break
      case '1Y':
        startDate = new Date(today)
        startDate.setFullYear(today.getFullYear() - 1)
        break
    }

    const bookings = await db.booking.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: today
        },
        service: {
          barbershopId: barbershopId
        }
      },
      select: {
        date: true,
        status: true,
        source: true,
        user: {
          select: { id: true, createdAt: true }
        },
        service: {
          select: { price: true }
        }
      },
      orderBy: { date: 'asc' }
    })

    const totalAppointments = bookings.length

    const newCustomers = await db.user.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: today
        },
        role: 'CLIENT',
        bookings: {
          some: {
            service: { barbershopId: barbershopId }
          }
        }
      }
    })

    // Presencial x Online (filtro)
    const offlineCount = bookings.filter(b => b.source === 'PRESENCIAL').length
    const onlineCount = bookings.filter(b => b.source === 'ONLINE').length

    const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length
    const conversionRate = totalAppointments > 0 
      ? Math.round((completedBookings / totalAppointments) * 100) 
      : 0

    const findPeak = (): string => {
      if (bookings.length === 0) {
        return 'N/A'
      }

      if (range === '1D') {
        
        // dia
        const hourCounts: Record<number, number> = {}
        bookings.forEach(booking => {
          const hour = new Date(booking.date).getHours()
          hourCounts[hour] = (hourCounts[hour] || 0) + 1
        })
        
        const entries = Object.entries(hourCounts)
        if (entries.length === 0) return 'N/A'
        
        const peakHour = entries.reduce((a, b) => 
          hourCounts[Number(a[0])] > hourCounts[Number(b[0])] ? a : b
        )[0]
        
        return `${peakHour}:00`
      } else if (range === '1W') {
        
        // semana
        const dayCounts: Record<string, number> = {}
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
        
        bookings.forEach(booking => {
          const dayIndex = new Date(booking.date).getDay()
          const dayName = days[dayIndex]
          dayCounts[dayName] = (dayCounts[dayName] || 0) + 1
        })
        
        const entries = Object.entries(dayCounts)
        if (entries.length === 0) return 'N/A'
        
        return entries.reduce((a, b) => 
          dayCounts[a[0]] > dayCounts[b[0]] ? a : b
        )[0]
      } else if (range === '1M') {
        
        // dia do mês mais movimentado
        const dayCounts: Record<number, number> = {}
        bookings.forEach(booking => {
          const day = new Date(booking.date).getDate()
          dayCounts[day] = (dayCounts[day] || 0) + 1
        })
        
        const entries = Object.entries(dayCounts)
        if (entries.length === 0) return 'N/A'
        
        const peakDay = entries.reduce((a, b) => 
          dayCounts[Number(a[0])] > dayCounts[Number(b[0])] ? a : b
        )[0]
        
        return `Dia ${peakDay}`
      } else {

        const monthCounts: Record<string, number> = {}
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
        
        bookings.forEach(booking => {
          const monthIndex = new Date(booking.date).getMonth()
          const monthName = months[monthIndex]
          monthCounts[monthName] = (monthCounts[monthName] || 0) + 1
        })
        
        const entries = Object.entries(monthCounts)
        if (entries.length === 0) return 'N/A'
        
        return entries.reduce((a, b) => 
          monthCounts[a[0]] > monthCounts[b[0]] ? a : b
        )[0]
      }
    }

    const peakHour = findPeak()

    // Presencial x Online
    const groupedData: Record<string, { offline: number; online: number; date: Date }> = {}
    
    bookings.forEach(booking => {
      const date = new Date(booking.date)
      let key: string
      
      if (range === '1D') {
        key = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      } else if (range === '1W') {
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
        key = days[date.getDay()]
      } else if (range === '1M') {
        const week = Math.ceil(date.getDate() / 7)
        key = `Sem ${Math.min(week, 4)}`
      } else {
        key = date.toLocaleDateString('pt-BR', { month: 'short' })
      }

      if (!groupedData[key]) {
        groupedData[key] = { offline: 0, online: 0, date }
      }

      if (booking.source === 'PRESENCIAL') {
        groupedData[key].offline++
      } else {
        groupedData[key].online++
      }
    })

    const chartData = Object.entries(groupedData).map(([time, data]) => ({
      time,
      offline: data.offline,
      online: data.online
    }))

    const sortedChartData = chartData.sort((a, b) => {
      if (range === '1D') return 0
      if (range === '1W') {
        const daysOrder = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
        return daysOrder.indexOf(a.time) - daysOrder.indexOf(b.time)
      }
      return a.time.localeCompare(b.time)
    })

    return NextResponse.json({
      totalAppointments,
      newCustomers,
      offlineCount,
      onlineCount,
      conversionRate,
      peakHour,
      chartData: sortedChartData
    }, {
      headers: {
        'Cache-Control': 'private, max-age=300, stale-while-revalidate=150',
      }
    })

  } catch (error) {
    console.error('Error fetching appointment stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}