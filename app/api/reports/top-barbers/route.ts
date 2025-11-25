import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/_lib/auth'
import { db } from '@/app/_lib/prisma'

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

    // Últimos 30 dias
    const lastMonth = new Date()
    lastMonth.setDate(lastMonth.getDate() - 30)

    const barbers = await db.barber.findMany({
      where: { 
        barbershopId,
        isActive: true
      },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        },
        bookings: {
          where: {
            date: {
              gte: lastMonth
            },
            status: 'COMPLETED'
          },
          select: {
            date: true,
            service: {
              select: {
                price: true,
                duration: true
              }
            }
          }
        }
      }
    })

    const barberData = barbers.map(barber => {
      const appointments = barber.bookings.length
      const revenue = barber.bookings.reduce((sum, booking) => 
        sum + Number(booking.service.price || 0), 0
      )
      const hoursWorked = barber.bookings.reduce((sum, booking) => 
        sum + (Number(booking.service.duration) || 0), 0
      ) / 60 // Converter minutos para horas

      return {
        id: barber.id,
        name: barber.user.name || 'Barbeiro',
        imageUrl: barber.user.image,
        appointments,
        revenue,
        hoursWorked: Math.round(hoursWorked * 10) / 10
      }
    }).sort((a, b) => b.appointments - a.appointments).slice(0, 5)

    return NextResponse.json(barberData)

  } catch (error) {
    console.error('Erro ao buscar top barbeiros:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}