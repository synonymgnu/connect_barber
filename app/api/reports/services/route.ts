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

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const services = await db.booking.groupBy({
      by: ['serviceId'],
      where: {
        service: { barbershopId },
        date: { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
        status: 'COMPLETED'
      },
      _count: { serviceId: true }
    })

    const serviceIds = services.map(s => s.serviceId)
    const serviceDetails = await db.barbershopService.findMany({
      where: { id: { in: serviceIds } },
      select: { id: true, name: true }
    })

    const serviceMap = serviceDetails.reduce((acc, service) => {
      acc[service.id] = service.name
      return acc
    }, {} as Record<string, string>)

    const formattedData = services
      .map(service => ({
        name: serviceMap[service.serviceId] || 'Serviço desconhecido',
        value: service._count.serviceId
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)

    return NextResponse.json(formattedData)

  } catch (error) {
    console.error('Erro ao buscar serviços:', error)
    return NextResponse.json({ error: 'Erro interno ao buscar serviços' }, { status: 500 })
  }
}