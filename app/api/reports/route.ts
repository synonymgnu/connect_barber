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

        const { searchParams } = new URL(request.url)
        const range = searchParams.get('range') || '30d'

        const days = range === '7d' ? 7 : range === '90d' ? 90 : 30

        const barbershopId = session.user.barbershopId

        if (!barbershopId) {
            return NextResponse.json({ error: 'Barbearia não encontrada' }, { status: 404 })
        }

        // Receita total
        const completedBookings = await db.booking.findMany({
            where: {
                service: {
                    barbershopId
                },
                date: {
                    gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
                },
                status: 'COMPLETED'
            },
            include: {
                service: true
            }
        })
        
        const totalRevenue = completedBookings.reduce((sum, booking) => sum + Number(booking.service.price), 0)

        // Total de agendamentos
        const totalAppointments = await db.booking.count({
            where: {
                service: {
                    barbershopId
                },
                date: {
                    gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
                }
            }
        })

        // Serviços realizados
        const totalServices = await db.booking.count({
            where: {
                service: {
                    barbershopId
                },
                date: {
                    gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
                },
                status: 'COMPLETED'
            }
        })

        const avgTicket = totalRevenue && totalServices > 0
            ? totalRevenue / totalServices
            : 0

        const previousDays = days * 2
        const previousCompletedBookings = await db.booking.findMany({
            where: {
                service: {
                    barbershopId
                },
                date: {
                    gte: new Date(Date.now() - previousDays * 24 * 60 * 60 * 1000),
                    lt: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
                },
                status: 'COMPLETED'
            },
            include: {
                service: true
            }
        })
        
        const previousRevenue = previousCompletedBookings.reduce((sum, booking) => sum + Number(booking.service.price), 0)

        const previousAppointments = await db.booking.count({
            where: {
                service: {
                    barbershopId
                },
                date: {
                    gte: new Date(Date.now() - previousDays * 24 * 60 * 60 * 1000),
                    lt: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
                }
            }
        })

        const revenueGrowth = previousRevenue && totalRevenue
            ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
            : 0

        const appointmentsGrowth = previousAppointments > 0
            ? ((totalAppointments - previousAppointments) / previousAppointments) * 100
            : 0

        return NextResponse.json({
            totalRevenue,
            totalAppointments,
            totalServices,
            avgTicket,
            growth: {
                revenue: Math.round(revenueGrowth),
                appointments: Math.round(appointmentsGrowth),
                services: Math.round(appointmentsGrowth)
            }
        })

    } catch (error) {
        console.error('Erro ao buscar relatórios:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}