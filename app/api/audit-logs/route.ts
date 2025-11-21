import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/_lib/auth'
import { db } from '@/app/_lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!session.user.barbershopId) {
    return NextResponse.json({ error: 'Barbearia não encontrada' }, { status: 404 })
  }

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const action = searchParams.get('action')

  // Buscar todos os logs relacionados à barbearia
  // Incluir: admin, barbeiros e clientes que fizeram agendamentos
  const barbershopUsers = await db.user.findMany({
    where: {
      OR: [
        { ownedBarbershop: { id: session.user.barbershopId } },
        { barber: { barbershopId: session.user.barbershopId } },
        { bookings: { some: { service: { barbershopId: session.user.barbershopId } } } }
      ]
    },
    select: { id: true }
  })

  const userIds = barbershopUsers.map(u => u.id)

  const where: any = {
    userId: { in: userIds }
  }
  if (action) where.action = action

  const logs = await db.auditLog.findMany({
    where,
    include: {
      user: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit
  })

  const total = await db.auditLog.count({ where })

  return NextResponse.json({
    logs,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  })
}
