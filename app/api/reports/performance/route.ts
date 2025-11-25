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

        // Últimos 30 dias agrupados por dia
        const bookings = await db.booking.findMany({
            where: {
                service: {
                    barbershopId
                },
                date: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
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

        // Agrupar por dia
        const groupedData = bookings.reduce((acc: any, booking) => {
            const date = booking.date.toISOString().split('T')[0]
            if (!acc[date]) {
                acc[date] = { date, revenue: 0, appointments: 0 }
            }
            acc[date].revenue += Number(booking.service.price || 0)
            acc[date].appointments += 1
            return acc
        }, {})

        const formattedData = Object.values(groupedData).map((day: any) => ({
            ...day,
            date: new Date(day.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
        }))

        return NextResponse.json(formattedData)

    } catch (error) {
        console.error('Erro ao buscar performance:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}