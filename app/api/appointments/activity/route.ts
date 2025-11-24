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
    
    const dateFilterType = searchParams.get('dateFilterType')
    const dateFilterValue = searchParams.get('dateFilterValue')

    const skip = (page - 1) * pageSize

    const whereClause: any = {
      service: {
        barbershopId: barbershopId
      }
    }

    if (search) {
      whereClause.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { service: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    if (statusFilter !== 'all') {
      whereClause.status = statusFilter.toUpperCase()
    }

    if (dateFilterType && dateFilterValue) {
      const selectedDate = new Date(dateFilterValue)
      
      if (dateFilterType === 'dia') {
        const startOfDay = new Date(selectedDate)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(selectedDate)
        endOfDay.setHours(23, 59, 59, 999)
        whereClause.date = { gte: startOfDay, lte: endOfDay }
      } else if (dateFilterType === 'semana') {
        const startOfWeek = new Date(selectedDate)
        startOfWeek.setHours(0, 0, 0, 0)
        startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay())

        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        endOfWeek.setHours(23, 59, 59, 999)
        
        whereClause.date = { gte: startOfWeek, lte: endOfWeek }
      } else if (dateFilterType === 'mes') {
        const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
        const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
        endOfMonth.setHours(23, 59, 59, 999)
        whereClause.date = { gte: startOfMonth, lte: endOfMonth }
      } else if (dateFilterType === 'ano') {
        const startOfYear = new Date(selectedDate.getFullYear(), 0, 1)
        const endOfYear = new Date(selectedDate.getFullYear(), 11, 31)
        endOfYear.setHours(23, 59, 59, 999)
        whereClause.date = { gte: startOfYear, lte: endOfYear }
      }
    }

    const bookings = await db.booking.findMany({
      where: whereClause,
      include: {
        user: { 
          select: { 
            id: true, 
            name: true,
            image: true
          } 
        },
        service: { select: { id: true, name: true, price: true, duration: true } },
        barber: { select: { id: true, name: true } }
      },
      orderBy: { date: 'desc' },
      skip,
      take: pageSize
    })

    // Removido auto-update inline - usar cron job separado para melhor performance

    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      customerName: booking.user.name || 'Cliente',
      customerEmail: '',
      customerPhone: '',
      customerImageUrl: booking.user.image || null,
      type: booking.service.name,
      serviceId: booking.service.id,
      date: new Date(booking.date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) + ' - ' + new Date(booking.date).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      dateIso: booking.date.toISOString(),
      source: booking.source,
      status: booking.status.toLowerCase(),
      employee: booking.barber?.name || 'Não atribuído',
      employeeId: booking.barber?.id || '',
      duration: booking.service.duration || 30,
      totalValue: Number(booking.service.price)
    }))

    const totalCount = await db.booking.count({ where: whereClause })

    return NextResponse.json({
      data: formattedBookings,
      totalPages: Math.ceil(totalCount / pageSize),
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