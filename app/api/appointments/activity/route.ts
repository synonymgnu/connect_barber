import { NextResponse } from 'next/server'
import { db } from '@/app/_lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/_lib/auth'

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
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const search = searchParams.get('search') || ''
    const statusFilter = searchParams.get('status') || 'all'
    const dateFilter = searchParams.get('dateFilter') || 'all'

    const skip = (page - 1) * pageSize

    const whereClause: any = {
      service: {
        barbershopId: barbershopId
      }
    }

    // Filtro de busca
    if (search) {
      whereClause.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { service: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Filtro de status
    if (statusFilter !== 'all') {
      whereClause.status = statusFilter.toUpperCase()
    }

    // Filtro de data
    const today = new Date()
    if (dateFilter === 'today') {
      const startOfDay = new Date(today)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(today)
      endOfDay.setHours(23, 59, 59, 999)
      whereClause.date = { gte: startOfDay, lte: endOfDay }
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(today)
      weekAgo.setDate(today.getDate() - 7)
      whereClause.date = { gte: weekAgo }
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(today)
      monthAgo.setMonth(today.getMonth() - 1)
      whereClause.date = { gte: monthAgo }
    }

    // Buscar agendamentos
    const [bookings, totalCount] = await Promise.all([
      db.booking.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          service: {
            select: {
              name: true,
              price: true
            }
          },
          barber: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        },
        skip,
        take: pageSize
      }),
      db.booking.count({
        where: whereClause
      })
    ])

    const totalPages = Math.ceil(totalCount / pageSize)

    // Formatar dados
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      customerName: booking.user.name || 'Cliente',
      customerEmail: booking.user.email || '',
      customerPhone: booking.user.phone || '',
      type: booking.service.name,
      date: new Date(booking.date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) + ' - ' + new Date(booking.date).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      source: booking.source,
      status: booking.status.toLowerCase(),
      employee: booking.barber?.name || 'Não atribuído',
      duration: booking.duration || 30,
      totalValue: Number(booking.service.price)
    }))

    return NextResponse.json({
      data: formattedBookings,
      totalPages,
      totalCount,
      currentPage: page
    })

  } catch (error) {
    console.error('Error fetching appointments activity:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}